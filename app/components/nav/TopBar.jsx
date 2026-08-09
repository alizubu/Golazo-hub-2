'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { LogOut, Settings, Bell, Trophy, Loader2, Menu, X } from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import ThemeToggle from '@/app/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';

export const TopBar = ({ session, me, items, pathname, handleNav, unreadCount, isLoggingOut, handleLogout }) => {
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center z-10">
                      <span className="absolute w-5 h-5 rounded-full bg-rose-500 opacity-75 animate-ping" />
                      <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-foreground text-[10px] font-bold border-2 border-zinc-950 shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
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

      {/* --- MOBILE HEADER --- */}
      <div className="md:hidden sticky top-0 z-[60] w-full bg-background/90 backdrop-blur-2xl" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="w-full flex items-center justify-between px-4 h-14 relative">
          
          {/* 1px Gradient Bottom Border */}
          <div className="absolute bottom-0 inset-x-0 h-[1px] bg-brand-gradient" />

          <div className="flex items-center gap-3 z-10">
            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center justify-center p-1 -ml-1 text-foreground active:scale-95 transition-transform outline-none"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-2 outline-none">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/10">
                <Trophy size={14} className="text-amber-400" />
              </div>
              <span className="font-heading text-sm font-bold tracking-tight text-foreground">GOLAZO HUB</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3 z-10">
            {me && (
              <>
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")} className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-foreground active:bg-secondary/50 transition-colors outline-none">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 flex items-center justify-center">
                      {!shouldReduceMotion && (
                        <span className="absolute w-4 h-4 rounded-full bg-rose-500 opacity-75 animate-ping" style={{ animationDuration: '2s' }} />
                      )}
                      <span className="relative flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-foreground text-[9px] font-bold border-[1.5px] border-zinc-950">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </Link>

                <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="relative p-[2px] rounded-full outline-none" style={{ background: 'conic-gradient(from 180deg, #38BDF8, #34D399, #38BDF8)' }}>
                  <div className="bg-background rounded-full p-[1px]">
                    <Avatar p={me} size={28} />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-[1.5px] border-background rounded-full" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* --- MOBILE NAVIGATION DRAWER --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-background border-r border-border z-[80] shadow-2xl flex flex-col"
              style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10">
                    <Trophy size={16} className="text-amber-400" />
                  </div>
                  <span className="font-heading text-sm font-bold tracking-tight">GOLAZO HUB</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
                {items.map(it => {
                  const Icon = it.icon;
                  const active = it.matchRoot ? pathname === it.href : pathname.startsWith(it.href);
                  return (
                    <Link
                      key={it.href}
                      href={it.href}
                      onClick={(e) => {
                        handleNav(e, it.href);
                        setMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                        active ? "bg-brand-green/10 text-foreground font-bold" : "text-muted-foreground font-medium hover:bg-secondary/50"
                      )}
                    >
                      <Icon size={20} className={active ? "text-brand-green" : "text-muted-foreground"} />
                      <span>{it.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                >
                  {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
