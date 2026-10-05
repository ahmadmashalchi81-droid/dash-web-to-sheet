import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { PaginationInfo } from '../types/documentary.ts';

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (newPage: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  pagination,
  onPageChange
}) => {
  const { page, totalPages, total, limit, hasPrevPage, hasNextPage } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-neutral-200/80 text-xs text-neutral-600 select-none">
      <div className="flex items-center">
        <span>نمایش صفحه</span>
        <span className="font-bold text-neutral-900 font-mono text-sm mx-1.5">{page}</span>
        <span>از</span>
        <span className="font-bold text-neutral-900 font-mono text-sm mx-1.5">{totalPages}</span>
        <span className="text-neutral-300 mx-2.5">|</span>
        <span>کل رکوردها:</span>
        <span className="font-bold text-neutral-900 font-mono text-sm mr-1.5">{total.toLocaleString('fa-IR')}</span>
      </div>

      <div className="flex items-center space-x-1.5 space-x-reverse">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="h-9 px-2.5 sm:px-3 rounded-xl border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-medium select-none active:scale-98"
          title="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">قبلی</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, current, and neighbours
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`h-9 w-9 rounded-xl text-xs font-semibold font-mono transition-all flex items-center justify-center select-none active:scale-95 ${
                  p === page
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {p}
              </button>
            );
          }
          if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-neutral-400 font-mono">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="h-9 px-2.5 sm:px-3 rounded-xl border border-neutral-200/80 text-neutral-700 hover:bg-neutral-100 disabled:opacity-35 disabled:hover:bg-transparent transition-colors flex items-center gap-1 font-medium select-none active:scale-98"
          title="صفحه بعد"
        >
          <span className="hidden sm:inline text-xs">بعدی</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
