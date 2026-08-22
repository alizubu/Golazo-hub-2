'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';

import { TournamentMatchCard } from '@/app/components/shared/TournamentMatchCard';
import UserMatchCard from '@/app/components/shared/UserMatchCard';
import { MagicCard, Badge, Avatar } from '@/app/components/shared/UI';

export default function MatchesPage({ activeSeason, matches, players, me, onMatchClick }) {
  if (!activeSeason) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
        <div className="text-muted-foreground font-medium">No active season yet.</div>
      </div>
    );
  }

  // Filter matches for the active season
  const seasonMatches = matches.filter((m) => m.seasonId === activeSeason.id);

  // Sort live to top, then scheduled, then completed
  const sortedMatches = [...seasonMatches].sort((a, b) => {
    const statusOrder = { 'live': 0, 'scheduled': 1, 'completed': 2 };
    
    // Sort by status first
    const statusA = (a.status === 'in_progress' || a.status === 'live') ? 'live' : a.status;
    const statusB = (b.status === 'in_progress' || b.status === 'live') ? 'live' : b.status;
    
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    // Secondary sort by date
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt) - new Date(b.scheduledAt);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold font-heading flex items-center gap-2">
          <Calendar className="text-pitch-bright" /> All Matches
          {activeSeason.config?.squadType && activeSeason.config.squadType !== 'None' && (
            <span className="ml-2 px-2 py-0.5 text-[10px] uppercase tracking-widest font-bold bg-pitch-bright/20 text-pitch-bright rounded-md border border-pitch-bright/30 shadow-sm">
              {activeSeason.config.squadType}
            </span>
          )}
        </h2>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="list"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex flex-col gap-4">
            {sortedMatches.map((m, i) => {
              const h = players.find(p => p.id === m.homeId);
              const a = players.find(p => p.id === m.awayId);
              const isPlayoff = m.round !== 'league';
              
              const status = (m.status === 'in_progress' || m.status === 'live') ? 'live' : m.status;

              if (status === 'completed') {
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}>
                    <UserMatchCard m={m} h={h} a={a} players={players} showToast={() => {}} isPlayoff={isPlayoff} isAdmin={false} />
                  </motion.div>
                );
              }

              if (status === 'scheduled') {
                let stage = 'normal';
                if (m.round === 'semiA') stage = 'qualifier-1';
                else if (m.round === 'semiB') stage = 'eliminator';
                else if (m.round === 'challenger') stage = 'qualifier-2';
                else if (m.round === 'final') stage = 'final';
                
                const mockStats = { rank: '-', wins: '-' };

                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }}>
                    <TournamentMatchCard 
                      stage={stage}
                      m={m}
                      h={h}
                      a={a}
                      hStats={mockStats}
                      aStats={mockStats}
                      index={i}
                      onClick={() => onMatchClick && onMatchClick(m.id)}
                    />
                  </motion.div>
                );
              }

              // Live Match View
              return (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.5) }} onClick={() => onMatchClick && onMatchClick(m.id)} className="cursor-pointer">
                  <MagicCard className="p-5 border-destructive/50 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <div className="flex items-center justify-center mb-4">
                      <Badge color="#e11d48" pulse>
                        🔴 LIVE • {m.liveState?.clock ? `${m.liveState.clock}'` : (m.liveState?.phase === 'first' ? '1ST HALF' : m.liveState?.phase === 'second' ? '2ND HALF' : m.liveState?.phase === 'extra' ? 'AET' : m.liveState?.phase === 'penalties' ? 'PENS' : 'IN PROGRESS')}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:gap-6">
                      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
                        <Avatar p={h} size={56} className="ring-2 ring-white/10" />
                        <div className="font-bold text-center truncate w-full px-2">{h?.name || 'Home'}</div>
                        <div className="text-4xl font-score text-center font-black">{m.homeScore || 0}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                        <div className="text-sm font-score opacity-30 font-bold select-none">-</div>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
                        <Avatar p={a} size={56} className="ring-2 ring-white/10" />
                        <div className="font-bold text-center truncate w-full px-2">{a?.name || 'Away'}</div>
                        <div className="text-4xl font-score text-center font-black">{m.awayScore || 0}</div>
                      </div>
                    </div>
                  </MagicCard>
                </motion.div>
              );
            })}
            
            {sortedMatches.length === 0 && (
              <div className="p-8 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
                No matches generated yet.
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
