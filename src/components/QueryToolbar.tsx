import React, { useState } from 'react';
import { Search, LayoutGrid, List, RotateCcw, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface QueryToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedTopic: string;
  onTopicChange: (val: string) => void;
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
}

export const QueryToolbar: React.FC<QueryToolbarProps> = ({
  search,
  onSearchChange,
  selectedTopic,
  onTopicChange,
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
  topicsList
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);

  const hasActiveFilters = Boolean(
    search ||
    selectedTopic !== 'all' ||
    selectedVerification !== 'all' ||
    selectedIsSeries !== 'all' ||
    selectedTimeCategory !== 'all'
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] mb-6 transition-all" dir="rtl">
      <div className="flex flex-col gap-3.5">
        {/* ردیف اول: نوار جستجوی متنی عریض، دراپ‌داون تعداد و دکمه‌های سوئیچ نمایش */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* نوار جستجوی متنی عریض با آیکون ذره‌بین در سمت راست */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="جستجو در عناوین، نام کارگردان، سوژه، مضامین، کلیدواژه‌ها..."
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

        {/* ردیف دوم: باکس‌های کشویی فیلتر با پس‌زمینه سفید و لبه‌های ملایم */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-neutral-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* ۱. وضعیت ناظران (human_verification) */}
            <div className="relative">
              <select
                value={selectedVerification}
                onChange={(e) => onVerificationChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors"
                dir="rtl"
              >
                <option value="all">وضعیت ناظران (human_verification)</option>
                <option value="verified">تایید شده (Verified)</option>
                <option value="pending">در انتظار بررسی (Pending)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* ۲. دسته‌بندی زمانی (time_category) */}
            <div className="relative">
              <select
                value={selectedTimeCategory}
                onChange={(e) => onTimeCategoryChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors"
                dir="rtl"
              >
                <option value="all">دسته‌بندی زمانی (time_category)</option>
                <option value="کوتاه">کوتاه</option>
                <option value="نیمه‌بلند">نیمه‌بلند</option>
                <option value="بلند">بلند</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* ۳. مجموعه / تک‌قسمتی (is_series) */}
            <div className="relative">
              <select
                value={selectedIsSeries}
                onChange={(e) => onIsSeriesChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors"
                dir="rtl"
              >
                <option value="all">مجموعه / تک‌قسمتی (is_series)</option>
                <option value="خیر">تک‌قسمتی (خیر)</option>
                <option value="بله">مجموعه (بله)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* ۴. تمام کلان‌موضوعات (main_topic) */}
            <div className="relative">
              <select
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                className="appearance-none pl-7 pr-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-800 focus:outline-none focus:ring-1 focus:ring-black shadow-2xs text-right cursor-pointer hover:border-neutral-300 transition-colors max-w-[200px] truncate"
                dir="rtl"
              >
                <option value="all">تمام کلان‌موضوعات (main_topic)</option>
                {topicsList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* سمت چپ در RTL: دکمه فیلترهای بیشتر و بازنشانی */}
          <div className="flex items-center gap-2 mr-auto">
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="px-2.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors flex items-center gap-1 border border-neutral-200"
                title="پاک کردن تمام فیلترها"
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
            <span className="font-semibold text-neutral-600">فیلترهای تکمیلی:</span>
            <span className="text-neutral-500">
              جهت اعمال فیلتر بر اساس تگ‌ها، کلیدواژه‌ها یا موقعیت‌های مکانی، می‌توانید روی برچسب‌های رنگی هر مستند یا کلمات کلیدی کلیک کنید.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
