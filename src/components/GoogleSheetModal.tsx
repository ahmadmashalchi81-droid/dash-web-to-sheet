import React, { useState, useEffect } from 'react';
import { X, Database, Check, AlertCircle, Copy, ExternalLink, RefreshCw, FileCode } from 'lucide-react';
import { SheetConnectionConfig } from '../types/documentary.ts';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetConnectionConfig | null;
  onSaveConfig: (webAppUrl: string, mode: 'live' | 'seed', sheetName?: string) => Promise<void>;
  onTriggerSync: (customUrl?: string, mode?: 'live' | 'seed', sheetName?: string) => Promise<any>;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerSync
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'script'>('connect');
  const [urlInput, setUrlInput] = useState(config?.webAppUrl || '');
  const [sheetNameInput, setSheetNameInput] = useState(config?.sheetName || 'temp');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [scriptCode, setScriptCode] = useState<string>('');

  useEffect(() => {
    if (config?.webAppUrl) setUrlInput(config.webAppUrl);
    if (config?.sheetName) setSheetNameInput(config.sheetName);
  }, [config]);

  useEffect(() => {
    fetch('/api/v1/google-apps-script')
      .then((res) => res.text())
      .then((text) => setScriptCode(text))
      .catch((err) => console.error('Failed to load Google Apps Script:', err));
  }, []);

  if (!isOpen) return null;

  const handleTestAndSave = async (mode: 'live' | 'seed') => {
    setIsTesting(true);
    setTestResult(null);
    try {
      if (mode === 'seed') {
        const res = await onTriggerSync('', 'seed', sheetNameInput.trim() || 'temp');
        setTestResult({
          success: true,
          message: 'مخزن با موفقیت به داده‌های استاندارد داخلی بازگردانی شد.',
          count: res.count
        });
        await onSaveConfig('', 'seed', sheetNameInput.trim() || 'temp');
      } else {
        if (!urlInput.trim()) {
          setTestResult({
            success: false,
            message: 'لطفاً آدرس Web App گوگل شیت را وارد نمایید.'
          });
          setIsTesting(false);
          return;
        }

        const res = await onTriggerSync(urlInput.trim(), 'live', sheetNameInput.trim() || 'temp');
        setTestResult({
          success: true,
          message: `اتصال با موفقیت برقرار شد. برگه «${res.sheetName || sheetNameInput.trim() || 'temp'}» همگام گردید (تعداد ${res.count} رکورد).`,
          count: res.count
        });
        await onSaveConfig(urlInput.trim(), 'live', sheetNameInput.trim() || 'temp');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'خطا در برقراری ارتباط با گوگل شیت.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopyScript = () => {
    if (scriptCode) {
      navigator.clipboard.writeText(scriptCode);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-9.5 h-9.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                پیکربندی اتصال به گوگل شیت (Google Sheets API / Web App)
              </h3>
              <p className="text-xs text-neutral-500">
                خواندن امن داده‌ها از شیت و تحویل به عنوان API داخلی با صفحه‌بندی
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

        {/* MD3 Secondary Tabs */}
        <div className="flex border-b border-neutral-200/80 px-4 sm:px-6 bg-white gap-2 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('connect')}
            className={`relative py-3.5 px-3 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <span>اتصال آدرس Web App</span>
            {activeTab === 'connect' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-neutral-900 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`relative py-3.5 px-3 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'script'
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>کد Apps Script شیت</span>
            {activeTab === 'script' && (
              <span className="absolute bottom-0 inset-x-0 h-0.5 bg-neutral-900 rounded-full" />
            )}
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-neutral-800 flex-1">
          {activeTab === 'connect' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    آدرس Google Apps Script Web App یا اندپوینت شیت
                  </label>
                  {config?.webAppUrl && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/70">
                      بارگذاری شده از Secrets (WEB_APP_URL)
                    </span>
                  )}
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                  آدرس وب‌سرویس Apps Script با متغیر WEB_APP_URL در بخش Secrets همگام شده است.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700">
                    نام برگه (تب) فعال در گوگل‌شیت
                  </label>
                  <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/70">
                    برگه تست: temp
                  </span>
                </div>
                <input
                  type="text"
                  value={sheetNameInput}
                  onChange={(e) => setSheetNameInput(e.target.value)}
                  placeholder="temp یا کلیدهای_اصلی_JSON"
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-neutral-50/80 hover:bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all font-mono"
                  dir="ltr"
                />
                <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
                  برگه نمونه پیش‌فرض <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-mono">temp</code> در شیت «تمرین ۱» شامل ۱۰۰۰ رکورد آزمایشی است. پس از تست می‌توانید نام تب را تغییر دهید.
                </p>
              </div>

              {/* Status & Feedback */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs leading-relaxed ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border-red-200 text-red-900'
                  }`}
                >
                  {testResult.success ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => handleTestAndSave('live')}
                  disabled={isTesting}
                  className="flex-1 h-10 inline-flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 transition-all shadow-xs select-none active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'در حال تست و اتصال...' : 'اتصال و سینک شیت زنده'}</span>
                </button>

                <button
                  onClick={() => handleTestAndSave('seed')}
                  disabled={isTesting}
                  className="h-10 px-4 rounded-xl text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/80 transition-all select-none active:scale-95"
                >
                  بازنشانی به داده‌های آزمایشی استاندارد
                </button>
              </div>

              {/* Quick instructions */}
              <div className="mt-4 p-4 rounded-xl bg-neutral-50/80 border border-neutral-100 space-y-2 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900 block mb-1">
                  نحوه راه‌اندازی سریع در گوگل شیت:
                </span>
                <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                  <li>فایل شیت خود را در Google Drive باز کنید.</li>
                  <li>از منوی <strong>Extensions</strong> گزینه <strong>Apps Script</strong> را بزنید.</li>
                  <li>کد آماده موجود در تب «کد Apps Script شیت» را در آن کپی کنید.</li>
                  <li>روی <strong>Deploy &gt; New deployment &gt; Web app</strong> کلیک کنید (دسترسی: Anyone).</li>
                  <li>آدرس تولیدشده را در کادر بالا وارد کرده و کلید اتصال را بزنید!</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-600">
                  این اسکریپت سبک داده‌های ردیف‌های شیت شما را خوانده و در قالب JSON استاندارد تحویل می‌دهد:
                </p>
                <button
                  onClick={handleCopyScript}
                  className="h-9 inline-flex items-center gap-1.5 text-xs font-semibold bg-neutral-900 text-white px-3 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs select-none active:scale-95"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'کپی شد' : 'کپی اسکریپت'}</span>
                </button>
              </div>

              <pre
                className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[360px] leading-relaxed select-all"
                dir="ltr"
              >
                {scriptCode || '// در حال بارگذاری اسکریپت از سرور...'}
              </pre>
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

