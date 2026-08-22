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
        {/* Cinematic Podium for Top 3 */}
        {top3.length > 0 && (
          <div className="relative pt-10 sm:pt-16 pb-0 flex justify-center items-end h-[500px] sm:h-[650px] mt-8 px-0">
            
            {/* Ambient Background Glows */}
            <div className="absolute inset-x-0 bottom-0 h-[80%] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-yellow-600/5 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-slate-400/5 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[30%] right-[20%] w-64 h-64 bg-orange-600/10 blur-[100px] rounded-full pointer-events-none" />

            {/* The 3D Podium Image Background & Holographic Floor */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pointer-events-none z-10 overflow-hidden pb-4">
              
              {/* Image Container with Glint Effect */}
              <div className="relative w-[120%] sm:w-[95%] max-w-[850px] flex justify-center">
                <motion.img 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  src="/assets/Podium.png" 
                  className="w-full h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] relative z-10" 
                  alt="Podium"
                />
                
                {/* Glint Animation overlay on the image */}
                <div className="absolute inset-0 z-20 overflow-hidden mask-image-podium" style={{ WebkitMaskImage: "url('/assets/Podium.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center bottom" }}>
                  <motion.div
                    animate={{ left: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "linear", repeatDelay: 2 }}
                    className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/40 to-transparent -rotate-45 z-20 pointer-events-none"
                    style={{ top: '-50%', bottom: '-50%' }}
                  />
                </div>

                {/* Volcanic Sparkles from Gold Base */}
                <div className="absolute bottom-[15%] left-1/2 -translate-x-1/2 w-48 h-10 z-20 flex justify-center overflow-visible">
                   {[...Array(8)].map((_, i) => (
                    <motion.div 
                      key={`sparkle-${i}`}
                      animate={{ 
                        y: [0, -120 - (i * 20)], 
                        opacity: [0, 1, 0], 
                        scale: [0.5, 1.5, 0],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (i * 15)]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 + (i * 0.2), delay: i * 0.3, ease: "easeOut" }}
                      className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_10px_2px_rgba(234,179,8,0.9)]"
                    />
                  ))}
                </div>
              </div>

              {/* Holographic Arena Floor */}
              <div className="absolute bottom-4 w-full flex justify-center items-center">
                <motion.div 
                  animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.95, 1.05, 0.95] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute w-full max-w-[900px] h-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/40 via-orange-600/10 to-transparent blur-xl rounded-[100%] z-0"
                />
                <div className="absolute w-full max-w-[700px] h-1 bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent blur-[2px] rounded-[100%] z-0" />
              </div>
            </div>

            {/* Position the avatars exactly over the image */}
            <div className="relative z-20 w-full max-w-[850px] flex justify-between items-end px-2 sm:px-12 mx-auto h-full pb-[40%] sm:pb-[250px]">
              {/* 2nd Place (Left) */}
              <div className="flex-1 flex justify-center items-end pb-[20px] sm:pb-[10px]">
                {top3[1] && <PodiumStep player={top3[1]} rank={2} delay={0.2} />}
              </div>
              
              {/* 1st Place (Center) */}
              <div className="flex-1 flex justify-center items-end pb-[100px] sm:pb-[120px]">
                {top3[0] && <PodiumStep player={top3[0]} rank={1} delay={0} />}
              </div>
              
              {/* 3rd Place (Right) */}
              <div className="flex-1 flex justify-center items-end pb-0 sm:pb-[-10px]">
                {top3[2] && <PodiumStep player={top3[2]} rank={3} delay={0.4} />}
              </div>
            </div>
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

function PodiumStep({ player, rank, delay }) {
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
      className={`flex flex-col items-center relative z-10 ${isFirst ? 'w-40 sm:w-56' : 'w-32 sm:w-48'}`}
    >
      {/* Base Sparkles / Glows for Rank 1 */}
      {isFirst && (
        <>
          <div className="absolute inset-0 top-10 rounded-full blur-3xl bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-orange-500/60 via-red-500/20 to-transparent opacity-80 z-0 pointer-events-none" />
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
        </>
      )}

      <div className={`relative z-10 flex flex-col items-center mb-4 ${isFirst ? 'scale-105 mt-12' : 'mt-0'}`}>
        <div className="relative flex flex-col items-center hover:scale-105 transition-transform duration-300">
          
          {/* Crown Floating above avatar top */}
          {isFirst && (
            <div className="absolute -top-12 sm:-top-16 z-50 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="relative w-full h-full"
              >
                <div 
                  className="relative w-full h-full"
                  style={{ maskImage: "url('/assets/RankCrown.png')", maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "center", WebkitMaskImage: "url('/assets/RankCrown.png')", WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }}
                >
                  <img src="/assets/RankCrown.png" alt="Rank 1 Crown" className="w-full h-full object-contain" />
                  <motion.div 
                    animate={{ x: ['-200%', '300%'] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 1.5 }}
                    className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/90 to-transparent -rotate-45 z-20"
                    style={{ top: '-20%', bottom: '-20%' }}
                  />
                </div>
              </motion.div>
            </div>
          )}

          {/* Profile Image & Rank Badge */}
          <div className={`relative p-[4px] rounded-full bg-gradient-to-tr ${ringGradients[rank] || ringGradients[1]} mb-3 shadow-[0_0_30px_rgba(0,0,0,0.8)]`}>
            <Avatar p={player} size={isFirst ? 110 : 86} className="rounded-full shadow-inner border-[4px] border-[#0a0c10]" />
            
            {/* Rank Badge overlapping bottom right */}
            <div className={`absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 z-20 ${isFirst ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-14 sm:h-14'} drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform`}>
              {rank <= 3 ? (
                <img src={`/assets/rankbadge/rank${rank}.png`} alt={`Rank ${rank}`} className="w-full h-full object-contain" />
              ) : (
                <div className={`w-full h-full rounded-full bg-[#0a0c10] flex items-center justify-center border-2 border-border/50 shadow-lg ${medalColors[rank]}`}>
                  <Medal size={16} strokeWidth={2.5} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Player Name with Slashes */}
        <div className="flex items-center justify-center gap-2 mb-2 w-full">
          <span className={`text-[12px] sm:text-[14px] font-black ${isFirst ? 'text-[#d4af37]' : rank === 2 ? 'text-slate-400' : 'text-amber-600'} italic`}>//</span>
          <h2 className={`font-heading font-black uppercase tracking-wider text-center drop-shadow-md truncate ${isFirst ? 'text-white text-[16px] sm:text-[20px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : rank === 2 ? 'text-slate-200 text-[14px] sm:text-[16px]' : 'text-orange-100 text-[14px] sm:text-[16px]'}`}>
            {player.name}
          </h2>
          <span className={`text-[12px] sm:text-[14px] font-black ${isFirst ? 'text-[#d4af37]' : rank === 2 ? 'text-slate-400' : 'text-amber-600'} italic`}>//</span>
        </div>

        {/* Angular Points Pill */}
        <div 
          className="relative flex items-center justify-center min-w-[100px] mb-2 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
          style={{
             clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
             background: isFirst ? 'linear-gradient(135deg, #d4af37, #8b6914)' : rank === 2 ? 'linear-gradient(135deg, #94a3b8, #475569)' : 'linear-gradient(135deg, #d97706, #92400e)',
             padding: '1.5px' 
          }}
        >
          <div 
            className="w-full h-full bg-[#0a0c10] flex items-center justify-center px-4 py-1.5"
            style={{ clipPath: 'polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px)' }}
          >
            <span className={`font-score font-bold tracking-widest text-[12px] sm:text-[14px] uppercase ${isFirst ? 'text-[#ffd76a]' : rank === 2 ? 'text-slate-300' : 'text-amber-500'}`}>
              {player.rankingPoints ?? 1000} <span className="text-white/60 ml-1">PTS</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
