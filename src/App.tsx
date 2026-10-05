import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { StatsOverview } from './components/StatsOverview.tsx';
import { QueryToolbar } from './components/QueryToolbar.tsx';
import { DocumentaryTable } from './components/DocumentaryTable.tsx';
import { DocumentaryCards } from './components/DocumentaryCards.tsx';
import { PaginationControls } from './components/PaginationControls.tsx';
import { DocumentaryDetailModal } from './components/DocumentaryDetailModal.tsx';
import { GoogleSheetModal } from './components/GoogleSheetModal.tsx';
import { ApiExplorerModal } from './components/ApiExplorerModal.tsx';
import { SchemaValidatorModal } from './components/SchemaValidatorModal.tsx';
import { JsonUploaderModal } from './components/JsonUploaderModal.tsx';
import { DocumentaryMetadata, PaginationInfo, SheetConnectionConfig, ApiResponse, KpiMetrics } from './types/documentary.ts';
import { AlertCircle, CheckCircle, Loader2, Clock, Database } from 'lucide-react';
import { exportToCsv, exportToJson, exportToExcelXml } from './utils/exportUtils.ts';

export default function App() {
  const [documentaries, setDocumentaries] = useState<DocumentaryMetadata[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [kpiMetrics, setKpiMetrics] = useState<KpiMetrics | undefined>(undefined);
  const [dataSource, setDataSource] = useState<string>('mock_sheets_seed');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [config, setConfig] = useState<SheetConnectionConfig | null>(null);

  // Filters & Controls per Data Dictionary
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedTemporalEra, setSelectedTemporalEra] = useState<string>('all');
  const [selectedVerification, setSelectedVerification] = useState<string>('all');
  const [selectedIsSeries, setSelectedIsSeries] = useState<string>('all');
  const [selectedTimeCategory, setSelectedTimeCategory] = useState<string>('all');
  const [limit, setLimit] = useState<number>(10);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allFormats, setAllFormats] = useState<string[]>([]);
  const [allEras, setAllEras] = useState<string[]>([]);

  // Modals
  const [selectedDoc, setSelectedDoc] = useState<DocumentaryMetadata | null>(null);
  const [detailModalTab, setDetailModalTab] = useState<'overview' | 'crew' | 'timecodes' | 'archival' | 'json'>('overview');
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);
  const [isApiExplorerOpen, setIsApiExplorerOpen] = useState<boolean>(false);
  const [isValidatorOpen, setIsValidatorOpen] = useState<boolean>(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);

  // Notifications
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 280);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch connection config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  }, []);

  // Fetch documentaries
  const fetchDocumentaries = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageToLoad),
        limit: String(limit)
      });

      if (debouncedSearch) params.set('q', debouncedSearch);
      if (selectedTopic !== 'all') params.set('topic', selectedTopic);
      if (selectedFormat !== 'all') params.set('format', selectedFormat);
      if (selectedTemporalEra !== 'all') params.set('temporal_era', selectedTemporalEra);
      if (selectedVerification !== 'all') params.set('verification', selectedVerification);
      if (selectedIsSeries !== 'all') params.set('is_series', selectedIsSeries);
      if (selectedTimeCategory !== 'all') params.set('time_category', selectedTimeCategory);

      const res = await fetch(`/api/v1/documentaries?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data: ApiResponse<DocumentaryMetadata[]> = await res.json();
      if (data.success) {
        setDocumentaries(data.data);
        if (data.pagination) setPagination(data.pagination);
        if (data.kpis) setKpiMetrics(data.kpis);
        setDataSource(data.dataSource);
        setLastSyncTime(data.lastSyncTime);

        // Collect unique topics, formats, and eras
        if (data.data.length > 0) {
          const topics = Array.from(
            new Set(data.data.map((d) => d.main_topic).filter(Boolean))
          );
          setAllTopics((prev) => Array.from(new Set([...prev, ...topics])));

          const formats = Array.from(
            new Set(data.data.map((d) => d.format_category).filter(Boolean))
          );
          setAllFormats((prev) => Array.from(new Set([...prev, ...formats])));

          const eras = Array.from(
            new Set(data.data.map((d) => d.temporal_era).filter(Boolean))
          );
          setAllEras((prev) => Array.from(new Set([...prev, ...eras])));
        }
      }
    } catch (err: any) {
      console.error('Error fetching documentaries:', err);
      showToast(err.message || 'خطا در بارگذاری اطلاعات مستندها', 'error');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, selectedTopic, selectedFormat, selectedTemporalEra, selectedVerification, selectedIsSeries, selectedTimeCategory, limit]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    fetchDocumentaries(1);
  }, [fetchDocumentaries]);

  // Trigger sync
  const handleTriggerSync = async (customUrl?: string, mode?: 'live' | 'seed', sheetName?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: customUrl, mode, sheetName })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'همگام‌سازی ناموفق بود.');
      }

      showToast(data.message || 'همگام‌سازی با موفقیت انجام شد.', 'success');
      await fetchConfig();
      await fetchDocumentaries(pagination.page);
      return data;
    } catch (err: any) {
      showToast(err.message || 'خطا در همگام‌سازی با گوگل شیت', 'error');
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  // Save config
  const handleSaveConfig = async (webAppUrl: string, mode: 'live' | 'seed', sheetName?: string) => {
    try {
      const res = await fetch('/api/v1/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl, mode, sheetName })
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTopic('all');
    setSelectedFormat('all');
    setSelectedTemporalEra('all');
    setSelectedVerification('all');
    setSelectedIsSeries('all');
    setSelectedTimeCategory('all');
  };

  const handleViewDocJson = (doc: DocumentaryMetadata) => {
    setSelectedDoc(doc);
    setDetailModalTab('json');
  };

  const handleSelectDoc = (doc: DocumentaryMetadata) => {
    setSelectedDoc(doc);
    setDetailModalTab('overview');
  };

  const handleSelectTag = (tag: string) => {
    setSearch(tag);
  };

  // Full-dataset export handler per Phase 8 Roadmap
  const handleExport = (format: 'excel' | 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      params.set('format', format);
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (selectedTopic !== 'all') params.set('topic', selectedTopic);
      if (selectedFormat !== 'all') params.set('format_category', selectedFormat);
      if (selectedTemporalEra !== 'all') params.set('temporal_era', selectedTemporalEra);
      if (selectedVerification !== 'all') params.set('verification', selectedVerification);
      if (selectedIsSeries !== 'all') params.set('is_series', selectedIsSeries);
      if (selectedTimeCategory !== 'all') params.set('time_category', selectedTimeCategory);

      const exportUrl = `/api/v1/export?${params.toString()}`;
      const a = document.createElement('a');
      a.href = exportUrl;
      const fileExt = format === 'excel' ? 'xls' : format;
      a.download = `documentaries-export-66cols.${fileExt}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`درخواست دانلود خروجی ${format.toUpperCase()} با موفقیت ارسال شد.`, 'success');
    } catch {
      // Fallback to client-side page export
      if (format === 'excel') exportToExcelXml(documentaries, undefined, config?.sheetName || 'temp');
      else if (format === 'csv') exportToCsv(documentaries);
      else exportToJson(documentaries);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-neutral-900 flex flex-col selection:bg-black selection:text-white">
      {/* Toast Notification (MD3 Snackbar) */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium flex items-center space-x-2 space-x-reverse transition-all animate-in fade-in slide-in-from-top-3 ${
            toast.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-800'
              : 'bg-red-600 text-white border-red-700'
          }`}
          dir="rtl"
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        config={config}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenApiExplorer={() => setIsApiExplorerOpen(true)}
        onOpenValidator={() => setIsValidatorOpen(true)}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onSync={() => handleTriggerSync(config?.webAppUrl, config?.mode, config?.sheetName)}
        isSyncing={isSyncing}
        totalRecords={kpiMetrics?.totalRecords ?? pagination.total}
      />

      {/* Main Content Area with MD3 Grid & Spacing System */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* MD3 Page Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-0.5" dir="rtl">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 tracking-tight">
              میز کار و تحلیل فراداده‌های مستند
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5 font-normal">
              پایش بلادرنگ ۶۶ ستون متادیتای ساخت‌یافته و همگام با برگه «{config?.sheetName || 'temp'}»
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            {lastSyncTime && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-200/80 rounded-xl text-neutral-600 shadow-2xs font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>سینک: {new Date(lastSyncTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 border border-neutral-200/80 rounded-xl text-neutral-700 font-medium text-[11px]">
              <Database className="w-3.5 h-3.5 text-neutral-500" />
              <span>{dataSource === 'mock_sheets_seed' ? 'داده‌های اولیه (Seed)' : 'گوگل‌شیت زنده (Live)'}</span>
            </div>
          </div>
        </div>

        {/* Section 1: KPI Summary Metrics (MD3 Outlined Cards) */}
        <StatsOverview
          documentaries={documentaries}
          totalRecords={pagination.total}
          dataSource={dataSource}
          lastSyncTime={lastSyncTime}
          kpiMetrics={kpiMetrics}
        />

        {/* Section 2: Data Controls & Filters Toolbar */}
        <QueryToolbar
          search={search}
          onSearchChange={setSearch}
          selectedTopic={selectedTopic}
          onTopicChange={setSelectedTopic}
          selectedFormat={selectedFormat}
          onFormatChange={setSelectedFormat}
          selectedTemporalEra={selectedTemporalEra}
          onTemporalEraChange={setSelectedTemporalEra}
          selectedVerification={selectedVerification}
          onVerificationChange={setSelectedVerification}
          selectedIsSeries={selectedIsSeries}
          onIsSeriesChange={setSelectedIsSeries}
          selectedTimeCategory={selectedTimeCategory}
          onTimeCategoryChange={setSelectedTimeCategory}
          limit={limit}
          onLimitChange={setLimit}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onReset={handleResetFilters}
          topicsList={allTopics}
          formatsList={allFormats}
          erasList={allEras}
          onExportExcel={() => handleExport('excel')}
          onExportCsv={() => handleExport('csv')}
          onExportJson={() => handleExport('json')}
        />

        {/* Section 3: Data Visualization / Table & Cards View */}
        {loading ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-neutral-200/80 shadow-2xs flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-neutral-600 animate-spin mb-3" />
            <p className="text-xs font-semibold text-neutral-700">در حال واکشی متادیتا از سرویس پشتیبان...</p>
            <p className="text-[11px] text-neutral-400 mt-1">اتصال به وب‌سرویس و اعتبارسنجی ۶۶ کلید اسکیما</p>
          </div>
        ) : viewMode === 'table' ? (
          <DocumentaryTable
            documentaries={documentaries}
            onSelectDoc={handleSelectDoc}
            onViewJson={handleViewDocJson}
          />
        ) : (
          <DocumentaryCards
            documentaries={documentaries}
            onSelectDoc={handleSelectDoc}
            onViewJson={handleViewDocJson}
            onSelectTag={handleSelectTag}
          />
        )}

        {/* Section 4: Pagination Controls (MD3 Surface Bar) */}
        {!loading && (
          <PaginationControls
            pagination={pagination}
            onPageChange={(p) => fetchDocumentaries(p)}
          />
        )}
      </main>


      {/* Modals */}
      <DocumentaryDetailModal
        documentary={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onSelectTag={handleSelectTag}
        initialTab={detailModalTab}
      />

      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onTriggerSync={handleTriggerSync}
      />

      <ApiExplorerModal
        isOpen={isApiExplorerOpen}
        onClose={() => setIsApiExplorerOpen(false)}
      />

      <SchemaValidatorModal
        isOpen={isValidatorOpen}
        onClose={() => setIsValidatorOpen(false)}
      />

      <JsonUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSuccess={(msg) => showToast(msg, 'success')}
        existingDocumentaries={documentaries}
        onDocumentaryAdded={async () => {
          await fetchDocumentaries(1);
        }}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-200/60 bg-white py-4 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>داشبورد مدیریت متادیتای مستندها • انطباق کامل با واژه‌نامه داده‌ها (Data Dictionary)</span>
          <span className="font-mono text-[11px] text-neutral-400">
            Strict Schema • Flat Arrays • Sub-Table & Timeline Ready
          </span>
        </div>
      </footer>
    </div>
  );
}
