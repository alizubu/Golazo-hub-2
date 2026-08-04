'use client';

import React from 'react';
import { Trophy } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="min-h-[100dvh] w-full bg-[#0B0E14] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(31,138,92,0.1)_0%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pitch-bright/10 rounded-full blur-[80px] animate-pulse pointer-events-none" />

      {/* Loader Container */}
      <div className="relative z-10 flex flex-col items-center gap-10">
        
        {/* Animated Icon */}
        <div className="relative">
          {/* Outer glowing rings */}
          <div className="absolute inset-[-20px] border-[1.5px] border-gold/20 rounded-2xl animate-ping" style={{ animationDuration: '3s' }} />
          
          {/* Spinning dashed ring */}
          <div className="absolute inset-[-35px] border border-dashed border-pitch-bright/25 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
          
          {/* Central Logo Box */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-[0_0_40px_rgba(217,169,59,0.15)] backdrop-blur-md">
             <Trophy size={38} className="text-[#D9A93B]" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="font-heading text-lg font-black tracking-[0.25em] text-white/90 uppercase">
            Golazo Hub
          </h2>
          
          {/* Elegant dot indicator */}
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 bg-[#29C179] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-[#29C179] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-[#29C179] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

      </div>
    </div>
  );
}
