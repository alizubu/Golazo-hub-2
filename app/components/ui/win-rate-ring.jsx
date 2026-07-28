'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { NumberTicker } from './number-ticker';

export function WinRateRing({ value, isEmpty, emptyStateText, accentColor = 'emerald-500' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-2 py-2">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-white/5 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold font-mono text-white/20">
            —
          </div>
        </div>
        {emptyStateText && (
          <span className="text-xs font-mono tracking-tight text-white/40 italic">{emptyStateText}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-2 py-2">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0" ref={ref}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-white/10 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <motion.path 
            className={`text-${accentColor} stroke-current`} 
            strokeWidth="3" 
            strokeLinecap="round" 
            fill="none" 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            initial={{ strokeDasharray: "0, 100" }} 
            animate={isInView ? { strokeDasharray: `${value}, 100` } : { strokeDasharray: "0, 100" }} 
            transition={{ duration: 1.5, ease: "easeOut" }} 
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-bold font-mono tabular-nums text-white">
          {isInView ? <NumberTicker value={value} className="text-white" /> : '0'}%
        </div>
      </div>
    </div>
  );
}
