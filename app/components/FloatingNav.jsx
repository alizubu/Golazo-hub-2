'use client';
import Link from 'next/link';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  LogOut, Settings, Menu, Search, Bell, Trophy,
  Home, ListOrdered, Calendar, Swords, Users, Archive, Megaphone, Star, Loader2,
  History as HistoryIcon
} from 'lucide-react';
import { Badge, Btn, Avatar } from './UI';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/app/components/ui/command";
import { usePathname, useRouter } from 'next/navigation';
import { clearAuthCookie } from '@/app/actions/auth';

const playerTabs = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchRoot: true },
  { href: "/matches", label: "Matches", icon: Calendar },
  { href: "/players", label: "Roster", icon: Users },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/hall-of-fame", label: "Hall of Fame", icon: Star },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

const adminTabs = [
  { href: "/admin", label: "Dashboard", icon: Home, matchRoot: true },
  { href: "/admin/players", label: "Players", icon: Users },
  { href: "/admin/season", label: "Tournament", icon: Trophy },
  { href: "/admin/matches", label: "Matches", icon: Calendar },
  { href: "/admin/trophies", label: "Trophies", icon: Trophy },
  { href: "/hall-of-fame", label: "Hall of Fame", icon: Star },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

// Helper for the new mobile nav icons
const NavItemMobile = ({ href, icon: Icon, label, active, iconColor = "text-muted-foreground", onClick, hasLive }) => (
  <Link
    href={href}
    onClick={(e) => onClick(e, href)}
    className={`relative flex flex-col items-center justify-center w-full h-full gap-1.5 transition-colors outline-none group ${
      active ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-muted-foreground hover:text-white/80'
    }`}
  >
    <div className="relative">
      <Icon size={22} className={`transition-transform duration-300 ${active ? 'text-white scale-110' : `${iconColor} group-hover:scale-110`}`} />
      {hasLive && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#151B25] animate-pulse" />
      )}
    </div>
    <span className={`text-[10px] font-semibold transition-all duration-300 ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
    
    {active && (
      <motion.div 
        layoutId="mobile-nav-glow" 
        className="absolute inset-0 bg-white/5 rounded-2xl pointer-events-none" 
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </Link>
);

export default function FloatingNav({ session, me, players = [], notifications = [], matches = [] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const nextPathname = usePathname();
  const [pathname, setPathname] = useState(nextPathname || (typeof window !== 'undefined' ? window.location.pathname : ''));
  
  useEffect(() => {
    const handlePop = () => setPathname(window.location.pathname);
    const handleTabChange = (e) => setPathname('/' + e.detail.replace(/^\/+/, ''));
    
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    
    window.addEventListener('popstate', handlePop);
    window.addEventListener('tab-change', handleTabChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('tab-change', handleTabChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    const tabPath = href.replace(/^\/+/, '');
    window.history.pushState(null, '', `/${tabPath}`);
    window.dispatchEvent(new CustomEvent('tab-change', { detail: tabPath }));
  };

  const items = session?.type === "admin" ? adminTabs : playerTabs;

  // Scroll-linked blur/opacity
  const { scrollY } = useScroll();

  const unreadCount = notifications.filter(n => {
    if (!me?.lastReadNotificationAt) return true;
    return new Date(n.createdAt) > new Date(me.lastReadNotificationAt);
  }).length;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clearAuthCookie();
    window.location.href = '/login';
  };

  const hasLiveMatch = matches.some(m => m.status === 'live');

  // Admin sessions use the dedicated AdminSidebar + AdminTopBar instead
  if (session?.type === 'admin') return null;

  return (
    <>
      {/* Full-Width Header */}
      <div className="hidden md:block sticky top-0 z-[60] w-full">
        <motion.div
          className="w-full border-b border-white/10 shadow-lg flex items-center justify-between px-6 h-16 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.75))`,
            backdropFilter: `blur(16px)`,
          }}
          animate={{ backdropFilter: `blur(16px)` }}
        >
          {/* Subtle gradient shimmer border */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Logo */}
          <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-2 flex-shrink-0 z-10 min-w-0 outline-none">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
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
                    className="relative px-2 xl:px-3 py-1.5 h-16 flex items-center gap-1 lg:gap-1.5 text-xs lg:text-[13px] xl:text-sm font-semibold transition-colors whitespace-nowrap outline-none flex-shrink-0 focus-visible:ring-2 focus-visible:ring-pitch-bright"
                  >
                    <span
                      className="relative z-10 flex items-center gap-1.5 transition-colors"
                      style={{ color: active ? 'var(--pitch-bright, #29C179)' : 'hsl(var(--muted-foreground))' }}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      <span className={`${active ? 'font-bold' : ''}`}>{it.label}</span>
                    {(it.href === '/matches' || it.href === '/admin/matches') && hasLiveMatch && (
                      <span className="flex h-2 w-2 relative ml-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[3px] bg-pitch-bright shadow-[0_0_10px_rgba(41,193,121,0.6)]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 z-10 flex-shrink-0 ml-4">
            {me && (
              <>
                {/* Notification Bell */}
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright"
                  title="Alerts"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-claret text-white text-[9px] font-bold border-2 border-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-pitch-bright border border-white/5 group">
                      <span className="relative flex-shrink-0">
                        <Avatar p={me} size={24} ring="rgba(41, 193, 121, 0.5)" />
                        {/* Online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                      </span>
                      <span className="hidden sm:inline font-semibold text-xs text-white max-w-[80px] truncate">
                        {me.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-2xl rounded-xl mt-2 z-[70]">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none text-foreground">{me.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">@{me.username}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuGroup className="p-1">
                      <DropdownMenuItem asChild>
                        <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="cursor-pointer rounded-lg hover:bg-secondary focus:bg-secondary py-2 w-full flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <div className="p-1">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive py-2">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            </div>
        </motion.div>
      </div>

      {/* Mobile Nav Bar (Top Header) */}
      <div className="md:hidden sticky top-0 z-[60] w-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <motion.div 
          className="w-full border-b border-white/10 shadow-md flex items-center justify-between px-4 h-14 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.85))`,
            backdropFilter: `blur(16px)`,
          }}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          <Link href="/dashboard" onClick={(e) => handleNav(e, "/dashboard")} className="flex items-center gap-2 z-10 outline-none">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
            <span className="font-heading text-sm font-bold tracking-tight text-white">GOLAZO HUB</span>
          </Link>
          
          <div className="flex items-center gap-3 z-10">
            {me && (
              <>
                {/* Mobile Notification Bell */}
                <Link href="/notifications" onClick={(e) => handleNav(e, "/notifications")} className="relative flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white transition-colors outline-none">
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold border-2 border-[#151B25]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Mobile Avatar Link */}
                <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 overflow-hidden">
                  <Avatar p={me} size={32} />
                </Link>
              </>
            )}
            
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white transition-colors outline-none"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin text-white" /> : <LogOut size={18} />}
            </button>
          </div>
        </motion.div>
      </div>

      {/* NEW Stylized Floating Bottom Navigation Bar (Mobile) */}
      <div className="md:hidden fixed bottom-1 left-0 right-0 z-[60] pb-[env(safe-area-inset-bottom)] pointer-events-none h-[140px]">
        <div className="relative w-full h-full max-w-[500px] mx-auto pointer-events-auto">
          
          {/* SVG Background (Width 800 ensures it covers the screen even on very wide mobile devices, while keeping the curves mathematically perfect in the center) */}
          <svg 
            viewBox="0 0 800 140" 
            className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[800px] h-[140px]" 
            style={{ filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="nav-bg" x1="0" y1="0" x2="800" y2="0">
                <stop offset="0%" stopColor="#11161D" />
                <stop offset="50%" stopColor="#151B25" />
                <stop offset="100%" stopColor="#11161D" />
              </linearGradient>
              <linearGradient id="nav-border" x1="0" y1="0" x2="800" y2="0">
                <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="65%" stopColor="#22c55e" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 40 L 330 40 C 355 40, 360 80, 400 80 C 440 80, 445 40, 470 40 L 800 40 L 800 90 L 470 90 C 445 90, 440 130, 400 130 C 360 130, 355 90, 330 90 L 0 90 Z" 
              fill="url(#nav-bg)" 
              stroke="url(#nav-border)" 
              strokeWidth="1.5" 
            />
          </svg>

          {/* Left Side Buttons (Matches, Roster) */}
          <div className="absolute left-2 right-[calc(50%+40px)] top-[40px] h-[50px] flex justify-evenly items-center">
            <NavItemMobile 
              href="/matches" 
              icon={Calendar} 
              label="Matches" 
              active={pathname.startsWith('/matches')} 
              iconColor="text-red-400"
              hasLive={hasLiveMatch}
              onClick={handleNav}
            />
            <NavItemMobile 
              href="/players" 
              icon={Users} 
              label="Roster" 
              active={pathname.startsWith('/players')} 
              iconColor="text-white/60"
              onClick={handleNav}
            />
          </div>

          {/* Right Side Buttons (History, Settings) */}
          <div className="absolute right-2 left-[calc(50%+40px)] top-[40px] h-[50px] flex justify-evenly items-center">
            <NavItemMobile 
              href="/history" 
              icon={HistoryIcon} 
              label="History" 
              active={pathname.startsWith('/history')}
              iconColor="text-white/60" 
              onClick={handleNav}
            />
            <NavItemMobile 
              href="/settings" 
              icon={Settings} 
              label="Setting" 
              active={pathname.startsWith('/settings')} 
              iconColor="text-white/60"
              onClick={handleNav}
            />
          </div>

          {/* Center Top Floating Action Button (Dashboard) */}
          <Link 
            href="/dashboard"
            onClick={(e) => handleNav(e, "/dashboard")}
            className="absolute left-1/2 -translate-x-1/2 top-[4px] w-[68px] h-[68px] rounded-full bg-gradient-to-b from-white to-[#E2E8F0] border-[5px] border-[#0A0D14] shadow-[0_0_20px_rgba(255,255,255,0.2)] flex flex-col items-center justify-center gap-0.5 group z-20 outline-none hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Home size={24} className="text-slate-900 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
            </motion.div>
            <span className="text-[9px] font-black text-slate-900 tracking-tight">Dashboard</span>
          </Link>

          {/* Center Bottom Outset Button (Hall of Fame) */}
          <Link 
            href="/hall-of-fame"
            onClick={(e) => handleNav(e, "/hall-of-fame")}
            className="absolute left-1/2 -translate-x-1/2 top-[76px] w-[54px] h-[54px] rounded-full bg-gradient-to-br from-[#1A222D] to-[#0A0D14] border border-[#D9A93B]/40 shadow-[0_0_20px_rgba(217,169,59,0.15)] flex flex-col items-center justify-center gap-[2px] group z-10 outline-none hover:border-[#D9A93B]/80 hover:shadow-[0_0_25px_rgba(217,169,59,0.3)] transition-all duration-300"
          >
            <motion.div whileTap={{ scale: 0.9 }}>
              <Trophy size={16} className="text-[#D9A93B] group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(217,169,59,0.5)]" strokeWidth={2} />
            </motion.div>
            <span className="text-[7.5px] font-black text-[#D9A93B]/90 leading-[1] text-center tracking-tight">Hall of<br/>Fame</span>
          </Link>

        </div>
      </div>

      {/* Command Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 gap-0 w-screen h-screen sm:h-auto max-w-full sm:max-w-lg sm:rounded-xl bg-card border-border/50 sm:shadow-2xl overflow-hidden m-0 sm:border-solid z-[99999]">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <Command className="bg-transparent">
            <CommandInput placeholder="Search players, tabs..." className="h-12 text-sm border-b border-border/50 rounded-none" />
            <CommandList className="max-h-80 p-2">
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </CommandEmpty>
              <CommandGroup heading="Navigation">
                {items.map(it => {
                  const Icon = it.icon;
                  return (
                    <CommandItem
                      key={it.href}
                      value={it.label}
                      onSelect={() => { router.push(it.href); setSearchOpen(false); }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2"
                    >
                      <Icon size={15} className="text-muted-foreground" />
                      <span>{it.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {players.length > 0 && (
                <CommandGroup heading="Players">
                  {players.map(p => (
                    <CommandItem
                      key={p.id}
                      value={p.name}
                      onSelect={() => { router.push('/player/' + (p.username || p.id)); setSearchOpen(false); }}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2"
                    >
                      <Avatar p={p} size={24} />
                      <span className="font-semibold">{p.name}</span>
                      {p.teamName && <span className="text-xs text-muted-foreground ml-1">{p.teamName}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
