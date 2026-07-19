'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User, Settings, Palette } from 'lucide-react';
import { Badge, Btn } from './UI';
import { AnimatePresence, motion } from 'framer-motion';

export default function TopBar({ session, me, setTab, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border bg-background/80 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <span className="text-xl">🏆</span>
        <span className="font-display text-lg font-bold tracking-tight">FRIENDS eLEAGUE</span>
      </div>
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        {session.type === 'admin' ? (
          <Badge color="var(--gold)">ADMIN</Badge>
        ) : me ? (
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-secondary transition-colors"
          >
            <span className="text-xl">{me.avatar}</span>
            <span className="hidden sm:inline font-semibold text-sm">{me.name}</span>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
        ) : null}

        {session.type === 'admin' && (
          <Btn variant="ghost" onClick={onLogout} className="p-2 h-9 w-9 text-muted-foreground hover:text-foreground" title="Log out">
            <LogOut size={16} />
          </Btn>
        )}

        <AnimatePresence>
          {menuOpen && me && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 w-48 rounded-xl bg-card border border-border shadow-xl overflow-hidden flex flex-col z-50"
            >
              <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
                <div className="font-semibold text-sm truncate">{me.name}</div>
                <div className="text-xs text-muted-foreground truncate">{me.teamName}</div>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => { setTab('profile'); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  <User size={16} className="text-muted-foreground" /> Profile
                </button>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors opacity-50 cursor-not-allowed"
                >
                  <Settings size={16} /> Settings
                </button>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-secondary rounded-lg transition-colors opacity-50 cursor-not-allowed"
                >
                  <Palette size={16} /> Theme
                </button>
              </div>
              <div className="p-1 border-t border-border/50">
                <button 
                  onClick={() => { onLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Log out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
