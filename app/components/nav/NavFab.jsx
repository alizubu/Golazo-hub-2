'use client';
import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export const NavFab = ({ item, active, onClick }) => {
  const Icon = item.icon;
  const shouldReduceMotion = useReducedMotion();

  // Breathing animation (only when inactive or if we just always want it idle breathing)
  // "gentle idle breathing scale loop"
  const idleAnimation = shouldReduceMotion ? {} : {
    scale: [1, 1.03, 1],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    }
  };

  const tapScale = shouldReduceMotion ? 1 : 0.92;

  return (
    <Link
      href={item.href}
      onClick={(e) => onClick(e, item.href)}
      className="absolute left-1/2 -translate-x-1/2 top-1.5 z-20 outline-none group flex flex-col items-center justify-center w-14 h-14"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        animate={idleAnimation}
        whileTap={{ scale: tapScale }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400 }}
        className="w-full h-full rounded-full flex items-center justify-center relative"
      >
        {/* Liquid Drop Indicator */}
        {active && (
          <motion.div
            layoutId="liquid-drop"
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)] z-30"
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {/* Soft backdrop glow to make it pop inside the dark glass wave */}
        <div className={`absolute inset-0 rounded-full transition-opacity duration-500 blur-md ${active ? 'bg-sky-400/30' : 'bg-transparent group-hover:bg-white/10'}`} />

        {/* The Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Icon 
            size={28} 
            strokeWidth={active ? 2.5 : 2} 
            className={`transition-all duration-300 ${active ? 'text-foreground' : 'text-muted-foreground group-hover:text-zinc-200'}`}
            fill={active ? "currentColor" : "none"}
          />
        </div>
      </motion.div>
    </Link>
  );
};
