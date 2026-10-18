'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { LibraryProvider } from '@/context/LibraryContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Toast from '@/components/Toast';
import NewAcquisitionModal from '@/components/NewAcquisitionModal';

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAcquisitionOpen, setIsAcquisitionOpen] = useState(false);
  const isAuthPage = pathname.startsWith('/login');

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        {children}
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Left Side Navigation Spine */}
      <Sidebar />

      {/* Top Header Bar */}
      <Header onOpenNewAcquisition={() => setIsAcquisitionOpen(true)} />

      {/* Main Content Area */}
      <div className="pl-72">
        <main className="relative pt-20 w-full min-h-screen bg-background">
          {children}
        </main>
      </div>

      {/* Global Toast */}
      <Toast />

      {/* Global New Acquisition Modal */}
      <NewAcquisitionModal
        isOpen={isAcquisitionOpen}
        onClose={() => setIsAcquisitionOpen(false)}
      />
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LibraryProvider>
        <ShellInner>{children}</ShellInner>
      </LibraryProvider>
    </AuthProvider>
  );
}
