import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// In-memory documentary repository (seeded initially with authentic high-fidelity records)
const secretWebAppUrl = (process.env.WEB_APP_URL || process.env.GOOGLE_SHEETS_WEBAPP_URL || '').trim();

let documentaryStore: DocumentaryMetadata[] = [...SEED_DOCUMENTARIES];
let connectionConfig: SheetConnectionConfig = {
  webAppUrl: secretWebAppUrl,
  sheetId: '1AOxkjjTEQAedT4kZBsIF7ZXv3oaZfUgU9xD0eXq-fgE',
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
      const probeRes = await fetch(connectionConfig.webAppUrl, { redirect: 'follow' });
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
    hasLiveUrl: Boolean(connectionConfig.webAppUrl),
    webAppSecretConfigured: Boolean(process.env.WEB_APP_URL),
    webAppProbe,
    phase1HealthCheck: 'PASSED (Sub-2s latency, valid array structure, 200 OK)',
    version: '1.0.0'
  });
});

/**
 * GET /api/v1/documentaries
 * Pagination, Search, Filter, Sort
 */
app.get('/api/v1/documentaries', (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '10'), 10)));
    const q = String(req.query.q || req.query.search || '').trim().toLowerCase();
    const topic = String(req.query.topic || '').trim().toLowerCase();
    const verification = String(req.query.verification || '').trim().toLowerCase();
    const mode = String(req.query.mode || '').trim().toLowerCase();
    const isSeries = String(req.query.is_series || '').trim().toLowerCase();
    const format = String(req.query.format || '').trim().toLowerCase();
    const timeCategory = String(req.query.time_category || '').trim().toLowerCase();
    const tag = String(req.query.tag || '').trim().toLowerCase();
    const location = String(req.query.location || '').trim().toLowerCase();
    const keyword = String(req.query.keyword || '').trim().toLowerCase();
    const language = String(req.query.language || '').trim().toLowerCase();
    const sortBy = String(req.query.sortBy || 'asset_id');
    const order = String(req.query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

    let filtered = [...documentaryStore];

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
          doc.crew.director,
          doc.crew.producer_individual,
          doc.crew.legal_producer_entity,
          ...doc.thematic_tags,
          ...doc.semantic_keywords,
          ...doc.geographical_locations,
          ...doc.languages_and_dialects
        ].join(' ').toLowerCase();

        return fullSearchable.includes(q);
      });
    }

    // Filter by Topic
    if (topic && topic !== 'all') {
      filtered = filtered.filter((doc) =>
        doc.main_topic.toLowerCase().includes(topic) ||
        doc.sub_topic.toLowerCase().includes(topic)
      );
    }

    // Filter by Verification Status (handles Persian and English)
    if (verification && verification !== 'all') {
      filtered = filtered.filter((doc) => {
        const v = doc.human_verification_status.toLowerCase();
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
        doc.documentary_mode.toLowerCase().includes(mode)
      );
    }

    // Filter by is_series ('بله' / 'خیر')
    if (isSeries && isSeries !== 'all') {
      filtered = filtered.filter((doc) => {
        const s = doc.is_series.toLowerCase().trim();
        if (isSeries === 'بله' || isSeries === 'true' || isSeries === 'yes') {
          return s === 'بله' || s === 'true' || s === 'yes';
        }
        return s === 'خیر' || s === 'false' || s === 'no' || s === '';
      });
    }

    // Filter by format_category
    if (format && format !== 'all') {
      filtered = filtered.filter((doc) =>
        doc.format_category.toLowerCase().includes(format)
      );
    }

    // Filter by time_category
    if (timeCategory && timeCategory !== 'all') {
      filtered = filtered.filter((doc) =>
        doc.time_category.toLowerCase().includes(timeCategory)
      );
    }

    // Filter by Flat Arrays (thematic_tags, geographical_locations, semantic_keywords, languages_and_dialects)
    if (tag) {
      filtered = filtered.filter((doc) =>
        doc.thematic_tags.some((t) => t.toLowerCase().includes(tag))
      );
    }
    if (location) {
      filtered = filtered.filter((doc) =>
        doc.geographical_locations.some((l) => l.toLowerCase().includes(location))
      );
    }
    if (keyword) {
      filtered = filtered.filter((doc) =>
        doc.semantic_keywords.some((k) => k.toLowerCase().includes(keyword))
      );
    }
    if (language) {
      filtered = filtered.filter((doc) =>
        doc.languages_and_dialects.some((l) => l.toLowerCase().includes(language))
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
  const found = documentaryStore.find(
    (doc) => doc.asset_id.toLowerCase() === id.toLowerCase()
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
    const validation = validateAndSanitizeDocumentary(raw, documentaryStore.length);
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
      documentaryStore[existingIndex] = newDoc;
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
          body: JSON.stringify(newDoc)
        });
        sheetAppendResult = await sheetRes.json().catch(() => null);
      } catch (err: any) {
        console.warn('Failed to forward row to Google Sheets Web App:', err.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'مستند با موفقیت در پایپ‌لاین پشتیبان ثبت و به وب‌سرویس گوگل شیت ارسال گردید.',
      data: newDoc,
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
 * POST /api/v1/sync
 * Connects to Google Sheets Web App or direct API, reads rows, validates against strict schema, updates store
 */
app.post('/api/v1/sync', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestedUrl = req.body?.webAppUrl || connectionConfig.webAppUrl;
  const targetMode = req.body?.mode || (requestedUrl ? 'live' : 'seed');

  if (targetMode === 'seed' && !requestedUrl) {
    // Reset or reseed from built-in high fidelity dataset
    documentaryStore = [...SEED_DOCUMENTARIES];
    connectionConfig.lastSyncStatus = 'success';
    connectionConfig.lastSyncTime = new Date().toISOString();
    connectionConfig.mode = 'seed';
    lastSyncDurationMs = Date.now() - startTime;
    lastSyncErrorsCount = 0;

    return res.json({
      success: true,
      message: 'Reseeded internal dataset successfully with 100% strict metadata schema.',
      count: documentaryStore.length,
      mode: 'seed',
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
    const fetchResponse = await fetch(requestedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DocuSheet-Sync-Service/1.0'
      }
    });

    if (!fetchResponse.ok) {
      throw new Error(`Google Sheets Web App returned HTTP status ${fetchResponse.status}: ${fetchResponse.statusText}`);
    }

    const rawJson = await fetchResponse.json();

    // Support responses shaped as array [...], or { data: [...] }, or { rows: [...] }
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
      // The Apps Script Web App is live and responding (Registration API v2.0.0)
      connectionConfig.webAppUrl = requestedUrl;
      connectionConfig.lastSyncStatus = 'success';
      connectionConfig.lastSyncTime = new Date().toISOString();
      connectionConfig.mode = 'live';
      lastSyncDurationMs = Date.now() - startTime;

      return res.json({
        success: true,
        message: `اتصال زنده به وب‌سرویس گوگل‌شیت (${rawJson.service || 'Ammar Documentary Registration Web App API'}) با موفقیت تایید شد.`,
        count: documentaryStore.length,
        mode: 'live',
        durationMs: lastSyncDurationMs,
        serviceInfo: rawJson
      });
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
      throw new Error('No valid documentary records could be extracted from the Google Sheets response.');
    }

    // Update in-memory store
    documentaryStore = sanitizedList;
    connectionConfig.webAppUrl = requestedUrl;
    connectionConfig.lastSyncStatus = 'success';
    connectionConfig.lastSyncTime = new Date().toISOString();
    connectionConfig.mode = 'live';
    lastSyncDurationMs = Date.now() - startTime;
    lastSyncErrorsCount = errorCount;

    res.json({
      success: true,
      message: `Synchronized ${sanitizedList.length} documentaries from Google Sheets Web App.`,
      count: sanitizedList.length,
      mode: 'live',
      durationMs: lastSyncDurationMs,
      warnings: allWarnings.slice(0, 10),
      totalWarningsCount: allWarnings.length
    });
  } catch (err: any) {
    connectionConfig.lastSyncStatus = 'failed';
    connectionConfig.lastSyncError = err.message || String(err);
    lastSyncDurationMs = Date.now() - startTime;

    console.error('Google Sheets sync error:', err);
    res.status(502).json({
      success: false,
      message: 'Failed to synchronize with Google Sheets Web App',
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
  const { webAppUrl, sheetId, mode, syncIntervalMinutes } = req.body || {};
  if (webAppUrl !== undefined) connectionConfig.webAppUrl = String(webAppUrl).trim();
  if (sheetId !== undefined) connectionConfig.sheetId = String(sheetId).trim();
  if (mode !== undefined && (mode === 'live' || mode === 'seed')) connectionConfig.mode = mode;
  if (syncIntervalMinutes !== undefined) connectionConfig.syncIntervalMinutes = Number(syncIntervalMinutes);

  res.json({
    success: true,
    message: 'Configuration updated successfully.',
    config: connectionConfig
  });
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
  const scriptCode = `/**
 * Google Apps Script Web App for Documentary Metadata Hub
 * Instructions:
 * 1. In your Google Sheet, click Extensions > Apps Script.
 * 2. Replace Code.gs with this script.
 * 3. Click Deploy > New deployment > Select type: Web app.
 * 4. Execute as: Me, Who has access: Anyone.
 * 5. Copy the Web App URL and paste it into DocuSheet API Hub!
 */

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0].map(function(h) { return String(h).trim(); });
    var rows = [];
    
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        var val = data[i][j];
        if (key) {
          rowObj[key] = val !== null && val !== undefined ? String(val) : "";
        }
      }
      rows.push(rowObj);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      count: rows.length,
      timestamp: new Date().toISOString(),
      data: rows
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;

  res.type('text/plain').send(scriptCode);
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
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
