'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLibrary } from '@/context/LibraryContext';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { settings, isDbConnected } = useLibrary();
  const { user, profile, role, signOut } = useAuth();

  // Dynamic Navigation based on authenticated role
  let navItems = [
    { label: 'Dashboard', path: '/', icon: 'auto_stories' },
    { label: 'Books', path: '/books', icon: 'menu_book' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Issue Book', path: '/issue-book', icon: 'outbox' },
    { label: 'Return Book', path: '/return-book', icon: 'move_to_inbox' },
    { label: 'Reports', path: '/reports', icon: 'history_edu' },
    { label: 'Settings', path: '/settings', icon: 'settings' }
  ];

  if (role === 'student') {
    navItems = [
      { label: 'My Reading Desk', path: '/student', icon: 'school' },
      { label: 'Books Catalogue', path: '/books', icon: 'menu_book' }
    ];
  } else if (role === 'admin') {
    navItems = [
      { label: 'Dashboard', path: '/', icon: 'auto_stories' },
      { label: 'Books', path: '/books', icon: 'menu_book' },
      { label: 'Students', path: '/students', icon: 'group' },
      { label: 'Issue Book', path: '/issue-book', icon: 'outbox' },
      { label: 'Return Book', path: '/return-book', icon: 'move_to_inbox' },
      { label: 'Reports', path: '/reports', icon: 'history_edu' },
      { label: 'Settings', path: '/settings', icon: 'settings' },
      { label: 'Chancellor Console', path: '/admin', icon: 'gavel' }
    ];
  }

  const isActive = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(itemPath);
  };

  const getStationLabel = () => {
    if (role === 'student') return 'Scholar Reading Room';
    if (role === 'admin') return 'Chancellor Governance';
    if (role === 'librarian') return 'Scriptorium Registers';
    return 'Library Registers';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-primary text-surface-bright z-50 flex flex-col justify-between shadow-[2px_0_12px_rgba(4,34,23,0.25)] border-r border-secondary/30">
      <div className="flex flex-col">
        {/* Brand Crest Header */}
        <Link href={role === 'student' ? '/student' : '/'} className="p-space-lg border-b border-secondary/20 flex items-start gap-space-sm hover:bg-primary-container/40 transition-colors">
          <div className="relative h-10 w-10 shrink-0 mt-0.5 rounded overflow-hidden bg-primary-container p-1 border border-secondary/30">
            <Image
              src="/images/crest.png"
              alt="Lore & Ledger Crest"
              width={40}
              height={40}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-secondary-fixed font-semibold tracking-wide leading-tight">
              Lore &amp; Ledger
            </span>
            <span className="font-body-sm text-body-sm text-primary-fixed-dim italic leading-snug">
              Where every book has a story
            </span>
          </div>
        </Link>

        {/* Section Label */}
        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs font-stamp-label text-stamp-label text-secondary uppercase tracking-widest flex items-center justify-between">
            <span>{getStationLabel()}</span>
            {role && (
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary-container text-secondary-fixed border border-secondary/30">
                {role}
              </span>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1 px-space-sm">
          {navItems.map(item => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-space-sm px-space-md py-space-sm rounded transition-all font-body-md ${
                  active
                    ? 'bg-primary-container text-secondary-fixed border-l-4 border-secondary shadow-inner font-semibold'
                    : 'text-primary-fixed-dim hover:bg-primary-container/60 hover:text-surface-bright'
                }`}
              >
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Session Card */}
      <div className="p-space-md border-t border-secondary/20 bg-primary/80 flex flex-col gap-2">
        <div className="bg-primary-container/90 rounded border border-secondary/40 p-space-sm flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-secondary-fixed">
            <span className="font-stamp-label text-stamp-label tracking-wider uppercase">
              Archival Session
            </span>
            <span
              title={isDbConnected ? 'Connected to Supabase PostgreSQL' : 'Operating with local registry registers'}
              className={`inline-block w-2 h-2 rounded-full ${
                isDbConnected ? 'bg-emerald-400' : 'bg-secondary animate-pulse'
              }`}
            />
          </div>
          <span className="font-code-ledger text-code-ledger text-surface-bright font-medium">
            {settings.termName}
          </span>
          <span className="font-body-sm text-body-sm text-primary-fixed-dim text-[11px]">
            {isDbConnected ? 'Supabase PostgreSQL Online' : 'Local Standby Registers'}
          </span>
          <div className="mt-1 pt-1 border-t border-secondary/20 flex items-center justify-between font-code-ledger text-[11px] text-secondary-fixed">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">
                {isDbConnected ? 'database' : 'ink_pen'}
              </span>
              {isDbConnected ? 'Cloud DB Active' : 'Quill Ready'}
            </span>
            <span className="text-primary-fixed">
              {isDbConnected ? 'Synced' : 'Standby'}
            </span>
          </div>
        </div>

        {/* User Identity or Portal Switcher */}
        {user ? (
          <div className="flex items-center justify-between px-1 font-code-ledger text-[11px] text-primary-fixed-dim">
            <span className="truncate max-w-[170px]" title={user.email}>
              {profile?.fullName || user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-secondary hover:text-surface-bright underline flex items-center gap-0.5 cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              Exit
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center px-1">
            <Link
              href="/login"
              className="w-full text-center py-1 rounded bg-secondary/20 hover:bg-secondary/30 text-secondary-fixed font-code-ledger text-[11px] transition-colors border border-secondary/30"
            >
              Present Credentials (Login)
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
