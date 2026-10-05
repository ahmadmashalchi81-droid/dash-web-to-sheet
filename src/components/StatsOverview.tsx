import React from 'react';
import { Film, Clock, Award, CheckCircle2 } from 'lucide-react';
import { DocumentaryMetadata, KpiMetrics } from '../types/documentary.ts';
import { parseDurationToSeconds, formatTotalDurationHoursMinutes } from '../utils/schemaValidator.ts';

interface StatsOverviewProps {
  documentaries: DocumentaryMetadata[];
  totalRecords: number;
  dataSource: string;
  lastSyncTime: string;
  kpiMetrics?: KpiMetrics;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  documentaries,
  totalRecords,
  kpiMetrics
}) => {
  // 1. تعداد کل آثار موجود
  const count = kpiMetrics?.totalRecords ?? totalRecords ?? documentaries.length;

  // 2. مجموع زمان کل مستندها: محاسبه و فرمت غلیظ X ساعت و Y دقیقه
  const totalSeconds = kpiMetrics?.totalDurationSeconds ?? documentaries.reduce(
    (acc, d) => acc + parseDurationToSeconds(d.duration_exact),
    0
  );
  const formattedDuration = kpiMetrics?.totalDurationFormatted ?? formatTotalDurationHoursMinutes(totalSeconds);

  // 3. میانگین گفتمان عمار: میانگین عددی از فیلد ammar_discourse_score
  const validScores = documentaries
    .map((d) => parseFloat(d.ammar_discourse_score))
    .filter((s) => !isNaN(s) && s > 0);
  const avgScore = kpiMetrics?.averageAmmarScore ?? (
    validScores.length > 0
      ? (validScores.reduce((acc, s) => acc + s, 0) / validScores.length).toFixed(1)
      : '0.0'
  );

  // 4. وضعیت بررسی ناظران: درصد پیشرفت با رنگ سبز تأکیدی
  const verifiedCount = kpiMetrics?.verifiedCount ?? documentaries.filter(
    (d) => d.human_verification_status.includes('verified') || d.human_verification_status.includes('تایید')
  ).length;
  const verifiedPercent = count > 0 ? Math.round((verifiedCount / count) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
      {/* کارت اول: تعداد کل آثار موجود (MD3 Outlined Card) */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[114px] group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 block truncate">
            تعداد کل آثار موجود
          </span>
          <div className="w-9.5 h-9.5 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0 group-hover:bg-neutral-200/70 transition-colors">
            <Film className="w-4.5 h-4.5 stroke-[1.75]" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap mb-1">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {count.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              اثر ثبت‌شده
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block truncate font-medium">
            مخزن فعال شیت • ۶۶ ستون متادیتا
          </span>
        </div>
      </div>

      {/* کارت دوم: مجموع زمان کل مستندها */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[114px] group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 block truncate">
            مجموع زمان کل مستندها
          </span>
          <div className="w-9.5 h-9.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/60 flex items-center justify-center shrink-0 group-hover:bg-blue-100/80 transition-colors">
            <Clock className="w-4.5 h-4.5 stroke-[1.75]" />
          </div>
        </div>
        <div>
          <div className="whitespace-nowrap mb-1">
            <span className="text-xl sm:text-[24px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {formattedDuration}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block font-mono truncate font-medium" dir="rtl">
            {totalSeconds.toLocaleString('fa-IR')} ثانیه محتوای ویدیویی
          </span>
        </div>
      </div>

      {/* کارت سوم: میانگین گفتمان عمار */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[114px] group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 block truncate">
            میانگین گفتمان عمار
          </span>
          <div className="w-9.5 h-9.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/60 flex items-center justify-center shrink-0 group-hover:bg-amber-100/80 transition-colors">
            <Award className="w-4.5 h-4.5 stroke-[1.75]" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap mb-1">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {avgScore}
            </span>
            <span className="text-xs text-neutral-500 font-medium">
              از ۱۰
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 block truncate font-medium">
            شاخص محتوایی جشنواره عمار
          </span>
        </div>
      </div>

      {/* کارت چهارم: وضعیت بررسی ناظران با نوار پیشرفت MD3 */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-xs hover:border-neutral-300 transition-all flex flex-col justify-between min-h-[114px] group">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-neutral-500 block truncate">
            وضعیت بررسی ناظران
          </span>
          <div className="w-9.5 h-9.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-100/80 transition-colors">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[1.75]" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-1.5 whitespace-nowrap mb-1">
            <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-emerald-600 tabular-nums font-mono leading-none">
              {verifiedPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              تایید شده
            </span>
          </div>
          <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${verifiedPercent}%` }}
            />
          </div>
          <span className="text-[10.5px] text-neutral-400 block truncate font-medium">
            {verifiedCount.toLocaleString('fa-IR')} تایید | {(count - verifiedCount).toLocaleString('fa-IR')} در انتظار
          </span>
        </div>
      </div>
    </div>
  );
};

