'use client';

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  LogOut, Settings, Menu, Search, Bell, Trophy,
  Home, ListOrdered, Calendar, Swords, Users, Archive, Megaphone
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

const playerTabs = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "matches", label: "Matches", icon: Calendar },
  { id: "players", label: "Roster", icon: Users },
  { id: "history", label: "History", icon: Archive },
  { id: "notifications", label: "Alerts", icon: Bell },
];

const adminTabs = [
  { id: "admin", label: "Overview", icon: Home },
  { id: "admin-players", label: "Players", icon: Users },
  { id: "admin-season", label: "Season", icon: Trophy },
  { id: "admin-matches", label: "Matches", icon: Calendar },
  { id: "admin-playoffs", label: "Playoffs", icon: Swords },
  { id: "admin-trophies", label: "Trophies", icon: Trophy },
  { id: "admin-announcements", label: "Announcements", icon: Megaphone },
];

export { playerTabs, adminTabs };

export default function FloatingNav({ session, me, tab, setTab, onLogout, players = [], notifications = [] }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const items = session?.type === "admin" ? adminTabs : playerTabs;

  // Scroll-linked blur/opacity
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.5, 0.85]);
  const blurAmount = useTransform(scrollY, [0, 80], [12, 24]);

  const unreadCount = notifications.filter(n => {
    if (!me?.lastReadNotificationAt) return true;
    return new Date(n.createdAt) > new Date(me.lastReadNotificationAt);
  }).length;

  const handleTabChange = (id) => {
    setTab(id);
    setSheetOpen(false);
  };

  // Search items: players + tabs
  const searchItems = [
    ...items.map(it => ({ type: 'nav', id: it.id, label: it.label, icon: it.icon })),
    ...players.map(p => ({ type: 'player', id: p.id, label: p.name, sub: p.teamName, avatar: p.avatar, avatarImage: p.avatarImage })),
  ];

  return (
    <>
      {/* Floating Pill Nav */}
      <div className="hidden md:block sticky top-0 z-50 w-full px-4 sm:px-6 pt-4 pb-2">
        <motion.div
          className="mx-auto max-w-6xl rounded-full border border-white/10 shadow-2xl flex items-center justify-between px-3 sm:px-5 py-2.5 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.6))`,
            backdropFilter: `blur(16px)`,
          }}
          animate={{ backdropFilter: `blur(16px)` }}
        >
          {/* Subtle gradient shimmer border */}
          <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0 z-10 min-w-0">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
            <span className="hidden lg:inline font-display text-sm font-bold tracking-tight text-white whitespace-nowrap">
              FRIENDS eLEAGUE
            </span>
          </div>

          {/* Desktop Center Nav Links */}
          <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2 z-10">
            {items.map((it) => {
              const Icon = it.icon;
              const active = tab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setTab(it.id)}
                  className="relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright"
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-pitch-bright/15 border border-pitch-bright/20"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span
                    className="relative z-10 flex items-center gap-1.5 transition-colors"
                    style={{ color: active ? 'var(--pitch-bright, #29C179)' : 'hsl(var(--muted-foreground))' }}
                  >
                    <Icon size={13} />
                    <span className={active ? 'font-bold' : ''}>{it.label}</span>
                  </span>
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-pitch-bright"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 z-10 flex-shrink-0">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright"
              title="Search"
            >
              <Search size={15} />
            </button>

            {/* Admin: ADMIN badge + logout */}
            {session?.type === 'admin' ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-gold/40 text-gold bg-gold/10">
                  ADMIN
                </span>
                <button
                  onClick={() => setTab('admin-settings')}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none"
                  title="Admin Settings"
                >
                  <Settings size={15} />
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors border border-border/50 outline-none"
                  title="Log out"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : me ? (
              <>
                {/* Notification Bell */}
                <button
                  onClick={() => setTab('notifications')}
                  className="relative flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright"
                  title="Alerts"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-claret text-white text-[9px] font-bold border-2 border-background">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Avatar Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors outline-none focus:ring-2 focus:ring-pitch-bright border border-white/5 group">
                      <span className="relative flex-shrink-0">
                        {me.avatarImage ? (
                          <img
                            src={me.avatarImage}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-pitch-bright/50"
                            alt={me.name}
                          />
                        ) : (
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-base leading-none ring-1 ring-pitch-bright/50">
                            {me.avatar || '👤'}
                          </span>
                        )}
                        {/* Online dot */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-background rounded-full" />
                      </span>
                      <span className="hidden sm:inline font-semibold text-xs text-white max-w-[80px] truncate">
                        {me.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-2xl rounded-xl mt-2">
                    <DropdownMenuLabel className="font-normal p-3">
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm font-semibold leading-none text-foreground">{me.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">@{me.username}</p>
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
              </>
            ) : null}

            </div>
        </motion.div>
      </div>

      {/* Mobile Nav Bar (Floating Pill style) */}
      <div className="md:hidden sticky top-0 z-50 w-full px-3 pt-3 pb-2" style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
        <motion.div 
          className="mx-auto max-w-full rounded-full border border-white/10 shadow-2xl flex items-center justify-between px-4 py-2 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.85))`,
            backdropFilter: `blur(16px)`,
          }}
        >
          {/* Subtle gradient shimmer border */}
          <div className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700" />
          </div>

          <div className="flex items-center gap-2 z-10">
            <span className="text-xl leading-none drop-shadow-sm">🏆</span>
            <span className="font-display text-sm font-bold tracking-tight text-white">FRIENDS eLEAGUE</span>
          </div>
          
          <div className="flex items-center gap-1 z-10">
            <button onClick={() => setSearchOpen(true)} className="flex items-center justify-center w-9 h-9 text-muted-foreground hover:text-white rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright">
              <Search size={18} />
            </button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright">
                    <Menu size={18} />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] bg-card border-r border-border/50 p-0">
                  <SheetHeader className="p-5 pb-3 border-b border-border/30">
                    <SheetTitle className="font-display text-lg tracking-tight flex items-center gap-2">
                      <span>🏆</span> FRIENDS eLEAGUE
                    </SheetTitle>
                    {me && (
                      <div className="flex items-center gap-2 mt-2">
                        {me.avatarImage ? (
                          <img src={me.avatarImage} className="w-8 h-8 rounded-full object-cover" alt={me.name} />
                        ) : (
                          <span className="text-xl">{me.avatar || '👤'}</span>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{me.name}</p>
                          <p className="text-xs text-muted-foreground truncate">@{me.username}</p>
                        </div>
                      </div>
                    )}
                  </SheetHeader>
                  <div className="flex flex-col gap-1 p-3">
                    {items.map((it) => {
                      const Icon = it.icon;
                      const active = tab === it.id;
                      return (
                        <button
                          key={it.id}
                          onClick={() => handleTabChange(it.id)}
                          className={`flex items-center gap-3 px-4 py-4 min-h-[44px] rounded-xl text-sm font-semibold transition-all text-left w-full ${
                            active
                              ? 'bg-pitch-bright/15 text-pitch-bright border border-pitch-bright/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                          }`}
                        >
                          <Icon size={17} />
                          {it.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="absolute bottom-6 left-3 right-3 flex flex-col gap-2">
                    <div className="h-px bg-border/30" />
                    <button
                      onClick={() => { onLogout(); setSheetOpen(false); }}
                      className="flex items-center gap-3 px-4 py-4 min-h-[44px] rounded-xl text-sm font-semibold text-destructive hover:bg-destructive/10 transition-all w-full"
                    >
                      <LogOut size={17} />
                      Log out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
          </div>
        </motion.div>
      </div>


      {/* Command Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 gap-0 w-screen h-screen sm:h-auto max-w-full sm:max-w-lg sm:rounded-xl bg-card border-border/50 sm:shadow-2xl overflow-hidden m-0 sm:border-solid">
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
                      key={it.id}
                      value={it.label}
                      onSelect={() => { setTab(it.id); setSearchOpen(false); }}
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
                      onSelect={() => setSearchOpen(false)}
                      className="flex items-center gap-2 rounded-lg cursor-pointer py-2"
                    >
                      {p.avatarImage ? (
                        <img src={p.avatarImage} className="w-6 h-6 rounded-full object-cover" alt={p.name} />
                      ) : (
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-secondary text-sm">
                          {p.avatar || '👤'}
                        </span>
                      )}
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
