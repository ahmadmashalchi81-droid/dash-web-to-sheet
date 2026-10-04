import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Film,
  Users,
  Music,
  Archive,
  Code2,
  Tag,
  MapPin,
  Globe,
  Sliders,
  Sparkles,
  Camera,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { DocumentaryMetadata, REQUIRED_CREW_KEYS } from '../types/documentary.ts';

interface DocumentaryDetailModalProps {
  documentary: DocumentaryMetadata | null;
  onClose: () => void;
  onSelectTag?: (tag: string) => void;
  initialTab?: 'overview' | 'crew' | 'timecodes' | 'archival' | 'json';
}

const CREW_LABELS_FA: Record<string, string> = {
  director: 'کارگردان',
  producer_individual: 'تهیه‌کننده حقیقی',
  legal_producer_entity: 'تهیه‌کننده حقوقی / سازمان',
  executive_producer: 'مجری طرح / مدیر اجرایی',
  screenwriter: 'فیلمنامه‌نویس / نویسنده',
  researcher: 'محقق و پژوهشگر',
  cinematographer: 'مدیر فیلمبرداری',
  camera_operator: 'فیلمبردار',
  sound_recordist: 'صدابردار',
  sound_designer: 'صداگذار و ترکیب صدا',
  editor: 'تدوینگر',
  music_composer: 'آهنگساز',
  music_arranger: 'تنظیم‌کننده موسیقی',
  narrator: 'راوی / گوینده متن',
  actors: 'بازیگران',
  production_manager: 'مدیر تولید',
  set_and_costume_designer: 'طراح صحنه و لباس',
  vfx_designer: 'طراح جلوه‌های ویژه بصری',
  title_and_graphic_designer: 'طراح تیتراژ و گرافیک',
  still_photographer: 'عکاس صحنه',
  poet_lyricist: 'شاعر / ترانه‌سرا',
  singer_vocalist: 'خواننده',
  choral_group: 'گروه کُر / همسرایان',
  animator: 'پویانما / انیماتور',
  reporter: 'گزارشگر / مصاحبه‌کننده'
};

export const DocumentaryDetailModal: React.FC<DocumentaryDetailModalProps> = ({
  documentary,
  onClose,
  onSelectTag,
  initialTab = 'overview'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crew' | 'timecodes' | 'archival' | 'json'>(initialTab);
  const [copied, setCopied] = useState(false);

  if (!documentary) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(documentary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const keyframes = documentary.keyframe_timestamps_5frames
    ? documentary.keyframe_timestamps_5frames.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-neutral-100 flex flex-col max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-start justify-between bg-neutral-50/50">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-semibold bg-neutral-900 text-white px-2.5 py-0.5 rounded">
                {documentary.asset_id}
              </span>
              <span className="text-xs bg-neutral-200/80 text-neutral-800 px-2 py-0.5 rounded font-medium">
                {documentary.format_category || 'فیلم مستند'}
              </span>
              <span className="text-xs bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                مجموعه: {documentary.is_series === 'بله' ? `بله (${documentary.episode_number || 'قسمت نامشخص'})` : 'تک‌قسمتی (خیر)'}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {documentary.duration_exact}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
              {documentary.title_extracted}
            </h2>
            <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
              {documentary.international_title && (
                <span dir="ltr" className="font-sans text-neutral-600">
                  {documentary.international_title}
                </span>
              )}
              {documentary.title_finglish && (
                <span dir="ltr" className="font-mono text-neutral-400">
                  • {documentary.title_finglish}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={handleCopyJson}
              className="inline-flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-medium bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copied ? 'کپی شد' : 'کپی JSON استریکت'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200/80 px-4 sm:px-6 bg-white overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>مشخصات و سیناپس</span>
          </button>

          <button
            onClick={() => setActiveTab('crew')}
            className={`py-3 px-3 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'crew'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>عوامل تولید ({REQUIRED_CREW_KEYS.length} ردیف)</span>
          </button>

          <button
            onClick={() => setActiveTab('timecodes')}
            className={`py-3 px-3 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'timecodes'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>جدول مصاحبه‌ها و خط زمان موسیقی</span>
          </button>

          <button
            onClick={() => setActiveTab('archival')}
            className={`py-3 px-3 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'archival'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>آرشیو، ارزیابی فنی و گفتمان</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 px-3 font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>خروجی خام API (Strict JSON)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-neutral-800 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Logline */}
              {documentary.logline && (
                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">
                    خلاصه تک‌خطی و لاگ‌لاین (Logline)
                  </span>
                  <p className="text-sm font-medium text-neutral-900 leading-relaxed">
                    {documentary.logline}
                  </p>
                </div>
              )}

              {/* Synopses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-2xs">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    خلاصه کوتاه (Short Synopsis)
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-700">
                    {documentary.short_synopsis || 'ثبت نشده است.'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-neutral-100 shadow-2xs">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-2">
                    خلاصه داستان کامل (Long Synopsis - بدون تلخیص)
                  </span>
                  <p className="text-xs leading-relaxed text-neutral-700 whitespace-pre-line">
                    {documentary.long_synopsis || 'ثبت نشده است.'}
                  </p>
                </div>
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">پیام محوری (Core Message)</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.core_message || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">سوژه یا پروتاگونیست اصلی</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.main_protagonist_subject || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">شغل و تخصص سوژه</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.subject_profession || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">گونه و فرم مستند (Mode)</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.documentary_mode || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">دوره زمانی و عصر روایت</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.temporal_era || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">دسته‌بندی زمانی</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.time_category || '—'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">رده‌بندی سنی پیشنهادی</span>
                  <span className="text-xs font-semibold text-neutral-900">{documentary.recommended_age_rating || 'عمومی'}</span>
                </div>

                <div className="bg-neutral-50/70 p-3 rounded-lg border border-neutral-100 col-span-1 sm:col-span-2">
                  <span className="text-[11px] text-neutral-500 block mb-0.5">نمادها و موتیف‌ها (Symbols & Motifs)</span>
                  <span className="text-xs font-medium text-neutral-900">{documentary.symbols_and_motifs || '—'}</span>
                </div>
              </div>

              {/* Keyframe Timestamps Section */}
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
                  <Camera className="w-3.5 h-3.5 text-neutral-500" />
                  <span>تایم‌کدهای ۵ فریم کلیدی اثر (Keyframe Timestamps):</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {keyframes.length > 0 ? (
                    keyframes.map((ts, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-neutral-200 px-3 py-1.5 rounded-lg text-xs font-mono text-neutral-800 flex items-center gap-1.5 shadow-2xs"
                        dir="ltr"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                        <span>Frame {idx + 1}: {ts}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400">تایم‌کدی ثبت نشده است.</span>
                  )}
                </div>
              </div>

              {/* Section 2: Flat Arrays mapped with .map() as colorful badges */}
              <div className="space-y-4 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    فیلدهای آرایه‌ای ساده (رندر شده با .map به صورت برچسب‌های رنگی)
                  </h4>
                  <span className="text-[11px] text-neutral-400">کلیک روی هر برچسب جهت فیلتر سریع</span>
                </div>

                {/* Locations */}
                <div>
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>موقعیت‌های جغرافیایی (geographical_locations):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {documentary.geographical_locations.length > 0 ? (
                      documentary.geographical_locations.map((loc, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectTag?.(loc)}
                          className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {loc}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">بدون مورد</span>
                    )}
                  </div>
                </div>

                {/* Thematic Tags */}
                <div>
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-blue-500" />
                    <span>برچسب‌های موضوعی (thematic_tags):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {documentary.thematic_tags.length > 0 ? (
                      documentary.thematic_tags.map((tag, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectTag?.(tag)}
                          className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          #{tag}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">بدون مورد</span>
                    )}
                  </div>
                </div>

                {/* Semantic Keywords */}
                <div>
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>کلمات کلیدی معنایی (semantic_keywords):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {documentary.semantic_keywords.length > 0 ? (
                      documentary.semantic_keywords.map((kw, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectTag?.(kw)}
                          className="text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100 px-2.5 py-1 rounded-md transition-colors font-mono"
                        >
                          {kw}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">بدون مورد</span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <span className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5 mb-2">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>زبان‌ها و گویش‌ها (languages_and_dialects):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {documentary.languages_and_dialects.length > 0 ? (
                      documentary.languages_and_dialects.map((lang, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectTag?.(lang)}
                          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 px-2.5 py-1 rounded-md transition-colors"
                        >
                          {lang}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-neutral-400">بدون مورد</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Notes & Advisories */}
              {(documentary.technical_judicial_notes || documentary.content_advisory_and_warnings) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-neutral-100 text-xs">
                  {documentary.technical_judicial_notes && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="font-semibold text-neutral-700 block mb-1">ملاحظات فنی و حقوقی:</span>
                      <p className="text-neutral-600 leading-relaxed">{documentary.technical_judicial_notes}</p>
                    </div>
                  )}
                  {documentary.content_advisory_and_warnings && (
                    <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <span className="font-semibold text-neutral-700 block mb-1">هشدارهای محتوایی:</span>
                      <p className="text-neutral-600 leading-relaxed">{documentary.content_advisory_and_warnings}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREW (SECTION 3-A: DEDICATED TAB FOR CREW WITH ALL 25 ROLES) */}
          {activeTab === 'crew' && (
            <div className="space-y-4">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    شیء عوامل تولید (crew) - طبقه‌بندی ۲۵ نقش فنی و هنری
                  </h4>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    فیلد crew.director علاوه بر این بخش، در جستجوی سراسری و جدول اصلی نیز مورد استفاده قرار می‌گیرد.
                  </p>
                </div>
                <span className="text-xs font-mono bg-white border border-neutral-200 text-neutral-700 px-2 py-1 rounded font-semibold">
                  ۲۵ از ۲۵ فیلد
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {REQUIRED_CREW_KEYS.map((key) => {
                  const val = documentary.crew[key];
                  const labelFa = CREW_LABELS_FA[key] || key;
                  const isKeyDirector = key === 'director';

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border transition-all ${
                        isKeyDirector
                          ? 'bg-blue-50/50 border-blue-200'
                          : 'bg-neutral-50/70 border-neutral-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-neutral-800">
                          {labelFa}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400" dir="ltr">
                          {key}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-neutral-900 mt-1">
                        {val ? (
                          <span className={isKeyDirector ? 'text-blue-900 font-bold' : ''}>{val}</span>
                        ) : (
                          <span className="text-neutral-300 font-mono font-normal">"" (ثبت نشده)</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TIMECODES (SECTION 3-B SUB-TABLE & 3-C TIMELINE) */}
          {activeTab === 'timecodes' && (
            <div className="space-y-6">
              {/* Section 3-B: Interviewees Sub-Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      ب) جدول فرعی مصاحبه‌شوندگان (interviewees_with_timecodes)
                    </h4>
                    <p className="text-xs text-neutral-500">
                      نمایش حداکثر ۲ مصاحبه‌شونده در قالب جدول فرعی با ۵ فیلد: نام، جایگاه/سمت، زمان شروع، زمان پایان و موضوع.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                    {documentary.interviewees_with_timecodes.length} از ۲ رکورد
                  </span>
                </div>

                {documentary.interviewees_with_timecodes.length > 0 ? (
                  <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-right text-xs" dir="rtl">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">ایندکس</th>
                          <th className="py-2.5 px-3">نام و نام خانوادگی</th>
                          <th className="py-2.5 px-3">سمت و تخصص</th>
                          <th className="py-2.5 px-3">زمان شروع (In)</th>
                          <th className="py-2.5 px-3">زمان پایان (Out)</th>
                          <th className="py-2.5 px-3">محور سخنان و موضوع کلیدی</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-800">
                        {documentary.interviewees_with_timecodes.map((item, idx) => (
                          <tr key={idx} className="hover:bg-neutral-50/60">
                            <td className="py-3 px-3 font-mono text-neutral-500">
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium text-[11px]">
                                Index {idx}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-neutral-900">
                              {item.name || 'بدون نام'}
                            </td>
                            <td className="py-3 px-3 text-neutral-600">
                              {item.role || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-600" dir="ltr">
                              {item.timecode_in || '—'}
                            </td>
                            <td className="py-3 px-3 font-mono text-neutral-600" dir="ltr">
                              {item.timecode_out || '—'}
                            </td>
                            <td className="py-3 px-3 text-neutral-700 max-w-xs leading-relaxed">
                              {item.topic || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400">
                    اطلاعات مصاحبه‌شونده در این اثر ثبت نشده است.
                  </div>
                )}
              </div>

              {/* Section 3-C: Music Cues Timeline and Table */}
              <div className="pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      ج) خط زمان و جدول نشانه‌های موسیقی (music_cues)
                    </h4>
                    <p className="text-xs text-neutral-500">
                      رندر شده به صورت خط زمان (Timeline) و جدول نشانه‌ها (حداکثر ۳ آیتم) با فیلدهای زمان شروع، پایان و سبک موسیقی.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                    {documentary.music_cues.length} از ۳ رکورد
                  </span>
                </div>

                {documentary.music_cues.length > 0 ? (
                  <div className="space-y-3">
                    {/* Visual Timeline Bar */}
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono" dir="ltr">
                        <span>00:00:00</span>
                        <span>{documentary.duration_exact || 'End'}</span>
                      </div>
                      <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden flex">
                        {documentary.music_cues.map((cue, idx) => (
                          <div
                            key={idx}
                            className={`h-full border-r border-white/60 transition-all ${
                              idx === 0
                                ? 'w-1/3 bg-emerald-500'
                                : idx === 1
                                ? 'w-1/3 bg-blue-500'
                                : 'w-1/3 bg-purple-500'
                            }`}
                            title={`Cue ${idx}: ${cue.type} (${cue.timecode_in} - ${cue.timecode_out})`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                        <span>خط زمان پیوسته بخش‌های موسیقی اثر</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> نشانه ۱
                          </span>
                          {documentary.music_cues.length > 1 && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-500" /> نشانه ۲
                            </span>
                          )}
                          {documentary.music_cues.length > 2 && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-purple-500" /> نشانه ۳
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Music cues sub-table */}
                    <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
                      <table className="w-full text-right text-xs" dir="rtl">
                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">ردیف</th>
                            <th className="py-2.5 px-3">زمان شروع (timecode_in)</th>
                            <th className="py-2.5 px-3">زمان پایان (timecode_out)</th>
                            <th className="py-2.5 px-3">سبک، لحن و گونه موسیقی (type)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-neutral-800">
                          {documentary.music_cues.map((cue, idx) => (
                            <tr key={idx} className="hover:bg-neutral-50/60">
                              <td className="py-2.5 px-3 font-mono text-neutral-500">
                                <span className="bg-neutral-100 px-1.5 py-0.5 rounded font-medium text-[11px]">
                                  Cue {idx}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-neutral-600" dir="ltr">
                                {cue.timecode_in || '—'}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-neutral-600" dir="ltr">
                                {cue.timecode_out || '—'}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-neutral-900">
                                {cue.type || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-neutral-50 rounded-xl text-center text-xs text-neutral-400">
                    نشانه موسیقی در این اثر ثبت نشده است.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ARCHIVAL, TECHNICAL QC & DISCOURSE */}
          {activeTab === 'archival' && (
            <div className="space-y-6">
              {/* Section 3-D: Archival Footage Log */}
              <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-neutral-900">
                    د) گزارش تصاویر آرشیوی (archival_footage_log)
                  </h4>
                  <span className="text-xs bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded font-medium">
                    فوتیج غیرتولیدی
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">وضعیت آرشیو (status):</span>
                    <span className="text-neutral-900 font-medium">{documentary.archival_footage_log.status || 'فوتیج شناسایی نشد / ندارد'}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">تایم‌کدهای دقیق (timecodes):</span>
                    <span className="text-neutral-900 font-mono" dir="ltr">{documentary.archival_footage_log.timecodes || '—'}</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">منبع استناد (source_evidence):</span>
                    <span className="text-neutral-900 font-medium">{documentary.archival_footage_log.source_evidence || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Ammar Discourse Score & Reasons */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-900 text-sm">ارزیابی گفتمان جشنواره عمار (ammar_discourse_score)</span>
                  </div>
                  <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded text-sm font-mono">
                    {documentary.ammar_discourse_score || '0'} / ۱۰
                  </span>
                </div>
                <div className="mt-2 text-neutral-800 leading-relaxed bg-white/70 p-3 rounded-lg border border-amber-100">
                  <span className="font-semibold text-amber-900 block mb-1">دلایل و مستندات امتیازدهی (ammar_discourse_reasons):</span>
                  {documentary.ammar_discourse_reasons || 'دلایل امتیازدهی ثبت نشده است.'}
                </div>
              </div>

              {/* Technical Assessment & QC */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  ارزیابی فنی، کنترل کیفیت و زیرنویس
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">کنترل کیفیت تصویر (visual_qc):</span>
                    <span className="text-neutral-800 font-mono">{documentary.visual_qc || 'Passed'}</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">سبک صدا و کیفیت (audio_style):</span>
                    <span className="text-neutral-800">{documentary.audio_style || 'طبیعی'}</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">زیرنویس‌ها و وضعیت متن (subtitles_srt):</span>
                    <span className="text-neutral-800 font-mono">{documentary.subtitles_srt || 'ندارد'}</span>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                    <span className="font-semibold text-neutral-500 block mb-1">امتیاز دقت سیستم (confidence_score):</span>
                    <span className="text-neutral-800 font-mono font-bold">{documentary.confidence_score || '1.0'}</span>
                  </div>
                </div>
              </div>

              {/* Admin Flags */}
              {documentary.system_review_flags && (
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  <span className="font-semibold text-neutral-700 block mb-1">فلگ‌های سیستماتیک و بازبینی (system_review_flags):</span>
                  <span className="font-mono text-neutral-800">{documentary.system_review_flags}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: STRICT JSON */}
          {activeTab === 'json' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500 font-mono">
                  100% Data Fidelity Strict JSON Schema
                </span>
                <button
                  onClick={handleCopyJson}
                  className="inline-flex items-center space-x-1 space-x-reverse text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'کپی شد' : 'کپی کل JSON'}</span>
                </button>
              </div>
              <pre
                className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[450px] leading-relaxed select-all"
                dir="ltr"
              >
                {JSON.stringify(documentary, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span>وضعیت تایید ناظر:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                documentary.human_verification_status.includes('verified') || documentary.human_verification_status.includes('تایید')
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {documentary.human_verification_status}
            </span>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <a
              href={`/api/v1/documentaries/${documentary.asset_id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 space-x-reverse text-neutral-700 hover:text-neutral-900"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>مشاهده اندپوینت زنده</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
