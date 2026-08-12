'use client';

import React from 'react';
import { Hexagon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#020202] flex flex-col items-center justify-center overflow-hidden">
      
      {/* ─── STADIUM FLOODLIGHTS (Cinematic Sweeping Beams) ─── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center">
        {/* Left Floodlight */}
        <motion.div 
          className="absolute -top-32 -left-32 w-[300px] h-[150vh] bg-gradient-to-b from-amber-200/20 via-amber-500/5 to-transparent blur-[80px] origin-top"
          animate={{ rotate: [-20, 10, -20], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        />
        {/* Right Floodlight */}
        <motion.div 
          className="absolute -top-32 -right-32 w-[300px] h-[150vh] bg-gradient-to-b from-amber-200/20 via-amber-500/5 to-transparent blur-[80px] origin-top"
          animate={{ rotate: [20, -10, 20], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 7, ease: "easeInOut", repeat: Infinity, delay: 1 }}
        />
        {/* Center Spotlight */}
        <motion.div 
          className="absolute -top-10 w-[400px] h-[100vh] bg-gradient-to-b from-white/10 via-amber-500/10 to-transparent blur-[100px]"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
        />
      </div>

      {/* ─── AMBIENT PITCH GRID ─── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_10%,transparent_100%)]" />

      {/* ─── 3D WIREFRAME BALL ─── */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          {/* Outer Orbit */}
          <motion.div 
            className="absolute inset-0 border border-amber-500/30 rounded-full"
            animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            style={{ transformStyle: "preserve-3d" }}
          />
          
          {/* Inner Orbit (Dashed) */}
          <motion.div 
            className="absolute inset-2 border-2 border-dashed border-amber-500/40 rounded-full"
            animate={{ rotateX: [360, 0], rotateZ: [0, 360] }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
            style={{ transformStyle: "preserve-3d" }}
          />

          {/* The Core Hexagon (Football panel) */}
          <motion.div 
            className="relative bg-black/50 backdrop-blur-md p-4 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.4)] border border-amber-500/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          >
            <Hexagon className="text-amber-500 w-10 h-10" strokeWidth={1.5} />
            <Sparkles className="absolute top-2 right-2 text-white/50 w-3 h-3 animate-ping" />
          </motion.div>
        </div>

        {/* ─── TYPOGRAPHY ─── */}
        <div className="mt-12 flex flex-col items-center gap-4">
          <motion.div 
            className="flex items-center gap-3 text-2xl font-black tracking-[0.4em] text-white/90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          >
            {['G','O','L','A','Z','O'].map((letter, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity, repeatDelay: 3 }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>
          
          {/* ─── THE BURNING FUSE PROGRESS BAR ─── */}
          <div className="w-64 h-1 bg-white/5 rounded-full relative overflow-hidden mt-2">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 via-amber-400 to-white shadow-[0_0_20px_rgba(245,158,11,1)]"
              initial={{ width: "0%", x: "-100%" }}
              animate={{ width: "50%", x: "200%" }}
              transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
            />
          </div>
        </div>
      </div>

    </div>
  );
}
