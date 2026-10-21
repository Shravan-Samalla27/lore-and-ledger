'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, UserProfile, UserRole } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { supabase } from '@/lib/supabase';
import RoleGuard from '@/components/RoleGuard';

export default function AdminConsolePage() {
  return (
    <RoleGuard allowedRoles={['admin']} redirectTo="/login/admin">
      <AdminConsoleContent />
    </RoleGuard>
  );
}

function AdminConsoleContent() {
  const { user, role, isLoading } = useAuth();
  const { scholars, showToast } = useLibrary();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProfiles = async () => {
    // Fail closed: only verified admin may query profiles
    if (!supabase || role !== 'admin') {
      setIsLoadingProfiles(false);
      return;
    }
    try {
      setIsLoadingProfiles(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProfiles(
          data.map(p => ({
            id: p.id,
            email: p.email,
            fullName: p.full_name || '',
            role: p.role as UserRole,
            scholarId: p.scholar_id || null
          }))
        );
      }
    } catch (err: any) {
      console.warn('Could not fetch profiles from database:', err.message);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchProfiles();
    } else {
      setIsLoadingProfiles(false);
    }
  }, [role]);

  const handleUpdateRole = async (targetUserId: string, newRole: UserRole) => {
    if (!supabase || role !== 'admin') {
      showToast('Unauthorized: Only administrators can appoint stations.', 'warning', 'warning');
      return;
    }
    setUpdatingId(targetUserId);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', targetUserId);

      if (error) throw error;

      showToast(`User station updated to ${newRole.toUpperCase()} successfully.`, 'shield');
      setProfiles(prev =>
        prev.map(p => (p.id === targetUserId ? { ...p, role: newRole } : p))
      );
    } catch (err: any) {
      showToast(`Failed to update station: ${err.message || err}`, 'warning', 'warning');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLinkScholar = async (targetUserId: string, newScholarId: string) => {
    if (!supabase || role !== 'admin') {
      showToast('Unauthorized: Only administrators can link scholar profiles.', 'warning', 'warning');
      return;
    }
    setUpdatingId(targetUserId);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          scholar_id: newScholarId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', targetUserId);

      if (error) throw error;

      showToast('Scholar registry folio linked to user account.', 'link');
      setProfiles(prev =>
        prev.map(p => (p.id === targetUserId ? { ...p, scholarId: newScholarId || null } : p))
      );
    } catch (err: any) {
      showToast(`Failed to link scholar: ${err.message || err}`, 'warning', 'warning');
    } finally {
      setUpdatingId(null);
    }
  };

  // Fail closed: If loading, unauthenticated, or verified role is not strictly admin, never render admin content
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

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <div className="w-full min-h-screen bg-background px-space-margin py-space-lg">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Banner */}
        <div className="relative w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border-2 border-tertiary/40 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-space-sm mb-1">
                <span className="font-stamp-label text-stamp-label text-tertiary uppercase tracking-widest font-bold">
                  Administrative Vault
                </span>
                <span className="font-code-ledger text-[11px] text-on-surface-variant">
                  • High Chancellor Console
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Staff Governance &amp; User Role Management
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant italic mt-1">
                Appoint Scriptorium librarians, elevate administrative chancellors, and verify student scholar links.
              </p>
            </div>

            <div className="flex items-center gap-space-sm">
              <Link
                href="/settings"
                className="px-space-md py-2 bg-surface-container-high text-on-surface rounded-lg font-code-ledger text-[12px] font-semibold border border-secondary/30 hover:bg-surface-container transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                Library Statutes &amp; Tariffs
              </Link>
            </div>
          </div>
        </div>

        {/* User Role Accounts Table */}
        <div className="bg-surface-container-low rounded-xl shadow-md p-space-lg border border-secondary/20 flex flex-col gap-space-md">
          <div className="flex items-center justify-between border-b border-secondary/20 pb-space-sm">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                manage_accounts
              </span>
              <h2 className="font-headline-md text-headline-md text-primary font-bold">
                Registered University Profiles ({profiles.length})
              </h2>
            </div>
            <button
              onClick={fetchProfiles}
              className="font-code-ledger text-[11px] text-primary hover:text-secondary flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              Reload Profiles
            </button>
          </div>

          {isLoadingProfiles ? (
            <div className="p-8 text-center font-code-ledger text-secondary">
              Querying university registry profiles...
            </div>
          ) : profiles.length === 0 ? (
            <div className="p-8 text-center bg-surface-container rounded-lg font-body-sm text-on-surface-variant italic">
              No profiles recorded yet in the database. When users sign up, their accounts will appear here for staff role appointments.
            </div>
          ) : (
            <div className="w-full overflow-x-auto rounded-lg bg-surface-container-lowest shadow-inner border border-secondary/20">
              <table className="w-full text-left border-collapse font-body-sm text-[13px]">
                <thead>
                  <tr className="bg-surface-container text-on-secondary-fixed-variant font-stamp-label text-[10px] uppercase tracking-wider border-b border-secondary/20">
                    <th className="py-2.5 px-3">Scholar / User</th>
                    <th className="py-2.5 px-3">Collegiate Email</th>
                    <th className="py-2.5 px-3">Current Station</th>
                    <th className="py-2.5 px-3">Linked Scholar ID</th>
                    <th className="py-2.5 px-3 text-right">Appoint Station</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/15 font-code-ledger text-[12px]">
                  {profiles.map(p => {
                    const isSelf = p.id === user?.id;
                    return (
                      <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-primary">
                          {p.fullName || 'Unnamed Scholar'}
                          {isSelf && (
                            <span className="ml-2 font-stamp-label text-[9px] px-1.5 py-0.5 rounded bg-primary text-secondary-fixed">
                              You
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-secondary">{p.email}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-stamp-label text-[9px] uppercase tracking-wider ${
                              p.role === 'admin'
                                ? 'bg-tertiary-container text-tertiary font-bold'
                                : p.role === 'librarian'
                                ? 'bg-primary-fixed text-on-primary-fixed font-bold'
                                : 'bg-surface-container-high text-on-surface-variant'
                            }`}
                          >
                            {p.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            disabled={updatingId === p.id}
                            value={p.scholarId || ''}
                            onChange={e => handleLinkScholar(p.id, e.target.value)}
                            className="px-2 py-1 bg-surface-container rounded border border-secondary/30 font-code-ledger text-[11px] text-on-surface focus:outline-none"
                          >
                            <option value="">Unlinked (None)</option>
                            {scholars.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.id} — {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              disabled={updatingId === p.id || p.role === 'librarian'}
                              onClick={() => handleUpdateRole(p.id, 'librarian')}
                              className="px-2 py-1 rounded bg-surface-container border border-secondary/30 font-code-ledger text-[11px] hover:bg-primary hover:text-surface-bright transition-colors cursor-pointer disabled:opacity-30"
                              title="Promote to Librarian"
                            >
                              Librarian
                            </button>
                            <button
                              disabled={updatingId === p.id || p.role === 'admin'}
                              onClick={() => handleUpdateRole(p.id, 'admin')}
                              className="px-2 py-1 rounded bg-surface-container border border-tertiary/40 font-code-ledger text-[11px] hover:bg-tertiary hover:text-surface-bright transition-colors cursor-pointer disabled:opacity-30"
                              title="Promote to Admin"
                            >
                              Admin
                            </button>
                            <button
                              disabled={updatingId === p.id || p.role === 'student'}
                              onClick={() => handleUpdateRole(p.id, 'student')}
                              className="px-2 py-1 rounded bg-surface-container border border-secondary/20 font-code-ledger text-[11px] hover:bg-surface-container-high transition-colors cursor-pointer disabled:opacity-30"
                              title="Set to Student"
                            >
                              Student
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
