'use client';

import React from 'react';

interface QuittanceSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    loanRef: string;
    title: string;
    callNo: string;
    borrower: string;
    scholarId: string;
    date: string;
    dueDate: string;
    type: 'DISPATCH' | 'RETURN';
    settlementAmount?: string;
    stampedBy?: string;
  } | null;
}

export default function QuittanceSlipModal({ isOpen, onClose, data }: QuittanceSlipModalProps) {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#fbf7ee] text-[#2b1e16] rounded-lg border-2 border-secondary/60 max-w-lg w-full p-8 shadow-2xl relative font-body-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary print:hidden"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Vintage Archival Slip Content */}
        <div className="border border-dashed border-[#775a19]/50 p-6 rounded bg-[#fff8f5]">
          <div className="text-center pb-4 border-b border-[#775a19]/30">
            <h2 className="font-headline-md text-headline-md text-primary font-bold">
              Lore &amp; Ledger Archives
            </h2>
            <div className="font-stamp-label text-[11px] text-secondary tracking-widest uppercase mt-0.5">
              Official Circulation Quittance Slip
            </div>
            <div className="font-code-ledger text-[11px] text-[#424844] mt-1">
              Folio Reference: <strong className="text-primary">{data.loanRef}</strong>
            </div>
          </div>

          <div className="py-4 space-y-3 font-code-ledger text-[13px]">
            <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
              <span className="text-[#775a19] uppercase">Operation:</span>
              <strong className={data.type === 'DISPATCH' ? 'text-primary' : 'text-[#775a19]'}>
                {data.type === 'DISPATCH' ? 'OUTWARD CIRCULATION LOAN' : 'INWARD RETURN RESTOCKED'}
              </strong>
            </div>

            <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
              <span className="text-[#775a19] uppercase">Volume Call No:</span>
              <strong className="text-primary">{data.callNo}</strong>
            </div>

            <div className="border-b border-dotted border-secondary/30 pb-1">
              <div className="text-[#775a19] uppercase text-[11px]">Volume Title:</div>
              <div className="font-headline-sm text-body-md text-primary font-semibold">
                {data.title}
              </div>
            </div>

            <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
              <span className="text-[#775a19] uppercase">Matriculated Reader:</span>
              <strong>{data.borrower}</strong>
            </div>

            <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
              <span className="text-[#775a19] uppercase">Reader Identifier:</span>
              <span>{data.scholarId}</span>
            </div>

            <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
              <span className="text-[#775a19] uppercase">Recorded Date:</span>
              <span>{data.date}</span>
            </div>

            {data.type === 'DISPATCH' && (
              <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1">
                <span className="text-[#775a19] uppercase">Mandatory Return Due:</span>
                <span className="text-tertiary font-bold">{data.dueDate}</span>
              </div>
            )}

            {data.settlementAmount && (
              <div className="flex justify-between border-b border-dotted border-secondary/30 pb-1 bg-surface-container-high/40 p-1 rounded">
                <span className="text-tertiary uppercase font-bold">Quittance Fine / Fee:</span>
                <strong className="text-tertiary">{data.settlementAmount}</strong>
              </div>
            )}
          </div>

          {/* Stamped Seal Section */}
          <div className="mt-4 pt-3 border-t border-[#775a19]/30 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-stamp-label text-[10px] text-[#775a19] uppercase">
                Attested Under Seal
              </span>
              <span className="font-body-sm text-[12px] italic text-[#424844]">
                Archivist Eleanor Vance
              </span>
            </div>
            <div className={data.type === 'DISPATCH' ? 'stamp-badge-issued' : 'stamp-badge-returned'}>
              {data.type === 'DISPATCH' ? 'BOOK ISSUED' : 'RETURNED TO SHELVES'}
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-container rounded text-on-surface hover:bg-surface-container-high transition-colors font-body-sm"
          >
            Close Slip
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-primary text-secondary-fixed rounded border border-secondary font-body-sm font-semibold flex items-center gap-1.5 shadow hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Parchment Slip
          </button>
        </div>
      </div>
    </div>
  );
}
