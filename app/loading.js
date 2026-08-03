'use client';

import React, { useEffect, useState } from 'react';

export default function GlobalLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Fake progress animation that slows down as it gets closer to 100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        // Fast at first, then slows down
        const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
        return Math.min(99, prev + increment);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#09090b] flex flex-col items-center justify-center z-[9999]">
      <div className="w-full max-w-xs px-8 flex flex-col items-center gap-8">
        {/* Logo/Icon Pulse */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 bg-pitch-bright rounded-full animate-ping opacity-20"></div>
          <img 
            src="/icons/golazohub.png" 
            alt="Golazo Hub" 
            className="w-full h-full object-contain relative z-10 drop-shadow-2xl animate-pulse"
          />
        </div>

        {/* Progress Bar Container */}
        <div className="w-full flex flex-col gap-3">
          <div className="flex justify-between items-end px-1">
            <span className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Loading App</span>
            <span className="text-pitch-bright font-score font-bold text-lg">{Math.floor(progress)}%</span>
          </div>
          
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-pitch-bright transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
