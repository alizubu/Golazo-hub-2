'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, Bell, Trophy, Loader2 } from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import ThemeToggle from '@/app/components/shared/ThemeToggle';

export const TopBar = ({ session, me, items, pathname, handleNav, unreadCount, isLoggingOut, handleLogout }) => {
  const shouldReduceMotion = useReducedMotion();
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Desktop header is retained but updated to use the unified gradient border approach if needed,
  // but the prompt focused heavily on the mobile experience. We will update both.

  return (
    <>
      {/* --- DESKTOP HEADER --- */}
      <div className="hidden md:block sticky top-0 z-[60] w-full bg-background/90 backdrop-blur-2xl border-b border-border shadow-xl shadow-black/5">
        <div className="w-full flex items-center justify-between px-6 h-16 relative">
          
          {/* Logo */}
          <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-3 flex-shrink-0 z-10 min-w-0 outline-none">
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Trophy size={18} className="text-amber-400" />
            </div>
            <span className="hidden xl:inline font-heading text-base font-bold tracking-tight text-foreground whitespace-nowrap">
              GOLAZO HUB
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center gap-2 lg:gap-4 flex-1 min-w-0 px-4">
            {items.map((it) => {
              const Icon = it.icon;
              const active = it.matchRoot ? pathname === it.href : pathname.startsWith(it.href);
              return (
                <Link href={it.href} onClick={(e) => handleNav(e, it.href)}
                  key={it.href}
                  className={`relative px-4 py-2 h-10 flex items-center gap-2 rounded-full transition-all duration-300 outline-none flex-shrink-0 ${active ? 'bg-brand-green/10' : 'hover:bg-white/5'}`}
                >
                  <span className={`relative z-10 flex items-center gap-2 transition-colors ${active ? 'text-foreground font-semibold' : 'text-muted-foreground font-medium'}`}>
                    <Icon size={16} className={`flex-shrink-0 ${active ? 'text-brand-green' : 'text-muted-foreground'}`} />
                    <span>{it.label}</span>
                  </span>
                  {active && (
                    <motion.div
                      layoutId="desktop-nav-active-bg"
                      className="absolute inset-0 border border-brand-green/30 rounded-full"
                      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4 z-10 flex-shrink-0 ml-4">
            {me && (
              <>
                <ThemeToggle />
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 active:bg-secondary transition-colors outline-none"
                >
                  <motion.div
                    key={`bell-${unreadCount}`}
                    initial={{ rotate: 0 }}
                    animate={unreadCount > 0 && !shouldReduceMotion ? { rotate: [0, -15, 15, -15, 15, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                  >
                    <Bell size={20} />
                  </motion.div>
                  {unreadCount > 0 && (
                    <motion.div 
                      key={`badge-${unreadCount}`}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12 }}
                      className="absolute -top-0.5 -right-0.5 flex items-center justify-center z-10"
                    >
                      {!shouldReduceMotion && (
                        <span className="absolute w-5 h-5 rounded-full bg-rose-500 opacity-75 animate-ping" />
                      )}
                      <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-foreground text-[10px] font-bold border-2 border-zinc-950 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </motion.div>
                  )}
                </Link>

                <div className="w-[1px] h-6 bg-border mx-1" />

                <div className="relative p-[2px] rounded-full hover:scale-105 transition-transform cursor-pointer" style={{ background: 'conic-gradient(from 180deg, #38BDF8, #34D399, #38BDF8)' }}>
                  <div className="bg-background rounded-full p-[2px]">
                    <Avatar p={me} size={34} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-[2px] border-background rounded-full" />
                </div>
              </>
            )}
            
            <div className="w-[1px] h-6 bg-border mx-1" />

            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors outline-none"
            >
              {isLoggingOut ? <Loader2 size={20} className="animate-spin text-rose-500" /> : <LogOut size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE HEADER (DYNAMIC ISLAND) --- */}
      <div className="md:hidden fixed top-12 inset-x-0 z-[60] flex justify-center px-4 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <motion.div 
          layout
          initial={{ borderRadius: 32 }}
          className="bg-background/75 backdrop-blur-3xl border border-border/60 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.5)] flex items-center h-[52px] pointer-events-auto overflow-hidden px-1.5 gap-1.5"
        >
          {/* Left: Logo Icon */}
          <motion.div layout>
            <Link href="/dashboard" onClick={(e) => { handleNav(e, "/dashboard"); setIsMobileExpanded(false); }} className="flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 outline-none hover:bg-white/5 active:bg-white/10 transition-colors">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10">
                <Trophy size={16} className="text-amber-400" />
              </div>
            </Link>
          </motion.div>

          {/* Spacer when collapsed */}
          {!isMobileExpanded && <motion.div layout className="w-4" />}

          {/* Expanded Items */}
          <AnimatePresence>
            {isMobileExpanded && (
              <motion.div 
                layout
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap"
              >
                <ThemeToggle />

                <button 
                  onClick={() => { handleLogout(); setIsMobileExpanded(false); }} 
                  disabled={isLoggingOut} 
                  className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-rose-500 active:bg-rose-500/10 transition-colors outline-none flex-shrink-0"
                >
                  {isLoggingOut ? <Loader2 size={18} className="animate-spin text-foreground" /> : <LogOut size={18} />}
                </button>
                <div className="w-1" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right: Triggers (Always Visible) */}
          <motion.div layout className="flex items-center gap-1.5 ml-auto">
            {/* Glowing Ranking Button */}
            <Link href="/ranking" onClick={(e) => { handleNav(e, "/ranking"); setIsMobileExpanded(false); }} className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(251,191,36,0.7)] outline-none flex-shrink-0 mx-0.5">
              <div className="absolute inset-0 rounded-full animate-ping bg-amber-400/40" style={{ animationDuration: '2s' }}></div>
              <Trophy size={16} className="text-zinc-950 relative z-10" strokeWidth={2.5} />
            </Link>
            {!isMobileExpanded && (
              <Link href="/notifications" onClick={(e) => { handleNav(e, "/notifications"); setIsMobileExpanded(false); }} className="relative flex items-center justify-center w-10 h-10 rounded-full text-muted-foreground hover:text-foreground active:bg-secondary/50 outline-none transition-colors">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-[1.5px] border-background" />
                )}
              </Link>
            )}
            
            <button onClick={() => setIsMobileExpanded(!isMobileExpanded)} className="relative p-[2px] rounded-full outline-none flex-shrink-0 transition-transform active:scale-95 mx-0.5" style={{ background: 'conic-gradient(from 180deg, #38BDF8, #34D399, #38BDF8)' }}>
              <div className="bg-background rounded-full p-[1px]">
                <Avatar p={me} size={28} />
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-[1.5px] border-background rounded-full" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
