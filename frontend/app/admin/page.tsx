'use client';

import '@/styles/app.css';
import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status]);

  return (
    <main className="bg-background text-foreground">
      
    </main>
  );
}