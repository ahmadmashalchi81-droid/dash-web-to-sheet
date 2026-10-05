import React, { useState, useMemo } from 'react';
import {
  Eye,
  Code,
  ExternalLink,
  Check,
  Clock,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { DocumentaryMetadata } from '../types/documentary.ts';
import { parseDurationToSeconds } from '../utils/schemaValidator.ts';

export type SortField =
  | 'asset_id'
  | 'title_extracted'
  | 'director'
  | 'format_category'
  | 'main_topic'
  | 'duration_exact'
  | 'ammar_discourse_score'
  | 'human_verification_status';

export type SortDirection = 'asc' | 'desc';

interface DocumentaryTableProps {
  documentaries: DocumentaryMetadata[];
  onSelectDoc: (doc: DocumentaryMetadata) => void;
  onViewJson: (doc: DocumentaryMetadata) => void;
  onSortChange?: (field: SortField, direction: SortDirection) => void;
}

export const DocumentaryTable: React.FC<DocumentaryTableProps> = ({
  documentaries,
  onSelectDoc,
  onViewJson,
  onSortChange
}) => {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleHeaderClick = (field: SortField) => {
    let nextDirection: SortDirection = 'asc';
    if (sortField === field) {
      nextDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      nextDirection = 'asc';
    }

    setSortField(field);
    setSortDirection(nextDirection);
    onSortChange?.(field, nextDirection);
  };

  // Sorted rows using useMemo for instantaneous UI response
  const sortedDocumentaries = useMemo(() => {
    if (!sortField) return documentaries;

    return [...documentaries].sort((a, b) => {
      // 1. مدت زمان (duration_exact) - آزمون سلامت فاز ۳
      if (sortField === 'duration_exact') {
        const secA = parseDurationToSeconds(a.duration_exact);
        const secB = parseDurationToSeconds(b.duration_exact);
        return sortDirection === 'asc' ? secA - secB : secB - secA;
      }

      // 2. امتیاز عمار (ammar_discourse_score)
      if (sortField === 'ammar_discourse_score') {
        const scoreA = parseFloat(a.ammar_discourse_score) || 0;
        const scoreB = parseFloat(b.ammar_discourse_score) || 0;
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }

      // 3. کارگردان (crew.director)
      if (sortField === 'director') {
        const dirA = (a.crew?.director || '').toLowerCase();
        const dirB = (b.crew?.director || '').toLowerCase();
        return sortDirection === 'asc'
          ? dirA.localeCompare(dirB, 'fa')
          : dirB.localeCompare(dirA, 'fa');
      }

      // 4. سایر فیلدهای متنی
      const valA = String((a as any)[sortField] || '').toLowerCase();
      const valB = String((b as any)[sortField] || '').toLowerCase();

      return sortDirection === 'asc'
        ? valA.localeCompare(valB, 'fa')
        : valB.localeCompare(valA, 'fa');
    });
  }, [documentaries, sortField, sortDirection]);

  if (documentaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80 shadow-2xs">
        <p className="text-neutral-500 text-sm">هیچ مستندی با فیلترهای مشخص شده یافت نشد.</p>
      </div>
    );
  }

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover/th:opacity-100 transition-opacity shrink-0" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-black stroke-[2.5] shrink-0" />
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-neutral-200/80 overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh]">
        <table className="w-full text-right text-xs sm:text-sm border-collapse" dir="rtl">
          <thead className="sticky top-0 z-10 bg-neutral-50/95 backdrop-blur-xs border-b border-neutral-200/90 shadow-2xs">
            <tr className="text-neutral-600 text-[11px] font-bold select-none">
              {/* شناسه (Asset ID) */}
              <th
                onClick={() => handleHeaderClick('asset_id')}
                className="py-3 px-3.5 sm:px-4 cursor-pointer hover:bg-neutral-100/80 transition-colors group/th text-right"
                title="مرتب‌سازی بر اساس شناسه اثر"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>شناسه اثر</span>
                  {renderSortIcon('asset_id')}
                </div>
              </th>

              {/* عنوان اثر */}
              <th
                onClick={() => handleHeaderClick('title_extracted')}
                className="py-3 px-3.5 sm:px-4 cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس عنوان اثر"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>عنوان اثر</span>
                  {renderSortIcon('title_extracted')}
                </div>
              </th>

              {/* کارگردان */}
              <th
                onClick={() => handleHeaderClick('director')}
                className="py-3 px-3.5 sm:px-4 hidden md:table-cell cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس نام کارگردان"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>کارگردان (crew.director)</span>
                  {renderSortIcon('director')}
                </div>
              </th>

              {/* قالب و نوع */}
              <th
                onClick={() => handleHeaderClick('format_category')}
                className="py-3 px-3.5 sm:px-4 hidden sm:table-cell cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس قالب مستند"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>قالب و نوع</span>
                  {renderSortIcon('format_category')}
                </div>
              </th>

              {/* موضوع اصلی */}
              <th
                onClick={() => handleHeaderClick('main_topic')}
                className="py-3 px-3.5 sm:px-4 hidden sm:table-cell cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس موضوع اصلی"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>موضوع اصلی</span>
                  {renderSortIcon('main_topic')}
                </div>
              </th>

              {/* مدت زمان - آزمون سلامت فاز ۳ */}
              <th
                onClick={() => handleHeaderClick('duration_exact')}
                id="header-duration-exact"
                className={`py-3 px-3.5 sm:px-4 hidden lg:table-cell cursor-pointer transition-colors group/th ${
                  sortField === 'duration_exact' ? 'bg-neutral-100/90 text-neutral-900 font-bold' : 'hover:bg-neutral-100/70'
                }`}
                title="کلیک کنید تا به صورت صعودی و نزولی مرتب شود"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span className="font-bold">مدت زمان</span>
                  <span className="text-[10px] text-neutral-400 font-normal">(دقیق)</span>
                  {renderSortIcon('duration_exact')}
                </div>
              </th>

              {/* امتیاز عمار */}
              <th
                onClick={() => handleHeaderClick('ammar_discourse_score')}
                className="py-3 px-3.5 sm:px-4 hidden sm:table-cell cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس امتیاز گفتمان عمار"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>امتیاز عمار</span>
                  {renderSortIcon('ammar_discourse_score')}
                </div>
              </th>

              {/* وضعیت ناظر */}
              <th
                onClick={() => handleHeaderClick('human_verification_status')}
                className="py-3 px-3.5 sm:px-4 cursor-pointer hover:bg-neutral-100/70 transition-colors group/th"
                title="مرتب‌سازی بر اساس وضعیت تایید"
              >
                <div className="flex items-center space-x-1.5 space-x-reverse">
                  <span>وضعیت ناظر</span>
                  {renderSortIcon('human_verification_status')}
                </div>
              </th>

              {/* عملیات */}
              <th className="py-3 px-3.5 sm:px-4 text-left font-semibold">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-neutral-800">
            {sortedDocumentaries.map((doc) => {
              const isVerified =
                doc.human_verification_status.toLowerCase().includes('verified') ||
                doc.human_verification_status.includes('تایید');
              const isSeriesBool =
                doc.is_series === 'بله' ||
                doc.is_series === 'true' ||
                doc.is_series.toLowerCase() === 'yes';

              return (
                <tr
                  key={doc.asset_id}
                  className="hover:bg-neutral-50/70 transition-colors group cursor-pointer"
                  onClick={() => onSelectDoc(doc)}
                >
                  {/* Asset ID */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                    <span className="bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-md font-medium">
                      {doc.asset_id}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4">
                    <div className="font-semibold text-neutral-900 line-clamp-1">
                      {doc.title_extracted}
                    </div>
                    {doc.international_title && (
                      <div className="text-[11px] text-neutral-400 font-normal truncate max-w-xs" dir="ltr">
                        {doc.international_title}
                      </div>
                    )}
                  </td>

                  {/* Director */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-neutral-700 font-medium hidden md:table-cell whitespace-nowrap">
                    {doc.crew.director || '—'}
                  </td>

                  {/* Format & Series */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-neutral-100 text-neutral-700 text-xs px-2.5 py-0.5 rounded-md font-medium">
                        {doc.format_category || 'فیلم مستند'}
                      </span>
                      {isSeriesBool ? (
                        <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>مجموعه</span>
                        </span>
                      ) : (
                        <span className="bg-neutral-50 text-neutral-400 border border-neutral-200/50 text-[10px] px-2 py-0.5 rounded-md">
                          تک‌قسمتی
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Main Topic */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                    <span className="inline-block bg-neutral-50 border border-neutral-200/70 text-neutral-700 text-xs px-2.5 py-0.5 rounded-md">
                      {doc.main_topic || 'نامشخص'}
                    </span>
                  </td>

                  {/* Duration - Highlighted cell */}
                  <td className={`py-2.5 sm:py-3 px-3.5 sm:px-4 font-mono text-xs hidden lg:table-cell whitespace-nowrap ${
                    sortField === 'duration_exact' ? 'font-bold text-neutral-900 bg-neutral-50/50' : 'text-neutral-600'
                  }`}>
                    {doc.duration_exact || '—'}
                  </td>

                  {/* Discourse Score */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 hidden sm:table-cell whitespace-nowrap">
                    <span className="inline-flex items-center text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md font-mono">
                      {doc.ammar_discourse_score || '—'}
                    </span>
                  </td>

                  {/* Verification Status */}
                  <td className="py-2.5 sm:py-3 px-3.5 sm:px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>تایید شده</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>در انتظار</span>
                        </>
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td
                    className="py-2.5 sm:py-3 px-3.5 sm:px-4 text-left whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1 space-x-reverse">
                      <button
                        onClick={() => onViewJson(doc)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors select-none active:scale-95"
                        title="مشاهده خروجی استریکت JSON"
                      >
                        <Code className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onSelectDoc(doc)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors select-none active:scale-95"
                        title="مشاهده تمام فیلدها"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <a
                        href={`/api/v1/documentaries/${doc.asset_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors select-none active:scale-95"
                        title="مشاهده مستقیم اندپوینت API"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
