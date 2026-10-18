'use client';

import React from 'react';
import { useLibrary } from '@/context/LibraryContext';

export default function Toast() {
  const { toast, hideToast } = useLibrary();

  if (!toast.visible) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-0"
    >
      <div className="bg-primary text-surface-bright rounded-lg p-space-md border border-secondary shadow-2xl flex items-center gap-space-sm max-w-md">
        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 border border-secondary/40 text-secondary-fixed">
          <span className="material-symbols-outlined text-[20px]">
            {toast.icon || 'check_circle'}
          </span>
        </div>
        <div className="flex flex-col flex-1">
          <span className="font-stamp-label text-[10px] uppercase text-secondary-fixed tracking-widest">
            Archival Dispatch Notice
          </span>
          <span className="font-body-sm text-[13px] text-surface-bright leading-snug">
            {toast.message}
          </span>
        </div>
        <button
          onClick={hideToast}
          className="text-primary-fixed-dim hover:text-surface-bright p-1"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
}
