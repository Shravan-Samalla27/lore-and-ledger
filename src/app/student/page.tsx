'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import RoleGuard from '@/components/RoleGuard';

export default function StudentPortalPage() {
  return (
    <RoleGuard allowedRoles={['student']}>
      <StudentPortalContent />
    </RoleGuard>
  );
}

function StudentPortalContent() {
  const { user, profile } = useAuth();
  const { loans, scholars, books } = useLibrary();

  // Find linked scholar record if exists
  const linkedScholar = profile?.scholarId
    ? scholars.find(s => s.id === profile.scholarId)
    : scholars.find(s => s.name.toLowerCase() === (profile?.fullName || '').toLowerCase()) || scholars[0];

  // Filter personal loans:
  // If scholar is linked or matched, show their loans; otherwise if matching scholarId or user id
  const targetScholarId = profile?.scholarId || linkedScholar?.id;
  const myLoans = loans.filter(
    l => l.scholarId === targetScholarId || l.scholarName.toLowerCase() === (profile?.fullName || '').toLowerCase()
  );

  const activeLoans = myLoans.filter(l => l.status !== 'RETURNED');
  const overdueLoans = myLoans.filter(l => l.status === 'OVERDUE');
  const totalFines = myLoans.reduce((acc, l) => acc + (l.baseFine || 0), 0);

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border-2 border-secondary/30 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
                  Matriculated Scholar Desk
                </span>
                <span className="font-code-ledger text-[11px] text-on-surface-variant">
                  • Reader ID: {targetScholarId || 'SCH-PENDING'}
                </span>
              </div>
              <h1 className="font-display-lg text-headline-lg text-primary tracking-tight">
                Welcome, {profile?.fullName || linkedScholar?.name || user?.email?.split('@')[0] || 'Scholar'}
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic mt-1">
                {linkedScholar?.college || 'University College'} • {linkedScholar?.faculty || 'Michaelmas Term Reader'}
              </p>
            </div>

            <div className="flex items-center gap-space-sm">
              <Link
                href="/books"
                className="px-space-md py-2 bg-primary text-secondary-fixed rounded-lg font-body-sm font-semibold shadow hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer border border-secondary"
              >
                <span className="material-symbols-outlined text-[18px]">menu_book</span>
                Consult Book Catalogue
              </Link>
            </div>
          </div>
        </div>

        {/* Scholar Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider">
              Active Folios in Custody
            </span>
            <div className="font-display-lg text-primary text-[32px] font-bold mt-1">
              {activeLoans.length}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Quota: {activeLoans.length} of {linkedScholar?.maxLoans || 5} volumes borrowed
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-tertiary uppercase tracking-wider">
              Overdue Demands
            </span>
            <div className="font-display-lg text-tertiary text-[32px] font-bold mt-1">
              {overdueLoans.length}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              {overdueLoans.length > 0 ? 'Please return to avoid beadle summons' : 'All loans in good standing'}
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider">
              Accrued Late Charges
            </span>
            <div className="font-display-lg text-secondary text-[32px] font-bold mt-1">
              ₹{totalFines}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Payable at circulation quittance desk
            </p>
          </div>

          <div className="bg-surface-container-low p-space-md rounded-lg shadow-sm border border-secondary/20">
            <span className="font-stamp-label text-[10px] text-primary uppercase tracking-wider">
              Caution Money Deposit
            </span>
            <div className="font-display-lg text-primary text-[32px] font-bold mt-1">
              {linkedScholar?.deposit || '₹2,500'}
            </div>
            <p className="font-body-sm text-[12px] text-on-surface-variant">
              Held with collegiate bursar
            </p>
          </div>
        </div>

        {/* Personal Loans Ledger Table */}
        <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                auto_stories
              </span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                My Personal Borrowed Volumes
              </h2>
            </div>
            <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-wider">
              Isolated Reader Folio
            </span>
          </div>

          {myLoans.length === 0 ? (
            <div className="p-8 text-center bg-surface-container rounded-lg border border-secondary/20 flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[36px]">
                menu_book
              </span>
              <h3 className="font-headline-sm text-primary font-semibold">No Active Loans on Record</h3>
              <p className="font-body-sm text-on-surface-variant italic max-w-sm">
                You currently have no volumes checked out under your reader ID. Consult the Scriptorium catalogue to request a book.
              </p>
              <Link
                href="/books"
                className="mt-2 px-4 py-1.5 bg-primary text-secondary-fixed rounded font-body-sm font-semibold"
              >
                Browse Available Volumes
              </Link>
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner border border-secondary/20">
              <table className="w-full text-left border-collapse font-body-sm text-[13px]">
                <thead>
                  <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[10px] uppercase tracking-wider border-b border-secondary/20">
                    <th className="py-2.5 px-3">Folio Ref</th>
                    <th className="py-2.5 px-3">Volume Title</th>
                    <th className="py-2.5 px-3">Call Number</th>
                    <th className="py-2.5 px-3">Dispatch Date</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-center">Standing</th>
                    <th className="py-2.5 px-3 text-right">Fee / Tariff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/15 font-code-ledger text-[12px]">
                  {myLoans.map(loan => (
                    <tr key={loan.ref} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-3 font-bold text-secondary">{loan.ref}</td>
                      <td className="py-2.5 px-3 font-headline-sm text-body-sm text-primary font-semibold">
                        {loan.bookTitle}
                      </td>
                      <td className="py-2.5 px-3 text-secondary font-mono">{loan.bookCallNo}</td>
                      <td className="py-2.5 px-3 text-on-surface-variant">{loan.issueDate}</td>
                      <td className="py-2.5 px-3 font-semibold text-primary">{loan.dueDate}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-stamp-label text-[9px] uppercase tracking-wider ${
                            loan.status === 'ISSUED'
                              ? 'bg-primary-fixed text-on-primary-fixed'
                              : loan.status === 'OVERDUE'
                              ? 'bg-tertiary-container text-tertiary font-bold'
                              : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {loan.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-secondary">
                        {loan.baseFine > 0 ? `₹${loan.baseFine}` : 'Nil'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security / Student Privacy Guarantee Card */}
        <div className="p-space-md rounded-lg bg-surface-container border border-secondary/20 flex items-start gap-space-sm text-on-surface-variant font-body-sm text-[12px]">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
            verified_user
          </span>
          <div>
            <strong className="text-primary font-semibold">Student Data Isolation Guarantee:</strong> Your reader records, caution deposits, and borrowing transactions are isolated and protected by PostgreSQL Row Level Security. Only you and authorized library custodial staff have access to your circulation ledger.
          </div>
        </div>
      </div>
    </div>
  );
}
