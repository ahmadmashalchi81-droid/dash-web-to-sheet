import React, { useState } from 'react';
import { Search, LayoutGrid, List, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';

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
  erasList = []
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

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

  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-6 transition-all" dir="rtl">
      <div className="flex flex-col gap-3.5">
        {/* ردیف اول: نوار جستجوی متنی عریض (عنوان، کارگردان، کلیدواژه‌ها)، دراپ‌داون تعداد و دکمه‌های نما */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* نوار جستجوی متنی عریض با آیکون ذره‌بین در سمت راست */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در عناوین، نام کارگردان، کلیدواژه‌ها، سوژه‌ها و مضامین..."
              id="search-input"
              className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-neutral-50/80 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all text-right"
              dir="rtl"
            />
          </div>

          {/* تنظیم تعداد در صفحه و سوئیچ نمایش */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto w-full md:w-auto justify-end">
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs cursor-pointer font-medium"
            >
              <option value={5}>۵ اثر در صفحه</option>
              <option value={10}>۱۰ اثر در صفحه</option>
              <option value={20}>۲۰ اثر در صفحه</option>
              <option value={50}>۵۰ اثر در صفحه</option>
            </select>

            <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/80">
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center justify-center ${
                  viewMode === 'table'
                    ? 'bg-white text-black shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="نمای جدول (Table View)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('cards')}
                className={`p-1.5 rounded-md text-xs transition-colors flex items-center justify-center ${
                  viewMode === 'cards'
                    ? 'bg-white text-black shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
                title="نمای کارت (Card View)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ردیف دوم: باکس‌های کشویی فیلتر پیشرفته (قالب، موضوع اصلی، دوره زمانی و...) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* ۱. موضوع اصلی (main_topic) - شامل گزینه آزمون سلامت "ملتِ مبعوث" */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                id="filter-main-topic"
                className={`appearance-none pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors max-w-[210px] truncate ${
                  selectedTopic !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">تمام کلان‌موضوعات (main_topic)</option>
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
            <div className="relative">
              <select
                value={selectedFormat}
                onChange={(e) => onFormatChange(e.target.value)}
                id="filter-format-category"
                className={`appearance-none pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors max-w-[190px] truncate ${
                  selectedFormat !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">تمام قالب‌ها (format_category)</option>
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
            <div className="relative">
              <select
                value={selectedTemporalEra}
                onChange={(e) => onTemporalEraChange(e.target.value)}
                id="filter-temporal-era"
                className={`appearance-none pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer transition-colors max-w-[200px] truncate ${
                  selectedTemporalEra !== 'all'
                    ? 'bg-neutral-900 text-white border-neutral-900 font-semibold'
                    : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-300'
                }`}
                dir="rtl"
              >
                <option value="all" className="bg-white text-neutral-800">دوره زمانی (temporal_era)</option>
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
            <div className="relative">
              <select
                value={selectedVerification}
                onChange={(e) => onVerificationChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors"
                dir="rtl"
              >
                <option value="all">وضعیت ناظران</option>
                <option value="verified">تایید شده (Verified)</option>
                <option value="pending">در انتظار بررسی (Pending)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* ۵. مجموعه / تک‌قسمتی (is_series) */}
            <div className="relative">
              <select
                value={selectedIsSeries}
                onChange={(e) => onIsSeriesChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors"
                dir="rtl"
              >
                <option value="all">مجموعه / تک‌قسمتی</option>
                <option value="خیر">تک‌قسمتی (خیر)</option>
                <option value="بله">مجموعه (بله)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* سمت چپ در RTL: دکمه فیلترهای بیشتر و بازنشانی */}
          <div className="flex items-center gap-2 mr-auto">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 rounded-lg transition-colors flex items-center gap-1 border border-neutral-200 font-medium"
                title="پاک کردن تمام فیلترها و جستجو"
              >
                <RotateCcw className="w-3 h-3" />
                <span>بازنشانی فیلترها</span>
              </button>
            )}

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs ${
                showMoreFilters
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
              }`}
              title="نمایش گزینه‌های فیلتر بیشتر"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلترهای بیشتر</span>
            </button>
          </div>
        </div>

        {/* بازشونده فیلترهای بیشتر */}
        {showMoreFilters && (
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs flex flex-wrap items-center gap-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700">دسته‌بندی زمانی:</span>
              <select
                value={selectedTimeCategory}
                onChange={(e) => onTimeCategoryChange(e.target.value)}
                className="px-2.5 py-1 bg-white border border-neutral-200 rounded text-neutral-800"
              >
                <option value="all">همه طول‌ها</option>
                <option value="کوتاه">کوتاه</option>
                <option value="نیمه‌بلند">نیمه‌بلند</option>
                <option value="بلند">بلند</option>
              </select>
            </div>
            <span className="text-neutral-400">|</span>
            <span className="text-neutral-500">
              با جستجوی نام کارگردان (مثلاً "باقری" یا "دهستانی") یا انتخاب کلان‌موضوعات، نتایج با دی‌بانس سریع (زیر ۳۰۰ میلی‌ثانیه) فیلتر می‌شوند.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
