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
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-neutral-200/80 text-xs text-neutral-500">
      <div>
        نمایش صفحه <span className="font-semibold text-neutral-800">{page}</span> از{' '}
        <span className="font-semibold text-neutral-800">{totalPages}</span> (مجموعاً{' '}
        <span className="font-semibold text-neutral-800">{total}</span> رکورد)
      </div>

      <div className="flex items-center space-x-1.5 space-x-reverse">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-neutral-200/80 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="صفحه قبل"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
          // Show first, last, current, and neighbours
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  p === page
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {p}
              </button>
            );
          }
          if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-neutral-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-neutral-200/80 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="صفحه بعد"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
