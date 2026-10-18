'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLibrary, LoanRecord } from '@/context/LibraryContext';
import QuittanceSlipModal from '@/components/QuittanceSlipModal';

export default function ReturnBookPage() {
  return (
    <Suspense fallback={<div className="p-8 font-code-ledger text-secondary">Loading Return Desk Register...</div>}>
      <ReturnBookContent />
    </Suspense>
  );
}

function ReturnBookContent() {
  const { loans, returnBook, showToast } = useLibrary();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');

  const [activeLoanRef, setActiveLoanRef] = useState<string>('LN-8492');
  const [filterMode, setFilterMode] = useState<'all' | 'overdue' | 'inspection'>(
    filterParam === 'overdue' ? 'overdue' : 'all'
  );
  const [scannerInput, setScannerInput] = useState<string>('');
  const [hasDamage, setHasDamage] = useState<boolean>(false);
  const [conditionNotes, setConditionNotes] = useState<string>('Spine intact, faint dust on fore-edge.');
  const [stampedOverlayVisible, setStampedOverlayVisible] = useState<boolean>(false);

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
    settlementAmount?: string;
  } | null>(null);

  const activeLoan = loans.find(l => l.ref === activeLoanRef) || loans[0];

  const filteredLoans = loans.filter(l => {
    if (filterMode === 'all') return true;
    if (filterMode === 'overdue') return l.status === 'OVERDUE';
    if (filterMode === 'inspection') return l.daysLate > 0 || l.ref === 'LN-8477';
    return true;
  });

  const baseFine = activeLoan ? activeLoan.baseFine : 0;
  const binderyFee = hasDamage ? 150 : 0;
  const totalSettlement = baseFine + binderyFee;

  const handleSimulateScan = () => {
    setScannerInput('LN-8477 (BOT-FOL-581)');
    setActiveLoanRef('LN-8477');
    setHasDamage(true);
    showToast('Barcode scanned: Flora & Sylva of the Levant [LN-8477]', 'barcode_scanner');
  };

  const handleExecuteReturn = () => {
    if (!activeLoan) return;

    returnBook(activeLoan.ref, conditionNotes, hasDamage);
    setStampedOverlayVisible(true);
  };

  const handleOpenSlip = () => {
    if (!activeLoan) return;
    setSlipData({
      loanRef: activeLoan.ref,
      title: activeLoan.bookTitle,
      callNo: activeLoan.bookCallNo,
      borrower: activeLoan.scholarName,
      scholarId: activeLoan.scholarId,
      date: '24 Oct 1888',
      dueDate: activeLoan.dueDate,
      type: 'RETURN',
      settlementAmount: totalSettlement > 0 ? `₹${totalSettlement}` : 'Nil'
    });
  };

  const handleNextLoan = () => {
    setStampedOverlayVisible(false);
    const unreturned = loans.filter(l => l.status !== 'RETURNED');
    if (unreturned.length > 0) {
      setActiveLoanRef(unreturned[0].ref);
    }
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner Area */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                  Circulation Desk • Inward Inks
                </span>
                <span className="font-code-ledger text-[11px] text-on-surface-variant">
                  Restocking Cart Alpha On Standby
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Return to the Shelves — Inward Circulation &amp; Restocking Desk
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                Inspect volume physical integrity, settle per diem late charges, and stamp restock release.
              </p>
            </div>

            {/* Quick barcode simulation button */}
            <button
              onClick={handleSimulateScan}
              className="inline-flex items-center gap-1.5 px-space-md py-2 bg-secondary text-surface-bright rounded-lg font-code-ledger text-[12px] font-bold shadow hover:bg-secondary-fixed-dim transition-all cursor-pointer border border-secondary-container"
            >
              <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              Simulate Barcode Scan
            </button>
          </div>
        </div>

        {/* Return Desk Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: Outstanding Loans Ledger (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
              {/* Header with Search and Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-secondary/20">
                <div className="relative flex-1 max-w-sm">
                  <span className="material-symbols-outlined absolute left-3 top-2 text-secondary text-[18px]">
                    qr_code_scanner
                  </span>
                  <input
                    value={scannerInput}
                    onChange={e => setScannerInput(e.target.value)}
                    placeholder="Scan Barcode or Call No..."
                    className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest rounded border border-secondary/30 font-code-ledger text-[12px] text-on-surface focus:outline-none"
                  />
                </div>

                <div className="inline-flex p-1 bg-surface-container rounded-lg shadow-inner">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-3 py-1 rounded font-code-ledger text-[11px] cursor-pointer transition-all ${
                      filterMode === 'all'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    All Active
                  </button>
                  <button
                    onClick={() => setFilterMode('overdue')}
                    className={`px-3 py-1 rounded font-code-ledger text-[11px] cursor-pointer transition-all ${
                      filterMode === 'overdue'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Overdue Only
                  </button>
                  <button
                    onClick={() => setFilterMode('inspection')}
                    className={`px-3 py-1 rounded font-code-ledger text-[11px] cursor-pointer transition-all ${
                      filterMode === 'inspection'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Flagged Damage
                  </button>
                </div>
              </div>

              {/* Loans Table */}
              <div className="w-full overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner border border-secondary/20">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[10px] uppercase tracking-wider border-b border-secondary/20">
                      <th className="py-2.5 px-3">Loan Ref</th>
                      <th className="py-2.5 px-3">Volume Title</th>
                      <th className="py-2.5 px-3">Borrower</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/15">
                    {filteredLoans.map(loan => {
                      const isSelected = loan.ref === activeLoanRef;
                      return (
                        <tr
                          key={loan.ref}
                          onClick={() => {
                            setActiveLoanRef(loan.ref);
                            setStampedOverlayVisible(false);
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-secondary/15 font-medium'
                              : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <td className="py-3 px-3 font-code-ledger text-secondary font-bold text-[12px]">
                            {loan.ref}
                            <div className="text-[10px] text-on-surface-variant font-normal">
                              {loan.bookCallNo}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            <div className="font-headline-sm text-[14px] text-primary font-semibold leading-tight">
                              {loan.bookTitle}
                            </div>
                            <div className="font-body-sm text-[11px] text-on-surface-variant italic">
                              {loan.bookAuthor}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-on-surface text-[12px]">{loan.scholarName}</div>
                            <div className="font-code-ledger text-[10px] text-secondary">
                              {loan.scholarId}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {loan.status === 'OVERDUE' && (
                              <span className="stamp-badge-overdue text-[9px]">
                                {loan.daysLate}D LATE
                              </span>
                            )}
                            {loan.status === 'ISSUED' && (
                              <span className="stamp-badge-issued text-[9px]">
                                ON TIME
                              </span>
                            )}
                            {loan.status === 'RETURNED' && (
                              <span className="stamp-badge-returned text-[9px]">
                                RESTOCKED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setActiveLoanRef(loan.ref);
                                setStampedOverlayVisible(false);
                              }}
                              className="px-2.5 py-1 bg-surface-container rounded text-on-surface hover:bg-surface-container-high text-[11px] font-code-ledger border border-secondary/20 cursor-pointer"
                            >
                              Inspect →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cart Alpha Dispatch Button */}
              <div className="flex items-center justify-between pt-2 border-t border-secondary/20 text-[12px]">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    shopping_cart
                  </span>
                  <span>Restocking Cart Alpha: 4 volumes staged for North Wing</span>
                </div>
                <button
                  onClick={() => showToast('Cart Alpha dispatched to stacks pages.', 'local_shipping')}
                  className="px-3 py-1 bg-primary text-secondary-fixed rounded font-code-ledger text-[11px] hover:bg-primary-container cursor-pointer font-bold"
                >
                  Dispatch Cart to Stacks
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Condition Inspection Dossier (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            <div className="bg-[#f4ead4] rounded-xl shadow-md p-space-lg border-2 border-secondary/50 flex flex-col gap-space-md relative overflow-hidden">
              {/* Stamped Overlay if already stamped */}
              {stampedOverlayVisible && (
                <div className="absolute inset-0 bg-[#fff8f5]/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-stamp">
                  <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary mb-3">
                    <span className="material-symbols-outlined text-[36px]">verified</span>
                  </div>
                  <div className="stamp-badge-returned text-[14px] py-1 px-4 mb-2">
                    RETURNED TO SHELVES
                  </div>
                  <div className="font-headline-sm text-primary font-bold text-[18px]">
                    Quittance Attested
                  </div>
                  <p className="font-body-sm text-[12px] text-on-surface-variant italic max-w-xs mt-1">
                    Volume {activeLoan?.bookCallNo} released from borrower {activeLoan?.scholarName}. Restock routing slip generated.
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={handleOpenSlip}
                      className="px-3 py-1.5 bg-primary text-secondary-fixed rounded text-[12px] font-code-ledger font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">receipt</span>
                      View Quittance Slip
                    </button>
                    <button
                      onClick={handleNextLoan}
                      className="px-3 py-1.5 bg-surface-container rounded text-on-surface text-[12px] font-code-ledger hover:bg-surface-container-high cursor-pointer"
                    >
                      Next Dossier
                    </button>
                  </div>
                </div>
              )}

              {/* Dossier Header */}
              <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
                <div>
                  <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-widest">
                    Inward Return Dossier
                  </span>
                  <div className="font-code-ledger text-[16px] font-bold text-primary">
                    {activeLoan?.ref || 'LN-8492'}
                  </div>
                </div>
                <span
                  className={
                    totalSettlement > 0
                      ? 'font-code-ledger text-[11px] font-bold text-tertiary bg-tertiary-container/20 px-2.5 py-0.5 rounded border border-tertiary/30'
                      : 'font-code-ledger text-[11px] font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded'
                  }
                >
                  {totalSettlement > 0 ? `₹${totalSettlement} Fine Due` : 'Nil Fine'}
                </span>
              </div>

              {/* Tome & Borrower Info */}
              {activeLoan && (
                <div className="space-y-2 bg-[#ede0c8] p-3 rounded-lg border border-secondary/20 font-body-sm text-[13px]">
                  <div>
                    <span className="text-secondary font-bold font-code-ledger uppercase text-[10px] block">
                      Folio Under Examination
                    </span>
                    <h3 className="font-headline-sm text-body-md text-primary font-bold">
                      {activeLoan.bookTitle}
                    </h3>
                    <div className="font-code-ledger text-[11px] text-on-surface-variant">
                      Call No: <strong>{activeLoan.bookCallNo}</strong> • Acc: {activeLoan.accession}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-secondary/20">
                    <span className="text-secondary font-bold font-code-ledger uppercase text-[10px] block">
                      Borrower Identity
                    </span>
                    <div className="font-semibold text-primary">{activeLoan.scholarName}</div>
                    <div className="font-code-ledger text-[11px] text-on-surface-variant">
                      {activeLoan.scholarId} • Deposit: {activeLoan.deposit}
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Condition Inspection Checklist */}
              <div className="space-y-2 font-body-sm text-[13px]">
                <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider block">
                  Curator Integrity Checklist
                </span>
                <div className="space-y-1.5 bg-surface-container-lowest p-3 rounded-lg border border-secondary/20 font-code-ledger text-[12px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-primary" />
                    <span>Collation complete (all leaves &amp; plates present)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-primary" />
                    <span>Spine cords and sewing structure intact</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-tertiary">
                    <input
                      type="checkbox"
                      checked={hasDamage}
                      onChange={e => setHasDamage(e.target.checked)}
                      className="accent-tertiary"
                    />
                    <span className="font-bold">Ink stains, dampfoxing, or broken headbands (+₹150)</span>
                  </label>
                </div>
              </div>

              {/* Financial Settlement Breakdown */}
              <div className="bg-surface-container-lowest p-3 rounded-lg border border-secondary/20 font-code-ledger text-[12px] space-y-1.5">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Base Overdue Tariff ({activeLoan?.daysLate || 0} days @ ₹50/day):</span>
                  <span>₹{baseFine}</span>
                </div>
                {hasDamage && (
                  <div className="flex justify-between text-tertiary font-bold">
                    <span>Conservator Bindery Repair Fee:</span>
                    <span>+₹150</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-secondary/20 font-bold text-[14px]">
                  <span className="text-primary">Total Settlement Due:</span>
                  <span className={totalSettlement > 0 ? 'text-tertiary' : 'text-primary'}>
                    ₹{totalSettlement}
                  </span>
                </div>
              </div>

              {/* Stamping Action */}
              <div className="pt-2">
                <button
                  onClick={handleExecuteReturn}
                  disabled={activeLoan?.status === 'RETURNED'}
                  className={`w-full py-3 rounded-lg font-headline-sm font-semibold tracking-wide flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                    activeLoan?.status === 'RETURNED'
                      ? 'bg-secondary/30 text-on-surface-variant cursor-not-allowed'
                      : 'bg-primary text-secondary-fixed hover:bg-primary-container border-2 border-secondary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">done_all</span>
                  <span>Affix Inward Return Stamp &amp; Settle</span>
                </button>
              </div>
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
