'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary, LoanRecord } from '@/context/LibraryContext';

export default function DashboardPage() {
  const { books, loans, showToast } = useLibrary();
  const [filterType, setFilterType] = useState<'all' | 'overdue' | 'restocked'>('all');
  const [activePage, setActivePage] = useState(1);

  // Derived metrics
  const totalVolumesCount = 14820 + books.length - 8;
  const inCirculationCount = loans.filter(l => l.status === 'ISSUED' || l.status === 'OVERDUE').length + 1244;
  const onShelvesCount = totalVolumesCount - inCirculationCount;
  const overdueCount = loans.filter(l => l.status === 'OVERDUE').length;

  // Filtered loans for ledger table
  const displayedLoans = loans.filter(l => {
    if (filterType === 'all') return true;
    if (filterType === 'overdue') return l.status === 'OVERDUE';
    if (filterType === 'restocked') return l.status === 'RETURNED';
    return true;
  });

  const handleSummonMessenger = (scholarName: string, bookTitle: string) => {
    showToast(`Summons dispatched by beadle to ${scholarName} for "${bookTitle}".`, 'mark_email_read');
  };

  const handleSealSanction = (scholarName: string) => {
    showToast(`Archival sanction & fine of ₹600 recorded for ${scholarName}.`, 'gavel', 'warning');
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Header Banner Area */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md overflow-hidden border border-secondary/20">
          {/* Archival Watermark / Seal Accent in BG */}
          <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none select-none text-primary">
            <svg fill="currentColor" height="280" viewBox="0 0 100 100" width="280">
              <circle cx="50" cy="50" fill="none" r="46" stroke="currentColor" strokeDasharray="3 2" strokeWidth="2" />
              <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="1.5" />
              <path d="M50 15 L53 38 L76 38 L57 52 L64 75 L50 61 L36 75 L43 52 L24 38 L47 38 Z" fill="currentColor" />
              <text fontFamily="serif" fontSize="6" letterSpacing="2" textAnchor="middle" x="50" y="88">
                LORE &amp; LEDGER • EST 1888
              </text>
            </svg>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex items-center gap-space-sm mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-primary text-secondary-fixed font-stamp-label text-stamp-label tracking-widest shadow-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />
                  ACTIVE REGISTER
                </span>
                <span className="font-code-ledger text-code-ledger text-secondary">
                  FOLIO NO. CCXCVIII-1888
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                The Great Ledger of Volumes &amp; Circulation
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                Bodleian Quadrangle &amp; Special Collections — Current Academic Register for Michaelmas Term
              </p>
            </div>

            {/* Quick Desk Seal / Timestamp */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md shrink-0 bg-surface-container rounded-lg p-space-md shadow-sm border border-secondary/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0 shadow-inner">
                  <span className="material-symbols-outlined text-[24px]">history_edu</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-wider">
                    Registry Session
                  </span>
                  <span className="font-code-ledger text-code-ledger text-on-surface font-semibold">
                    24th October • Evening Watch
                  </span>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-secondary/20" />
              <div className="flex flex-col">
                <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-wider">
                  Custodian in Charge
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                  <span className="font-body-md text-body-md text-primary font-semibold">
                    Archivist Eleanor Vance
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Archival Metric Cards (Simulated Oak Card Catalogue Drawers with Brass Pulls) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-space-md">
          {/* Metric Card 1 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/40 group-hover:bg-secondary transition-colors" />
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-secondary">
                DRAWER 01 • CUSTODY
              </span>
              <span className="material-symbols-outlined text-[18px]">shelves</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-primary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                {totalVolumesCount.toLocaleString()}
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                Total Volumes
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-primary-container font-medium">
                +{books.length} in register
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>

          {/* Metric Card 2 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary group-hover:bg-primary-container transition-colors" />
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-secondary">
                DRAWER 02 • LOANS
              </span>
              <span className="material-symbols-outlined text-[18px]">outbox</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-primary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                {inCirculationCount.toLocaleString()}
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                In Active Circulation
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-secondary font-medium">
                8.4% of total collection
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>

          {/* Metric Card 3 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/40 group-hover:bg-secondary transition-colors" />
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-secondary">
                DRAWER 03 • SHELVES
              </span>
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-primary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                {onShelvesCount.toLocaleString()}
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                Present on Stacks
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-primary-fixed-variant font-medium">
                Stack availability 91.6%
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>

          {/* Metric Card 4 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-tertiary group-hover:bg-tertiary-container transition-colors" />
            <div className="flex items-center justify-between text-tertiary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-tertiary">
                DRAWER 04 • DEMANDS
              </span>
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-tertiary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                {overdueCount}
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                Overdue &amp; Sanctions
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-tertiary font-medium">
                Beadle summons out
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>

          {/* Metric Card 5 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary/40 group-hover:bg-secondary transition-colors" />
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-secondary">
                DRAWER 05 • SCHOLARS
              </span>
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-primary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                842
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                Fellows &amp; Readers
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-on-surface-variant font-medium">
                41 Visiting Fellows
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>

          {/* Metric Card 6 */}
          <div className="group relative bg-surface-container-low rounded-lg p-space-md shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden border border-secondary/20">
            <div className="absolute top-0 left-0 right-0 h-1 bg-secondary-container group-hover:bg-secondary transition-colors" />
            <div className="flex items-center justify-between text-secondary mb-2">
              <span className="font-stamp-label text-[10px] uppercase tracking-widest text-secondary">
                DRAWER 06 • TREASURY
              </span>
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </div>
            <div className="flex flex-col my-1">
              <span className="font-display-lg text-display-lg text-secondary tracking-tight leading-none group-hover:scale-[1.02] origin-left transition-transform">
                ₹14,350
              </span>
              <span className="font-headline-sm text-body-sm text-on-surface font-medium mt-1">
                Archival Fines Fund
              </span>
            </div>
            <div className="mt-3 pt-2 bg-surface-container/60 rounded px-2 py-1 flex items-center justify-between">
              <span className="font-code-ledger text-[11px] text-secondary font-medium">
                ₹50/day standard tariff
              </span>
              <span className="w-6 h-1.5 rounded-full bg-secondary/50 shadow-inner" />
            </div>
          </div>
        </div>

        {/* Primary Archival Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Left Column: The Circulation Ledger Table & Rhythm (7 cols = ~60%) */}
          <div className="lg:col-span-7 flex flex-col gap-space-md">
            {/* Ledger Card Wrapper */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-secondary/20">
              {/* Ledger Headings and Interactive Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-secondary/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">book</span>
                    <h2 className="font-headline-md text-headline-md text-primary">
                      Circulation Activity &amp; Movements
                    </h2>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                    Recorded hand ledger entries for the current operational shift
                  </p>
                </div>

                {/* Interactive Filter Tabs */}
                <div className="inline-flex p-1 bg-surface-container rounded-lg shadow-inner self-start sm:self-auto">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded font-code-ledger text-[12px] transition-all cursor-pointer ${
                      filterType === 'all'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    All Dispatches
                  </button>
                  <button
                    onClick={() => setFilterType('overdue')}
                    className={`px-3 py-1 rounded font-code-ledger text-[12px] transition-all cursor-pointer ${
                      filterType === 'overdue'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Overdue
                  </button>
                  <button
                    onClick={() => setFilterType('restocked')}
                    className={`px-3 py-1 rounded font-code-ledger text-[12px] transition-all cursor-pointer ${
                      filterType === 'restocked'
                        ? 'bg-primary text-surface-bright shadow-sm'
                        : 'text-on-surface hover:text-primary'
                    }`}
                  >
                    Restocked
                  </button>
                </div>
              </div>

              {/* Ledger Table with Hand-ruled Vintage Lines */}
              <div className="w-full overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner border border-secondary/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[11px] uppercase tracking-wider border-b border-secondary/20">
                      <th className="py-3 px-3">Ref &amp; Call No.</th>
                      <th className="py-3 px-3">Volume Title &amp; Author</th>
                      <th className="py-3 px-3">Scholar &amp; College</th>
                      <th className="py-3 px-3 text-center">Status Stamp</th>
                      <th className="py-3 px-3 text-right">Custodian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/15 font-body-sm text-body-sm">
                    {displayedLoans.map(loan => (
                      <tr
                        key={loan.ref}
                        className="hover:bg-surface-container-low transition-colors"
                      >
                        <td className="py-3 px-3 align-top">
                          <div className="font-code-ledger text-code-ledger text-primary font-bold">
                            {loan.ref}
                          </div>
                          <div className="font-code-ledger text-[11px] text-secondary tracking-wide">
                            {loan.bookCallNo}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top max-w-xs">
                          <div className="font-headline-sm text-body-md text-primary font-semibold leading-snug">
                            {loan.bookTitle}
                          </div>
                          <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                            {loan.bookAuthor}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="text-on-surface font-medium">{loan.scholarName}</div>
                          <div className="font-stamp-label text-[10px] text-secondary">
                            {loan.scholarId} • {loan.wing || 'NORTH WING'}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top text-center">
                          {loan.status === 'ISSUED' && (
                            <span className="stamp-badge-issued text-[10px]">
                              DISPATCHED
                            </span>
                          )}
                          {loan.status === 'OVERDUE' && (
                            <span className="stamp-badge-overdue text-[10px]">
                              OVERDUE • {loan.daysLate || 5}D
                            </span>
                          )}
                          {loan.status === 'RETURNED' && (
                            <span className="stamp-badge-returned text-[10px]">
                              RESTOCKED
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 align-top text-right font-code-ledger text-[11px] text-on-surface-variant">
                          E. Vance
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ledger Footer Summary */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-xs font-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">
                    ink_highlighter
                  </span>
                  <span>
                    Displaying {displayedLoans.length} active movements for Michaelmas term
                  </span>
                </div>
                <div className="flex items-center gap-1 font-code-ledger text-code-ledger">
                  <button
                    disabled={activePage === 1}
                    onClick={() => setActivePage(p => Math.max(1, p - 1))}
                    className="px-2 py-1 rounded hover:bg-surface-container text-on-surface cursor-pointer disabled:opacity-40"
                  >
                    ← Prev Folio
                  </button>
                  <span className="px-2 py-1 bg-surface-container rounded text-primary font-bold">
                    {activePage}
                  </span>
                  <button
                    onClick={() => setActivePage(p => p + 1)}
                    className="px-2 py-1 rounded hover:bg-surface-container text-on-surface cursor-pointer"
                  >
                    Next Folio →
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Circulation Activity Chart */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm border border-secondary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    Fortnightly Loan Rhythm
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Comparative register of volumes dispatched vs. returned over 14 days
                  </p>
                </div>
                <div className="flex items-center gap-space-md font-stamp-label text-[11px]">
                  <span className="flex items-center gap-1.5 text-primary">
                    <span className="w-3 h-3 rounded-xs bg-primary" /> Volumes Lent
                  </span>
                  <span className="flex items-center gap-1.5 text-secondary">
                    <span className="w-3 h-3 rounded-xs bg-secondary" /> Returns Processed
                  </span>
                </div>
              </div>

              {/* Inline SVG Chart */}
              <div className="w-full pt-4">
                <svg className="w-full h-40 overflow-visible text-secondary" viewBox="0 0 700 160">
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.15" x1="40" x2="680" y1="20" y2="20" />
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.15" x1="40" x2="680" y1="60" y2="60" />
                  <line stroke="currentColor" strokeDasharray="4 4" strokeOpacity="0.15" x1="40" x2="680" y1="100" y2="100" />
                  <line stroke="currentColor" strokeOpacity="0.3" x1="40" x2="680" y1="140" y2="140" />

                  <text fill="currentColor" fontFamily="'Courier Prime', monospace" fontSize="10" opacity="0.7" textAnchor="end" x="32" y="24">150</text>
                  <text fill="currentColor" fontFamily="'Courier Prime', monospace" fontSize="10" opacity="0.7" textAnchor="end" x="32" y="64">100</text>
                  <text fill="currentColor" fontFamily="'Courier Prime', monospace" fontSize="10" opacity="0.7" textAnchor="end" x="32" y="104">50</text>
                  <text fill="currentColor" fontFamily="'Courier Prime', monospace" fontSize="10" opacity="0.7" textAnchor="end" x="32" y="144">0</text>

                  {/* Dispatched Curve */}
                  <path
                    d="M 60,110 C 120,90 160,130 220,65 C 280,30 330,80 390,45 C 450,25 500,70 560,35 C 610,15 650,50 670,40"
                    fill="none"
                    stroke="#042217"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                  />
                  {/* Returned Curve */}
                  <path
                    d="M 60,125 C 120,115 160,95 220,85 C 280,75 330,60 390,70 C 450,55 500,50 560,65 C 610,45 650,35 670,55"
                    fill="none"
                    stroke="#775a19"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />

                  <circle cx="670" cy="40" fill="#042217" r="4" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="670" cy="55" fill="#775a19" r="4" stroke="#ffffff" strokeWidth="1.5" />

                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="60" y="156">Mon</text>
                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="160" y="156">Wed</text>
                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="260" y="156">Fri</text>
                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="360" y="156">Sun</text>
                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="460" y="156">Tue</text>
                  <text fill="#251911" fontFamily="'Literata', serif" fontSize="10" textAnchor="middle" x="560" y="156">Thu</text>
                  <text fill="#042217" fontFamily="'Literata', serif" fontSize="10" fontWeight="600" textAnchor="middle" x="660" y="156">Today</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: Urgent Recalls, Rare Vault & Quill Actions (5 cols = ~40%) */}
          <div className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Urgent Recalls & Notice Ledger */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border-t-4 border-tertiary border-x border-b border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">
                    notification_important
                  </span>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-primary">Urgent Recalls</h2>
                    <p className="font-body-sm text-[12px] text-tertiary font-medium">
                      Summons Required • Fine Tier II Applied
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded font-stamp-label text-[10px] bg-tertiary-container text-on-tertiary tracking-widest uppercase">
                  {loans.filter(l => l.status === 'OVERDUE').length} ACTIVE
                </span>
              </div>

              <div className="flex flex-col gap-space-sm">
                {/* Recall Item 1 */}
                <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col gap-2 relative overflow-hidden group border border-secondary/15">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-headline-sm text-primary font-bold shrink-0 border border-secondary/40">
                        BC
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-body-md text-primary font-semibold">
                          Bartholomew Croft
                        </span>
                        <span className="font-code-ledger text-[11px] text-secondary">
                          Oriel College • Matriculation 1885
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-code-ledger text-code-ledger text-tertiary font-bold">
                        ₹600
                      </span>
                      <span className="block font-stamp-label text-[9px] text-tertiary uppercase">
                        12 Days Past Due
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-surface-container rounded text-[12px]">
                    <span className="font-bold text-primary">Vol:</span> The Anatomy of Melancholy [PR-4581-V1]
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleSummonMessenger('Bartholomew Croft', 'The Anatomy of Melancholy')}
                      className="px-2.5 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-[11px] font-code-ledger border border-secondary/20 cursor-pointer"
                    >
                      Summon Messenger
                    </button>
                    <button
                      onClick={() => handleSealSanction('Bartholomew Croft')}
                      className="px-2.5 py-1 bg-tertiary text-surface-bright hover:bg-tertiary-container rounded text-[11px] font-code-ledger font-semibold shadow-xs cursor-pointer"
                    >
                      Seal Sanction
                    </button>
                  </div>
                </div>

                {/* Recall Item 2 */}
                <div className="bg-surface-container-lowest rounded-lg p-space-md shadow-sm flex flex-col gap-2 relative overflow-hidden group border border-secondary/15">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center font-headline-sm text-primary font-bold shrink-0 border border-secondary/40">
                        AP
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-sm text-body-md text-primary font-semibold">
                          Arthur Pendelton, MD
                        </span>
                        <span className="font-code-ledger text-[11px] text-secondary">
                          Christ Church • SCH-2019-014
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-code-ledger text-code-ledger text-tertiary font-bold">
                        ₹250
                      </span>
                      <span className="block font-stamp-label text-[9px] text-tertiary uppercase">
                        5 Days Past Due
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-surface-container rounded text-[12px]">
                    <span className="font-bold text-primary">Vol:</span> Flora &amp; Sylva of the Levant [BOT-FOL-581]
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleSummonMessenger('Arthur Pendelton, MD', 'Flora & Sylva')}
                      className="px-2.5 py-1 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-[11px] font-code-ledger border border-secondary/20 cursor-pointer"
                    >
                      Summon Messenger
                    </button>
                    <Link
                      href="/return-book"
                      className="px-2.5 py-1 bg-primary text-secondary-fixed hover:bg-primary-container rounded text-[11px] font-code-ledger font-semibold shadow-xs"
                    >
                      Inspect &amp; Settle
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Special Collections Vault */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-secondary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    shield
                  </span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      Special Collections Vault
                    </h3>
                    <p className="font-body-sm text-[12px] text-on-surface-variant">
                      Chaperoned Reading Room Restricted Access
                    </p>
                  </div>
                </div>
                <span className="font-code-ledger text-[11px] text-primary font-bold px-2 py-0.5 rounded bg-primary-fixed">
                  SECURE
                </span>
              </div>

              <div className="divide-y divide-secondary/15 bg-surface-container-lowest rounded-lg border border-secondary/15 p-2">
                <div className="py-2 px-2 flex justify-between items-center">
                  <div>
                    <div className="font-headline-sm text-[14px] font-semibold text-primary">
                      Chaucer: The Canterbury Tales (Caxton, 1478)
                    </div>
                    <div className="font-code-ledger text-[11px] text-on-surface-variant">
                      Vault I, Enclosed Safe • Heavy Vellum
                    </div>
                  </div>
                  <span className="stamp-badge-issued text-[9px]">IN VAULT</span>
                </div>
                <div className="py-2 px-2 flex justify-between items-center">
                  <div>
                    <div className="font-headline-sm text-[14px] font-semibold text-primary">
                      Elias Ashmole: Theatrum Chemicum (1652)
                    </div>
                    <div className="font-code-ledger text-[11px] text-on-surface-variant">
                      Vault I, Shelf 3 • Alchemical Engravings
                    </div>
                  </div>
                  <span className="font-stamp-label text-[9px] px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                    RESERVED
                  </span>
                </div>
              </div>
            </div>

            {/* Quill Rapid Operations */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-secondary/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  edit_note
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Quill Rapid Operations
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <Link
                  href="/issue-book"
                  className="flex flex-col items-center justify-center text-center p-3 bg-primary text-secondary-fixed rounded-lg border border-secondary shadow-sm hover:bg-primary-container transition-all group"
                >
                  <span className="material-symbols-outlined text-[24px] mb-1 group-hover:scale-110 transition-transform">
                    outbox
                  </span>
                  <span className="font-stamp-label text-[11px] uppercase tracking-wider">
                    Record Dispatched Loan
                  </span>
                </Link>

                <Link
                  href="/return-book"
                  className="flex flex-col items-center justify-center text-center p-3 bg-surface-container-high text-on-surface rounded-lg border border-secondary/30 shadow-sm hover:bg-surface-container transition-all group"
                >
                  <span className="material-symbols-outlined text-[24px] text-secondary mb-1 group-hover:scale-110 transition-transform">
                    move_to_inbox
                  </span>
                  <span className="font-stamp-label text-[11px] uppercase tracking-wider">
                    Accept Shelving Return
                  </span>
                </Link>

                <Link
                  href="/students"
                  className="flex flex-col items-center justify-center text-center p-3 bg-surface-container-high text-on-surface rounded-lg border border-secondary/30 shadow-sm hover:bg-surface-container transition-all group"
                >
                  <span className="material-symbols-outlined text-[24px] text-secondary mb-1 group-hover:scale-110 transition-transform">
                    person_add
                  </span>
                  <span className="font-stamp-label text-[11px] uppercase tracking-wider">
                    Matriculate Reader
                  </span>
                </Link>

                <Link
                  href="/reports"
                  className="flex flex-col items-center justify-center text-center p-3 bg-surface-container-high text-on-surface rounded-lg border border-secondary/30 shadow-sm hover:bg-surface-container transition-all group"
                >
                  <span className="material-symbols-outlined text-[24px] text-secondary mb-1 group-hover:scale-110 transition-transform">
                    menu_book
                  </span>
                  <span className="font-stamp-label text-[11px] uppercase tracking-wider">
                    Stack Conservation Log
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
