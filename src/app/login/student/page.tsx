'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';

export default function StudentLoginPage() {
  const router = useRouter();
  const { signIn, signUpStudent, isConfigured } = useAuth();
  const { showToast } = useLibrary();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setIsLoading(true);

    if (mode === 'signup') {
      const res = await signUpStudent(email, password, fullName);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.error || 'Matriculation registration failed.');
        return;
      }

      if (res.isEmailConfirmationRequired) {
        setSuccessNotice(
          'Matriculation registered! A confirmation email was sent to your address. Please click the link in your email before logging in.\n' +
          '(Tip: In your Supabase Dashboard, under Authentication -> Providers -> Email, you can disable "Confirm email" for instant login during testing).'
        );
      } else {
        setSuccessNotice('Matriculation registered successfully! You may now sign in below.');
      }

      showToast(`Welcome, Scholar ${fullName}! Matriculation registered.`, 'school');
      setMode('signin');
      return;
    }

    // Sign In flow
    const res = await signIn(email, password);
    if (!res.success) {
      setIsLoading(false);
      setErrorMessage(res.error || 'Invalid credentials.');
      return;
    }

    setIsLoading(false);
    showToast('Scholar credentials verified. Welcome to your Reading Desk!', 'school');
    router.push('/student');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-lg relative">
      <div className="max-w-md w-full bg-surface-container-low rounded-xl p-space-xl border-2 border-secondary/40 shadow-xl flex flex-col gap-space-md relative overflow-hidden">
        {/* Banner Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary" />

        {/* Header */}
        <div className="flex items-center gap-space-sm border-b border-secondary/20 pb-space-sm">
          <div className="relative h-10 w-10 shrink-0 rounded bg-secondary/20 p-1.5 border border-secondary shadow flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px] text-primary">school</span>
          </div>
          <div>
            <span className="font-stamp-label text-[10px] text-secondary uppercase tracking-widest block">
              Reader &amp; Collegiate Portal
            </span>
            <h1 className="font-headline-md text-body-lg text-primary font-bold">
              Matriculated Scholar Login
            </h1>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-surface-container rounded-lg p-1 border border-secondary/30 shadow-inner">
          <button
            type="button"
            onClick={() => { setMode('signin'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded font-stamp-label text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-primary text-secondary-fixed shadow-sm'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Sign In to Reading Desk
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-1.5 rounded font-stamp-label text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-primary text-secondary-fixed shadow-sm'
                : 'text-on-surface hover:text-primary'
            }`}
          >
            Matriculate (Sign Up)
          </button>
        </div>

        <p className="font-body-sm text-[13px] text-on-surface-variant italic">
          {mode === 'signin'
            ? 'Access your personal loans ledger, verify return deadlines, and examine caution deposits.'
            : 'Enroll in the academic reader registry. Enforces the student role.'}
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

        {successNotice && (
          <div className="p-3 bg-primary-fixed/30 border border-primary-container rounded text-primary font-code-ledger text-[12px] flex items-start gap-2 whitespace-pre-line">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">check_circle</span>
            <span>{successNotice}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
          {mode === 'signup' && (
            <div>
              <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
                Scholar Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Eleanor Finch"
                className="w-full px-3 py-2 bg-surface-container rounded border border-secondary/40 font-body-sm text-on-surface focus:border-secondary focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-stamp-label text-[11px] text-secondary uppercase tracking-wider mb-1">
              Collegiate Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="scholar@balliol.ac.uk"
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
                <span>Recording in Registry...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">
                  {mode === 'signin' ? 'login' : 'assignment_ind'}
                </span>
                <span>{mode === 'signin' ? 'Enter Reading Desk' : 'Matriculate as Reader'}</span>
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
          <Link href="/login/librarian" className="hover:text-primary transition-colors">
            Archivist Login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
