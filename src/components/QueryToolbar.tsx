import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  LayoutGrid,
  List,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  X,
  Filter
} from 'lucide-react';

interface QueryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTopic: string;
  onTopicChange: (val: string) => void;
  selectedFormat: string;
  onFormatChange: (val: string) => void;
  selectedTemporalEra: string;
  onTemporalEraChange: (val: string) => void;
  selectedVerification: string;
  onVerificationChange: (val: string) => void;
  selectedIsSeries: string;
  onIsSeriesChange: (val: string) => void;
  selectedTimeCategory: string;
  onTimeCategoryChange: (val: string) => void;
  limit: number;
  onLimitChange: (val: number) => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  onReset: () => void;
  topicsList: string[];
  formatsList?: string[];
  erasList?: string[];
  onExportCsv?: () => void;
  onExportJson?: () => void;
  onExportExcel?: () => void;
}

export const QueryToolbar: React.FC<QueryToolbarProps> = ({
  search,
  onSearchChange,
  selectedTopic,
  onTopicChange,
  selectedFormat,
  onFormatChange,
  selectedTemporalEra,
  onTemporalEraChange,
  selectedVerification,
  onVerificationChange,
  selectedIsSeries,
  onIsSeriesChange,
  selectedTimeCategory,
  onTimeCategoryChange,
  limit,
  onLimitChange,
  viewMode,
  onViewModeChange,
  onReset,
  topicsList,
  formatsList = [],
  erasList = [],
  onExportCsv,
  onExportJson,
  onExportExcel
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setIsExportOpen(false);
      }
    };
    if (isExportOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExportOpen]);

  // Guarantee 'ملتِ مبعوث' is always prominent in the topic list per Phase 4 Roadmap
  const enrichedTopics = Array.from(new Set(['ملتِ مبعوث', ...topicsList])).filter(Boolean);

  const defaultFormats = [
    'مستند کوتاه',
    'مستند نیمه‌بلند',
    'مستند بلند',
    'مستند مجموعه',
    'مستند پرتره هنری',
    'مستند بلند سیاسی - پژوهشی',
    'مستند بلند حیات وحش'
  ];
  const combinedFormats = Array.from(new Set([...formatsList, ...defaultFormats])).filter(Boolean);

  const defaultEras = [
    'معاصر (۱۴۰۱ - ۱۴۰۲)',
    '۱۴۰۰ - ۱۴۰۲',
    '۱۳۹۸ - ۱۴۰۲',
    '۱۳۹۶ - ۱۴۰۱',
    '۱۳۶۷ - ۱۴۰۱',
    '۱۳۶۲ - ۱۳۶۳',
    'ساسانیان تا قرن پانزدهم هجری شمسی'
  ];
  const combinedEras = Array.from(new Set([...erasList, ...defaultEras])).filter(Boolean);

  const hasActiveFilters = Boolean(
    search ||
    selectedTopic !== 'all' ||
    selectedFormat !== 'all' ||
    selectedTemporalEra !== 'all' ||
    selectedVerification !== 'all' ||
    selectedIsSeries !== 'all' ||
    selectedTimeCategory !== 'all'
  );

  const activeFiltersCount = [
    selectedTopic !== 'all',
    selectedFormat !== 'all',
    selectedTemporalEra !== 'all',
    selectedVerification !== 'all',
    selectedIsSeries !== 'all',
    selectedTimeCategory !== 'all',
    Boolean(search)
  ].filter(Boolean).length;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-2xs transition-all" dir="rtl">
      <div className="flex flex-col gap-3.5">
        {/* ردیف اول: نوار جستجوی متنی عریض با دکمه پاک کردن، انتخاب تعداد و سوئیچ نمای جدول/کارت (ارتفاع استاندارد ۴۰px) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* نوار جستجوی متنی عریض با آیکون ذره‌بین و دکمه پاکسازی سریع */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در عناوین، نام کارگردان، کلیدواژه‌ها، سوژه‌ها و مضامین..."
              id="search-input"
              className="w-full h-10 pl-9 pr-10 text-xs sm:text-sm bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black focus:bg-white transition-all text-right font-medium"
              dir="rtl"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-700 rounded-lg transition-colors"
                title="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* تنظیم تعداد در صفحه و سوئیچ نما بر اساس استانداردهای Segmented Button در MD3 */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto w-full md:w-auto justify-end">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="h-10 px-3 text-xs bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs cursor-pointer font-medium transition-colors"
            >
              <option value={5}>۵ اثر در صفحه</option>
              <option value={10}>۱۰ اثر در صفحه</option>
              <option value={20}>۲۰ اثر در صفحه</option>
              <option value={50}>۵۰ اثر در صفحه</option>
            </select>

            <div className="flex items-center bg-neutral-100 p-1 rounded-xl border border-neutral-200/80 h-10">
              <button
                onClick={() => onViewModeChange('table')}
                className={`h-8 px-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 font-medium ${
                  viewMode === 'table'
                    ? 'bg-white text-black shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="نمای جدول (Table View)"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">جدول</span>
              </button>
              <button
                onClick={() => onViewModeChange('cards')}
                className={`h-8 px-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 font-medium ${
                  viewMode === 'cards'
                    ? 'bg-white text-black shadow-xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="نمای کارت (Card View)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">کارت</span>
              </button>
            </div>
          </div>
        </div>

        {/* ردیف دوم: چیپ‌ها و گزینه‌های فیلتر (ارتفاع استاندارد ۳۶px / h-9 برای هماهنگی کامل عناصر) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* ۱. موضوع اصلی (main_topic) */}
            <div className="relative flex-1 sm:flex-initial min-w-[150px] max-w-full sm:max-w-[210px]">
              <select
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                id="filter-main-topic"
                className={`w-full appearance-none h-9 pl-7 pr-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors truncate font-medium ${
                  selectedTopic !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">کلان‌موضوعات (همه)</option>
                {enrichedTopics.map((t) => (
                  <option key={t} value={t} className="bg-white text-neutral-800">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedTopic !== 'all' ? 'text-neutral-300' : 'text-neutral-400'
              }`} />
            </div>

            {/* ۲. قالب مستند (format_category) */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] max-w-full sm:max-w-[190px]">
              <select
                value={selectedFormat}
                onChange={(e) => onFormatChange(e.target.value)}
                id="filter-format-category"
                className={`w-full appearance-none h-9 pl-7 pr-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors truncate font-medium ${
                  selectedFormat !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">قالب مستند (همه)</option>
                {combinedFormats.map((f) => (
                  <option key={f} value={f} className="bg-white text-neutral-800">
                    {f}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedFormat !== 'all' ? 'text-neutral-300' : 'text-neutral-400'
              }`} />
            </div>

            {/* ۳. دوره زمانی روایت (temporal_era) */}
            <div className="relative flex-1 sm:flex-initial min-w-[140px] max-w-full sm:max-w-[200px]">
              <select
                value={selectedTemporalEra}
                onChange={(e) => onTemporalEraChange(e.target.value)}
                id="filter-temporal-era"
                className={`w-full appearance-none h-9 pl-7 pr-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors truncate font-medium ${
                  selectedTemporalEra !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">دوره زمانی (همه)</option>
                {combinedEras.map((era) => (
                  <option key={era} value={era} className="bg-white text-neutral-800">
                    {era}
                  </option>
                ))}
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedTemporalEra !== 'all' ? 'text-neutral-300' : 'text-neutral-400'
              }`} />
            </div>

            {/* ۴. وضعیت ناظران (human_verification) */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={selectedVerification}
                onChange={(e) => onVerificationChange(e.target.value)}
                className={`w-full appearance-none h-9 pl-7 pr-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors font-medium ${
                  selectedVerification !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">وضعیت ناظران</option>
                <option value="verified" className="bg-white text-neutral-800">تایید شده (Verified)</option>
                <option value="pending" className="bg-white text-neutral-800">در انتظار بررسی (Pending)</option>
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedVerification !== 'all' ? 'text-neutral-300' : 'text-neutral-400'
              }`} />
            </div>

            {/* ۵. مجموعه / تک‌قسمتی (is_series) */}
            <div className="relative flex-1 sm:flex-initial min-w-[130px]">
              <select
                value={selectedIsSeries}
                onChange={(e) => onIsSeriesChange(e.target.value)}
                className={`w-full appearance-none h-9 pl-7 pr-3 border rounded-xl focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors font-medium ${
                  selectedIsSeries !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">مجموعه / تک‌قسمتی</option>
                <option value="خیر" className="bg-white text-neutral-800">تک‌قسمتی (خیر)</option>
                <option value="بله" className="bg-white text-neutral-800">مجموعه (بله)</option>
              </select>
              <ChevronDown className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${
                selectedIsSeries !== 'all' ? 'text-neutral-300' : 'text-neutral-400'
              }`} />
            </div>
          </div>

          {/* سمت چپ در RTL: دکمه‌های کنترل خروجی، فیلتر بیشتر و ریست */}
          <div className="flex items-center gap-2 mr-auto">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="h-9 px-3 text-xs text-neutral-800 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-all flex items-center gap-1.5 border border-neutral-200/80 font-medium active:scale-98 select-none"
                title="پاک کردن تمام فیلترها و جستجو"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                <span>بازنشانی</span>
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold font-mono">
                  {activeFiltersCount}
                </span>
              </button>
            )}

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 shadow-2xs active:scale-98 select-none ${
                showMoreFilters || selectedTimeCategory !== 'all'
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
              title="نمایش گزینه‌های فیلتر بیشتر"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلترهای بیشتر</span>
              {selectedTimeCategory !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>

            {/* Export Engine Dropdown per Phase 8 Roadmap */}
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className="h-9 px-3.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs active:scale-98 bg-white"
                title="دانلود داده‌ها در قالب‌های اکسل، CSV و JSON"
              >
                <Download className="w-3.5 h-3.5 text-neutral-700" />
                <span>خروجی (Export)</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {isExportOpen && (
                <div
                  className="absolute left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-1.5 z-40 animate-in fade-in duration-100"
                  dir="rtl"
                >
                  <button
                    onClick={() => {
                      onExportExcel?.();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-right px-3.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900">فایل اکسل (.xls)</span>
                      <span className="text-[10.5px] text-neutral-400">۶۶ ستون کامل با چیدمان راست‌به‌چپ</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onExportCsv?.();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-right px-3.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-neutral-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900">فایل CSV استاندارد</span>
                      <span className="text-[10.5px] text-neutral-400">دارای UTF-8 BOM جهت سازگاری اکسل</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onExportJson?.();
                      setIsExportOpen(false);
                    }}
                    className="w-full text-right px-3.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors cursor-pointer border-t border-neutral-100"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-900">فایل درختی JSON</span>
                      <span className="text-[10.5px] text-neutral-400">آرایه آبجکت‌های ساخت‌یافته متادیتا</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ردیف چیپ‌های فیلترهای فعال (MD3 Filter Chips Row) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-neutral-100 text-xs">
            <span className="text-neutral-400 font-medium text-[11px] flex items-center gap-1 ml-1 select-none">
              <Filter className="w-3 h-3 text-neutral-400" />
              <span>فیلترهای فعال:</span>
            </span>

            {search && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 rounded-lg text-xs font-medium border border-neutral-200/80 shadow-2xs">
                <span>جستجو: <strong className="font-semibold text-neutral-900">«{search}»</strong></span>
                <button
                  onClick={() => onSearchChange('')}
                  className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-800 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر جستجو"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTopic !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 rounded-lg text-xs font-medium border border-neutral-200/80 shadow-2xs">
                <span>موضوع: <strong className="font-semibold text-neutral-900">{selectedTopic}</strong></span>
                <button
                  onClick={() => onTopicChange('all')}
                  className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-800 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر موضوع"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedFormat !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 rounded-lg text-xs font-medium border border-neutral-200/80 shadow-2xs">
                <span>قالب: <strong className="font-semibold text-neutral-900">{selectedFormat}</strong></span>
                <button
                  onClick={() => onFormatChange('all')}
                  className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-800 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر قالب"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTemporalEra !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 rounded-lg text-xs font-medium border border-neutral-200/80 shadow-2xs">
                <span>دوره: <strong className="font-semibold text-neutral-900">{selectedTemporalEra}</strong></span>
                <button
                  onClick={() => onTemporalEraChange('all')}
                  className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-800 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر دوره زمانی"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedVerification !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 rounded-lg text-xs font-medium border border-emerald-200/70 shadow-2xs">
                <span>وضعیت: <strong className="font-semibold">{selectedVerification === 'verified' ? 'تایید شده' : 'در انتظار بررسی'}</strong></span>
                <button
                  onClick={() => onVerificationChange('all')}
                  className="hover:bg-emerald-100 text-emerald-600 hover:text-emerald-950 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر وضعیت"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedIsSeries !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 rounded-lg text-xs font-medium border border-blue-200/70 shadow-2xs">
                <span>ساختار: <strong className="font-semibold">{selectedIsSeries === 'بله' ? 'مجموعه' : 'تک‌قسمتی'}</strong></span>
                <button
                  onClick={() => onIsSeriesChange('all')}
                  className="hover:bg-blue-100 text-blue-600 hover:text-blue-950 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر ساختار"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedTimeCategory !== 'all' && (
              <span className="h-7.5 inline-flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 rounded-lg text-xs font-medium border border-neutral-200/80 shadow-2xs">
                <span>طول مستند: <strong className="font-semibold text-neutral-900">{selectedTimeCategory}</strong></span>
                <button
                  onClick={() => onTimeCategoryChange('all')}
                  className="hover:bg-neutral-200 text-neutral-400 hover:text-neutral-800 rounded p-0.5 transition-colors cursor-pointer"
                  title="حذف فیلتر طول مستند"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={onReset}
              className="text-neutral-500 hover:text-neutral-900 text-xs font-medium px-2 py-0.5 rounded-lg hover:bg-neutral-100 transition-colors mr-2 cursor-pointer select-none"
            >
              پاک کردن همه
            </button>
          </div>
        )}

        {/* بازشونده فیلترهای بیشتر (MD3 Expanded Panel) */}
        {showMoreFilters && (
          <div className="p-4 bg-neutral-50/90 rounded-xl border border-neutral-200/80 text-xs flex flex-col gap-3 animate-in fade-in duration-150">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-700">دسته‌بندی زمانی (مدت مستند):</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-neutral-200">
                  {[
                    { value: 'all', label: 'همه' },
                    { value: 'کوتاه', label: 'کوتاه (زیر ۳۰ دقیقه)' },
                    { value: 'نیمه‌بلند', label: 'نیمه‌بلند (۳۰-۶۰ دقیقه)' },
                    { value: 'بلند', label: 'بلند (بالای ۶۰ دقیقه)' }
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => onTimeCategoryChange(item.value)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        selectedTimeCategory === item.value
                          ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-200/60 leading-relaxed">
              با جستجوی نام کارگردان (مثلاً «باقری» یا «دهستانی») یا فیلتر کلان‌موضوعات، داده‌ها بلافاصله با الگوریتم دی‌بانس سریع (زیر ۳۰۰ میلی‌ثانیه) فیلتر می‌شوند.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

