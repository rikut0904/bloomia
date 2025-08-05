'use client';

import '@/styles/app.css';
import React from 'react';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme');
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }, []);

    if (!mounted) return null;

    return (
        <div className="admin-layout">
            {children}
        </div>
    );
}