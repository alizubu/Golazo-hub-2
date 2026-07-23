'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function FloatingLiveWidget({ initialMatches, players }) {
  const [liveMatches, setLiveMatches] = useState(
    initialMatches.filter(m => m.status === 'live')
  );
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Keep internal state in sync with props changes (e.g. Server Component refresh)
    const newLive = initialMatches.filter(m => m.status === 'live');
    if (newLive.length !== liveMatches.length) {
      setTimeout(() => setLiveMatches(newLive), 0);
    }
  }, [initialMatches, liveMatches.length]);

  useEffect(() => {
    const channel = supabase.channel('floating-widget-events')
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

  if (liveMatches.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {liveMatches.map(m => {
          const home = players.find(p => p.id === m.homeId);
          const away = players.find(p => p.id === m.awayId);
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              onClick={() => setExpanded(prev => !prev)}
              className="bg-card border-2 border-claret rounded-2xl shadow-2xl p-4 flex flex-col gap-2 min-w-[150px] cursor-pointer hover:bg-secondary/20 transition-colors"
            >
              {expanded ? (
                <>
                  <div className="flex items-center justify-between text-[10px] font-bold text-destructive tracking-widest uppercase mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive animate-ping absolute" /><span className="w-2 h-2 rounded-full bg-destructive relative" /> 72&apos;</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 font-bold text-sm">
                    <span>{home?.name}</span>
                    <span className="text-pitch-bright text-lg font-mono">{m.homeScore || 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 font-bold text-sm">
                    <span>{away?.name}</span>
                    <span className="text-pitch-bright text-lg font-mono">{m.awayScore || 0}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3 text-sm font-bold font-mono">
                  <span className="flex items-center gap-1.5 text-destructive text-[10px] uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-destructive animate-ping absolute" /><span className="w-2 h-2 rounded-full bg-destructive relative" /> LIVE</span>
                  <span className="text-pitch-bright">{m.homeScore || 0} - {m.awayScore || 0}</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
