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
          <div className="relative pt-32 sm:pt-40 pb-0 flex justify-center items-end gap-2 sm:gap-6 h-[500px] sm:h-[560px] rounded-3xl bg-[#0a0c10] border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden mt-8 px-2 sm:px-6">
            
            {/* Base Glows for 1, 2, 3 */}
            <div className="absolute inset-x-0 bottom-0 h-[80%] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-600/10 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-slate-400/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[30%] right-[20%] w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Subtle Honeycomb Texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'24\\' height=\\'40\\' viewBox=\\'0 0 24 40\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 10l12 6.928L24 10V0L12-6.928 0 0v10zm0 20l12 6.928L24 30V20l-12-6.928L0 20v10z\\' fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }} />

            {/* 2nd Place */}
            {top3[1] && <PodiumStep player={top3[1]} rank={2} height={200} trend={getPlayerTrend(top3[1].id)} delay={0.2} />}
            
            {/* 1st Place */}
            {top3[0] && <PodiumStep player={top3[0]} rank={1} height={260} trend={getPlayerTrend(top3[0].id)} delay={0} />}
            
            {/* 3rd Place */}
            {top3[2] && <PodiumStep player={top3[2]} rank={3} height={160} trend={getPlayerTrend(top3[2].id)} delay={0.4} />}
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
                  className="flex items-center gap-3 sm:gap-4 bg-secondary/40 backdrop-blur-md border border-white/5 shadow-lg shadow-black/20 rounded-2xl p-3 sm:p-4 hover:bg-secondary/60 transition-colors relative overflow-hidden"
                >
                  <div className="w-6 sm:w-8 text-center font-score font-bold text-muted-foreground text-sm sm:text-base">{rank}</div>
                  <Avatar p={p} size={48} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-base sm:text-lg flex flex-wrap items-center gap-1.5 leading-tight">
                      <span className="break-words break-all sm:break-normal">{p.name}</span>
                      {p.playStyle && <PlayStyleBadge style={p.playStyle} showLabel={false} size="sm" />}
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted-foreground leading-snug mt-0.5 break-words">
                      {p.teamName ? <span className="font-medium text-foreground/80">{p.teamName}</span> : ''} {p.teamName && '· '} @{p.username}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <div className="text-lg sm:text-xl font-score font-black text-pitch-bright whitespace-nowrap">
                      {p.rankingPoints ?? 1000} <span className="text-[10px] sm:text-xs text-muted-foreground font-normal">pts</span>
                    </div>
                    <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold ${trend.color}`}>
                      <TrendIcon size={10} strokeWidth={3} /> Form
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

  const ringGradients = {
    1: 'from-yellow-600 via-yellow-200 to-amber-700 shadow-[0_0_20px_rgba(217,119,6,0.3)]',
    2: 'from-slate-400 via-slate-100 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.2)]',
    3: 'from-orange-700 via-orange-300 to-amber-800 shadow-[0_0_20px_rgba(194,65,12,0.2)]'
  };

  const ambientGlows = {
    1: 'from-orange-500/40',
    2: 'from-slate-400/20',
    3: 'from-orange-600/30'
  };


  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', damping: 20 }}
      className={`flex flex-col items-center relative z-10 ${isFirst ? 'w-36 sm:w-48' : 'w-28 sm:w-40'}`}
    >
      {/* Volcanic Reign Base Heat Source */}
      {isFirst && (
        <div className="absolute inset-0 top-10 rounded-full blur-3xl bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-orange-500/60 via-red-500/20 to-transparent opacity-80 z-0 pointer-events-none" />
      )}

      {/* Aggressive Fire Sparkles */}
      {isFirst && (
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-visible">
          {[...Array(10)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ 
                y: [0, -150 - (i * 37) % 100], 
                opacity: [0, 1, 0], 
                scale: [0.5, 1.5, 0.2],
                x: [0, ((i * 41) % 100 - 50) * 1.6] 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1 + ((i * 17) % 20) / 10, 
                delay: ((i * 23) % 15) / 10, 
                ease: "easeOut" 
              }}
              className={`absolute w-1.5 h-1.5 rounded-full blur-[1px] ${i % 2 === 0 ? 'bg-yellow-300' : 'bg-orange-500 shadow-[0_0_10px_2px_rgba(234,88,12,0.8)]'}`}
            />
          ))}
        </div>
      )}

      <div className={`relative z-10 flex flex-col items-center gap-2 sm:gap-3 mb-4 ${isFirst ? 'scale-105 mt-10' : 'mt-0'}`}>
        <div className="relative flex flex-col items-center hover:scale-105 transition-transform duration-300">
          
          {/* Profile Image & Rank Badge */}
          <div className={`relative p-[4px] rounded-full bg-gradient-to-tr ${ringGradients[rank] || ringGradients[1]} mb-2`}>
            <Avatar p={player} size={isFirst ? 100 : 76} className="rounded-full shadow-inner border-[4px] border-background" />
            
            {/* Rank Badge overlapping bottom right */}
            <div className={`absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 z-20 ${isFirst ? 'w-14 h-14 sm:w-16 sm:h-16' : 'w-10 h-10 sm:w-12 sm:h-12'} drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform`}>
              {rank <= 3 ? (
                <img src={`/assets/rankbadge/rank${rank}.png`} alt={`Rank ${rank}`} className="w-full h-full object-contain" />
              ) : (
                <div className={`w-full h-full rounded-full bg-background flex items-center justify-center border-2 border-border/50 shadow-lg ${medalColors[rank]}`}>
                  <Medal size={16} strokeWidth={2.5} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Name */}
        <h2 className={`font-heading font-black uppercase tracking-wider text-center drop-shadow-md w-full truncate px-1 ${isFirst ? 'text-white text-[16px] sm:text-[20px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : rank === 2 ? 'text-slate-200 text-[14px] sm:text-[16px]' : 'text-orange-100 text-[14px] sm:text-[16px]'}`}>
          {player.name}
        </h2>

        {/* Points Pill */}
        <div className={`px-4 py-1.5 rounded-full bg-[#0a0c10] border ${isFirst ? 'border-yellow-500/60 shadow-[0_0_12px_rgba(234,179,8,0.25)]' : rank === 2 ? 'border-slate-400/60 shadow-[0_0_12px_rgba(148,163,184,0.15)]' : 'border-amber-600/60 shadow-[0_0_12px_rgba(217,119,6,0.15)]'} flex items-center justify-center min-w-[70px]`}>
          <span className={`font-score font-bold tracking-widest text-[11px] sm:text-[13px] uppercase ${isFirst ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-500'}`}>
            {player.rankingPoints ?? 1000} <span className="text-white/60 ml-0.5">pts</span>
          </span>
        </div>
      </div>

      {/* Actual Podium Block */}
      <div 
        className={`w-full rounded-t-lg sm:rounded-t-xl relative overflow-hidden flex flex-col items-center justify-start pt-6 sm:pt-8 border-t-2 border-l border-r shadow-[inset_0_30px_60px_rgba(0,0,0,0.6)] ${isFirst ? 'border-t-yellow-400 border-l-yellow-600/30 border-r-yellow-600/30 bg-gradient-to-b from-yellow-700 via-yellow-900 to-[#0a0c10]' : rank === 2 ? 'border-t-slate-300 border-l-slate-400/30 border-r-slate-400/30 bg-gradient-to-b from-slate-600 via-slate-800 to-[#0a0c10]' : 'border-t-amber-500 border-l-amber-600/30 border-r-amber-600/30 bg-gradient-to-b from-orange-700 via-orange-900 to-[#0a0c10]'}`}
        style={{ height: `${height}px` }}
      >
        {/* Subtle Podium Texture */}
        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'16\\' height=\\'28\\' viewBox=\\'0 0 16 28\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 7l8 4.619L16 7V0L8-4.619 0 0v7zm0 14l8 4.619L16 21V14l-8-4.619L0 14v7z\\' fill=\\'%23ffffff\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')" }}></div>
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>
        
        <div 
          className="relative z-10 font-heading font-black text-6xl sm:text-7xl mt-2"
          style={{
            background: isFirst ? 'linear-gradient(180deg, #ffffff 0%, #ffd76a 40%, #c58a12 100%)' : rank === 2 ? 'linear-gradient(180deg, #ffffff 0%, #e2e8f0 40%, #64748b 100%)' : 'linear-gradient(180deg, #ffffff 0%, #fcd34d 40%, #b45309 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))'
          }}
        >
          {rank}
        </div>
      </div>
    </motion.div>
  );
}
