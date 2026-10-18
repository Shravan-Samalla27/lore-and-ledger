'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

export default function LibrarianLoginPage() {
  const router = useRouter();
  const { signIn, signOut, isConfigured } = useAuth();
  const { showToast } = useLibrary();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const res = await signIn(email, password);

    if (!res.success) {
      setIsLoading(false);
      setErrorMessage(res.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    // Role verification
    const assignedRole = res.profile?.role || 'student';
    if (assignedRole !== 'librarian' && assignedRole !== 'admin') {
      setIsLoading(false);
      await signOut();
      setErrorMessage(
        `Station Authorization Denied: The account "${res.user?.email}" holds the station of "Student", not "Librarian".\n` +
        `Only appointed librarians or administrators may enter the Scriptorium desk.\n` +
        `An administrator can appoint your account as a Librarian via the High Chancellor Console or Supabase SQL Editor.`
      );
      return;
    }

    setIsLoading(false);
    showToast('Archivist credentials verified. Welcome to the Circulation Desk!', 'verified');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-lg relative">
      <div className="max-w-md w-full bg-surface-container-low rounded-xl p-space-xl border-2 border-primary/40 shadow-xl flex flex-col gap-space-md relative overflow-hidden">
        {/* Banner Seal Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

        {/* Header */}
        <div className="flex items-center gap-space-sm border-b border-secondary/20 pb-space-sm">
          <div className="relative h-10 w-10 shrink-0 rounded bg-primary p-1.5 border border-secondary/40 shadow">
            <Image
              src="/images/crest.png"
              alt="Lore & Ledger Crest"
              width={40}
              height={40}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-widest block">
              Authorized Staff Desk
            </span>
            <h1 className="font-headline-md text-body-lg text-primary font-bold">
              Archivist &amp; Staff Login
            </h1>
          </div>
        </div>

        <p className="font-body-sm text-[13px] text-on-surface-variant italic">
          Sign in to access circulation movement registers, folio lending, restitution quittances, and stacks inventory.
        </p>

        {!isConfigured && (
          <div className="p-3 bg-secondary/15 rounded border border-secondary/30 font-code-ledger text-[11px] text-on-surface">
            <strong>Local Standby Notice:</strong> Supabase credentials are not configured in <code>.env.local</code>.
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-tertiary-container/30 border border-tertiary rounded text-tertiary font-code-ledger text-[12px] flex items-start gap-2 whitespace-pre-line">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md mt-2">
          <div>
            <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
              Archivist Email / ID *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="archivist@bodleian.ac.uk"
              className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-code-ledger text-[13px] text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
              Cipher Password *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-code-ledger text-[13px] text-on-surface focus:border-secondary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-primary text-secondary-fixed rounded-lg font-body-sm font-semibold shadow hover:bg-primary-container transition-all flex items-center justify-center gap-2 cursor-pointer border border-secondary disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  hourglass_empty
                </span>
                <span>Verifying Seal...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>Enter Circulation Desk</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-4 pt-space-sm border-t border-secondary/15 flex items-center justify-between font-code-ledger text-[11px] text-on-surface-variant">
          <Link href="/login" className="hover:text-primary transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">arrow_back</span>
            Switch Station
          </Link>
          <Link href="/login/student" className="hover:text-primary transition-colors">
            Matriculated Scholar Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
