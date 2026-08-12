'use client';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

export const BottomNav = ({ items, pathname, isActive, handleNav, hasLiveMatch }) => {
  const shouldReduceMotion = useReducedMotion();

  // Find the Dashboard (FAB) item and the side items (excluding ranking for mobile)
  const mobileItems = items.filter(item => item.id !== 'ranking');
  const fabItem = mobileItems.find(item => item.id === 'dashboard');
  const otherItems = mobileItems.filter(item => item.id !== 'dashboard');
  
  // Split into left (2) and right (2)
  const leftItems = otherItems.slice(0, 2);
  const rightItems = otherItems.slice(2, 4);

  return (
    <motion.div 
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut", type: "spring", damping: 25 }}
      className="md:hidden fixed bottom-5 inset-x-0 z-50 px-4 pb-[env(safe-area-inset-bottom)] pointer-events-none flex justify-center"
    >
      {/* Floating Glassmorphic Island */}
      <div className="relative w-full max-w-[420px] h-[72px] bg-background/75 backdrop-blur-2xl border border-border/60 rounded-full shadow-[0_15px_40px_-10px_rgba(0,0,0,0.4)] dark:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] pointer-events-auto flex items-center px-2">
        
        {/* Luminous top border reflection */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Left Items */}
        <div className="flex-1 flex items-center justify-around h-full pt-1">
          {leftItems.map(item => (
            <NavItem key={item.id} item={item} isActive={isActive} handleNav={handleNav} shouldReduceMotion={shouldReduceMotion} hasLiveMatch={item.id === 'matches' && hasLiveMatch} />
          ))}
        </div>

        {/* Center FAB Space */}
        <div className="w-[88px] h-full relative">
          {fabItem && (
            <Link
              href={fabItem.href}
              onClick={(e) => handleNav(e, fabItem.href)}
              className="absolute -top-7 left-1/2 -translate-x-1/2 w-[68px] h-[68px] bg-gradient-to-tr from-[#16a34a] to-[#4ade80] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(34,197,94,0.4)] outline-none group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* Inner glow on press */}
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity" />
              
              {/* Pulse rings if live match */}
              {hasLiveMatch && (
                <>
                  <div className="absolute -inset-2 rounded-full border-2 border-green-500/40 animate-ping opacity-60" style={{ animationDuration: '2s' }} />
                  <div className="absolute -inset-4 rounded-full border border-green-500/20 animate-pulse opacity-40" />
                </>
              )}
              
              <fabItem.icon size={28} className="text-foreground dark:text-zinc-950 drop-shadow-sm transition-transform group-active:scale-90" strokeWidth={2.5} />
            </Link>
          )}
        </div>

        {/* Right Items */}
        <div className="flex-1 flex items-center justify-around h-full pt-1">
          {rightItems.map(item => (
            <NavItem key={item.id} item={item} isActive={isActive} handleNav={handleNav} shouldReduceMotion={shouldReduceMotion} />
          ))}
        </div>

      </div>
    </motion.div>
  );
};

const NavItem = ({ item, isActive, handleNav, shouldReduceMotion, hasLiveMatch }) => {
  const active = isActive(item.href, item.matchRoot);
  const Icon = item.icon;
  const isGold = item.variant === 'gold';
  
  // Custom colors based on variant
  const colorClass = isGold ? 'text-amber-400' : 'text-zinc-50';
  const indicatorColor = isGold ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]' : 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]';

  return (
    <Link
      href={item.href}
      onClick={(e) => handleNav(e, item.href)}
      className="relative flex flex-col items-center justify-center w-full h-full outline-none group"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <motion.div
        whileTap={{ scale: 0.85 }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400 }}
        className="relative flex flex-col items-center justify-center gap-1 z-10 w-full"
      >
        <div className="relative">
          <Icon 
            size={24} 
            className={`transition-all duration-300 ${active ? colorClass : 'text-muted-foreground group-hover:text-muted-foreground'}`} 
            strokeWidth={active ? 2.5 : 2}
          />
          {hasLiveMatch && !active && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-950 animate-pulse" />
          )}
        </div>
        <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${active ? colorClass : 'text-muted-foreground group-hover:text-muted-foreground'}`}>
          {item.label}
        </span>
      </motion.div>

      {/* Sliding Underline Indicator with Framer Motion layoutId */}
      {active && (
        <motion.div
          layoutId="bottom-nav-indicator"
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full ${indicatorColor}`}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
};
