'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPortalPage() {
  const roles = [
    {
      title: 'Matriculated Scholar',
      sub: 'Student & Reader Register',
      icon: 'school',
      desc: 'Access your reader desk, examine personal borrowed folios, verify return deadlines, and review caution deposit balances.',
      href: '/login/student',
      badge: 'Michaelmas Term Reader',
      accentColor: 'border-secondary/40 hover:border-secondary'
    },
    {
      title: 'Scriptorium Archivist',
      sub: 'Circulation & Stacks Custodian',
      icon: 'history_edu',
      desc: 'Lend and return library volumes, accession new manuscripts, verify binding conditions, and certify quittance slips.',
      href: '/login/librarian',
      badge: 'Authorized Library Staff',
      accentColor: 'border-primary/40 hover:border-primary'
    },
    {
      title: 'High Chancellor',
      sub: 'Archival Governance & Statutes',
      icon: 'gavel',
      desc: 'System administration, custodial appointments, fine tariffs, security rules, and audit registers.',
      href: '/login/admin',
      badge: 'Administrative Vault',
      accentColor: 'border-tertiary/40 hover:border-tertiary'
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-space-lg relative overflow-hidden">
      {/* Background seal watermark */}
      <div className="absolute -right-16 -bottom-16 opacity-5 pointer-events-none select-none text-primary">
        <svg fill="currentColor" height="480" viewBox="0 0 100 100" width="480">
          <circle cx="50" cy="50" fill="none" r="46" stroke="currentColor" strokeDasharray="3 2" strokeWidth="2" />
          <circle cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeWidth="1.5" />
          <path d="M50 15 L53 38 L76 38 L57 52 L64 75 L50 61 L36 75 L43 52 L24 38 L47 38 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center gap-space-lg z-10">
        {/* Crest & Title Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-primary p-2 border-2 border-secondary shadow-lg mb-2">
            <Image
              src="/images/crest.png"
              alt="Lore & Ledger Crest"
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <span className="font-stamp-label text-stamp-label text-secondary uppercase tracking-widest">
            Bodleian Quadrangle • Est. 1888
          </span>
          <h1 className="font-display-lg text-[38px] text-primary tracking-tight leading-none">
            Lore &amp; Ledger
          </h1>
          <p className="font-body-md text-on-surface-variant italic max-w-lg">
            Where every book has a story. Select your station to present your registry credentials and enter the archives.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md w-full mt-2">
          {roles.map(role => (
            <Link
              key={role.href}
              href={role.href}
              className={`group bg-surface-container-low rounded-xl p-space-lg border-2 ${role.accentColor} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
            >
              <div className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full bg-secondary/15 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface-bright transition-colors shadow-inner border border-secondary/30">
                    <span className="material-symbols-outlined text-[24px]">
                      {role.icon}
                    </span>
                  </div>
                  <span className="font-stamp-label text-[9px] px-2 py-0.5 rounded bg-surface-container text-secondary uppercase tracking-wider border border-secondary/20">
                    {role.badge}
                  </span>
                </div>

                <div className="mt-2">
                  <h2 className="font-headline-md text-body-lg text-primary font-bold group-hover:text-secondary-fixed-variant transition-colors">
                    {role.title}
                  </h2>
                  <span className="font-code-ledger text-[11px] text-secondary font-semibold block">
                    {role.sub}
                  </span>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant italic leading-relaxed">
                  {role.desc}
                </p>
              </div>

              <div className="mt-space-lg pt-space-sm border-t border-secondary/15 flex items-center justify-between font-code-ledger text-[12px] text-primary font-semibold group-hover:text-secondary transition-colors">
                <span>Enter Portal</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Public Catalogue Link */}
        <div className="mt-4 flex items-center gap-space-md font-body-sm text-[13px] text-on-surface-variant">
          <span>Looking to consult open catalogues?</span>
          <Link
            href="/books"
            className="text-primary hover:text-secondary underline font-semibold flex items-center gap-1"
          >
            Browse Public Volumes
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
