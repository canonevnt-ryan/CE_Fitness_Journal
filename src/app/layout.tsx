
import './globals.css';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import { FirebaseClientProvider } from '@/firebase';
import { SettingsProvider } from '@/context/SettingsContext';
import { AppThemeManager } from '@/components/AppThemeManager';

export const metadata: Metadata = {
  title: 'FitFlow',
  description: 'Track your fitness journey with FitFlow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      {/* Base classes that are safe for SSR */}
      <body className={cn('font-body antialiased')}>
        <FirebaseClientProvider>
          <SettingsProvider>
            <AppThemeManager />
            <Header />
            <main className="container mx-auto max-w-7xl px-4 py-8">
              {children}
            </main>
            <Toaster />
          </SettingsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
