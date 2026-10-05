import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Play } from 'lucide-react';
import { validateAndSanitizeDocumentary, ValidationResult } from '../utils/schemaValidator.ts';

interface SchemaValidatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchemaValidatorModal: React.FC<SchemaValidatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const sampleJson = `{
  "asset_id": "DOC-SAMPLE-101",
  "title_extracted": "روایت آب در کویر",
  "title_finglish": "Revayat-e Ab dar Kavir",
  "international_title": "Water Chronicle in Desert",
  "is_series": "false",
  "episode_number": "",
  "logline": "روایت قنات تاریخی زارچ و مقنی های کهنسال.",
  "short_synopsis": "بررسی مهندسی کهن کاریز در ایران.",
  "long_synopsis": "متن بلند بدون خلاصه سازی...",
  "technical_judicial_notes": "",
  "format_category": "مستند کوتاه",
  "main_topic": "میراث فرهنگی",
  "sub_topic": "کاریز و آب",
  "time_category": "معاصر",
  "duration_exact": "00:25:00",
  "documentary_mode": "مشاهده‌گر",
  "temporal_era": "معاصر",
  "symbols_and_motifs": "آب و خاک",
  "main_protagonist_subject": "مقنی کهنسال",
  "core_message": "پاسداری از آب",
  "subject_profession": "مقنی",
  "keyframe_timestamps_5frames": "00:02:00, 00:07:00, 00:12:00, 00:18:00, 00:23:00",
  "visual_qc": "Passed",
  "audio_style": "طبیعی",
  "content_advisory_and_warnings": "",
  "recommended_age_rating": "عمومی",
  "ammar_discourse_score": "9.0",
  "ammar_discourse_reasons": "توجه به تمدن بومی و عدالت در توزیع منابع",
  "subtitles_srt": "fa",
  "confidence_score": "0.95",
  "human_verification_status": "verified",
  "system_review_flags": "Clean",
  "geographical_locations": ["یزد", "زارچ"],
  "thematic_tags": ["قنات", "آب"],
  "semantic_keywords": ["کاریز", "مقنی"],
  "languages_and_dialects": ["فارسی"],
  "crew": {
    "director": "علی رضایی",
    "producer_individual": "محمد کریمی"
  },
  "archival_footage_log": {
    "status": "عکس های تاریخی",
    "timecodes": "00:04:00 - 00:05:00",
    "source_evidence": "مرکز اسناد"
  },
  "interviewees_with_timecodes": [
    {
      "name": "استاد مقنی",
      "role": "مقنی باسابقه",
      "timecode_in": "00:03:00",
      "timecode_out": "00:08:00",
      "topic": "تاریخچه قنات زارچ"
    }
  ],
  "music_cues": [
    {
      "timecode_in": "00:00:10",
      "timecode_out": "00:02:00",
      "type": "نوای ساز سنتی"
    }
  ]
}`;

  const [inputJson, setInputJson] = useState<string>(sampleJson);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleValidate = () => {
    setParseError(null);
    setResult(null);
    try {
      const parsed = JSON.parse(inputJson);
      const res = validateAndSanitizeDocumentary(parsed);
      setResult(res);
    } catch (err: any) {
      setParseError(`خطای نحوی در ساختار JSON: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9.5 h-9.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
              <CheckCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                ابزار اعتبارسنجی اسکیما (Strict Schema Validator)
              </h3>
              <p className="text-xs text-neutral-500">
                بررسی ۳۲ کلید ریشه، ۲۵ کلید عوامل، مصاحبه‌ها (حداکثر ۲) و نشانه‌های موسیقی (حداکثر ۳)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors active:scale-95"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-700">
                ورودی JSON جهت بررسی تطابق با اسکیما:
              </label>
              <button
                onClick={handleValidate}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold bg-black text-white rounded-xl hover:bg-neutral-800 transition-all shadow-xs select-none active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>بررسی و اعتبارسنجی</span>
              </button>
            </div>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              rows={9}
              className="w-full p-3.5 text-xs font-mono bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all leading-relaxed"
              dir="ltr"
            />
          </div>

          {/* Errors or Warnings */}
          {parseError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  result.isValid
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.isValid ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    {result.isValid
                      ? 'داده‌ها کاملاً معتبر و منطبق بر استاندارد استریکت JSON هستند.'
                      : 'خطاهایی در ساختار یافت شد.'}
                  </span>
                </div>
                {result.warnings.length > 0 && (
                  <span className="text-[11px] font-normal text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200/70">
                    {result.warnings.length} هشدار نرمال‌سازی
                  </span>
                )}
              </div>

              {result.warnings.length > 0 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>تطبیق‌های خودکار انجام‌شده (Auto-Sanitized):</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                    {result.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <span className="text-xs font-semibold text-neutral-600 block mb-1">
                  خروجی پاکسازی‌شده با پر کردن خودکار مقادیر خالی (""):
                </span>
                <pre
                  className="bg-neutral-900 text-neutral-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-[250px] leading-relaxed select-all"
                  dir="ltr"
                >
                  {JSON.stringify(result.sanitizedData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-2xs active:scale-95"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

