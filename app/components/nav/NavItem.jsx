'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

export const NavItem = ({ item, active, onClick, hasLive }) => {
  const Icon = item.icon;
  const isGold = item.variant === 'gold';
  const shouldReduceMotion = useReducedMotion();



  // Spring configurations
  const pillTransition = shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 };
  const tapScale = shouldReduceMotion ? 1 : 0.85;

  return (
    <Link
      href={item.href}
      onClick={(e) => onClick(e, item.href)}
      className="relative flex flex-col items-center justify-center w-full h-full gap-1 outline-none group z-10"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Liquid Drop Indicator */}
      {active && (
        <motion.div
          layoutId="liquid-drop"
          className={`absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${
            isGold ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
          }`}
          transition={pillTransition}
        />
      )}

      {/* Persistent Gold Glow for Hall of Fame */}
      {isGold && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 shadow-gold-glow" />
        </div>
      )}

      <motion.div
        whileTap={{ scale: tapScale }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400 }}
        className="relative flex flex-col items-center justify-center gap-1 z-10"
      >
        <div className="relative">
          {isGold ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="gold-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FCD34D" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
              <Icon 
                size={24} 
                strokeWidth={active ? 2 : 1.75} 
                stroke="url(#gold-grad)" 
              />
            </svg>
          ) : (
            <motion.div
              animate={active && !shouldReduceMotion ? { y: [0, -4, 0] } : { y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Icon
                size={24}
                strokeWidth={active ? 2 : 1.75}
                className={`transition-colors duration-200 ${
                  active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-400'
                }`}
              />
            </motion.div>
          )}

          {/* Live Indicator */}
          {hasLive && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse" />
          )}
        </div>

        <span
          className={`text-[11px] font-medium tracking-tight transition-colors duration-200 ${
            active 
              ? (isGold ? 'text-amber-400' : 'text-white') 
              : 'text-zinc-500 group-hover:text-zinc-400'
          }`}
        >
          {item.label}
        </span>
      </motion.div>
    </Link>
  );
};
