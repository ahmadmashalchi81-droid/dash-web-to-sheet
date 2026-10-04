import React from 'react';
import { SheetConnectionConfig } from '../types/documentary.ts';
import { RefreshCw, Database, Terminal, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  config: SheetConnectionConfig | null;
  onOpenSheetModal: () => void;
  onOpenApiExplorer: () => void;
  onOpenValidator: () => void;
  onSync: () => void;
  isSyncing: boolean;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onOpenSheetModal,
  onOpenApiExplorer,
  onOpenValidator,
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
          <div className="w-9 h-9 rounded-lg bg-black text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm select-none">
            DS
          </div>

          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <h1 className="text-base font-bold text-neutral-900 tracking-tight">
                DocuSheet API
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/60">
                v1.0 Ready
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-normal">
              زیرساخت متادیتای مستند و اتصال به گوگل‌شیت
            </p>
          </div>

          {/* Connection Status Badge with Ping Animation */}
          <div className="hidden lg:flex items-center space-x-2 space-x-reverse border-r border-neutral-200 pr-4 mr-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-neutral-800">
              {isLive ? 'رکوردهای اتصال زنده (Google Sheets)' : 'اتصال زنده (Google Sheets)'}
            </span>
            <span className="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200/70">
              {totalRecords} رکورد
            </span>
          </div>
        </div>

        {/* Left side in RTL (Action Buttons) */}
        <div className="flex items-center space-x-2 sm:space-x-2.5 space-x-reverse" dir="rtl">
          {/* 1. Linear Navigation Button: اعتبارسنجی اسکیما */}
          <button
            onClick={onOpenValidator}
            className="hidden md:inline-flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent"
            title="اعتبارسنجی اسکیما و قواعد شیت"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-500" />
            <span>اعتبارسنجی اسکیما</span>
          </button>

          {/* 2. Linear Navigation Button: API Docs & cURL */}
          <button
            onClick={onOpenApiExplorer}
            className="hidden sm:inline-flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-transparent"
            title="مستندات تعاملی API و کدهای cURL"
          >
            <Terminal className="w-4 h-4 text-neutral-500" />
            <span>API Docs & cURL</span>
          </button>

          {/* 3. Bordered Button: اتصال شیت */}
          <button
            onClick={onOpenSheetModal}
            className="inline-flex items-center space-x-1.5 space-x-reverse px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-50 rounded-lg border border-neutral-300 transition-colors shadow-2xs"
            title="تنظیمات اتصال به گوگل‌شیت"
          >
            <Database className="w-3.5 h-3.5 text-neutral-600" />
            <span>اتصال شیت</span>
          </button>

          {/* 4. Primary Highlight Button (#000000 black background): همگام‌سازی */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center space-x-1.5 space-x-reverse px-3.5 py-1.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-lg shadow-sm transition-all duration-150 active:scale-95"
            title="همگام‌سازی فوری با وب‌سرویس گوگل شیت"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'در حال سینک...' : 'همگام‌سازی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
