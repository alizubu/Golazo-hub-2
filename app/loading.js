'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function GlobalLoading() {
  // Player node positions (percentages for responsive absolute positioning)
  const nodes = [
    { x: '15%', y: '30%' },
    { x: '85%', y: '25%' },
    { x: '70%', y: '75%' },
    { x: '25%', y: '80%' },
    { x: '50%', y: '45%' },
  ];

  // Ball passing sequence coordinates
  const ballPathX = ['15%', '85%', '70%', '25%', '50%', '15%'];
  const ballPathY = ['30%', '25%', '75%', '80%', '45%', '30%'];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#080808] flex flex-col items-center justify-center overflow-hidden font-heading">
      
      {/* ─── TACTICAL PITCH BACKGROUND ─── */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Pitch Outline */}
        <div className="absolute w-[90%] h-[90%] max-w-4xl border-2 border-amber-500/10 rounded-xl" />
        {/* Halfway Line */}
        <div className="absolute w-full max-w-4xl h-0 border-t-2 border-amber-500/10" />
        {/* Center Circle */}
        <div className="absolute w-64 h-64 border-2 border-amber-500/10 rounded-full" />
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_30%,transparent_100%)]" />
      </div>

      {/* ─── RADAR SWEEP ─── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full pointer-events-none opacity-40 mix-blend-screen">
        <motion.div 
          className="w-full h-full rounded-full origin-center"
          style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(245,158,11,0.05) 85%, rgba(245,158,11,0.6) 100%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
        />
      </div>

      {/* ─── PLAYER NODES & PASSING BALL ─── */}
      <div className="absolute inset-0 max-w-4xl max-h-[800px] mx-auto my-auto pointer-events-none">
        {nodes.map((node, i) => (
          <div 
            key={i} 
            className="absolute w-3 h-3 bg-amber-500/40 border border-amber-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]"
            style={{ left: node.x, top: node.y, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse effect around nodes */}
            <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-30" />
          </div>
        ))}

        {/* The Ball */}
        <motion.div
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] z-10"
          style={{ transform: 'translate(-50%, -50%)' }}
          animate={{ 
            left: ballPathX, 
            top: ballPathY 
          }}
          transition={{ 
            duration: 5, 
            ease: "easeInOut", 
            repeat: Infinity 
          }}
        />
      </div>

      {/* ─── CENTRAL GOLAZO HUB & POSSESSION RING ─── */}
      <div className="relative z-20 flex flex-col items-center">
        <div className="relative w-44 h-44 flex items-center justify-center">
          
          {/* Animated Possession Ring (SVG) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="3" />
            {/* Progress Fill */}
            <motion.circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="rgba(245,158,11,1)" 
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="289" // 2 * pi * 46 ≈ 289
              initial={{ strokeDashoffset: 289 }}
              animate={{ strokeDashoffset: [289, 0] }}
              transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
            />
          </svg>

          {/* Central Hub Container */}
          <div className="relative w-28 h-28 bg-black border border-amber-500/40 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)] overflow-hidden">
            {/* Subtle inner grid in the logo box */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.15)_1px,transparent_1px)] bg-[size:8px_8px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
            <Trophy className="text-amber-500 w-12 h-12 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse" strokeWidth={1.5} />
          </div>
        </div>

        {/* ─── TYPOGRAPHY ─── */}
        <div className="mt-8 flex flex-col items-center">
          <div className="text-amber-500 font-black tracking-[0.4em] text-xl mb-3 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            GOLAZO HUB
          </div>
          <div className="text-amber-500/50 text-xs font-mono tracking-[0.3em] uppercase">
            Tactical Analysis in Progress...
          </div>
        </div>
      </div>

    </div>
  );
}
