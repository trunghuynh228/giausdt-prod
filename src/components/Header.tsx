'use client';

import { useState, useEffect } from 'react';
import tetherLogo from '@/assets/tether-logo.svg';

export function Header() {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsAgo(prev => {
        if (prev >= 30) return 0; // Reset after 30s (data refetch)
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src={tetherLogo.src} alt="USDT" className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-foreground">Giá USDT</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Cập nhật {secondsAgo} giây trước
          </div>
        </div>
      </div>
    </header>
  );
}