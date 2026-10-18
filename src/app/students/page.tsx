'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLibrary, Scholar } from '@/context/LibraryContext';

export default function StudentsRegisterPage() {
  const { scholars, loans, showToast } = useLibrary();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('all');

  const filteredScholars = scholars.filter(s => {
    const matchSearch =
      !searchTerm.trim() ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.faculty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchCollege = selectedCollege === 'all' || s.college === selectedCollege;

    return matchSearch && matchCollege;
  });

  const colleges = Array.from(new Set(scholars.map(s => s.college)));

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-secondary/20">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-space-sm mb-1">
              <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                Matriculation Register
              </span>
              <span className="font-code-ledger text-[11px] text-on-surface-variant">
                Michaelmas Term 1888
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Matriculated Scholars &amp; Readers
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              Collegiate standing, caution money deposits, and active folio quotas.
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-surface-container-low rounded-xl p-space-md shadow-sm border border-secondary/20 flex flex-col sm:flex-row gap-space-md justify-between items-center">
          <div className="relative flex-1 max-w-md w-full">
            <span className="material-symbols-outlined absolute left-3 top-2 text-secondary text-[20px]">
              search
            </span>
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search scholar name, ID, or faculty..."
              className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest rounded border border-secondary/30 font-body-sm text-on-surface focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-space-sm w-full sm:w-auto">
            <select
              value={selectedCollege}
              onChange={e => setSelectedCollege(e.target.value)}
              className="px-3 py-2 bg-surface-container rounded border border-secondary/30 font-body-sm text-on-surface text-[13px] focus:outline-none"
            >
              <option value="all">All Colleges</option>
              {colleges.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={() => showToast('New scholar matriculation register opened.', 'person_add')}
              className="px-4 py-2 bg-primary text-secondary-fixed rounded font-body-sm font-semibold shadow hover:bg-primary-container transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              Matriculate New Scholar
            </button>
          </div>
        </div>

        {/* Scholars Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {filteredScholars.map(scholar => {
            const scholarLoans = loans.filter(l => l.scholarId === scholar.id && l.status !== 'RETURNED');
            return (
              <div
                key={scholar.id}
                className="bg-[#f4ead4] rounded-lg p-space-md shadow-card-folio border border-[#2b1e16]/20 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-space-xs border-b border-secondary/20">
                    <span className="font-code-ledger text-secondary font-bold text-[13px]">
                      {scholar.id}
                    </span>
                    <span
                      className={`font-stamp-label text-[10px] px-2 py-0.5 rounded uppercase ${
                        scholar.standing === 'In Good Standing'
                          ? 'bg-primary-fixed text-on-primary-fixed'
                          : 'bg-tertiary-container/30 text-tertiary'
                      }`}
                    >
                      {scholar.standing}
                    </span>
                  </div>

                  <div className="mt-space-sm flex items-center gap-space-sm">
                    <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center font-headline-md text-primary font-bold border border-secondary/40 shrink-0">
                      {scholar.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-body-md text-primary font-bold">
                        {scholar.name}
                      </h3>
                      <div className="font-body-sm text-[12px] text-on-surface-variant italic">
                        {scholar.college}
                      </div>
                      <div className="font-code-ledger text-[11px] text-secondary">
                        {scholar.faculty}
                      </div>
                    </div>
                  </div>

                  {/* Quotas and Deposit */}
                  <div className="mt-space-md p-space-xs bg-[#ede0c8] rounded border border-secondary/15 font-code-ledger text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-secondary font-bold">Caution Deposit:</span>
                      <span>{scholar.deposit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary font-bold">Active Circulation:</span>
                      <strong className="text-primary">
                        {scholarLoans.length} of {scholar.maxLoans} volumes
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary font-bold">Matriculation Year:</span>
                      <span>{scholar.joinedYear}</span>
                    </div>
                  </div>

                  {/* Active Volumes List if any */}
                  {scholarLoans.length > 0 && (
                    <div className="mt-space-sm">
                      <span className="font-stamp-label text-[10px] text-secondary uppercase block mb-1">
                        Currently In Possession:
                      </span>
                      <div className="space-y-1">
                        {scholarLoans.map(l => (
                          <div
                            key={l.ref}
                            className="bg-surface-container-lowest p-1.5 rounded text-[11px] font-code-ledger flex justify-between items-center"
                          >
                            <span className="truncate max-w-[180px]">{l.bookTitle}</span>
                            <span className={l.status === 'OVERDUE' ? 'text-tertiary font-bold' : 'text-primary'}>
                              {l.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-space-md mt-space-md border-t border-secondary/15 flex justify-end gap-2">
                  <Link
                    href={`/issue-book?scholarId=${scholar.id}`}
                    className="px-3 py-1 bg-primary text-secondary-fixed rounded font-code-ledger text-[11px] font-semibold hover:bg-primary-container"
                  >
                    Lend Volume
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
