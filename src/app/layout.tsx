import type { Metadata } from 'next';
import './globals.css';
import ClientShell from '@/components/ClientShell';

export const metadata: Metadata = {
  title: 'Lore & Ledger — Archival Library Register & Scriptorium',
  description: 'An evocative synthesis of an antique collegiate archive and functional modern administrative ledger.',
  icons: {
    icon: '/images/crest.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=EB+Garamond:ital,wght@0,400..800;1,400..800&family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-surface antialiased selection:bg-secondary/30 selection:text-primary">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
