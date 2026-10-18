'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/context/LibraryContext';

interface HeaderProps {
  onOpenNewAcquisition?: () => void;
}

export default function Header({ onOpenNewAcquisition }: HeaderProps) {
  const router = useRouter();
  const { loans, books, searchQuery, setSearchQuery } = useLibrary();
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const overdueCount = loans.filter(l => l.status === 'OVERDUE').length;

  const filteredQuickBooks = searchQuery.trim()
    ? books.filter(
        b =>
          b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.callNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.dewey.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/books?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

  return (
    <header className="fixed top-0 left-72 right-0 h-20 bg-surface-container-low/95 backdrop-blur-md z-40 border-b border-secondary/20 shadow-[0_2px_10px_rgba(43,30,22,0.06)] flex items-center justify-between px-space-lg">
      {/* Search Input with quick live dropdown */}
      <div className="flex-1 max-w-xl pr-space-md relative">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
          <span className="material-symbols-outlined absolute left-3 text-secondary text-[20px] pointer-events-none">
            search
          </span>
          <input
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 250)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container rounded border border-secondary/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none font-body-sm text-body-sm text-on-surface placeholder:italic placeholder:text-on-surface-variant shadow-[inset_0_1px_3px_rgba(43,30,22,0.08)]"
            placeholder="Search archives by Dewey Decimal, Title, or Call Number..."
            type="search"
          />
        </form>

        {/* Live Search Quick Results Dropdown */}
        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute top-12 left-0 w-full bg-surface-container-lowest border border-secondary/40 rounded-lg shadow-xl overflow-hidden z-50">
            <div className="p-2 border-b border-secondary/15 bg-surface-container-low flex justify-between items-center">
              <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider">
                Matching Archive Volumes ({filteredQuickBooks.length})
              </span>
              <span className="font-code-ledger text-[10px] text-on-surface-variant">Press Enter for all</span>
            </div>
            {filteredQuickBooks.length > 0 ? (
              <div className="divide-y divide-secondary/10">
                {filteredQuickBooks.map(book => (
                  <div
                    key={book.callNo}
                    onMouseDown={() => {
                      router.push(`/books?highlight=${encodeURIComponent(book.callNo)}`);
                      setShowSearchDropdown(false);
                    }}
                    className="p-2.5 hover:bg-surface-container transition-colors cursor-pointer flex justify-between items-center"
                  >
                    <div>
                      <div className="font-headline-sm text-[15px] font-semibold text-primary">{book.title}</div>
                      <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                        {book.author} • <span className="font-code-ledger text-secondary">{book.callNo}</span>
                      </div>
                    </div>
                    <span className="font-code-ledger text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface border border-secondary/20">
                      {book.shelf}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center font-body-sm text-on-surface-variant italic">
                No matching folios found in current registers.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons & Archivist Profile */}
      <div className="flex items-center gap-space-md shrink-0">
        <div className="flex items-center gap-space-xs">
          <Link
            href="/issue-book"
            className="inline-flex items-center gap-1.5 px-space-md py-1.5 bg-primary text-surface-bright rounded border border-secondary/50 font-body-sm text-body-sm shadow hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary-fixed">
              arrow_upward
            </span>
            <span>Lend Book</span>
          </Link>

          <button
            type="button"
            onClick={onOpenNewAcquisition}
            className="inline-flex items-center gap-1.5 px-space-md py-1.5 bg-surface-container-high text-on-surface rounded border border-secondary/30 font-body-sm text-body-sm hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              add_circle
            </span>
            <span>New Acquisition</span>
          </button>

          <Link
            href="/return-book?filter=overdue"
            className="inline-flex items-center gap-1.5 px-space-sm py-1.5 bg-tertiary-container/20 text-tertiary rounded border border-tertiary/30 font-code-ledger text-[12px] hover:bg-tertiary-container/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-tertiary">
              warning
            </span>
            <span>Overdue Alerts ({overdueCount})</span>
          </Link>
        </div>

        <div className="h-8 w-px bg-secondary/20 mx-space-xs" />

        {/* Archivist Identity */}
        <div className="flex items-center gap-space-sm">
          <div className="text-right">
            <div className="font-headline-sm text-body-md font-semibold text-on-surface leading-tight">
              Archivist Eleanor Vance
            </div>
            <div className="font-stamp-label text-[10px] text-secondary tracking-wider uppercase">
              Grand Custodian of Volumes
            </div>
          </div>
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-secondary/60 shadow bg-secondary/20">
            <Image
              src="/images/archivist.png"
              alt="Archivist Eleanor Vance"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
