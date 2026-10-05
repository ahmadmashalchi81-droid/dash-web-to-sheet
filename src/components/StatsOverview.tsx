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
      {/* کارت اول: تعداد کل آثار موجود */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between min-h-[104px]">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            تعداد کل آثار موجود
          </span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {count.toLocaleString('fa-IR')}
            </span>
            <span className="text-xs text-neutral-500 font-medium mr-1">
              اثر ثبت‌شده
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block truncate font-medium">
            مخزن فعال شیت
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
          <Film className="w-5 h-5 stroke-[1.75]" />
        </div>
      </div>

      {/* کارت دوم: مجموع زمان کل مستندها */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between min-h-[104px]">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            مجموع زمان کل مستندها
          </span>
          <div className="whitespace-nowrap">
            <span className="text-xl sm:text-[22px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {formattedDuration}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono truncate font-medium" dir="rtl">
            {totalSeconds.toLocaleString('fa-IR')} ثانیه کل
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Clock className="w-5 h-5 stroke-[1.75]" />
        </div>
      </div>

      {/* کارت سوم: میانگین گفتمان عمار */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between min-h-[104px]">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            میانگین گفتمان عمار
          </span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-neutral-900 tabular-nums font-mono leading-none">
              {avgScore}
            </span>
            <span className="text-xs text-neutral-500 font-medium mr-1">
              از ۱۰
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block truncate font-medium">
            شاخص محتوایی جشنواره
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <Award className="w-5 h-5 stroke-[1.75]" />
        </div>
      </div>

      {/* کارت چهارم: وضعیت بررسی ناظران */}
      <div className="bg-white p-4.5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:border-neutral-300 transition-all flex items-center justify-between min-h-[104px]">
        <div className="flex flex-col justify-center min-w-0">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            وضعیت بررسی ناظران
          </span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-[26px] font-extrabold tracking-tight text-emerald-600 tabular-nums font-mono leading-none">
              {verifiedPercent}%
            </span>
            <span className="text-xs font-semibold text-emerald-700 mr-1">
              تایید شده
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block truncate font-medium">
            {verifiedCount} اثر تایید | {count - verifiedCount} در انتظار
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[1.75]" />
        </div>
      </div>
    </div>
  );
};
