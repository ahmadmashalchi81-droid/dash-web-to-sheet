import React from 'react';
import { SheetConnectionConfig } from '../types/documentary.ts';
import { RefreshCw, Database, Terminal, ShieldCheck, Upload } from 'lucide-react';

interface HeaderProps {
  config: SheetConnectionConfig | null;
  onOpenSheetModal: () => void;
  onOpenApiExplorer: () => void;
  onOpenValidator: () => void;
  onOpenUploader: () => void;
  onSync: () => void;
  isSyncing: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenSheetModal,
  onOpenApiExplorer,
  onOpenValidator,
  onOpenUploader,
  onSync,
  isSyncing,
  totalRecords
}) => {
  const isLive = config?.mode === 'live' && Boolean(config.webAppUrl);

  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Right side in RTL (Branding & Connection Badge) */}
        <div className="flex items-center space-x-3 sm:space-x-4 space-x-reverse" dir="rtl">
          {/* Logo badge */}
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs select-none shrink-0">
            DS
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-2 space-x-reverse">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-none">
                DocuSheet API
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/70 select-none">
                v3.1.0 Ready
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal mt-0.5 hidden xs:block">
              زیرساخت متادیتای مستند و اتصال به گوگل‌شیت
            </p>
          </div>

          {/* Connection Status Badge with Ping Animation */}
          <div className="hidden md:flex items-center space-x-2 space-x-reverse border-r border-neutral-200 pr-3 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-700">
              {isLive ? `برگه «${config?.sheetName || 'temp'}»` : 'حالت لوکال (Seed)'}
            </span>
            <span className="text-[11px] font-mono font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/80">
              {totalRecords.toLocaleString('fa-IR')} اثر
            </span>
          </div>
        </div>

        {/* Left side in RTL (Action Buttons) */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 space-x-reverse" dir="rtl">
          {/* 1. Linear Navigation Button: اعتبارسنجی اسکیما */}
          <button
            onClick={onOpenValidator}
            className="hidden lg:inline-flex items-center space-x-1.5 space-x-reverse h-9 px-3 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors border border-transparent select-none active:scale-98"
            title="اعتبارسنجی اسکیما و قواعد شیت"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>اعتبارسنجی اسکیما</span>
          </button>

          {/* 2. Linear Navigation Button: API Docs & cURL */}
          <button
            onClick={onOpenApiExplorer}
            className="hidden sm:inline-flex items-center space-x-1.5 space-x-reverse h-9 px-3 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors border border-transparent select-none active:scale-98"
            title="مستندات تعاملی API و کدهای cURL"
          >
            <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>API Docs & cURL</span>
          </button>

          {/* 3. Button: بارگذاری شناسنامه (JSON) */}
          <button
            onClick={onOpenUploader}
            className="inline-flex items-center space-x-1.5 space-x-reverse h-9 px-3 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-xl transition-colors shadow-2xs select-none active:scale-98"
            title="بارگذاری فایل JSON شناسنامه مستند و ارسال به گوگل‌شیت"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
            <span>بارگذاری JSON</span>
          </button>

          {/* 4. Bordered Button: تنظیمات اتصال شیت */}
          <button
            onClick={onOpenSheetModal}
            className="inline-flex items-center space-x-1.5 space-x-reverse h-9 px-3 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors shadow-2xs select-none active:scale-98"
            title="تنظیمات اتصال به گوگل‌شیت"
          >
            <Database className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <span>اتصال شیت</span>
          </button>

          {/* 5. Primary Highlight Button (#000000 black background): همگام‌سازی */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center space-x-1.5 space-x-reverse h-9 px-3.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-xl shadow-xs transition-all duration-150 select-none active:scale-95"
            title="همگام‌سازی فوری با وب‌سرویس گوگل شیت"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'در حال سینک...' : 'همگام‌سازی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
