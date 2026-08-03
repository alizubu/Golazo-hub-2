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
    <>
      <style>{`
        .pwa-loader { display: none !important; }
        .web-loader { display: flex !important; }
        
        @media all and (display-mode: standalone) {
          .pwa-loader { display: flex !important; }
          .web-loader { display: none !important; }
        }
        @media all and (display-mode: fullscreen) {
          .pwa-loader { display: flex !important; }
          .web-loader { display: none !important; }
        }

        /* Custom shimmer animation for the progress bar */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite linear;
        }
      `}</style>

      {/* PWA Loading Screen */}
      <div className="pwa-loader fixed inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111827] via-[#09090b] to-[#000000] flex-col items-center justify-center z-[9999]">
        
        {/* Subtle background animated blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl animate-pulse delay-75"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-900/10 rounded-full blur-3xl animate-pulse delay-150"></div>

        <div className="w-full max-w-xs px-8 flex flex-col items-center gap-12 relative z-10">
          {/* Logo/Icon Area */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Expanding rings */}
              <div className="absolute inset-0 border-2 border-pitch-bright rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-pitch-bright/20 rounded-full blur-xl animate-pulse"></div>
              
              <img 
                src="/icons/golazohub.png" 
                alt="Golazo Hub" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(41,193,121,0.4)] transition-transform duration-1000 ease-out scale-105"
              />
            </div>
            
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white drop-shadow-md animate-pulse">
              GOLAZO HUB
            </h1>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full flex flex-col gap-3">
            <div className="flex justify-between items-end px-1">
              <span className="text-muted-foreground text-[10px] uppercase tracking-widest font-bold">Initializing</span>
              <span className="text-pitch-bright font-score font-bold text-lg drop-shadow-[0_0_5px_rgba(41,193,121,0.5)]">
                {Math.floor(progress)}%
              </span>
            </div>
            
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 relative">
              {/* The progress fill */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-600 via-pitch-bright to-emerald-400 transition-all duration-300 ease-out rounded-full shadow-[0_0_15px_rgba(41,193,121,0.8)]"
                style={{ width: `${progress}%` }}
              >
                {/* A light shimmer effect passing over the fill */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full h-full animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Web Loading Spinner */}
      <div className="web-loader flex-col items-center justify-center min-h-[50vh] gap-6 w-full">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-secondary border-t-pitch-bright rounded-full animate-spin"></div>
          <img src="/icons/golazohub.png" alt="Logo" className="w-8 h-8 object-contain opacity-50" />
        </div>
        <p className="font-heading text-sm font-bold tracking-widest text-muted-foreground uppercase animate-pulse">
          Loading Golazo Hub...
        </p>
      </div>
    </>
  );
}
