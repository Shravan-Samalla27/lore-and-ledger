'use client';

import React, { useEffect } from 'react';
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
  const { user, role, isLoading, isConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // If Supabase is not configured yet (local dev standby mode), allow previewing
    if (!isConfigured) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push(redirectTo);
      return;
    }

    // If role is restricted and user does not match
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      if (role === 'student') {
        router.push('/student');
      } else if (role === 'librarian') {
        router.push('/');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    }
  }, [user, role, isLoading, isConfigured, allowedRoles, redirectTo, router]);

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

  // If not configured, allow local dev rendering with notice
  if (!isConfigured) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-surface-container-low rounded-xl border border-secondary/30 text-center flex flex-col items-center gap-3">
        <span className="material-symbols-outlined text-tertiary text-[40px]">
          gavel
        </span>
        <h2 className="font-headline-md text-primary font-bold">Access Restricted</h2>
        <p className="font-body-md text-on-surface-variant italic">
          Your current station ({role}) does not hold custodial authority for this folio register.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
