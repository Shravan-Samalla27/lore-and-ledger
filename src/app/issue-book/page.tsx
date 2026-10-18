'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLibrary, Scholar, Book } from '@/context/LibraryContext';
import QuittanceSlipModal from '@/components/QuittanceSlipModal';

export default function IssueBookPage() {
  return (
    <Suspense fallback={<div className="p-8 font-code-ledger text-secondary">Loading Issue Desk Registry...</div>}>
      <IssueBookContent />
    </Suspense>
  );
}

function IssueBookContent() {
  const { books, scholars, lendBook, sessionDispatches } = useLibrary();
  const searchParams = useSearchParams();
  const preselectedCallNo = searchParams.get('callNo');

  const [selectedScholarId, setSelectedScholarId] = useState<string>(scholars[0]?.id || '');
  const [selectedBookCallNo, setSelectedBookCallNo] = useState<string>(preselectedCallNo || books[0]?.callNo || '');
  const [loanPeriodDays, setLoanPeriodDays] = useState<number>(14);
  const [loanNotes, setLoanNotes] = useState<string>('Standard reading room dispatch; parchment binding verified intact.');
  const [isStamping, setIsStamping] = useState<boolean>(false);
  const [stampedSuccess, setStampedSuccess] = useState<boolean>(false);

  // Quittance slip modal state
  const [slipData, setSlipData] = useState<{
    loanRef: string;
    title: string;
    callNo: string;
    borrower: string;
    scholarId: string;
    date: string;
    dueDate: string;
    type: 'DISPATCH' | 'RETURN';
  } | null>(null);

  useEffect(() => {
    if (preselectedCallNo) {
      setSelectedBookCallNo(preselectedCallNo);
    }
  }, [preselectedCallNo]);

  const currentScholar = scholars.find(s => s.id === selectedScholarId) || scholars[0];
  const currentBook = books.find(b => b.callNo === selectedBookCallNo) || books[0];

  // Calculate dynamic due date
  const baseDate = new Date(1888, 9, 24); // 24 Oct 1888
  baseDate.setDate(baseDate.getDate() + loanPeriodDays);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const formattedDueDate = `${String(baseDate.getDate()).padStart(2, '0')} ${months[baseDate.getMonth()]} ${baseDate.getFullYear()}`;

  const handleIssueBook = () => {
    if (!currentScholar || !currentBook) return;

    if (currentBook.availableCopies <= 0) {
      alert(`Cannot dispatch: All exemplars of ${currentBook.title} are currently out.`);
      return;
    }

    setIsStamping(true);
    setTimeout(() => {
      const res = lendBook(currentScholar.id, currentBook.callNo, loanPeriodDays, loanNotes);
      setIsStamping(false);
      if (res.success && res.loanRef) {
        setStampedSuccess(true);
        setTimeout(() => setStampedSuccess(false), 3000);

        setSlipData({
          loanRef: res.loanRef,
          title: currentBook.title,
          callNo: currentBook.callNo,
          borrower: currentScholar.name,
          scholarId: currentScholar.id,
          date: '24 Oct 1888',
          dueDate: formattedDueDate,
          type: 'DISPATCH'
        });
      }
    }, 400);
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner Area */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-secondary/20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                Circulation Desk • Outward Dispatch
              </span>
              <span className="font-code-ledger text-[11px] text-on-surface-variant">
                Quill Register Active
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Lend a Volume — Circulation &amp; Loan Dispatch Desk
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              Charge volumes to matriculated scholars, certify folio condition, and affix dispatch seal.
            </p>
          </div>
        </div>

        {/* Dispatch Workspace (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Dispatch Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Step 1: Scholar Identification */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-secondary-fixed flex items-center justify-center font-code-ledger text-[12px] font-bold">
                    1
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    Scholar Card Verification
                  </h2>
                </div>
                <span className="font-stamp-label text-[10px] text-secondary uppercase">
                  Registry Identity Check
                </span>
              </div>

              <div>
                <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                  Select Matriculated Scholar
                </label>
                <select
                  value={selectedScholarId}
                  onChange={e => setSelectedScholarId(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-body-md text-on-surface focus:border-secondary focus:outline-none"
                >
                  {scholars.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.id}) — {s.college}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scholar Dossier Card */}
              {currentScholar && (
                <div className="bg-[#ede0c8] rounded-lg p-space-md border border-secondary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm font-code-ledger text-[12px]">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center font-headline-md text-primary font-bold border border-secondary/40">
                      {currentScholar.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-headline-sm text-body-md text-primary font-semibold">
                        {currentScholar.name}
                      </div>
                      <div className="text-secondary font-bold">{currentScholar.college}</div>
                      <div className="text-on-surface-variant text-[11px]">{currentScholar.faculty}</div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <span className="inline-block px-2 py-0.5 rounded bg-primary text-secondary-fixed text-[11px] font-bold">
                      {currentScholar.standing}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-1">
                      Loans: <strong>{currentScholar.activeLoansCount}</strong> / {currentScholar.maxLoans} limit
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Caution Deposit: {currentScholar.deposit}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Volume Selection */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-secondary-fixed flex items-center justify-center font-code-ledger text-[12px] font-bold">
                    2
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    Volume &amp; Tome Accession Selection
                  </h2>
                </div>
                <span className="font-stamp-label text-[10px] text-secondary uppercase">
                  Physical Stack Match
                </span>
              </div>

              <div>
                <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                  Volume Call Number or Title
                </label>
                <select
                  value={selectedBookCallNo}
                  onChange={e => setSelectedBookCallNo(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-body-md text-on-surface focus:border-secondary focus:outline-none"
                >
                  {books.map(b => (
                    <option key={b.callNo} value={b.callNo}>
                      [{b.callNo}] {b.title} — {b.shelf} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Volume Preview Box */}
              {currentBook && (
                <div className="bg-[#ede0c8] rounded-lg p-space-md border border-secondary/30 flex flex-col gap-2 font-code-ledger text-[12px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-secondary font-bold text-[14px]">
                        {currentBook.callNo}
                      </span>
                      <h3 className="font-headline-sm text-body-md text-primary font-bold">
                        {currentBook.title}
                      </h3>
                      <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                        {currentBook.author} • {currentBook.edition}
                      </div>
                    </div>
                    <span
                      className={
                        currentBook.availableCopies > 0
                          ? 'stamp-badge-issued text-[10px]'
                          : 'stamp-badge-overdue text-[10px]'
                      }
                    >
                      {currentBook.availableCopies > 0 ? 'AVAILABLE' : 'CIRCULATING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-secondary/20 text-[11px]">
                    <div>
                      <span className="text-secondary font-bold">Location:</span> {currentBook.shelf}
                    </div>
                    <div>
                      <span className="text-secondary font-bold">Wing:</span> {currentBook.wing}
                    </div>
                    <div>
                      <span className="text-secondary font-bold">Binding:</span> {currentBook.binding}
                    </div>
                    <div>
                      <span className="text-secondary font-bold">Conservation:</span> {currentBook.conservationRating}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Loan Terms & Seal Dispatch */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-secondary-fixed flex items-center justify-center font-code-ledger text-[12px] font-bold">
                    3
                  </span>
                  <h2 className="font-headline-sm text-headline-sm text-primary">
                    Circulation Period &amp; Attestation
                  </h2>
                </div>
                <span className="font-stamp-label text-[10px] text-secondary uppercase">
                  Michaelmas Mandate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div>
                  <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                    Select Loan Duration
                  </label>
                  <select
                    value={loanPeriodDays}
                    onChange={e => setLoanPeriodDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
                  >
                    <option value={7}>7 Days — Short Reading Room Loan</option>
                    <option value={14}>14 Days — Standard Collegiate Dispatch</option>
                    <option value={28}>28 Days — Research Fellow Dispensation</option>
                    <option value={90}>90 Days — Full Michaelmas Academic Term</option>
                  </select>
                </div>

                {/* Stamped Due Date Display */}
                <div className="bg-surface-container-lowest p-3 rounded-lg border-2 border-dashed border-secondary/50 flex flex-col items-center justify-center text-center">
                  <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider">
                    Official Due Stamp
                  </span>
                  <div className="font-code-ledger text-[20px] font-bold text-tertiary tracking-wide mt-1">
                    {formattedDueDate}
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant italic">
                    Return mandated prior to evening chime
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                  Archival Remarks / Condition at Dispatch
                </label>
                <input
                  value={loanNotes}
                  onChange={e => setLoanNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-body-sm text-on-surface focus:outline-none"
                />
              </div>

              {/* Big Rubber Stamping Dispatch Button */}
              <div className="pt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-md border-t border-secondary/20">
                <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                  Attestation will be recorded into the Master Folio immediately.
                </div>
                <button
                  type="button"
                  disabled={isStamping || (currentBook && currentBook.availableCopies <= 0)}
                  onClick={handleIssueBook}
                  className={`w-full sm:w-auto px-space-xl py-3 rounded-lg font-headline-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all duration-200 cursor-pointer ${
                    currentBook && currentBook.availableCopies <= 0
                      ? 'bg-secondary/40 text-on-surface-variant cursor-not-allowed'
                      : isStamping
                      ? 'bg-primary-container text-secondary-fixed scale-95'
                      : 'bg-primary text-secondary-fixed hover:bg-primary-container border-2 border-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[24px]">verified</span>
                  <span>{isStamping ? 'Stamping Register...' : 'Stamp & Dispatch Volume'}</span>
                </button>
              </div>

              {stampedSuccess && (
                <div className="p-3 bg-primary-fixed text-on-primary-fixed rounded-lg text-center font-code-ledger text-[13px] font-bold animate-stamp">
                  ✓ DISPATCH RECORDED &amp; SEAL AFFIXED TO FOLIO
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Session Dispatches Log (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
              <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    history
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Circulation Dispatches Stamped This Session
                  </h3>
                </div>
                <span className="font-stamp-label text-[10px] text-secondary uppercase">
                  {sessionDispatches.length} STAMPED
                </span>
              </div>

              <div className="flex flex-col gap-space-sm">
                {sessionDispatches.map(dispatch => (
                  <div
                    key={dispatch.loanRef}
                    className="bg-surface-container-lowest p-3 rounded-lg border border-secondary/20 flex flex-col gap-1 shadow-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-code-ledger text-secondary font-bold text-[12px]">
                        {dispatch.loanRef} • {dispatch.timestamp}
                      </div>
                      <span className="stamp-badge-issued text-[9px]">BOOK ISSUED</span>
                    </div>

                    <div className="font-headline-sm text-[14px] text-primary font-semibold leading-tight">
                      {dispatch.bookTitle}
                    </div>

                    <div className="font-code-ledger text-[11px] text-on-surface-variant">
                      Borrower: <strong>{dispatch.scholarName}</strong> ({dispatch.scholarId})
                    </div>

                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-secondary/15 font-code-ledger text-[11px]">
                      <span className="text-tertiary">
                        Due: <strong>{dispatch.dueDateStr}</strong>
                      </span>
                      <button
                        onClick={() =>
                          setSlipData({
                            loanRef: dispatch.loanRef,
                            title: dispatch.bookTitle,
                            callNo: dispatch.bookCallNo,
                            borrower: dispatch.scholarName,
                            scholarId: dispatch.scholarId,
                            date: '24 Oct 1888',
                            dueDate: dispatch.dueDateStr,
                            type: 'DISPATCH'
                          })
                        }
                        className="px-2 py-0.5 bg-surface-container hover:bg-surface-container-high rounded text-on-surface border border-secondary/20 cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">receipt</span>
                        Quittance Slip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Rules Banner */}
            <div className="bg-[#ede0c8] p-space-md rounded-xl border border-secondary/30 font-body-sm text-[12px] space-y-2">
              <div className="font-headline-sm text-primary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[18px]">gavel</span>
                Bodleian Circulation Statutes (1888)
              </div>
              <ul className="list-disc pl-4 text-on-surface/80 space-y-1">
                <li>Rare folios marked with gold call-number stamps must not depart Quadrangle precincts.</li>
                <li>Fines for delinquent return: ₹50 per diem for common volumes, ₹100 per diem for chained books.</li>
                <li>Quill marks or spilled ink on vellum incur immediate bindery repair levy of ₹150.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Quittance Slip Modal */}
      <QuittanceSlipModal
        isOpen={!!slipData}
        onClose={() => setSlipData(null)}
        data={slipData}
      />
    </div>
  );
}
