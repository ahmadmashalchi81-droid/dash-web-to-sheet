import React from 'react';
import { Eye, Code, ExternalLink, Check, Clock, User, Calendar, Tag, Layers } from 'lucide-react';
import { DocumentaryMetadata } from '../types/documentary.ts';

interface DocumentaryCardsProps {
  documentaries: DocumentaryMetadata[];
  onSelectDoc: (doc: DocumentaryMetadata) => void;
  onViewJson: (doc: DocumentaryMetadata) => void;
  onSelectTag?: (tag: string) => void;
}

export const DocumentaryCards: React.FC<DocumentaryCardsProps> = ({
  documentaries,
  onSelectDoc,
  onViewJson,
  onSelectTag
}) => {
  if (documentaries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200/80 shadow-2xs">
        <p className="text-neutral-500 text-sm">هیچ مستندی با فیلترهای مشخص شده یافت نشد.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" dir="rtl">
      {documentaries.map((doc) => {
        const isVerified =
          doc.human_verification_status.toLowerCase().includes('verified') ||
          doc.human_verification_status.includes('تایید');
        const isSeriesBool =
          doc.is_series === 'بله' ||
          doc.is_series === 'true' ||
          doc.is_series.toLowerCase() === 'yes';

        return (
          <div
            key={doc.asset_id}
            onClick={() => onSelectDoc(doc)}
            className="bg-white rounded-2xl p-4.5 sm:p-5 shadow-2xs border border-neutral-200/80 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between h-full"
          >
            <div>
              {/* Header: Asset ID & Badges */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-semibold text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-md">
                    {doc.asset_id}
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
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-neutral-900 mb-1 leading-snug line-clamp-1">
                {doc.title_extracted}
              </h3>
              {doc.international_title && (
                <p className="text-xs text-neutral-400 mb-3 truncate" dir="ltr">
                  {doc.international_title}
                </p>
              )}

              {/* Logline (Faithful extraction) */}
              <p className="text-xs text-neutral-600 line-clamp-3 mb-4 leading-relaxed">
                {doc.logline || doc.short_synopsis || 'توضیحات ثبت نشده است.'}
              </p>

              {/* Metadata rows */}
              <div className="space-y-2 text-xs text-neutral-500 mb-3.5 border-t border-neutral-100 pt-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    <span>کارگردان:</span>
                  </span>
                  <span className="font-medium text-neutral-800">{doc.crew.director || 'نامشخص'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    <span>موضوع اصلی:</span>
                  </span>
                  <span className="font-medium text-neutral-800">{doc.main_topic || 'نامشخص'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-500">
                    <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                    <span>مدت زمان:</span>
                  </span>
                  <span className="font-mono text-neutral-700 font-medium">{doc.duration_exact || '—'}</span>
                </div>
              </div>

              {/* Flat Tags rendered with .map() per Section 2 */}
              {doc.thematic_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3.5">
                  {doc.thematic_tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTag?.(tag);
                      }}
                      className="text-[11px] bg-neutral-100/90 text-neutral-700 hover:bg-neutral-200/90 px-2 py-0.5 rounded-md transition-colors font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  {doc.thematic_tags.length > 3 && (
                    <span className="text-[11px] text-neutral-400 self-center font-medium">
                      +{doc.thematic_tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div
              className="flex items-center justify-between pt-3 border-t border-neutral-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-500 font-medium">امتیاز عمار:</span>
                <span className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded-md font-mono">
                  {doc.ammar_discourse_score || '—'}
                </span>
              </div>

              <div className="flex items-center space-x-1 space-x-reverse">
                <button
                  onClick={() => onViewJson(doc)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors select-none active:scale-95"
                  title="مشاهده JSON استریکت"
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
                  title="مشاهده مستقیم API"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
