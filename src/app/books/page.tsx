'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLibrary, Book } from '@/context/LibraryContext';

export default function BooksCataloguePage() {
  return (
    <Suspense fallback={<div className="p-8 font-code-ledger text-secondary">Retrieving Scriptorium Registers...</div>}>
      <BooksCatalogueContent />
    </Suspense>
  );
}

function BooksCatalogueContent() {
  const { books, reserveBook, showToast } = useLibrary();
  const searchParams = useSearchParams();

  // Local filter states
  const initialSearch = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedWing, setSelectedWing] = useState('all');
  const [selectedBinding, setSelectedBinding] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Selected Tome for Examination Drawer Modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchSearch =
        !searchTerm.trim() ||
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.callNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.dewey.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = selectedClass === 'all' || b.category === selectedClass;
      const matchWing = selectedWing === 'all' || b.wing === selectedWing;
      const matchBinding = selectedBinding === 'all' || b.binding === selectedBinding;
      const matchStatus = selectedStatus === 'all' || b.status === selectedStatus;

      return matchSearch && matchClass && matchWing && matchBinding && matchStatus;
    });
  }, [books, searchTerm, selectedClass, selectedWing, selectedBinding, selectedStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedClass('all');
    setSelectedWing('all');
    setSelectedBinding('all');
    setSelectedStatus('all');
  };

  const handleQuickLend = (book: Book) => {
    if (book.availableCopies <= 0) {
      showToast(`All exemplars of ${book.callNo} are currently out on loan.`, 'error', 'warning');
      return;
    }
    // Navigate or link to issue desk with preselected callNo
    window.location.href = `/issue-book?callNo=${encodeURIComponent(book.callNo)}`;
  };

  const handleQuickReserve = (book: Book) => {
    reserveBook(book.callNo);
  };

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Scriptorium Header Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md overflow-hidden border border-secondary/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                  Bodleian Scriptorium
                </span>
                <span className="font-code-ledger text-[11px] text-on-surface-variant">
                  • 8 Divisions Catalogued
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg text-primary tracking-tight leading-none">
                The Scriptorium
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic mt-1">
                Master Card Catalogue &amp; Archival Folio Registers
              </p>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center bg-surface-container rounded-lg p-1 border border-secondary/30 shadow-inner">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-space-md py-1.5 rounded font-stamp-label text-stamp-label tracking-wider uppercase transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-primary text-surface-bright shadow-sm'
                      : 'text-on-surface hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_module</span>
                  Index Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-space-md py-1.5 rounded font-stamp-label text-stamp-label tracking-wider uppercase transition-all cursor-pointer ${
                    viewMode === 'table'
                      ? 'bg-primary text-surface-bright shadow-sm'
                      : 'text-on-surface hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">table_rows</span>
                  Ledger Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-secondary/20 flex flex-col gap-space-md">
          {/* Main search and quick reset */}
          <div className="flex flex-col md:flex-row gap-space-sm items-stretch md:items-center justify-between">
            <div className="relative flex-1 max-w-xl">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-secondary text-[20px]">
                search
              </span>
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by Title, Scribe, Call No, or Dewey..."
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded border border-secondary/30 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none font-body-sm text-on-surface"
              />
            </div>

            <div className="flex items-center gap-space-sm">
              <span className="font-code-ledger text-[12px] text-secondary font-bold">
                {filteredBooks.length} Folios Recorded
              </span>
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container rounded font-body-sm text-[12px] transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Granular Classification Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-xs border-t border-secondary/15">
            <div>
              <label className="block font-stamp-label text-[10px] text-secondary uppercase mb-1">
                Classification
              </label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container rounded border border-secondary/30 font-body-sm text-[13px] text-on-surface focus:outline-none"
              >
                <option value="all">All Classifications</option>
                <option value="Alchemy & Medicine">Alchemy &amp; Medicine</option>
                <option value="Mathematics & Natural Philosophy">Mathematics &amp; Philosophy</option>
                <option value="History & Cartography">History &amp; Cartography</option>
                <option value="Botany & Herbal">Botany &amp; Herbal</option>
                <option value="Jurisprudence">Jurisprudence</option>
              </select>
            </div>

            <div>
              <label className="block font-stamp-label text-[10px] text-secondary uppercase mb-1">
                Wing Location
              </label>
              <select
                value={selectedWing}
                onChange={e => setSelectedWing(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container rounded border border-secondary/30 font-body-sm text-[13px] text-on-surface focus:outline-none"
              >
                <option value="all">All Library Wings</option>
                <option value="North Gallery">North Gallery</option>
                <option value="West Wing">West Wing</option>
                <option value="Special Collections Vault">Special Collections Vault</option>
                <option value="South Cloisters">South Cloisters</option>
              </select>
            </div>

            <div>
              <label className="block font-stamp-label text-[10px] text-secondary uppercase mb-1">
                Binding Material
              </label>
              <select
                value={selectedBinding}
                onChange={e => setSelectedBinding(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container rounded border border-secondary/30 font-body-sm text-[13px] text-on-surface focus:outline-none"
              >
                <option value="all">All Bindings</option>
                <option value="Parchment">Parchment</option>
                <option value="Calfskin">Calfskin</option>
                <option value="Morocco Leather">Morocco Leather</option>
                <option value="Vellum">Vellum</option>
                <option value="Velvet Cloth">Velvet Cloth</option>
              </select>
            </div>

            <div>
              <label className="block font-stamp-label text-[10px] text-secondary uppercase mb-1">
                Circulation Status
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container rounded border border-secondary/30 font-body-sm text-[13px] text-on-surface focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="AVAILABLE">Available on Stacks</option>
                <option value="CIRCULATING">Out on Loan</option>
                <option value="RESERVED">Reserved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Catalog Layout (Main Content + Side Panel) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
          {/* Main List / Grid View (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-space-md">
            {viewMode === 'cards' ? (
              /* Archival Index Card Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {filteredBooks.map(book => (
                  <div
                    key={book.callNo}
                    className="group relative bg-[#f4ead4] rounded-lg p-space-md shadow-card-folio border border-[#2b1e16]/20 flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Simulated Brass Pull Ring and Top Highlight Rim */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#c5a059]/40 group-hover:bg-[#c5a059] transition-colors" />

                    <div>
                      {/* Top Header with Call No & Status Stamp */}
                      <div className="flex items-center justify-between pb-space-xs border-b border-secondary/15">
                        <span className="font-code-ledger text-secondary font-bold text-[14px]">
                          {book.callNo}
                        </span>
                        {book.status === 'AVAILABLE' && (
                          <span className="stamp-badge-issued text-[10px]">AVAILABLE</span>
                        )}
                        {book.status === 'CIRCULATING' && (
                          <span className="stamp-badge-overdue text-[10px]">CIRCULATING</span>
                        )}
                        {book.status === 'RESERVED' && (
                          <span className="stamp-badge-returned text-[10px]">RESERVED</span>
                        )}
                      </div>

                      <div className="pt-space-xs">
                        <h3
                          onClick={() => setSelectedBook(book)}
                          className="font-headline-sm text-headline-sm text-on-surface font-semibold leading-snug cursor-pointer group-hover:text-primary transition-colors"
                        >
                          {book.title}
                        </h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant italic block mt-0.5">
                          {book.author} ({book.edition})
                        </span>
                      </div>

                      <p className="font-body-sm text-[13px] text-on-surface/80 mt-2 line-clamp-2">
                        {book.notes}
                      </p>

                      <div className="mt-space-sm p-space-xs bg-[#ede0c8] rounded grid grid-cols-2 gap-2 text-[11px] font-code-ledger text-on-surface-variant border border-secondary/15">
                        <div>
                          <span className="text-secondary font-bold">Dewey:</span> {book.dewey}
                        </div>
                        <div>
                          <span className="text-secondary font-bold">Binding:</span> {book.binding}
                        </div>
                        <div>
                          <span className="text-secondary font-bold">Loc:</span> {book.shelf}
                        </div>
                        <div>
                          <span className="text-secondary font-bold">Custody:</span>{' '}
                          <strong className={book.availableCopies > 0 ? 'text-primary' : 'text-tertiary'}>
                            {book.availableCopies}/{book.totalCopies} Available
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-space-md mt-space-md border-t border-secondary/15">
                      <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-widest">
                        {book.wing}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBook(book)}
                          className="px-space-sm py-1 bg-surface-container-high rounded text-on-surface font-code-ledger text-[11px] hover:bg-surface-container cursor-pointer border border-secondary/20"
                        >
                          Examine
                        </button>
                        {book.availableCopies > 0 ? (
                          <button
                            onClick={() => handleQuickLend(book)}
                            className="px-space-sm py-1 bg-primary text-secondary-fixed rounded font-code-ledger text-[11px] shadow hover:bg-primary-container cursor-pointer border border-secondary/40 font-bold"
                          >
                            Lend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickReserve(book)}
                            className="px-space-sm py-1 bg-secondary text-surface-bright rounded font-code-ledger text-[11px] shadow hover:bg-secondary-fixed-dim cursor-pointer font-bold"
                          >
                            Reserve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Parchment Ledger Table View */
              <div className="bg-surface-container-lowest rounded-xl shadow-md overflow-x-auto border border-secondary/20">
                <table className="w-full text-left border-collapse font-body-sm">
                  <thead>
                    <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[11px] uppercase tracking-wider border-b border-secondary/20">
                      <th className="py-3 px-3">Call Number</th>
                      <th className="py-3 px-3">Folio Title &amp; Scribe</th>
                      <th className="py-3 px-3">Location &amp; Wing</th>
                      <th className="py-3 px-3">Binding</th>
                      <th className="py-3 px-3 text-center">Custody</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/15">
                    {filteredBooks.map(book => (
                      <tr key={book.callNo} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-3 px-3 font-code-ledger text-secondary font-bold">
                          {book.callNo}
                          <div className="text-[10px] text-on-surface-variant font-normal">{book.dewey}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div
                            onClick={() => setSelectedBook(book)}
                            className="font-headline-sm text-body-md text-primary font-semibold cursor-pointer hover:underline"
                          >
                            {book.title}
                          </div>
                          <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                            {book.author} ({book.edition})
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-body-sm text-on-surface font-medium">{book.wing}</div>
                          <div className="font-code-ledger text-[11px] text-secondary">{book.shelf}</div>
                        </td>
                        <td className="py-3 px-3 font-body-sm text-on-surface">
                          {book.binding}
                          <div className="font-stamp-label text-[10px] text-on-surface-variant">
                            {book.conservationRating}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-code-ledger text-[12px]">
                          <span
                            className={
                              book.availableCopies > 0
                                ? 'text-primary font-bold'
                                : 'text-tertiary font-bold'
                            }
                          >
                            {book.availableCopies}/{book.totalCopies}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {book.status === 'AVAILABLE' && (
                            <span className="stamp-badge-issued text-[9px]">AVAILABLE</span>
                          )}
                          {book.status === 'CIRCULATING' && (
                            <span className="stamp-badge-overdue text-[9px]">CIRCULATING</span>
                          )}
                          {book.status === 'RESERVED' && (
                            <span className="stamp-badge-returned text-[9px]">RESERVED</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedBook(book)}
                              className="px-2 py-1 bg-surface-container rounded text-on-surface text-[11px] hover:bg-surface-container-high cursor-pointer font-code-ledger"
                            >
                              Dossier
                            </button>
                            {book.availableCopies > 0 ? (
                              <button
                                onClick={() => handleQuickLend(book)}
                                className="px-2 py-1 bg-primary text-secondary-fixed rounded text-[11px] shadow hover:bg-primary-container cursor-pointer font-code-ledger font-semibold"
                              >
                                Lend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleQuickReserve(book)}
                                className="px-2 py-1 bg-secondary text-surface-bright rounded text-[11px] shadow hover:bg-secondary-fixed-dim cursor-pointer font-code-ledger"
                              >
                                Reserve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Scriptorium Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Wing Occupancy Density */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-md border border-secondary/20">
              <div className="flex items-center gap-2 pb-space-xs border-b border-secondary/15">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  account_tree
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Wing Occupancy Density
                </h3>
              </div>

              <div className="space-y-3 font-body-sm text-[13px]">
                <div>
                  <div className="flex justify-between pb-1">
                    <span>North Gallery (Classical &amp; Philology)</span>
                    <strong className="font-code-ledger text-primary">88% Capacity</strong>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full w-[88%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between pb-1">
                    <span>West Wing (Natural History &amp; Law)</span>
                    <strong className="font-code-ledger text-secondary">62% Capacity</strong>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full w-[62%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between pb-1">
                    <span>Special Collections Vault (Incunabula)</span>
                    <strong className="font-code-ledger text-tertiary">94% Strict Cap</strong>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full w-[94%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between pb-1">
                    <span>South Cloisters (Music &amp; Cartography)</span>
                    <strong className="font-code-ledger text-primary-fixed-dim">45% Capacity</strong>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full w-[45%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tome Conservation Alert */}
            <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm border-t-4 border-secondary border-x border-b border-secondary/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  history_edu
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Tome Conservation Alert
                </h3>
              </div>
              <p className="font-body-sm text-[13px] text-on-surface/90 leading-relaxed">
                Seasonal humidity across the South Cloisters has caused faint paper foxing on 17th-century folios. Custodians are advised to treat vellum covers with beeswax balm.
              </p>
              <div className="pt-2">
                <Link
                  href="/reports"
                  className="font-code-ledger text-[11px] text-secondary hover:underline flex items-center gap-1 font-bold"
                >
                  Examine Stack Conservation Ledger →
                </Link>
              </div>
            </div>

            {/* Summon Folio Clerk Card */}
            <div className="bg-primary text-surface-bright rounded-xl shadow-md p-space-lg flex flex-col gap-space-sm border border-secondary/40">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[24px]">
                  person_search
                </span>
                <h3 className="font-headline-sm text-headline-sm text-secondary-fixed">
                  Summon Stack Runner
                </h3>
              </div>
              <p className="font-body-sm text-[13px] text-primary-fixed-dim">
                Need a volume retrieved from upper locked cages or the sub-crypt? Send a bell summons to student pages.
              </p>
              <button
                onClick={() => showToast('Stack page dispatched to Bay IX upper gallery.', 'notifications_active')}
                className="mt-2 py-2 px-space-md bg-secondary text-primary font-body-sm font-semibold rounded hover:bg-secondary-fixed transition-colors cursor-pointer text-center"
              >
                Ring Stacks Chime
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tome Dossier / Examination Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#fbf7ee] text-on-surface rounded-xl border-2 border-secondary max-w-2xl w-full p-space-lg shadow-2xl relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-1 rounded hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* Dossier Header */}
            <div className="flex items-start justify-between border-b border-secondary/20 pb-space-sm mb-space-md pr-8">
              <div>
                <span className="font-code-ledger text-secondary font-bold text-[16px]">
                  {selectedBook.callNo}
                </span>
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
                  {selectedBook.title}
                </h2>
                <div className="font-body-md text-on-surface-variant italic">
                  by {selectedBook.author} ({selectedBook.edition})
                </div>
              </div>
            </div>

            {/* Dossier Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-code-ledger text-[12px] bg-[#ede0c8] p-4 rounded-lg border border-secondary/20 mb-space-md">
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Classification
                </span>
                <span>{selectedBook.category}</span>
              </div>
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Dewey Decimal
                </span>
                <span>{selectedBook.dewey}</span>
              </div>
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Binding Material
                </span>
                <span>{selectedBook.binding}</span>
              </div>
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Physical Location
                </span>
                <span>{selectedBook.shelf}</span>
              </div>
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Library Wing
                </span>
                <span>{selectedBook.wing}</span>
              </div>
              <div>
                <span className="text-secondary font-bold block uppercase text-[10px]">
                  Custody Copies
                </span>
                <span className="font-bold text-primary">
                  {selectedBook.availableCopies} of {selectedBook.totalCopies} Available
                </span>
              </div>
            </div>

            {/* Curatorial Annotation */}
            <div className="mb-space-md">
              <span className="font-stamp-label text-[11px] text-secondary uppercase block mb-1">
                Archival Curatorial Notes &amp; Marginalia
              </span>
              <p className="font-body-md text-[14px] text-on-surface bg-surface-container-low p-3 rounded border border-secondary/15 italic">
                &ldquo;{selectedBook.notes}&rdquo;
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-space-sm border-t border-secondary/20">
              <span className="font-stamp-label text-[10px] text-on-surface-variant uppercase">
                Accession: {selectedBook.accessionNo}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-2 bg-surface-container rounded text-on-surface font-body-sm hover:bg-surface-container-high transition-colors"
                >
                  Close Dossier
                </button>
                {selectedBook.availableCopies > 0 ? (
                  <button
                    onClick={() => {
                      const bookToLend = selectedBook;
                      setSelectedBook(null);
                      handleQuickLend(bookToLend);
                    }}
                    className="px-5 py-2 bg-primary text-secondary-fixed rounded border border-secondary font-body-sm font-semibold shadow hover:bg-primary-container transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">outbox</span>
                    Dispatch Loan at Issue Desk
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleQuickReserve(selectedBook);
                      setSelectedBook(null);
                    }}
                    className="px-5 py-2 bg-secondary text-surface-bright rounded border border-secondary font-body-sm font-semibold shadow hover:bg-secondary-fixed-dim transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    Attach Hold Slip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
