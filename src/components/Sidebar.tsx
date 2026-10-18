'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: 'auto_stories' },
    { label: 'Books', path: '/books', icon: 'menu_book' },
    { label: 'Students', path: '/students', icon: 'group' },
    { label: 'Issue Book', path: '/issue-book', icon: 'outbox' },
    { label: 'Return Book', path: '/return-book', icon: 'move_to_inbox' },
    { label: 'Reports', path: '/reports', icon: 'history_edu' },
    { label: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const isActive = (itemPath: string) => {
    if (itemPath === '/') {
      return pathname === '/' || pathname === '/dashboard';
    }
    return pathname.startsWith(itemPath);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-primary text-surface-bright z-50 flex flex-col justify-between shadow-[2px_0_12px_rgba(4,34,23,0.25)] border-r border-secondary/30">
      <div className="flex flex-col">
        {/* Brand Crest Header */}
        <div className="p-space-lg border-b border-secondary/20 flex items-start gap-space-sm">
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
        </div>

        {/* Section Label */}
        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
            Library Registers
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
      <div className="p-space-md border-t border-secondary/20 bg-primary/80">
        <div className="bg-primary-container/90 rounded border border-secondary/40 p-space-sm flex flex-col gap-1 shadow-sm">
          <div className="flex items-center justify-between text-secondary-fixed">
            <span className="font-stamp-label text-stamp-label tracking-wider uppercase">
              Archival Session
            </span>
            <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse" />
          </div>
          <span className="font-code-ledger text-code-ledger text-surface-bright font-medium">
            Michaelmas Term 1888
          </span>
          <span className="font-body-sm text-body-sm text-primary-fixed-dim text-[11px]">
            Academic Register 2025–2026
          </span>
          <div className="mt-1 pt-1 border-t border-secondary/20 flex items-center justify-between font-code-ledger text-[11px] text-secondary-fixed">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">ink_pen</span>
              Quill Ready
            </span>
            <span className="text-primary-fixed">Ink Well: Full</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
