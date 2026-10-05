import React, { useState, useRef, useEffect } from 'react';
import { SheetConnectionConfig } from '../types/documentary.ts';
import { RefreshCw, Database, Terminal, ShieldCheck, Upload, MoreVertical } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile overflow menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <header className="border-b border-neutral-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Right side in RTL (Branding & Connection Status) */}
        <div className="flex items-center gap-3 sm:gap-4" dir="rtl">
          {/* Logo badge (MD3 Medium container) */}
          <div className="w-9.5 h-9.5 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs select-none shrink-0">
            DS
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight leading-none">
                DocuSheet API
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200/80 select-none">
                v3.1.0 Ready
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 font-normal mt-0.5 hidden xs:block">
              زیرساخت متادیتای مستند و اتصال به گوگل‌شیت
            </p>
          </div>

          {/* Connection Status Badge with Ping Animation */}
          <div className="hidden md:flex items-center gap-2 border-r border-neutral-200/80 pr-3.5 mr-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-neutral-700">
              {isLive ? `برگه «${config?.sheetName || 'temp'}»` : 'حالت لوکال (Seed)'}
            </span>
            <span className="text-[11px] font-mono font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-lg border border-neutral-200/80">
              {totalRecords.toLocaleString('fa-IR')} اثر
            </span>
          </div>
        </div>

        {/* Left side in RTL (Action Buttons with MD3 Visual Hierarchy) */}
        <div className="flex items-center gap-1.5 sm:gap-2" dir="rtl">
          {/* 1. MD3 Text Button: اعتبارسنجی اسکیما */}
          <button
            onClick={onOpenValidator}
            className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-150 border border-transparent select-none active:scale-98"
            title="اعتبارسنجی اسکیما و قواعد شیت"
          >
            <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>اعتبارسنجی اسکیما</span>
          </button>

          {/* 2. MD3 Text Button: API Docs & cURL */}
          <button
            onClick={onOpenApiExplorer}
            className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-all duration-150 border border-transparent select-none active:scale-98"
            title="مستندات تعاملی API و کدهای cURL"
          >
            <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
            <span>API Docs & cURL</span>
          </button>

          {/* 3. MD3 Tonal Button: بارگذاری JSON */}
          <button
            onClick={onOpenUploader}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200/80 rounded-xl transition-all duration-150 shadow-2xs select-none active:scale-98"
            title="بارگذاری فایل JSON شناسنامه مستند و ارسال به گوگل‌شیت"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-700 shrink-0" />
            <span className="hidden xs:inline">بارگذاری JSON</span>
            <span className="xs:hidden">JSON</span>
          </button>

          {/* 4. MD3 Outlined Button: اتصال شیت */}
          <button
            onClick={onOpenSheetModal}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-neutral-800 bg-white hover:bg-neutral-50 rounded-xl border border-neutral-200 hover:border-neutral-300 transition-all duration-150 shadow-2xs select-none active:scale-98"
            title="تنظیمات اتصال به گوگل‌شیت"
          >
            <Database className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
            <span>اتصال شیت</span>
          </button>

          {/* 5. MD3 Filled Button (High-Emphasis): همگام‌سازی */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 rounded-xl shadow-xs transition-all duration-150 select-none active:scale-95"
            title="همگام‌سازی فوری با وب‌سرویس گوگل شیت"
          >
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'در حال سینک...' : 'همگام‌سازی'}</span>
          </button>

          {/* Responsive Overflow Menu Button (Visible on screens < lg where buttons are hidden) */}
          <div className="relative lg:hidden" ref={menuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80 transition-colors active:scale-95"
              title="سایر گزینه‌ها"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {mobileMenuOpen && (
              <div
                className="absolute left-0 mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-neutral-200/90 py-1.5 z-50 animate-in fade-in duration-100"
                dir="rtl"
              >
                <button
                  onClick={() => {
                    onOpenValidator();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>اعتبارسنجی اسکیما</span>
                </button>
                <button
                  onClick={() => {
                    onOpenApiExplorer();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full sm:hidden text-right px-3.5 py-2.5 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2.5 transition-colors font-medium border-t border-neutral-100 cursor-pointer"
                >
                  <Terminal className="w-4 h-4 text-neutral-500 shrink-0" />
                  <span>API Docs & cURL</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

