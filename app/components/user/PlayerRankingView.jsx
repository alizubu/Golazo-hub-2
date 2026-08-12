'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Info, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { PlayStyleBadge } from '@/app/components/shared/UI';

export default function PlayerRankingView({ players, matches, setTab }) {
  // Sort players by ranking points descending
  const sortedPlayers = [...players].sort((a, b) => (b.rankingPoints ?? 1000) - (a.rankingPoints ?? 1000));
  
  const top3 = sortedPlayers.slice(0, 3);
  const rest = sortedPlayers.slice(3);

  // Helper to determine form trend based on recent matches (optional enhancement)
  const getPlayerTrend = (playerId) => {
    const pMatches = matches.filter(m => (m.homeId === playerId || m.awayId === playerId) && m.status === 'completed');
    if (pMatches.length === 0) return { icon: Minus, color: 'text-muted-foreground' };
    const lastMatch = pMatches[pMatches.length - 1];
    const isHome = lastMatch.homeId === playerId;
    const hScore = lastMatch.homeScore ?? 0;
    const aScore = lastMatch.awayScore ?? 0;
    
    if (hScore === aScore) return { icon: Minus, color: 'text-muted-foreground' };
    const won = isHome ? hScore > aScore : aScore > hScore;
    return won ? { icon: TrendingUp, color: 'text-green-400' } : { icon: TrendingDown, color: 'text-red-400' };
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-24">
      <PageHeader title="Global Ranking" onBack={() => setTab('dashboard')} />
      
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-12 mt-4">
        {/* Cinematic Podium for Top 3 */}
        {top3.length > 0 && (
          <div className="relative pt-28 pb-8 flex justify-center items-end gap-2 sm:gap-6 h-[400px]">
            {/* 2nd Place */}
            {top3[1] && <PodiumStep player={top3[1]} rank={2} height={200} trend={getPlayerTrend(top3[1].id)} delay={0.2} />}
            
            {/* 1st Place */}
            {top3[0] && <PodiumStep player={top3[0]} rank={1} height={260} trend={getPlayerTrend(top3[0].id)} delay={0} />}
            
            {/* 3rd Place */}
            {top3[2] && <PodiumStep player={top3[2]} rank={3} height={150} trend={getPlayerTrend(top3[2].id)} delay={0.4} />}
          </div>
        )}

        {/* List View for Rest */}
        <div className="flex flex-col gap-3">
          {rest.length > 0 ? (
            rest.map((p, i) => {
              const rank = i + 4;
              const trend = getPlayerTrend(p.id);
              const TrendIcon = trend.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + (i * 0.05) }}
                  key={p.id}
                  className="flex items-center gap-4 bg-secondary/40 backdrop-blur-md border-t border-white/10 shadow-lg shadow-black/20 rounded-2xl p-4 hover:bg-secondary/60 transition-colors relative overflow-hidden"
                >
                  <div className="w-8 text-center font-score font-bold text-muted-foreground">{rank}</div>
                  <Avatar p={p} size={48} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg truncate flex items-center gap-2">
                      {p.name}
                      {p.playStyle && <PlayStyleBadge style={p.playStyle} showLabel={false} size="sm" />}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {p.teamName ? `${p.teamName} · ` : ''}@{p.username}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="text-xl font-score font-black text-pitch-bright">
                      {p.rankingPoints ?? 1000} <span className="text-xs text-muted-foreground font-normal">pts</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold ${trend.color}`}>
                      <TrendIcon size={12} strokeWidth={3} /> Form
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
             top3.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  No ranked players available.
                </div>
             )
          )}
        </div>
      </div>
    </div>
  );
}

function PodiumStep({ player, rank, height, trend, delay }) {
  const TrendIcon = trend.icon;
  const isFirst = rank === 1;
  const rankColors = {
    1: 'bg-gradient-to-b from-amber-400/90 to-yellow-600/90 border-t border-yellow-300 shadow-[0_0_50px_rgba(255,215,0,0.4)] backdrop-blur-md',
    2: 'bg-gradient-to-b from-slate-300/80 to-gray-500/80 border-t border-white/50 backdrop-blur-md',
    3: 'bg-gradient-to-b from-orange-400/80 to-amber-700/80 border-t border-orange-300/50 backdrop-blur-md'
  };
  const medalColors = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-orange-500'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 20 }}
      className="flex flex-col items-center relative z-10 w-28 sm:w-40"
    >
      {isFirst && (
        <motion.div 
          initial={{ scale: 0, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
          transition={{ 
            delay: delay + 0.4, 
            scale: { type: 'spring' },
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" } 
          }}
          className="absolute -top-12 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.9)] z-20"
        >
          <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V18H19V19Z" />
          </svg>
        </motion.div>
      )}

      <div className={`relative z-10 flex flex-col items-center gap-2 mb-4 ${isFirst ? 'scale-110' : ''}`}>
        <div className="relative">
          <Avatar p={player} size={isFirst ? 88 : 56} className={`border-4 border-background shadow-2xl ${isFirst ? 'ring-4 ring-yellow-500/70' : ''}`} />
          <div className={`absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-background flex items-center justify-center border-2 border-border/50 shadow-lg ${medalColors[rank]}`}>
            <Medal size={16} strokeWidth={2.5} />
          </div>
        </div>
        <div className="text-center px-1 flex flex-col items-center w-full">
          <div className="font-bold text-sm sm:text-base truncate w-full px-2" title={player.name}>{player.name}</div>
          <div className="mt-1 bg-background/90 backdrop-blur-sm border border-border/50 px-2.5 py-0.5 rounded-full flex items-center justify-center shadow-lg relative z-20">
            <span className={`font-score text-[10px] sm:text-xs font-bold ${isFirst ? 'text-yellow-400 drop-shadow-sm' : 'text-foreground'}`}>{player.rankingPoints ?? 1000} pts</span>
          </div>
        </div>
      </div>

      <div 
        className={`w-full rounded-t-2xl sm:rounded-t-3xl ${rankColors[rank]} relative overflow-hidden flex flex-col items-center justify-start pt-4 sm:pt-6`}
        style={{ height: `${height}px` }}
      >
        <div className="absolute inset-0 bg-black/20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="relative z-10 font-score font-black text-4xl sm:text-6xl text-white/90 drop-shadow-md">
          {rank}
        </div>
      </div>
    </motion.div>
  );
}
