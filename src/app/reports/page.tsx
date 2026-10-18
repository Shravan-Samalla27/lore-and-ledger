'use client';

import React from 'react';
import { useLibrary } from '@/context/LibraryContext';

export default function ReportsPage() {
  const { loans, books, showToast } = useLibrary();

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Ref,Title,CallNo,Scholar,Status,DueDate,Fine']
        .concat(
          loans.map(
            l =>
              `"${l.ref}","${l.bookTitle}","${l.bookCallNo}","${l.scholarName}","${l.status}","${l.dueDate}","₹${l.baseFine}"`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Lore_and_Ledger_Folio_Register_1888.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Circulation folio ledger exported to parchment CSV.', 'download');
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                  Archival Audit Desk
                </span>
                <span className="font-code-ledger text-[11px] text-on-surface-variant">
                  Michaelmas 1888 Term Digest
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Reports &amp; Stack Conservation Audits
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                Summary registers of circulation movements, stack density, and fine revenues.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-space-md py-2 bg-primary text-secondary-fixed rounded-lg font-code-ledger text-[12px] font-bold shadow hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer border border-secondary"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Folio Register (CSV)
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase">
              Circulation Volume Index
            </span>
            <div className="font-display-lg text-primary text-[32px] font-bold mt-1">
              98.2%
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Exemplar return integrity across colleges
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase">
              Treasury Fines Accrued
            </span>
            <div className="font-display-lg text-secondary text-[32px] font-bold mt-1">
              ₹14,350
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Re-allocated to bookbinding and vellum repair
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase">
              Fragile Codexes In Custody
            </span>
            <div className="font-display-lg text-tertiary text-[32px] font-bold mt-1">
              412
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Stored under locked iron grille in Vault I &amp; II
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase">
              Bindery Interventions
            </span>
            <div className="font-display-lg text-primary text-[32px] font-bold mt-1">
              18 Folios
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Treated for damp foxing and worn leather spines
            </p>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                verified
              </span>
              <h2 className="font-headline-md text-headline-md text-primary">
                Folio Movements Audit Ledger
              </h2>
            </div>
            <span className="font-stamp-label text-[10px] text-secondary uppercase">
              Full Term Records
            </span>
          </div>

          <div className="w-full overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner border border-secondary/20">
            <table className="w-full text-left border-collapse font-body-sm text-[13px]">
              <thead>
                <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[10px] uppercase tracking-wider border-b border-secondary/20">
                  <th className="py-2.5 px-3">Loan Folio</th>
                  <th className="py-2.5 px-3">Volume Title</th>
                  <th className="py-2.5 px-3">Scholar</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Due / Return Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/15 font-code-ledger text-[12px]">
                {loans.map(loan => (
                  <tr key={loan.ref} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-bold text-secondary">{loan.ref}</td>
                    <td className="py-2.5 px-3 font-headline-sm text-body-sm text-primary font-semibold">
                      {loan.bookTitle}
                    </td>
                    <td className="py-2.5 px-3">{loan.scholarName}</td>
                    <td className="py-2.5 px-3 text-on-surface-variant">{loan.issueDate}</td>
                    <td className="py-2.5 px-3">
                      {loan.returnDate ? (
                        <span className="text-secondary">{loan.returnDate} (Ret)</span>
                      ) : (
                        <span className={loan.status === 'OVERDUE' ? 'text-tertiary font-bold' : ''}>
                          {loan.dueDate}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {loan.status === 'ISSUED' && (
                        <span className="stamp-badge-issued text-[9px]">ISSUED</span>
                      )}
                      {loan.status === 'OVERDUE' && (
                        <span className="stamp-badge-overdue text-[9px]">OVERDUE</span>
                      )}
                      {loan.status === 'RETURNED' && (
                        <span className="stamp-badge-returned text-[9px]">RETURNED</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {loan.baseFine > 0 ? (
                        <span className="text-tertiary">₹{loan.baseFine}</span>
                      ) : (
                        <span className="text-primary font-normal">Nil</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
