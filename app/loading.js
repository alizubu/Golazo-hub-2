'use client';

import React from 'react';
import { Trophy, Activity, Zap } from 'lucide-react';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#f0f9ff] dark:bg-[#050505] flex flex-col items-center justify-center overflow-hidden transition-colors duration-700">
      
      {/* Dark Mode Specific Background Effects */}
      <div className="absolute inset-0 hidden dark:block">
        {/* Deep grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
        
        {/* Radar sweeping effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-amber-500/10 animate-[ping_4s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-amber-500/20" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] origin-top-left animate-[spin_3s_linear_infinite] bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
      </div>

      {/* Light Mode Specific Background Effects */}
      <div className="absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#dcfce7]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(41,193,121,0.25)_0%,transparent_100%)] pointer-events-none" />
      </div>

      {/* Central Loader */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Hexagon rotating */}
          <div className="absolute inset-0 border-2 border-emerald-500/30 dark:border-amber-500/30 rounded-3xl rotate-45 animate-[spin_8s_linear_infinite]" />
          <div className="absolute inset-2 border-2 border-dashed border-emerald-500/50 dark:border-amber-500/50 rounded-2xl -rotate-45 animate-[spin_6s_linear_infinite_reverse]" />
          
          <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 p-5 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] dark:shadow-[0_0_50px_rgba(245,158,11,0.25)]">
            <Trophy className="text-emerald-600 dark:text-amber-500 w-12 h-12 animate-pulse" />
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <h2 className="text-xl font-black tracking-[0.3em] uppercase text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500 dark:text-amber-500 animate-pulse" />
            Golazo Hub
            <Zap className="w-5 h-5 text-emerald-500 dark:text-amber-500 animate-pulse" />
          </h2>
          
          {/* Cyberpunk Loading Bar for dark mode */}
          <div className="w-48 h-1.5 mt-2 bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden relative shadow-inner">
            <div className="absolute inset-y-0 left-0 bg-emerald-500 dark:bg-amber-500 w-[40%] rounded-full animate-[ping_1.5s_ease-in-out_infinite] opacity-50" />
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 to-emerald-600 dark:from-amber-400 dark:to-orange-500 w-[60%] rounded-full animate-[pulse_1s_ease-in-out_infinite] shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
