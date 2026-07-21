'use client';

import React from 'react';
import { LogOut, ChevronDown, User, Settings, Palette } from 'lucide-react';
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

export default function TopBar({ session, me, setTab, onLogout }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <span className="font-display text-lg font-bold tracking-tight">FRIENDS eLEAGUE</span>
      </div>
      <div className="flex items-center gap-4 relative">
        {session.type === 'admin' ? (
          <Badge color="var(--gold)">ADMIN</Badge>
        ) : me ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary transition-colors outline-none focus:ring-2 focus:ring-pitch-bright">
                <span className="text-xl">{me.avatar}</span>
                <span className="hidden sm:inline font-semibold text-sm">{me.name}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-xl rounded-xl">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{me.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{me.teamName}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setTab('profile')} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTab('settings')} className="cursor-pointer hover:bg-secondary focus:bg-secondary">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Theme</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {session.type === 'admin' && (
          <Btn variant="ghost" onClick={onLogout} className="p-2 h-9 w-9 text-muted-foreground hover:text-foreground" title="Log out">
            <LogOut size={16} />
          </Btn>
        )}
      </div>
    </div>
  );
}
