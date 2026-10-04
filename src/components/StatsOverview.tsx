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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6" dir="rtl">
      {/* کارت اول: تعداد کل آثار موجود */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between transition-shadow hover:shadow-md">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            تعداد کل آثار موجود
          </span>
          <div className="flex items-baseline space-x-2 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              {count}
            </span>
            <span className="text-xs text-neutral-400 whitespace-nowrap">
              اثر ثبت‌شده
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block whitespace-nowrap">
            مخزن فعال شیت
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-neutral-100/80 flex items-center justify-center text-neutral-700 shrink-0">
          <Film className="w-6 h-6 stroke-[1.5]" />
        </div>
      </div>

      {/* کارت دوم: مجموع زمان کل مستندها */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between transition-shadow hover:shadow-md">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            مجموع زمان کل مستندها
          </span>
          <div className="whitespace-nowrap">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              {formattedDuration}
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block font-mono whitespace-nowrap" dir="rtl">
            {totalSeconds.toLocaleString('fa-IR')} ثانیه کل
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Clock className="w-6 h-6 stroke-[1.5]" />
        </div>
      </div>

      {/* کارت سوم: میانگین گفتمان عمار */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between transition-shadow hover:shadow-md">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            میانگین گفتمان عمار
          </span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              {avgScore}
            </span>
            <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">
              از ۱۰
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block whitespace-nowrap">
            شاخص محتوایی جشنواره
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
          <Award className="w-6 h-6 stroke-[1.5]" />
        </div>
      </div>

      {/* کارت چهارم: وضعیت بررسی ناظران */}
      <div className="bg-white p-5 rounded-xl border border-neutral-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex items-center justify-between transition-shadow hover:shadow-md">
        <div className="flex flex-col justify-center">
          <span className="text-xs font-medium text-neutral-500 block mb-1 whitespace-nowrap">
            وضعیت بررسی ناظران
          </span>
          <div className="flex items-baseline space-x-1.5 space-x-reverse whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#10B981] whitespace-nowrap">
              {verifiedPercent}%
            </span>
            <span className="text-xs font-semibold text-[#10B981] whitespace-nowrap">
              تایید شده
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block whitespace-nowrap">
            {verifiedCount} اثر تایید | {count - verifiedCount} در انتظار
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981] shrink-0">
          <CheckCircle2 className="w-6 h-6 stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
};
