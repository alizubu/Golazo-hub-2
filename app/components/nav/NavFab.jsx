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
      className="absolute left-1/2 -translate-x-1/2 -top-7 z-20 outline-none group"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        animate={idleAnimation}
        whileTap={{ scale: tapScale }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center relative ${
          active ? 'shadow-fab-glow' : 'shadow-lg'
        } transition-shadow duration-300`}
      >
        {/* Glossy Fill with Top-Left Highlight */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white via-white to-sky-50 overflow-hidden">
          <div className="absolute -inset-1 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.8),transparent_50%)] pointer-events-none" />
        </div>

        {/* Gradient Ring Border (using a pseudo-element style mask approach) */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            padding: '2px',
            background: 'linear-gradient(135deg, #38BDF8 0%, #34D399 100%)',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Icon */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-0.5">
          <Icon 
            size={24} 
            strokeWidth={active ? 2.5 : 2} 
            className="text-zinc-900 transition-all duration-300"
            fill={active ? "currentColor" : "none"}
          />
        </div>
      </motion.div>
    </Link>
  );
};
