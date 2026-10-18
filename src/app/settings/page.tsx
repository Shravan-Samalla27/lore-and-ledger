'use client';

import React, { useState } from 'react';
import { useLibrary } from '@/context/LibraryContext';

export default function SettingsPage() {
  const { showToast } = useLibrary();

  const [termName, setTermName] = useState('Michaelmas Term 1888');
  const [dailyFineRate, setDailyFineRate] = useState(50);
  const [binderyFee, setBinderyFee] = useState(150);
  const [maxLoanDays, setMaxLoanDays] = useState(28);
  const [chaperoneRequired, setChaperoneRequired] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Library desk and archival statutes updated successfully.', 'check_circle');
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg max-w-4xl">
        {/* Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-secondary/20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                Desk Administration
              </span>
              <span className="font-code-ledger text-[11px] text-on-surface-variant">
                Custodial Governance
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Library Desk &amp; Term Settings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              Configure term sessions, fine rate tariffs, stack security rules, and bindery repairs.
            </p>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
          <div className="flex items-center gap-2 pb-space-sm border-b border-secondary/20">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              tune
            </span>
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Archival Circulation Statutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Active Archival Term Session
              </label>
              <input
                value={termName}
                onChange={e => setTermName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/30 font-body-sm text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Standard Per Diem Overdue Tariff (₹)
              </label>
              <input
                type="number"
                value={dailyFineRate}
                onChange={e => setDailyFineRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/30 font-code-ledger text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Bindery Repair Levy (₹)
              </label>
              <input
                type="number"
                value={binderyFee}
                onChange={e => setBinderyFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/30 font-code-ledger text-on-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Maximum Standard Loan Duration (Days)
              </label>
              <input
                type="number"
                value={maxLoanDays}
                onChange={e => setMaxLoanDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/30 font-code-ledger text-on-surface focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-secondary/20">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={chaperoneRequired}
                onChange={e => setChaperoneRequired(e.target.checked)}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <div className="font-headline-sm text-body-md text-primary font-semibold">
                  Mandatory Chaperone in Special Collections Vault
                </div>
                <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                  Readers must be accompanied by an Assistant Librarian when handling incunabula and manuscripts dated prior to 1700.
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-space-md border-t border-secondary/20">
            <button
              type="submit"
              className="px-space-xl py-2 bg-primary text-secondary-fixed rounded-lg border border-secondary font-body-sm font-semibold shadow hover:bg-primary-container transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              Save Custodial Statutes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
