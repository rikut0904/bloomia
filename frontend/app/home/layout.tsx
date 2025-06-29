'use client';

import '@/styles/app.css';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  if (!mounted) return null;

  return (
    <SessionProvider>{children}</SessionProvider>
  );
}
