import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Film,
  Clock,
  User,
  Tag,
  RefreshCw,
  Sparkles,
  GitCompare,
  Copy,
  PlusCircle,
  SlidersHorizontal,
  ArrowRight,
  Eye,
  Layers,
  FileText,
  ShieldAlert,
  Check
} from 'lucide-react';
import { DocumentaryMetadata } from '../types/documentary.ts';
import { validateAndSanitizeDocumentary, ValidationResult } from '../utils/schemaValidator.ts';

interface JsonUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  existingDocumentaries: DocumentaryMetadata[];
  onDocumentaryAdded: () => Promise<void>;
}

interface DiffItem {
  key: string;
  label: string;
  category: string;
  oldVal: string;
  newVal: string;
  isDifferent: boolean;
}

export const JsonUploaderModal: React.FC<JsonUploaderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingDocumentaries,
  onDocumentaryAdded
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [existingDoc, setExistingDoc] = useState<DocumentaryMetadata | null>(null);

  // Auto-versioning state
  const [newVersionId, setNewVersionId] = useState<string>('');

  // Side-by-Side Diff Modal State
  const [isDiffOpen, setIsDiffOpen] = useState<boolean>(false);
  const [diffOnlyChanges, setDiffOnlyChanges] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setParsedData(null);
    setValidation(null);
    setParseError(null);
    setIsSubmitting(false);
    setIsCheckingDuplicate(false);
    setIsDuplicate(false);
    setExistingDoc(null);
    setNewVersionId('');
    setIsDiffOpen(false);
    setDiffOnlyChanges(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  /**
   * Generates a smart new version identifier: e.g. "1504595-v2", "1504595-v3"
   */
  const generateVersionId = (baseId: string, suffix = 'v2'): string => {
    const cleanId = (baseId || 'DOC-001').trim();
    const versionMatch = cleanId.match(/^(.*?)-(v|rev)(\d+)$/i);
    if (versionMatch) {
      const prefix = versionMatch[1];
      const tag = versionMatch[2];
      const num = parseInt(versionMatch[3], 10) + 1;
      return `${prefix}-${tag}${num}`;
    }
    return `${cleanId}-${suffix}`;
  };

  const processJsonText = async (text: string, fileName = 'file.json') => {
    setParseError(null);
    setParsedData(null);
    setValidation(null);
    setIsDuplicate(false);
    setExistingDoc(null);
    setIsDiffOpen(false);

    try {
      const parsed = JSON.parse(text);
      setParsedData(parsed);

      const valResult = validateAndSanitizeDocumentary(parsed);
      setValidation(valResult);

      if (!valResult.isValid) {
        setParseError('ساختار فایل با استاندارد ۶۶ ستونه شناسنامه مستند همخوانی ندارد.');
        return;
      }

      const assetId = String(valResult.sanitizedData.asset_id || '').trim();
      if (!assetId) return;

      // Suggest default new version ID
      setNewVersionId(generateVersionId(assetId, 'v2'));

      // Check duplicate locally and via backend
      setIsCheckingDuplicate(true);
      let found: DocumentaryMetadata | null = null;

      // 1. Try authoritative backend endpoint
      try {
        const probeRes = await fetch(`/api/v1/documentaries/${encodeURIComponent(assetId)}`);
        if (probeRes.ok) {
          const probeJson = await probeRes.json();
          if (probeJson?.data) {
            found = probeJson.data;
          }
        }
      } catch (err) {
        console.warn('Backend duplicate check probe failed, falling back to local dataset', err);
      }

      // 2. Fallback to local existing documentaries if not found by API probe
      if (!found) {
        const localFound = existingDocumentaries.find(
          (d) => String(d.asset_id || '').trim().toLowerCase() === assetId.toLowerCase()
        );
        if (localFound) {
          found = localFound;
        }
      }

      if (found) {
        setIsDuplicate(true);
        setExistingDoc(found);
      }
    } catch (err: any) {
      setParseError(`خطای تحلیل فایل JSON: ${err.message}`);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setParseError('لطفاً صرفاً فایل با پسوند .json بارگذاری فرمایید.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processJsonText(text, file.name);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setParseError('لطفاً صرفاً فایل با پسوند .json انتخاب نمایید.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processJsonText(text, file.name);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleLoadSample = async () => {
    try {
      const res = await fetch('/api/v1/documentaries/1504595');
      let sampleData: any = null;
      if (res.ok) {
        const body = await res.json();
        sampleData = body.data;
      }
      if (!sampleData && existingDocumentaries.length > 0) {
        sampleData = existingDocumentaries[0];
      }

      if (sampleData) {
        setSelectedFile(new File([''], 'sample-documentary.json'));
        await processJsonText(JSON.stringify(sampleData, null, 2), 'sample-documentary.json');
      }
    } catch (err: any) {
      setParseError('خطا در فراخوانی فایل نمونه: ' + err.message);
    }
  };

  /**
   * Main submission handler supporting:
   * 1. 'update' (Overwrite existing row)
   * 2. 'append' (Force append with current asset_id)
   * 3. 'new_version' (Append with newly generated/custom asset_id)
   */
  const handleSendToSheet = async (action: 'append' | 'update' | 'new_version' = 'append') => {
    if (!validation || !validation.sanitizedData) return;

    setIsSubmitting(true);
    try {
      let finalDoc = { ...validation.sanitizedData };
      let effectiveAction: 'append' | 'update' = 'append';

      if (action === 'new_version') {
        const targetId = (newVersionId || generateVersionId(finalDoc.asset_id)).trim();
        if (!targetId) {
          throw new Error('شناسه نسخه جدید نمی‌تواند خالی باشد.');
        }
        finalDoc.asset_id = targetId;
        effectiveAction = 'append';
      } else if (action === 'update') {
        effectiveAction = 'update';
      } else {
        effectiveAction = 'append';
      }

      const res = await fetch('/api/v1/documentaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonContent: finalDoc,
          duplicateAction: effectiveAction
        })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || 'خطا در ثبت و ارسال داده به وب‌سرویس گوگل');
      }

      let successMsg = `شناسنامه مستند «${finalDoc.title_extracted || finalDoc.asset_id}» با موفقیت در گوگل شیت ثبت گردید.`;
      if (action === 'update') {
        successMsg = `شناسنامه اثر ${finalDoc.asset_id} با موفقیت در گوگل‌شیت به‌روزرسانی (Update) شد.`;
      } else if (action === 'new_version') {
        successMsg = `نسخه جدید مستند با کد «${finalDoc.asset_id}» با موفقیت در گوگل شیت درج گردید.`;
      } else if (isDuplicate && action === 'append') {
        successMsg = `شناسنامه اثر ${finalDoc.asset_id} با حفظ شناسه به عنوان ردیف جدید (Force Append) در گوگل شیت ثبت گردید.`;
      }

      onSuccess(successMsg);
      await onDocumentaryAdded();
      handleClose();
    } catch (err: any) {
      setParseError(err.message || 'خطای غیرمنتظره در ارسال اطلاعات به گوگل‌شیت');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewDoc = validation?.sanitizedData;

  /**
   * Computes Side-by-Side differences between existingDoc and previewDoc
   */
  const diffItems = useMemo<DiffItem[]>(() => {
    if (!existingDoc || !previewDoc) return [];

    const items: DiffItem[] = [
      // 1. General Info
      {
        key: 'asset_id',
        label: 'کد شناسنامه اثر (Asset ID)',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.asset_id || '',
        newVal: previewDoc.asset_id || '',
        isDifferent: (existingDoc.asset_id || '') !== (previewDoc.asset_id || '')
      },
      {
        key: 'title_extracted',
        label: 'عنوان استخراج‌شده از تیتراژ',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.title_extracted || '',
        newVal: previewDoc.title_extracted || '',
        isDifferent: (existingDoc.title_extracted || '') !== (previewDoc.title_extracted || '')
      },
      {
        key: 'title_finglish',
        label: 'عنوان فینگلیش',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.title_finglish || '',
        newVal: previewDoc.title_finglish || '',
        isDifferent: (existingDoc.title_finglish || '') !== (previewDoc.title_finglish || '')
      },
      {
        key: 'international_title',
        label: 'عنوان بین‌المللی',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.international_title || '',
        newVal: previewDoc.international_title || '',
        isDifferent: (existingDoc.international_title || '') !== (previewDoc.international_title || '')
      },
      {
        key: 'format_category',
        label: 'قالب اثر',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.format_category || '',
        newVal: previewDoc.format_category || '',
        isDifferent: (existingDoc.format_category || '') !== (previewDoc.format_category || '')
      },
      {
        key: 'is_series',
        label: 'مجموعه‌ای / تک‌قسمتی',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.is_series || 'خیر',
        newVal: previewDoc.is_series || 'خیر',
        isDifferent: (existingDoc.is_series || 'خیر') !== (previewDoc.is_series || 'خیر')
      },
      {
        key: 'episode_number',
        label: 'شماره قسمت',
        category: 'شناسنامه و هویت',
        oldVal: existingDoc.episode_number || '',
        newVal: previewDoc.episode_number || '',
        isDifferent: (existingDoc.episode_number || '') !== (previewDoc.episode_number || '')
      },
      {
        key: 'main_topic',
        label: 'کلان‌موضوع اصلی',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.main_topic || '',
        newVal: previewDoc.main_topic || '',
        isDifferent: (existingDoc.main_topic || '') !== (previewDoc.main_topic || '')
      },
      {
        key: 'sub_topic',
        label: 'ریزموضوع اثر',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.sub_topic || '',
        newVal: previewDoc.sub_topic || '',
        isDifferent: (existingDoc.sub_topic || '') !== (previewDoc.sub_topic || '')
      },
      {
        key: 'duration_exact',
        label: 'مدت زمان دقیق',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.duration_exact || '',
        newVal: previewDoc.duration_exact || '',
        isDifferent: (existingDoc.duration_exact || '') !== (previewDoc.duration_exact || '')
      },
      {
        key: 'documentary_mode',
        label: 'گونه و فرم روایی',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.documentary_mode || '',
        newVal: previewDoc.documentary_mode || '',
        isDifferent: (existingDoc.documentary_mode || '') !== (previewDoc.documentary_mode || '')
      },
      {
        key: 'temporal_era',
        label: 'مقطع زمانی و دوره وقایع',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.temporal_era || '',
        newVal: previewDoc.temporal_era || '',
        isDifferent: (existingDoc.temporal_era || '') !== (previewDoc.temporal_era || '')
      },
      {
        key: 'main_protagonist_subject',
        label: 'سوژه یا قهرمان اصلی',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.main_protagonist_subject || '',
        newVal: previewDoc.main_protagonist_subject || '',
        isDifferent: (existingDoc.main_protagonist_subject || '') !== (previewDoc.main_protagonist_subject || '')
      },
      {
        key: 'subject_profession',
        label: 'شغل یا تخصص سوژه',
        category: 'محتوا و طبقه‌بندی',
        oldVal: existingDoc.subject_profession || '',
        newVal: previewDoc.subject_profession || '',
        isDifferent: (existingDoc.subject_profession || '') !== (previewDoc.subject_profession || '')
      },
      {
        key: 'logline',
        label: 'لاگ‌لاین (خلاصه تک‌خطی)',
        category: 'روایت و خلاصه',
        oldVal: existingDoc.logline || '',
        newVal: previewDoc.logline || '',
        isDifferent: (existingDoc.logline || '').trim() !== (previewDoc.logline || '').trim()
      },
      {
        key: 'short_synopsis',
        label: 'خلاصه کوتاه کاتالوگ',
        category: 'روایت و خلاصه',
        oldVal: existingDoc.short_synopsis || '',
        newVal: previewDoc.short_synopsis || '',
        isDifferent: (existingDoc.short_synopsis || '').trim() !== (previewDoc.short_synopsis || '').trim()
      },
      {
        key: 'core_message',
        label: 'پیام اصلی اثر',
        category: 'روایت و خلاصه',
        oldVal: existingDoc.core_message || '',
        newVal: previewDoc.core_message || '',
        isDifferent: (existingDoc.core_message || '').trim() !== (previewDoc.core_message || '').trim()
      },

      // 2. Crew Roles
      {
        key: 'crew.director',
        label: 'کارگردان (Director)',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.director || '',
        newVal: previewDoc.crew?.director || '',
        isDifferent: (existingDoc.crew?.director || '') !== (previewDoc.crew?.director || '')
      },
      {
        key: 'crew.producer_individual',
        label: 'تهیه‌کننده حقیقی',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.producer_individual || '',
        newVal: previewDoc.crew?.producer_individual || '',
        isDifferent: (existingDoc.crew?.producer_individual || '') !== (previewDoc.crew?.producer_individual || '')
      },
      {
        key: 'crew.legal_producer_entity',
        label: 'تهیه‌کننده حقوقی / سازمان سازنده',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.legal_producer_entity || '',
        newVal: previewDoc.crew?.legal_producer_entity || '',
        isDifferent: (existingDoc.crew?.legal_producer_entity || '') !== (previewDoc.crew?.legal_producer_entity || '')
      },
      {
        key: 'crew.screenwriter',
        label: 'فیلمنامه‌نویس / نویسنده',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.screenwriter || '',
        newVal: previewDoc.crew?.screenwriter || '',
        isDifferent: (existingDoc.crew?.screenwriter || '') !== (previewDoc.crew?.screenwriter || '')
      },
      {
        key: 'crew.cinematographer',
        label: 'مدیر فیلمبرداری',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.cinematographer || '',
        newVal: previewDoc.crew?.cinematographer || '',
        isDifferent: (existingDoc.crew?.cinematographer || '') !== (previewDoc.crew?.cinematographer || '')
      },
      {
        key: 'crew.editor',
        label: 'تدوینگر',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.editor || '',
        newVal: previewDoc.crew?.editor || '',
        isDifferent: (existingDoc.crew?.editor || '') !== (previewDoc.crew?.editor || '')
      },
      {
        key: 'crew.music_composer',
        label: 'آهنگساز',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.music_composer || '',
        newVal: previewDoc.crew?.music_composer || '',
        isDifferent: (existingDoc.crew?.music_composer || '') !== (previewDoc.crew?.music_composer || '')
      },
      {
        key: 'crew.narrator',
        label: 'گوینده گفتار متن / نریتور',
        category: 'عوامل تولید (Crew)',
        oldVal: existingDoc.crew?.narrator || '',
        newVal: previewDoc.crew?.narrator || '',
        isDifferent: (existingDoc.crew?.narrator || '') !== (previewDoc.crew?.narrator || '')
      },

      // 3. Archival & Timecodes
      {
        key: 'archival_footage_log.status',
        label: 'وضعیت فوتیج آرشیوی',
        category: 'آرشیو و تایم‌کدها',
        oldVal: existingDoc.archival_footage_log?.status || '',
        newVal: previewDoc.archival_footage_log?.status || '',
        isDifferent: (existingDoc.archival_footage_log?.status || '') !== (previewDoc.archival_footage_log?.status || '')
      },
      {
        key: 'interviewees_count',
        label: 'تعداد مصاحبه‌شوندگان با تایم‌کد',
        category: 'آرشیو و تایم‌کدها',
        oldVal: `${existingDoc.interviewees_with_timecodes?.length || 0} مصاحبه`,
        newVal: `${previewDoc.interviewees_with_timecodes?.length || 0} مصاحبه`,
        isDifferent: (existingDoc.interviewees_with_timecodes?.length || 0) !== (previewDoc.interviewees_with_timecodes?.length || 0)
      },
      {
        key: 'music_cues_count',
        label: 'تعداد نشانه‌های موسیقی (Music Cues)',
        category: 'آرشیو و تایم‌کدها',
        oldVal: `${existingDoc.music_cues?.length || 0} نشانه`,
        newVal: `${previewDoc.music_cues?.length || 0} نشانه`,
        isDifferent: (existingDoc.music_cues?.length || 0) !== (previewDoc.music_cues?.length || 0)
      },

      // 4. Tags & Locations
      {
        key: 'geographical_locations',
        label: 'لوکیشن‌های جغرافیایی',
        category: 'برچسب‌ها و کلیدواژه‌ها',
        oldVal: (existingDoc.geographical_locations || []).join('، '),
        newVal: (previewDoc.geographical_locations || []).join('، '),
        isDifferent: (existingDoc.geographical_locations || []).join('، ') !== (previewDoc.geographical_locations || []).join('، ')
      },
      {
        key: 'thematic_tags',
        label: 'برچسب‌های موضوعی',
        category: 'برچسب‌ها و کلیدواژه‌ها',
        oldVal: (existingDoc.thematic_tags || []).join('، '),
        newVal: (previewDoc.thematic_tags || []).join('، '),
        isDifferent: (existingDoc.thematic_tags || []).join('، ') !== (previewDoc.thematic_tags || []).join('، ')
      },
      {
        key: 'semantic_keywords',
        label: 'کلمات کلیدی معنایی',
        category: 'برچسب‌ها و کلیدواژه‌ها',
        oldVal: (existingDoc.semantic_keywords || []).join('، '),
        newVal: (previewDoc.semantic_keywords || []).join('، '),
        isDifferent: (existingDoc.semantic_keywords || []).join('، ') !== (previewDoc.semantic_keywords || []).join('، ')
      },

      // 5. Evaluation & QC
      {
        key: 'ammar_discourse_score',
        label: 'امتیاز گفتمان عمار (۰ تا ۱۰)',
        category: 'ارزیابی و داوری',
        oldVal: String(existingDoc.ammar_discourse_score || ''),
        newVal: String(previewDoc.ammar_discourse_score || ''),
        isDifferent: String(existingDoc.ammar_discourse_score || '') !== String(previewDoc.ammar_discourse_score || '')
      },
      {
        key: 'confidence_score',
        label: 'امتیاز اطمینان استخراج هوش مصنوعی',
        category: 'ارزیابی و داوری',
        oldVal: String(existingDoc.confidence_score || ''),
        newVal: String(previewDoc.confidence_score || ''),
        isDifferent: String(existingDoc.confidence_score || '') !== String(previewDoc.confidence_score || '')
      },
      {
        key: 'human_verification_status',
        label: 'وضعیت بررسی ناظران',
        category: 'ارزیابی و داوری',
        oldVal: existingDoc.human_verification_status || '',
        newVal: previewDoc.human_verification_status || '',
        isDifferent: (existingDoc.human_verification_status || '') !== (previewDoc.human_verification_status || '')
      }
    ];

    return items;
  }, [existingDoc, previewDoc]);

  const diffStats = useMemo(() => {
    const total = diffItems.length;
    const changed = diffItems.filter((i) => i.isDifferent).length;
    const identical = total - changed;
    return { total, changed, identical };
  }, [diffItems]);

  const displayedDiffItems = useMemo(() => {
    if (diffOnlyChanges) {
      return diffItems.filter((i) => i.isDifferent);
    }
    return diffItems;
  }, [diffItems, diffOnlyChanges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* ========================================================================= */}
      {/* 1. SIDE-BY-SIDE DIFF MODAL (Option 4)                                    */}
      {/* ========================================================================= */}
      {isDiffOpen && existingDoc && previewDoc ? (
        <div
          className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          dir="rtl"
        >
          {/* Diff Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/80">
            <div className="flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <GitCompare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    مقایسه تطبیقی فیلدها (Side-by-Side Diff)
                  </h3>
                  <span className="font-mono text-xs font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-lg">
                    {previewDoc.asset_id}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  مقایسه موشکافانه اطلاعات فایل ارسالی با رکورد موجود در سامانه و گوگل‌شیت
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-800">
                {diffStats.changed} فیلد دارای تفاوت
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-neutral-100 text-neutral-700">
                {diffStats.identical} فیلد یکسان
              </span>
              <button
                onClick={() => setIsDiffOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-200/60 transition-colors active:scale-95"
                title="بازگشت به نمای اصلی آپلود"
                aria-label="بازگشت"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Diff Filter Bar */}
          <div className="px-5 py-2.5 bg-neutral-100/60 border-b border-neutral-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiffOnlyChanges(false)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  !diffOnlyChanges
                    ? 'bg-white text-neutral-900 shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                نمایش تمام فیلدها ({diffStats.total})
              </button>
              <button
                onClick={() => setDiffOnlyChanges(true)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                  diffOnlyChanges
                    ? 'bg-amber-500 text-white shadow-2xs font-semibold'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                صرفاً موارد دارای تفاوت ({diffStats.changed})
              </button>
            </div>

            <div className="text-neutral-400 hidden sm:block">
              رنگ زرد نشان‌دهنده مقادیر اصلاح‌شده یا متفاوت در فایل جدید است
            </div>
          </div>

          {/* Diff Table Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="grid grid-cols-12 bg-neutral-100/90 text-neutral-700 text-xs font-bold border-b border-neutral-200 py-2.5 px-3">
                <div className="col-span-3">نام و مشخصه فیلد</div>
                <div className="col-span-4 border-r border-neutral-200 pr-2">
                  داده‌های کنونی در سیستم (Existing)
                </div>
                <div className="col-span-4 border-r border-neutral-200 pr-2">
                  داده‌های فایل جدید ارسالی (Incoming)
                </div>
                <div className="col-span-1 text-center">وضعیت</div>
              </div>

              <div className="divide-y divide-neutral-100 text-xs">
                {displayedDiffItems.map((item) => (
                  <div
                    key={item.key}
                    className={`grid grid-cols-12 py-2.5 px-3 items-center transition-colors ${
                      item.isDifferent
                        ? 'bg-amber-50/50 hover:bg-amber-50'
                        : 'bg-white hover:bg-neutral-50/70'
                    }`}
                  >
                    {/* Field Name */}
                    <div className="col-span-3 pl-2">
                      <span className="font-semibold text-neutral-900 block truncate" title={item.label}>
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 block truncate">
                        {item.key}
                      </span>
                    </div>

                    {/* Existing Value */}
                    <div className="col-span-4 border-r border-neutral-100 pr-2.5 text-neutral-700">
                      {item.oldVal ? (
                        <p className="line-clamp-3 leading-relaxed break-words font-medium">
                          {item.oldVal}
                        </p>
                      ) : (
                        <span className="text-neutral-300 italic">تهی / خالی</span>
                      )}
                    </div>

                    {/* New Value */}
                    <div className="col-span-4 border-r border-neutral-100 pr-2.5">
                      {item.newVal ? (
                        <p
                          className={`line-clamp-3 leading-relaxed break-words font-medium ${
                            item.isDifferent ? 'text-amber-900 font-bold' : 'text-neutral-700'
                          }`}
                        >
                          {item.newVal}
                        </p>
                      ) : (
                        <span className="text-neutral-300 italic">تهی / خالی</span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-1 text-center">
                      {item.isDifferent ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900">
                          تغییر
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-neutral-100 text-neutral-500">
                          یکسان
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Diff Action Footer with Direct Execution */}
          <div className="p-4 sm:px-6 border-t border-neutral-200/80 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setIsDiffOpen(false)}
              className="w-full sm:w-auto h-9 px-4 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              بازگشت به پنجره آپلود
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleSendToSheet('append')}
                disabled={isSubmitting}
                className="h-9 px-3.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                title="ثبت به عنوان ردیف جدید با حفظ کد قبلی"
              >
                <PlusCircle className="w-3.5 h-3.5 text-neutral-500" />
                <span>ثبت با حفظ شناسه (Force Append)</span>
              </button>

              <button
                onClick={() => handleSendToSheet('new_version')}
                disabled={isSubmitting}
                className="h-9 px-3.5 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-200 rounded-xl transition-colors flex items-center gap-1.5"
                title="ثبت با شناسه نسخه جدید بدون تداخل"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>ثبت نسخه جدید ({newVersionId})</span>
              </button>

              <button
                onClick={() => handleSendToSheet('update')}
                disabled={isSubmitting}
                className="h-9 px-4 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                title="جایگزینی متادیتای ردیف قبلی"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                <span>به‌روزرسانی ردیف موجود</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. MAIN UPLOADER MODAL & ADVANCED DUPLICATE RESOLUTION HUB               */
        /* ========================================================================= */
        <div
          className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[92vh] overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div className="w-9.5 h-9.5 rounded-xl bg-black text-white flex items-center justify-center shadow-xs shrink-0">
                <Upload className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  بارگذاری شناسنامه مستند (ارسال فایل JSON به گوگل‌شیت)
                </h3>
                <p className="text-xs text-neutral-500">
                  انطباق کامل با استاندارد ۶۶ ستونه جشنواره عمار و اعتبارسنجی هوشمند تکرار
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors active:scale-95"
              aria-label="بستن"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-neutral-900 bg-neutral-100/70 scale-[0.99]'
                  : selectedFile
                  ? 'border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50'
                  : 'border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50/60'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedFile
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {selectedFile ? (
                    <FileJson className="w-6 h-6" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {selectedFile ? selectedFile.name : 'فایل JSON را به اینجا بکشید یا کلیک کنید'}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    پشتیبانی صرفاً از فرمت استاندارد <span className="font-mono">.json</span> (حداکثر حجم ۱۰ مگابایت)
                  </p>
                </div>

                {!selectedFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadSample();
                    }}
                    className="mt-1 inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-black bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-neutral-50 transition-colors active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>تست با فایل نمونه (آب رسان - کد 1504595)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Duplicate Checking Indicator */}
            {isCheckingDuplicate && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-neutral-600 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
                <span>در حال بررسی پیشینه کد اثر در پایگاه داده گوگل‌شیت...</span>
              </div>
            )}

            {/* Parse or Validation Error */}
            {parseError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">خطا در پردازش فایل:</span>
                  <span>{parseError}</span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* RICH DUPLICATE RESOLUTION HUB (Options 1, 2, 3, 4, 5)                    */}
            {/* ========================================================================= */}
            {isDuplicate && existingDoc && previewDoc && (
              <div className="p-4 sm:p-5 bg-amber-50/80 border border-amber-300/80 rounded-2xl text-xs space-y-4 shadow-2xs">
                {/* Header of Warning */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>کد اثر تکراری شناسایی شد (شناسه: {existingDoc.asset_id})</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 font-semibold text-[11px] rounded-lg shrink-0">
                    نیاز به تصمیم‌گیری
                  </span>
                </div>

                {/* Conflict Summary Card */}
                <div className="bg-white/90 border border-amber-200 rounded-xl p-3 space-y-2 text-neutral-700">
                  <div className="flex items-center justify-between text-[11px] border-b border-neutral-100 pb-1.5">
                    <span className="text-neutral-500">رکورد موجود در سیستم:</span>
                    <span className="font-bold text-neutral-900">
                      «{existingDoc.title_extracted}» {existingDoc.crew?.director ? `— به کارگردانی ${existingDoc.crew.director}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">فایل تازه ارسالی:</span>
                    <span className="font-bold text-amber-900">
                      «{previewDoc.title_extracted}» {previewDoc.crew?.director ? `— به کارگردانی ${previewDoc.crew.director}` : ''}
                    </span>
                  </div>
                </div>

                {/* Smart Choice Options */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-amber-950 block">
                    حق انتخاب‌های مدیریت رکورد تکراری:
                  </span>

                  {/* Option 3: Auto-Version Generation Box */}
                  <div className="bg-white rounded-xl p-3 border border-amber-200/90 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-neutral-900 font-bold">
                        <Copy className="w-4 h-4 text-emerald-600" />
                        <span>تولید خودکار شناسه جدید (نسخه‌گذاری)</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg font-medium border border-emerald-200">
                        پیشنهادی و امن
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      کد اثر را به عنوان نسخه تازه (بدون تداخل با رکورد قبلی) تغییر دهید و ثبت نمایید:
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="relative flex-1 w-full">
                        <input
                          type="text"
                          value={newVersionId}
                          onChange={(e) => setNewVersionId(e.target.value.trim())}
                          placeholder="مثلاً 1504595-v2"
                          className="w-full h-9 px-3 font-mono text-xs text-neutral-900 bg-neutral-50 border border-neutral-300 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white text-left dir-ltr"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setNewVersionId(generateVersionId(existingDoc.asset_id, 'v2'))}
                          className="h-9 px-2.5 text-[11px] font-mono bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors active:scale-95"
                          title="پسوند نسخه ۲"
                        >
                          v2
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewVersionId(generateVersionId(existingDoc.asset_id, 'rev1'))}
                          className="h-9 px-2.5 text-[11px] font-mono bg-neutral-100 hover:bg-neutral-200 rounded-xl text-neutral-700 transition-colors active:scale-95"
                          title="پسوند ویرایش ۱"
                        >
                          rev1
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSendToSheet('new_version')}
                          disabled={isSubmitting || !newVersionId}
                          className="h-9 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1 whitespace-nowrap active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>ثبت نسخه جدید</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Option 4: Side-by-Side Diff Trigger Button */}
                  <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl p-3">
                    <div>
                      <span className="font-bold text-blue-900 block text-xs">
                        مشاهده و مقایسه تفاوت‌ها (Diff Side-by-Side)
                      </span>
                      <span className="text-[11px] text-blue-700 block mt-0.5">
                        بررسی فیلد به فیلد تفاوت‌های رکورد کنونی با داده‌های جدید ارسالی
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDiffOpen(true)}
                      className="h-9 px-3.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 active:scale-95 shrink-0"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>مشاهده تفاوت‌ها</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata Quick Preview */}
            {previewDoc && (
              <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200/70 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-neutral-700" />
                    <span className="text-xs font-bold text-neutral-900">
                      مشخصات استخراج‌شده از JSON (مطابق ۶۶ ستون استاندارد):
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg font-semibold">
                    اسکیما معتبر است
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">عنوان اثر:</span>
                    <span className="font-bold text-neutral-900 truncate block">
                      {previewDoc.title_extracted || '—'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">کد اثر (Asset ID):</span>
                    <span className="font-mono font-semibold text-neutral-800 block">
                      {previewDoc.asset_id || '—'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">کارگردان:</span>
                    <span className="text-neutral-800 truncate block">
                      {previewDoc.crew?.director || '—'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">موضوع اصلی:</span>
                    <span className="text-neutral-800 truncate block">
                      {previewDoc.main_topic || '—'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">مدت زمان دقیق:</span>
                    <span className="font-mono text-neutral-800 block">
                      {previewDoc.duration_exact || '—'}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-neutral-100">
                    <span className="text-neutral-400 block text-[11px]">امتیاز گفتمان:</span>
                    <span className="font-mono font-semibold text-amber-600 block">
                      {previewDoc.ammar_discourse_score || '—'}
                    </span>
                  </div>
                </div>

                {previewDoc.logline && (
                  <p className="text-[11px] text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-100 line-clamp-2 leading-relaxed">
                    <strong className="text-neutral-800">لاگ‌لاین: </strong>
                    {previewDoc.logline}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Modal Footer / Actions (Option 1, 2, 5) */}
          <div className="p-4 sm:px-6 border-t border-neutral-200/80 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Option 5: Cancel */}
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-9 px-4 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors active:scale-95"
            >
              انصراف و لغو
            </button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {isDuplicate ? (
                <>
                  {/* Option 2: Force Append */}
                  <button
                    onClick={() => handleSendToSheet('append')}
                    disabled={isSubmitting || !validation?.isValid}
                    className="h-9 px-3.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors flex items-center gap-1.5 active:scale-95"
                    title="ثبت به عنوان ردیف جدید با همان کد شناسنامه"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-neutral-500" />
                    <span>ثبت با حفظ شناسه (Force Append)</span>
                  </button>

                  {/* Option 1: Update Existing Row */}
                  <button
                    onClick={() => handleSendToSheet('update')}
                    disabled={isSubmitting || !validation?.isValid}
                    className="h-9 px-4 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 active:scale-95"
                    title="جایگزینی مقادیر ردیف قبلی با متادیتای جدید"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>به‌روزرسانی و جایگزینی ردیف موجود</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSendToSheet('append')}
                  disabled={isSubmitting || !validation?.isValid}
                  className="w-full sm:w-auto h-10 px-5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>در حال ارسال به گوگل‌شیت...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>تایید و ارسال به گوگل‌شیت</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
