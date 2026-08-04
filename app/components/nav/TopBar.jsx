'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { LogOut, Settings, Bell, Loader2 } from 'lucide-react';
import { Avatar } from '../UI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function TopBar({
  session,
  me,
  items,
  pathname,
  handleNav,
  hasLiveMatch,
  unreadCount,
  isLoggingOut,
  handleLogout
}) {
  return (
    <>
      {/* Desktop Header */}
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

      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-[60] w-full" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <motion.div 
          className="w-full border-b border-white/10 shadow-md flex items-center justify-between px-4 h-14 relative overflow-hidden"
          style={{
            backgroundColor: `rgba(10, 14, 20, var(--nav-opacity, 0.85))`,
            backdropFilter: `blur(16px)`,
          }}
        >
          {/* Subtle gradient shimmer border */}
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
                <Link href="/settings" onClick={(e) => handleNav(e, "/settings")} className="flex items-center justify-center w-8 h-8 rounded-full ring-2 ring-offset-2 ring-offset-[#0A0E14] ring-[#29C179]/50 overflow-hidden outline-none">
                  <Avatar p={me} size={32} />
                </Link>
              </>
            )}
            
            <button 
              onClick={handleLogout} 
              disabled={isLoggingOut} 
              className="flex items-center justify-center w-8 h-8 rounded-full text-muted-foreground hover:text-white transition-colors outline-none ml-1"
            >
              {isLoggingOut ? <Loader2 size={18} className="animate-spin text-white" /> : <LogOut size={18} />}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
