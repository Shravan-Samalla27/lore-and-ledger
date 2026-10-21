'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/login'
}: RoleGuardProps) {
  const { user, role, isLoading, isConfigured, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, redirectTo, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] font-code-ledger text-secondary">
        <div className="flex flex-col items-center gap-2">
          <span className="material-symbols-outlined text-[32px] animate-spin text-primary">
            hourglass_empty
          </span>
          <span>Verifying Archival Credentials...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated, do not render children
  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-space-lg">
        <div className="max-w-md w-full bg-surface-container-low rounded-xl p-space-xl border-2 border-secondary/30 shadow-xl text-center flex flex-col items-center gap-space-md">
          <span className="material-symbols-outlined text-secondary text-[40px]">lock</span>
          <h2 className="font-headline-md text-primary font-bold">Authentication Required</h2>
          <p className="font-body-sm text-[13px] text-on-surface-variant italic">
            Please present your registry credentials to access this archival folio.
          </p>
          <Link
            href={redirectTo}
            className="w-full py-2 bg-primary text-secondary-fixed rounded font-semibold hover:bg-primary-container transition-colors text-center text-[13px]"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // If role is restricted and current user role does not match or is undefined
  const isUnauthorized = Boolean(allowedRoles && (!role || !allowedRoles.includes(role)));

  if (isUnauthorized) {
    const targetHome =
      role === 'student' ? '/student' : role === 'librarian' ? '/' : role === 'admin' ? '/admin' : '/login';

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-space-lg">
        <div className="max-w-md w-full bg-surface-container-low rounded-xl p-space-xl border-2 border-tertiary/60 shadow-2xl text-center flex flex-col items-center gap-space-md">
          <div className="w-14 h-14 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center border border-tertiary/40">
            <span className="material-symbols-outlined text-[32px]">security</span>
          </div>

          <div>
            <span className="font-stamp-label text-[10px] text-tertiary uppercase tracking-widest block font-bold">
              Custodial Station Guard
            </span>
            <h2 className="font-headline-md text-primary text-xl font-bold mt-1">
              Access denied: your account is not authorized for this portal
            </h2>
          </div>

          <p className="font-body-sm text-[13px] text-on-surface-variant italic">
            Your current account station is &ldquo;{role || 'unassigned'}&rdquo;.
            This portal strictly requires an authorized &ldquo;{allowedRoles?.join(' / ')}&rdquo; role.
          </p>

          <div className="w-full flex flex-col gap-2 pt-2 border-t border-secondary/20 font-body-sm text-[13px]">
            <Link
              href={targetHome}
              className="w-full py-2 bg-primary text-secondary-fixed rounded font-semibold hover:bg-primary-container transition-colors text-center"
            >
              Return to Authorized Station ({role ? role.toUpperCase() : 'PORTAL'})
            </Link>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push('/login');
              }}
              className="w-full py-2 bg-surface-container text-on-surface rounded border border-secondary/30 hover:bg-surface-container-high transition-colors cursor-pointer text-center"
            >
              Sign Out &amp; Switch Station
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
