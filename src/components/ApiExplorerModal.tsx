import React, { useState } from 'react';
import { X, Play, Copy, Check, Terminal } from 'lucide-react';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [endpoint, setEndpoint] = useState<string>('/api/v1/documentaries?page=1&limit=3');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [
    { label: 'لیست صفحه‌بندی‌شده', url: '/api/v1/documentaries?page=1&limit=5' },
    { label: 'جستجوی طارق عچرش', url: '/api/v1/documentaries?q=طارق&limit=5' },
    { label: 'فیلتر عدالت آموزشی', url: '/api/v1/documentaries?topic=عدالت آموزشی' },
    { label: 'مستند تکی با ID', url: '/api/v1/documentaries/DOC-IR-1402-001' },
    { label: 'بررسی سلامت سرویس', url: '/api/v1/health' }
  ];

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    setStatusCode(null);
    const start = performance.now();
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setLatency(Math.round(performance.now() - start));
      setStatusCode(res.status);
      setResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setLatency(Math.round(performance.now() - start));
      setStatusCode(500);
      setResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const curlCommand = `curl -X GET "${window.location.origin}${endpoint}" -H "Accept: application/json"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-neutral-200/80 flex flex-col max-h-[90vh] overflow-hidden"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-200/80 flex items-center justify-between bg-neutral-50/60">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-9.5 h-9.5 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
              <Terminal className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                مستندات و کاوشگر API داخلی (/api/v1/documentaries)
              </h3>
              <p className="text-xs text-neutral-500">
                تست زنده فراخوانی داده‌های شیت، صفحه‌بندی (Pagination) و فیلترها
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-xl hover:bg-neutral-100 transition-colors active:scale-95"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset chips */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-100 bg-neutral-50/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-neutral-500 font-medium whitespace-nowrap text-[11px]">پیش‌فرض‌ها:</span>
          {presets.map((p, i) => (
            <button
              key={i}
              onClick={() => setEndpoint(p.url)}
              className="px-2.5 py-1 rounded-lg bg-white border border-neutral-200/80 text-neutral-700 hover:border-neutral-900 hover:text-neutral-900 whitespace-nowrap transition-colors text-xs font-medium shadow-2xs"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Endpoint Input bar (Unified 40px height) */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center gap-2">
          <span className="h-10 px-3 flex items-center justify-center text-xs font-mono font-bold bg-neutral-900 text-white rounded-xl select-none">
            GET
          </span>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="h-10 flex-1 px-3 text-xs font-mono bg-neutral-50/80 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:bg-white transition-all"
            dir="ltr"
          />
          <button
            onClick={handleExecute}
            disabled={loading}
            className="h-10 inline-flex items-center space-x-1.5 space-x-reverse px-4 text-xs font-semibold text-white bg-black hover:bg-neutral-800 rounded-xl shadow-xs transition-all disabled:opacity-50 select-none active:scale-95"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'در حال ارسال...' : 'ارسال درخواست'}</span>
          </button>
        </div>

        {/* Output area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* cURL instruction */}
          <div className="bg-neutral-900 text-neutral-200 p-3.5 rounded-xl flex items-center justify-between font-mono text-xs" dir="ltr">
            <div className="truncate pr-2 text-neutral-300">
              <span className="text-emerald-400 font-bold">$ </span>
              {curlCommand}
            </div>
            <button
              onClick={handleCopyCurl}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 transition-colors shrink-0"
              title="کپی دستور cURL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Response Meta */}
          {statusCode !== null && (
            <div className="flex items-center justify-between text-xs text-neutral-500 border-b border-neutral-100 pb-2">
              <div className="flex items-center space-x-3 space-x-reverse">
                <span>
                  وضعیت پاسخ:{' '}
                  <span
                    className={`font-mono font-bold ${
                      statusCode >= 200 && statusCode < 300
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {statusCode} OK
                  </span>
                </span>
                <span>
                  زمان پاسخ:{' '}
                  <span className="font-mono text-neutral-800 font-medium">
                    {latency} ms
                  </span>
                </span>
              </div>
              <span className="font-mono text-neutral-400">Content-Type: application/json</span>
            </div>
          )}

          {/* JSON Body */}
          <div>
            <span className="text-xs font-semibold text-neutral-600 block mb-1.5">
              پاسخ سرور (Response Body):
            </span>
            <pre
              className="bg-neutral-900 text-neutral-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[360px] leading-relaxed select-all"
              dir="ltr"
            >
              {response || (loading ? '// در حال واکشی داده‌ها از سرور...' : '// برای مشاهده خروجی، کلید «ارسال درخواست» را بزنید.')}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors shadow-2xs"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

