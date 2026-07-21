'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, ChevronDown, Settings, Menu,
  Trophy, Home, ListOrdered, Calendar, Swords, Users, Archive, Bell
} from 'lucide-react';
import { Badge, Btn } from './UI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet";

const playerTabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "standings", label: "Standings", icon: ListOrdered },
  { id: "matches", label: "Matches", icon: Calendar },
  { id: "playoffs", label: "Playoffs", icon: Swords },
  { id: "players", label: "Roster", icon: Users },
  { id: "history", label: "History", icon: Archive },
  { id: "notifications", label: "Alerts", icon: Bell },
];

const adminTabs = [
  { id: "admin", label: "Overview", icon: Home },
  { id: "admin-players", label: "Players", icon: Users },
  { id: "admin-tournament", label: "Tournament", icon: Trophy },
  { id: "admin-matches", label: "Matches", icon: Calendar },
  { id: "admin-playoffs", label: "Playoffs", icon: Swords },
  { id: "admin-settings", label: "Settings", icon: Settings },
];

export default function FloatingNav({ session, me, tab, setTab, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const items = session?.type === "admin" ? adminTabs : playerTabs;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-50 w-full px-4 sm:px-6 pt-4 transition-all duration-300 ${scrolled ? 'pb-4' : 'pb-2'}`}>
      <motion.div 
        className="mx-auto max-w-6xl rounded-full border border-white/10 bg-black/60 shadow-lg backdrop-blur-xl transition-all duration-300 flex items-center justify-between px-4 py-2.5 relative overflow-hidden group"
      >
        {/* Magic UI Shine Border Effect (subtle) */}
        <div className="pointer-events-none absolute inset-0 rounded-full border border-transparent bg-[linear-gradient(110deg,transparent_10%,var(--border)_30%,transparent_50%)] bg-[length:200%_100%] animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Logo Section */}
        <div className="flex items-center gap-2 flex-shrink-0 z-10">
          <span className="text-xl leading-none">🏆</span>
          <span className="hidden lg:inline font-display text-lg font-bold tracking-tight text-white">FRIENDS eLEAGUE</span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 z-10">
          {items.map((it) => {
            const Icon = it.icon; 
            const active = tab === it.id;
            return (
              <button 
                key={it.id} 
                onClick={() => setTab(it.id)} 
                className="relative px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap outline-none"
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'var(--pitch-bright)', opacity: 0.15 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5" style={{ color: active ? 'var(--pitch-bright)' : 'var(--muted-foreground)' }}>
                  <Icon size={14} className={active ? 'text-pitch-bright' : 'text-muted-foreground'} />
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Nav Links & Actions */}
        <div className="flex items-center gap-3 z-10 flex-shrink-0">
          {/* Mobile Sheet Menu */}
          <div className="block md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Btn variant="ghost" className="p-2 h-9 w-9 text-muted-foreground hover:text-white rounded-full">
                  <Menu size={18} />
                </Btn>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-card border-r-border/50">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle className="font-display text-xl tracking-tight flex items-center gap-2">
                    <span>🏆</span> FRIENDS eLEAGUE
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2">
                  {items.map((it) => {
                    const Icon = it.icon; 
                    const active = tab === it.id;
                    return (
                      <SheetTrigger asChild key={it.id}>
                        <button 
                          onClick={() => setTab(it.id)} 
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all-fast"
                          style={{ 
                            background: active ? 'var(--surface-3)' : 'transparent', 
                            color: active ? 'var(--pitch-bright)' : 'var(--text-dim)',
                            border: `1px solid ${active ? 'var(--border-light)' : 'transparent'}`
                          }}
                        >
                          <Icon size={18} /> {it.label}
                        </button>
                      </SheetTrigger>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* User Dropdown / Admin Badge */}
          {session?.type === 'admin' ? (
            <div className="flex items-center gap-3">
              <Badge color="var(--gold)">ADMIN</Badge>
              <Btn variant="ghost" onClick={onLogout} className="p-2 h-9 w-9 text-muted-foreground hover:text-white rounded-full border border-border/50" title="Log out">
                <LogOut size={16} />
              </Btn>
            </div>
          ) : me ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-pitch-bright border border-white/5">
                  <span className="text-xl leading-none">{me.avatarImage ? <img src={me.avatarImage} className="w-6 h-6 rounded-full object-cover" /> : me.avatar}</span>
                  <span className="hidden sm:inline font-semibold text-sm text-white">{me.name}</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-2xl rounded-xl">
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">{me.name}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{me.teamName}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem onClick={() => setTab('settings')} className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary py-2">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-1">
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
