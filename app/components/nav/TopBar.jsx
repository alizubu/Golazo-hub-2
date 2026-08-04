'use client';
import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { LogOut, Settings, Bell, Trophy, Loader2 } from 'lucide-react';
import { Avatar } from '../UI';

export const TopBar = ({ session, me, items, pathname, handleNav, unreadCount, isLoggingOut, handleLogout }) => {
  const shouldReduceMotion = useReducedMotion();

  // Desktop header is retained but updated to use the unified gradient border approach if needed,
  // but the prompt focused heavily on the mobile experience. We will update both.

  return (
    <>
      {/* --- DESKTOP HEADER --- */}
      <div className="hidden md:block sticky top-0 z-[60] w-full bg-zinc-950/70 backdrop-blur-2xl">
        <div className="w-full flex items-center justify-between px-6 h-16 relative">
          
          {/* 1px Gradient Bottom Border */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-brand-gradient" />

          {/* Logo */}
          <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-2 flex-shrink-0 z-10 min-w-0 outline-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10">
              <Trophy size={16} className="text-amber-400" />
            </div>
            <span className="hidden xl:inline font-heading text-sm font-bold tracking-tight text-white whitespace-nowrap">
              GOLAZO HUB
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center lg:justify-around flex-1 min-w-0 px-2 lg:px-6">
            {items.map((it) => {
              const Icon = it.icon;
              const active = it.matchRoot ? pathname === it.href : pathname.startsWith(it.href);
              return (
                <Link href={it.href} onClick={(e) => handleNav(e, it.href)}
                  key={it.href}
                  className="relative px-2 xl:px-3 py-1.5 h-16 flex items-center gap-1.5 text-xs lg:text-[13px] xl:text-sm font-semibold transition-colors whitespace-nowrap outline-none flex-shrink-0"
                >
                  <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${active ? 'text-brand-green' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    <Icon size={14} className="flex-shrink-0" />
                    <span className={`${active ? 'font-bold' : ''}`}>{it.label}</span>
                  </span>
                  {active && (
                    <motion.div
                      layoutId="desktop-nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-gradient rounded-t-full shadow-[0_-2px_10px_rgba(52,211,153,0.5)]"
                      transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3 z-10 flex-shrink-0 ml-4">
            {me && (
              <>
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-white active:bg-white/5 transition-colors outline-none"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      <span className="absolute w-4 h-4 rounded-full bg-rose-500 opacity-75 animate-ping" />
                      <span className="relative flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white text-[9px] font-bold border border-zinc-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </Link>

                <div className="relative p-[2px] rounded-full" style={{ background: 'conic-gradient(from 180deg, #38BDF8, #34D399, #38BDF8)' }}>
                  <div className="bg-zinc-950 rounded-full p-[2px]">
                    <Avatar p={me} size={32} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-[2px] border-zinc-950 rounded-full" />
                </div>
              </>
            )}
            
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-white transition-colors outline-none"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin text-white" /> : <LogOut size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden sticky top-0 z-[60] w-full bg-zinc-950/70 backdrop-blur-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="w-full flex items-center justify-between px-4 h-14 relative">
          
          {/* 1px Gradient Bottom Border */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-brand-gradient" />

          {/* Logo */}
          <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-2 z-10 outline-none">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10">
              <Trophy size={14} className="text-amber-400" />
            </div>
            <span className="font-heading text-sm font-bold tracking-tight text-white">GOLAZO HUB</span>
          </Link>
          
          <div className="flex items-center gap-4 z-10">
            {me && (
              <>
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")} className="relative flex items-center justify-center w-8 h-8 rounded-full text-zinc-500 hover:text-white active:bg-white/5 transition-colors outline-none">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      {!shouldReduceMotion && (
                        <span className="absolute w-4 h-4 rounded-full bg-rose-500 opacity-75 animate-ping" style={{ animationDuration: '2s' }} />
                      )}
                      <span className="relative flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white text-[9px] font-bold border-[1.5px] border-zinc-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </Link>

                <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="relative p-[2px] rounded-full outline-none" style={{ background: 'conic-gradient(from 180deg, #38BDF8, #34D399, #38BDF8)' }}>
                  <div className="bg-zinc-950 rounded-full p-[1px]">
                    <Avatar p={me} size={28} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-[1.5px] border-zinc-950 rounded-full" />
                </Link>
              </>
            )}
            
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center text-zinc-500 hover:text-white active:scale-95 transition-all outline-none"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin text-white" /> : <LogOut size={18} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
