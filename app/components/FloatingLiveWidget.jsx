'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function FloatingLiveWidget({ initialMatches = [], players = [], tab, onNavigate }) {
  const [liveMatches, setLiveMatches] = useState(
    initialMatches.filter(m => m.status === 'live')
  );

  useEffect(() => {
    const newLive = initialMatches.filter(m => m.status === 'live');
    if (newLive.length !== liveMatches.length) {
      setTimeout(() => setLiveMatches(newLive), 0);
    }
  }, [initialMatches, liveMatches.length]);

  useEffect(() => {
    const channel = supabase.channel('matches-page')
      .on('broadcast', { event: 'match_update' }, (payload) => {
        const matchData = payload.payload;
        setLiveMatches(prev => {
          let updated = [...prev];
          const idx = updated.findIndex(m => m.id === matchData.id);
          
          if (matchData.status === 'live') {
            if (idx >= 0) updated[idx] = matchData;
            else updated.push(matchData);
          } else {
            if (idx >= 0) updated.splice(idx, 1);
          }
          return updated;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Hide widget if no live matches OR if user is already viewing Match/Tournament screens where the live card is prominently displayed
  if (liveMatches.length === 0) return null;
  if (tab === 'matches' || tab === 'admin-matches' || tab === 'admin-season') return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex flex-col gap-3 w-[92vw] sm:w-auto max-w-md">
      <AnimatePresence>
        {liveMatches.map(m => {
          const home = players.find(p => p.id === m.homeId);
          const away = players.find(p => p.id === m.awayId);
          const timeDisplay = m.liveState?.clock ? `${m.liveState.clock}'` : (m.liveState?.phase === 'first' ? '1st Half' : m.liveState?.phase === 'second' ? '2nd Half' : m.liveState?.phase === 'extra' ? 'AET' : m.liveState?.phase === 'penalties' ? 'PENS' : 'LIVE');
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={onNavigate}
              className="bg-card/95 backdrop-blur-md border-2 border-destructive/80 rounded-2xl shadow-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-6 cursor-pointer hover:bg-secondary/40 hover:border-destructive transition-all group"
              title="Tap to jump to live match"
            >
              <div className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-widest font-mono shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                </span>
                <span>LIVE • {timeDisplay}</span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-bold min-w-0 flex-1 justify-center">
                <span className="text-foreground truncate max-w-[80px] sm:max-w-[120px] text-right">{home?.name || 'Home'}</span>
                <span className="px-2.5 py-1 bg-destructive/15 text-destructive rounded-lg font-mono text-base sm:text-lg font-black shrink-0">
                  {m.homeScore || 0} - {m.awayScore || 0}
                </span>
                <span className="text-foreground truncate max-w-[80px] sm:max-w-[120px]">{away?.name || 'Away'}</span>
              </div>

              <div className="hidden sm:flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors shrink-0">
                <span>View</span>
                <span className="ml-1 font-mono">→</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
