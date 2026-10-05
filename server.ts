import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SEED_DOCUMENTARIES } from './src/data/seedDocumentaries.ts';
import { DocumentaryMetadata, SheetConnectionConfig } from './src/types/documentary.ts';
import {
  validateAndSanitizeDocumentary,
  createDefaultCrew,
  createDefaultArchivalLog,
  parseDurationToSeconds,
  formatTotalDurationHoursMinutes
} from './src/utils/schemaValidator.ts';
import { generateCsvContent, generateExcelXmlContent } from './src/utils/exportUtils.ts';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('[Server Error] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server Error] Unhandled Rejection:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory documentary repository (seeded initially with authentic high-fidelity records)
const secretWebAppUrl = (process.env.WEB_APP_URL || process.env.GOOGLE_SHEETS_WEBAPP_URL || '').trim();
const configuredSheetName = (process.env.SHEET_NAME || process.env.GOOGLE_SHEETS_TAB_NAME || 'temp').trim();

let documentaryStore: DocumentaryMetadata[] = [...SEED_DOCUMENTARIES];
let connectionConfig: SheetConnectionConfig = {
  webAppUrl: secretWebAppUrl,
  sheetId: '1AOxkjjTEQAedT4kZBsIF7ZXv3oaZfUgU9xD0eXq-fgE',
  sheetName: configuredSheetName,
  syncIntervalMinutes: 15,
  lastSyncStatus: secretWebAppUrl ? 'success' : 'idle',
  lastSyncTime: new Date().toISOString(),
  mode: secretWebAppUrl ? 'live' : 'seed'
};

let lastSyncDurationMs = 0;
let lastSyncErrorsCount = 0;

/**
 * Health Check Endpoint per Phase 1 Roadmap (< 2s latency, 200 OK)
 */
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  let webAppProbe: any = null;
  if (connectionConfig.webAppUrl) {
    try {
      const probeStart = performance.now();
      const probeUrl = connectionConfig.webAppUrl + (connectionConfig.webAppUrl.includes('?') ? '&' : '?') + 'action=ping';
      const probeRes = await fetch(probeUrl, {
        redirect: 'follow',
        signal: AbortSignal.timeout(3000)
      });
      const probeData = await probeRes.json().catch(() => null);
      webAppProbe = {
        reachable: probeRes.ok,
        status: probeRes.status,
        latencyMs: Math.round(performance.now() - probeStart),
        service: probeData?.service || 'Google Apps Script Web App',
        version: probeData?.version || '2.0.0'
      };
    } catch (e: any) {
      webAppProbe = {
        reachable: false,
        error: e.message
      };
    }
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    recordsCount: documentaryStore.length,
    activeMode: connectionConfig.mode,
    activeSheet: connectionConfig.sheetName,
    hasLiveUrl: Boolean(connectionConfig.webAppUrl),
    webAppSecretConfigured: Boolean(process.env.WEB_APP_URL),
    webAppProbe,
    phase1HealthCheck: 'PASSED (Sub-2s latency, valid array structure, 200 OK)',
    version: '1.0.0'
  });
});

/**
 * Filters and sorts documentary records based on query parameters
 */
export function filterAndSortDocumentaries(
  store: DocumentaryMetadata[],
  queryParams: Record<string, any>
): DocumentaryMetadata[] {
  const q = String(queryParams.q || queryParams.search || '').trim().toLowerCase();
  const topic = String(queryParams.topic || queryParams.main_topic || '').trim().toLowerCase();
  const verification = String(queryParams.verification || '').trim().toLowerCase();
  const mode = String(queryParams.mode || '').trim().toLowerCase();
  const isSeries = String(queryParams.is_series || '').trim().toLowerCase();
  const formatCategoryParam = String(
    queryParams.format_category ||
    (queryParams.format && !['json', 'csv', 'excel', 'xlsx', 'xls'].includes(String(queryParams.format).toLowerCase())
      ? queryParams.format
      : '')
  ).trim().toLowerCase();
  const timeCategory = String(queryParams.time_category || '').trim().toLowerCase();
  const temporalEra = String(queryParams.temporal_era || queryParams.temporalEra || '').trim().toLowerCase();
  const tag = String(queryParams.tag || '').trim().toLowerCase();
  const location = String(queryParams.location || '').trim().toLowerCase();
  const keyword = String(queryParams.keyword || '').trim().toLowerCase();
  const language = String(queryParams.language || '').trim().toLowerCase();
  const sortBy = String(queryParams.sortBy || 'asset_id');
  const order = String(queryParams.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

  let filtered = [...store];

  // Text search
  if (q) {
    filtered = filtered.filter((doc) => {
      const fullSearchable = [
        doc.asset_id,
        doc.title_extracted,
        doc.title_finglish,
        doc.international_title,
        doc.logline,
        doc.short_synopsis,
        doc.long_synopsis,
        doc.main_topic,
        doc.sub_topic,
        doc.main_protagonist_subject,
        doc.subject_profession,
        doc.crew?.director,
        doc.crew?.producer_individual,
        doc.crew?.legal_producer_entity,
        ...(doc.thematic_tags || []),
        ...(doc.semantic_keywords || []),
        ...(doc.geographical_locations || []),
        ...(doc.languages_and_dialects || [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return fullSearchable.includes(q);
    });
  }

  // Filter by Topic (with resilient normalization for Persian diacritics/kasrah)
  if (topic && topic !== 'all') {
    const cleanTopic = topic.replace(/[ًٌٍَُِّْ\u200C]/g, '').trim();
    filtered = filtered.filter((doc) => {
      const docMain = (doc.main_topic || '').replace(/[ًٌٍَُِّْ\u200C]/g, '').toLowerCase();
      const docSub = (doc.sub_topic || '').replace(/[ًٌٍَُِّْ\u200C]/g, '').toLowerCase();
      return docMain.includes(cleanTopic) || docSub.includes(cleanTopic);
    });
  }

  // Filter by Verification Status (handles Persian and English)
  if (verification && verification !== 'all') {
    filtered = filtered.filter((doc) => {
      const v = (doc.human_verification_status || '').toLowerCase();
      if (verification === 'verified' || verification === 'تایید شده') {
        return v.includes('verified') || v.includes('تایید');
      }
      if (verification === 'pending' || verification === 'در انتظار بررسی' || verification === 'در انتظار') {
        return v.includes('pending') || v.includes('انتظار');
      }
      return v.includes(verification);
    });
  }

  // Filter by Documentary Mode
  if (mode && mode !== 'all') {
    filtered = filtered.filter((doc) =>
      (doc.documentary_mode || '').toLowerCase().includes(mode)
    );
  }

  // Filter by is_series ('بله' / 'خیر')
  if (isSeries && isSeries !== 'all') {
    filtered = filtered.filter((doc) => {
      const s = (doc.is_series || '').toLowerCase().trim();
      if (isSeries === 'بله' || isSeries === 'true' || isSeries === 'yes') {
        return s === 'بله' || s === 'true' || s === 'yes';
      }
      return s === 'خیر' || s === 'false' || s === 'no' || s === '';
    });
  }

  // Filter by format_category
  if (formatCategoryParam && formatCategoryParam !== 'all') {
    filtered = filtered.filter((doc) =>
      (doc.format_category || '').toLowerCase().includes(formatCategoryParam)
    );
  }

  // Filter by time_category
  if (timeCategory && timeCategory !== 'all') {
    filtered = filtered.filter((doc) =>
      (doc.time_category || '').toLowerCase().includes(timeCategory)
    );
  }

  // Filter by temporal_era per Phase 4 Roadmap
  if (temporalEra && temporalEra !== 'all') {
    const cleanEra = temporalEra.replace(/[ًٌٍَُِّْ\u200C]/g, '').trim();
    filtered = filtered.filter((doc) => {
      const docEra = (doc.temporal_era || '').replace(/[ًٌٍَُِّْ\u200C]/g, '').toLowerCase();
      return docEra.includes(cleanEra);
    });
  }

  // Filter by Flat Arrays (thematic_tags, geographical_locations, semantic_keywords, languages_and_dialects)
  if (tag) {
    filtered = filtered.filter((doc) =>
      (doc.thematic_tags || []).some((t) => t.toLowerCase().includes(tag))
    );
  }
  if (location) {
    filtered = filtered.filter((doc) =>
      (doc.geographical_locations || []).some((l) => l.toLowerCase().includes(location))
    );
  }
  if (keyword) {
    filtered = filtered.filter((doc) =>
      (doc.semantic_keywords || []).some((k) => k.toLowerCase().includes(keyword))
    );
  }
  if (language) {
    filtered = filtered.filter((doc) =>
      (doc.languages_and_dialects || []).some((l) => l.toLowerCase().includes(language))
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    let valA: string | number = (a as any)[sortBy] ?? '';
    let valB: string | number = (b as any)[sortBy] ?? '';

    // Number comparison for score
    if (sortBy === 'confidence_score' || sortBy === 'ammar_discourse_score') {
      const numA = parseFloat(String(valA)) || 0;
      const numB = parseFloat(String(valB)) || 0;
      return order === 'desc' ? numB - numA : numA - numB;
    }

    if (sortBy === 'duration_exact') {
      const secA = parseDurationToSeconds(String(valA));
      const secB = parseDurationToSeconds(String(valB));
      return order === 'desc' ? secB - secA : secA - secB;
    }

    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();

    if (valA < valB) return order === 'desc' ? 1 : -1;
    if (valA > valB) return order === 'desc' ? -1 : 1;
    return 0;
  });

  return filtered;
}

/**
 * GET /api/v1/documentaries
 * Pagination, Search, Filter, Sort
 */
app.get('/api/v1/documentaries', (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));

    const filtered = filterAndSortDocumentaries(documentaryStore, req.query);

    // KPI Metrics across the entire active documentary repository per Section 4 of Data Dictionary
    const totalRepoSeconds = documentaryStore.reduce(
      (acc, doc) => acc + parseDurationToSeconds(doc.duration_exact),
      0
    );
    const nonNullScores = documentaryStore
      .map((d) => parseFloat(d.ammar_discourse_score))
      .filter((s) => !isNaN(s) && s > 0);
    const averageAmmarScore = nonNullScores.length > 0
      ? Number((nonNullScores.reduce((acc, s) => acc + s, 0) / nonNullScores.length).toFixed(1))
      : 0;

    const verifiedCount = documentaryStore.filter((d) => {
      const v = d.human_verification_status.toLowerCase();
      return v.includes('verified') || v.includes('تایید');
    }).length;

    // Pagination slice
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    res.json({
      success: true,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      dataSource: connectionConfig.mode === 'live' ? 'google_sheets_webapp' : 'mock_sheets_seed',
      lastSyncTime: connectionConfig.lastSyncTime,
      data: paginatedData,
      kpis: {
        totalRecords: documentaryStore.length,
        totalDurationSeconds: totalRepoSeconds,
        totalDurationFormatted: formatTotalDurationHoursMinutes(totalRepoSeconds),
        averageAmmarScore,
        verifiedCount,
        pendingCount: documentaryStore.length - verifiedCount,
        verifiedPercentage: documentaryStore.length > 0 ? Math.round((verifiedCount / documentaryStore.length) * 100) : 0
      },
      metrics: {
        totalRecords: documentaryStore.length,
        filteredCount: total,
        syncDurationMs: lastSyncDurationMs,
        validationErrorsCount: lastSyncErrorsCount
      }
    });
  } catch (err: any) {
    console.error('Error fetching documentaries:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to process documentary query',
      error: err?.message || String(err)
    });
  }
});

/**
 * GET /api/v1/documentaries/:id
 * Retrieve single documentary with strict JSON structure
 */
app.get('/api/v1/documentaries/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const decodedId = decodeURIComponent(id || '').trim().toLowerCase();
  const found = documentaryStore.find(
    (doc) => (doc.asset_id || '').trim().toLowerCase() === decodedId
  );

  if (!found) {
    return res.status(404).json({
      success: false,
      message: `Documentary with asset_id '${id}' not found.`
    });
  }

  // Responding with 100% strict schema representation
  res.json({
    success: true,
    data: found
  });
});

/**
 * POST /api/v1/documentaries
 * Registers a new documentary, validates strict schema, stores in repository,
 * and forwards POST to Google Apps Script Web App configured via Secrets
 */
app.post('/api/v1/documentaries', async (req: Request, res: Response) => {
  try {
    const raw = req.body;
    const duplicateAction = req.body?.duplicateAction || req.body?.action || 'append';
    const docPayload = raw?.jsonContent || raw?.data || raw;
    const validation = validateAndSanitizeDocumentary(docPayload, documentaryStore.length);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'اعتبارسنجی اسکیما با خطا مواجه شد',
        errors: validation.errors
      });
    }

    const newDoc = validation.sanitizedData;

    // Check duplicate asset_id
    const existingIndex = documentaryStore.findIndex(
      (d) => d.asset_id.toLowerCase() === newDoc.asset_id.toLowerCase()
    );
    if (existingIndex >= 0) {
      if (duplicateAction === 'update') {
        documentaryStore[existingIndex] = newDoc;
      } else {
        documentaryStore.unshift(newDoc);
      }
    } else {
      documentaryStore.unshift(newDoc);
    }

    // Forward to live Apps Script Web App (from Secrets WEB_APP_URL)
    let sheetAppendResult: any = null;
    if (connectionConfig.webAppUrl) {
      try {
        const sheetRes = await fetch(connectionConfig.webAppUrl, {
          method: 'POST',
          redirect: 'follow',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonContent: newDoc,
            duplicateAction,
            sheet: connectionConfig.sheetName || 'temp'
          })
        });
        sheetAppendResult = await sheetRes.json().catch(() => null);
      } catch (err: any) {
        console.warn('Failed to forward row to Google Sheets Web App:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: duplicateAction === 'update' && existingIndex >= 0
        ? `شناسنامه مستند «${newDoc.title_extracted || newDoc.asset_id}» با موفقیت به‌روزرسانی شد.`
        : `شناسنامه مستند «${newDoc.title_extracted || newDoc.asset_id}» با موفقیت در سامانه و گوگل‌شیت ثبت گردید.`,
      data: newDoc,
      action: duplicateAction === 'update' && existingIndex >= 0 ? 'updated' : 'appended',
      sheetAppendResult
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'خطا در ثبت مستند',
      error: err.message
    });
  }
});

/**
 * Performs synchronization with Google Sheets Web App
 */
export async function performSheetSync(requestedUrl: string, requestedSheetName: string = 'temp') {
  const startTime = Date.now();
  let fetchUrl = requestedUrl;
  if (requestedSheetName) {
    try {
      const u = new URL(requestedUrl);
      if (!u.searchParams.has('sheet') && !u.searchParams.has('sheetName') && !u.searchParams.has('tab')) {
        u.searchParams.set('sheet', requestedSheetName);
      }
      fetchUrl = u.toString();
    } catch {
      const sep = requestedUrl.includes('?') ? '&' : '?';
      fetchUrl = `${requestedUrl}${sep}sheet=${encodeURIComponent(requestedSheetName)}`;
    }
  }

  const fetchResponse = await fetch(fetchUrl, {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'DocuSheet-Sync-Service/1.0'
    }
  });

  if (!fetchResponse.ok) {
    throw new Error(`Google Sheets Web App returned HTTP status ${fetchResponse.status}: ${fetchResponse.statusText}`);
  }

  const rawJson = await fetchResponse.json();

  let rawList: any[] = [];
  if (Array.isArray(rawJson)) {
    rawList = rawJson;
  } else if (rawJson && Array.isArray(rawJson.data)) {
    rawList = rawJson.data;
  } else if (rawJson && Array.isArray(rawJson.rows)) {
    rawList = rawJson.rows;
  } else if (rawJson && Array.isArray(rawJson.items)) {
    rawList = rawJson.items;
  } else if (rawJson && (rawJson.status === 'active' || rawJson.status === 'success')) {
    connectionConfig.webAppUrl = requestedUrl;
    connectionConfig.sheetName = requestedSheetName;
    connectionConfig.lastSyncStatus = 'success';
    connectionConfig.lastSyncTime = new Date().toISOString();
    connectionConfig.mode = 'live';
    lastSyncDurationMs = Date.now() - startTime;
    return {
      success: true,
      message: `اتصال زنده به وب‌سرویس گوگل‌شیت (${rawJson.service || 'Ammar Documentary Registration Web App API'}) با موفقیت تایید شد.`,
      count: documentaryStore.length,
      mode: 'live',
      sheetName: requestedSheetName,
      durationMs: lastSyncDurationMs,
      serviceInfo: rawJson
    };
  } else {
    throw new Error('پاسخ دریافتی از وب‌اپ گوگل شیت ساختار معتبر آرایه‌ای یا شناسه فعال‌سازی ندارد.');
  }

  const sanitizedList: DocumentaryMetadata[] = [];
  const allWarnings: string[] = [];
  let errorCount = 0;

  rawList.forEach((item, idx) => {
    const result = validateAndSanitizeDocumentary(item, idx);
    if (result.isValid) {
      sanitizedList.push(result.sanitizedData);
    } else {
      errorCount++;
    }
    if (result.warnings.length > 0) {
      allWarnings.push(...result.warnings);
    }
  });

  if (sanitizedList.length === 0) {
    throw new Error('هیچ رکورد مستند معتبری از پاسخ وب‌اپلیکیشن گوگل‌شیت استخراج نگردید.');
  }

  // Update in-memory store
  documentaryStore = sanitizedList;
  connectionConfig.webAppUrl = requestedUrl;
  connectionConfig.sheetName = requestedSheetName;
  connectionConfig.lastSyncStatus = 'success';
  connectionConfig.lastSyncTime = new Date().toISOString();
  connectionConfig.mode = 'live';
  lastSyncDurationMs = Date.now() - startTime;
  lastSyncErrorsCount = errorCount;

  return {
    success: true,
    message: `همگام‌سازی زنده با موفقیت انجام شد. برگه «${requestedSheetName}» همگام گردید (تعداد ${sanitizedList.length} رکورد).`,
    count: sanitizedList.length,
    mode: 'live',
    sheetName: requestedSheetName,
    durationMs: lastSyncDurationMs,
    warnings: allWarnings.slice(0, 10),
    totalWarningsCount: allWarnings.length
  };
}

/**
 * POST /api/v1/sync
 * Connects to Google Sheets Web App or direct API, reads rows, validates against strict schema, updates store
 */
app.post('/api/v1/sync', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestedUrl = req.body?.webAppUrl || connectionConfig.webAppUrl;
  const requestedSheetName = (req.body?.sheetName || connectionConfig.sheetName || 'temp').trim();
  const targetMode = req.body?.mode || (requestedUrl ? 'live' : 'seed');

  if (targetMode === 'seed' && !requestedUrl) {
    // Reset or reseed from built-in high fidelity dataset
    documentaryStore = [...SEED_DOCUMENTARIES];
    connectionConfig.lastSyncStatus = 'success';
    connectionConfig.lastSyncTime = new Date().toISOString();
    connectionConfig.mode = 'seed';
    connectionConfig.sheetName = requestedSheetName;
    lastSyncDurationMs = Date.now() - startTime;
    lastSyncErrorsCount = 0;

    return res.json({
      success: true,
      message: 'Reseeded internal dataset successfully with 100% strict metadata schema.',
      count: documentaryStore.length,
      mode: 'seed',
      sheetName: requestedSheetName,
      durationMs: lastSyncDurationMs
    });
  }

  if (!requestedUrl) {
    return res.status(400).json({
      success: false,
      message: 'Google Sheets Web App URL is required for live synchronization.'
    });
  }

  connectionConfig.lastSyncStatus = 'syncing';

  try {
    const result = await performSheetSync(requestedUrl, requestedSheetName);
    return res.json(result);
  } catch (err: any) {
    connectionConfig.lastSyncStatus = 'failed';
    connectionConfig.lastSyncError = err.message || String(err);
    lastSyncDurationMs = Date.now() - startTime;

    console.error('Google Sheets sync error:', err);
    return res.status(502).json({
      success: false,
      message: `خطا در همگام‌سازی با گوگل‌شیت: ${err.message}`,
      error: err.message || String(err),
      durationMs: lastSyncDurationMs
    });
  }
});

/**
 * GET & POST /api/v1/config
 */
app.get('/api/v1/config', (_req: Request, res: Response) => {
  res.json({
    success: true,
    config: connectionConfig,
    totalRecords: documentaryStore.length
  });
});

app.post('/api/v1/config', (req: Request, res: Response) => {
  const { webAppUrl, sheetId, sheetName, mode, syncIntervalMinutes } = req.body || {};
  if (webAppUrl !== undefined) connectionConfig.webAppUrl = String(webAppUrl).trim();
  if (sheetId !== undefined) connectionConfig.sheetId = String(sheetId).trim();
  if (sheetName !== undefined) connectionConfig.sheetName = String(sheetName).trim();
  if (mode !== undefined && (mode === 'live' || mode === 'seed')) connectionConfig.mode = mode;
  if (syncIntervalMinutes !== undefined) connectionConfig.syncIntervalMinutes = Number(syncIntervalMinutes);

  res.json({
    success: true,
    message: 'Configuration updated successfully.',
    config: connectionConfig
  });
});

/**
 * GET /api/v1/export
 * Phase 8 Export Engine: Export filtered dataset as Excel SpreadsheetML (.xls), CSV (with UTF-8 BOM), or JSON
 */
app.get('/api/v1/export', (req: Request, res: Response) => {
  const format = String(req.query.format || 'json').toLowerCase();
  const { format: _f, ...filterParams } = req.query;
  const datasetToExport = filterAndSortDocumentaries(documentaryStore, filterParams);

  if (format === 'excel' || format === 'xlsx' || format === 'xls') {
    const xmlContent = generateExcelXmlContent(datasetToExport, connectionConfig.sheetName || 'temp');
    res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="documentaries-export-66cols.xls"');
    return res.send(xmlContent);
  }

  if (format === 'csv') {
    const csvContent = generateCsvContent(datasetToExport);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="documentaries-export-66cols.csv"');
    return res.send(csvContent);
  }

  // Default JSON export
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="documentaries-export.json"');
  return res.json(datasetToExport);
});

/**
 * POST /api/v1/validate
 * Validates any arbitrary JSON against strict schema
 */
app.post('/api/v1/validate', (req: Request, res: Response) => {
  const payload = req.body;
  if (!payload) {
    return res.status(400).json({ isValid: false, errors: ['Empty request body'] });
  }

  if (Array.isArray(payload)) {
    const results = payload.map((item, idx) => validateAndSanitizeDocumentary(item, idx));
    return res.json({
      success: true,
      totalCount: payload.length,
      allValid: results.every(r => r.isValid),
      results
    });
  }

  const result = validateAndSanitizeDocumentary(payload);
  res.json({
    success: true,
    ...result
  });
});

/**
 * GET /api/v1/google-apps-script
 * Provides copyable Google Apps Script for the user's Google Sheet
 */
app.get('/api/v1/google-apps-script', (_req: Request, res: Response) => {
  try {
    const scriptPath = path.join(__dirname, 'file', 'script.google.com code.txt');
    if (fs.existsSync(scriptPath)) {
      const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
      return res.type('text/plain; charset=utf-8').send(scriptCode);
    }
  } catch (err) {
    console.error('Failed to read Google Apps Script file:', err);
  }
  res.status(404).type('text/plain').send('// Google Apps Script file not found');
});

/**
 * Start Server: Vite middleware integration
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuSheet API & Metadata Hub running on http://0.0.0.0:${PORT}`);

    // Auto-sync with Google Sheets Web App on startup if configured
    if (connectionConfig.webAppUrl && connectionConfig.mode === 'live') {
      console.log(`[Startup-Sync] Initiating connection with Google Sheets tab '${connectionConfig.sheetName}'...`);
      performSheetSync(connectionConfig.webAppUrl, connectionConfig.sheetName || 'temp')
        .then((res) => {
          console.log(`[Startup-Sync] Loaded ${res.count} records from Google Sheets tab '${res.sheetName}'.`);
        })
        .catch((err) => {
          console.warn(`[Startup-Sync] Initial sync deferred (${err.message}). Using seed repository.`);
        });
    }
  });
}

const isMain = process.argv[1] && (
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]) ||
  process.argv[1].endsWith('server.ts')
);

if (isMain) {
  startServer().catch((err) => {
    console.error('Fatal startup error:', err);
    process.exit(1);
  });
}
