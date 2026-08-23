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
      
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-4 sm:gap-12 mt-0 sm:mt-4">
        {/* Cinematic Podium for Top 3 */}
        {/* Cinematic Podium for Top 3 */}
        {top3.length > 0 && (
          <div className="relative pt-4 sm:pt-16 pb-0 flex justify-center items-end h-[420px] sm:h-[750px] mt-2 sm:mt-8 px-0 overflow-visible">
            
            {/* Ambient Background Glows - warm amber like reference */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-900/8 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-[10%] w-80 h-48 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-[10%] w-80 h-48 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

            {/* The 3D Podium Image Background & Holographic Floor */}
            <div className="absolute inset-x-0 bottom-0 flex justify-center pointer-events-none z-10 overflow-visible pb-0">
              
              {/* Image Container with Glint Effect & Floor */}
              <div className="relative w-[105%] sm:w-[95%] max-w-[850px] flex justify-center">
                
                {/* Warm Amber Ground Glow - matching reference Image 2 */}
                <div className="absolute -bottom-[2%] w-[140%] flex justify-center items-center z-0 pointer-events-none">
                  {/* Layer 1: Wide atmospheric warm glow */}
                  <motion.div 
                    animate={{ opacity: [0.5, 0.8, 0.5], scaleX: [0.98, 1.02, 0.98] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute w-full h-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/30 via-orange-700/12 to-transparent blur-2xl rounded-[100%]"
                  />
                  {/* Layer 2: Tight warm reflection under podium */}
                  <motion.div 
                    animate={{ opacity: [0.6, 1, 0.6], scaleX: [0.96, 1.04, 0.96] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute w-[80%] h-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-400/40 via-amber-600/15 to-transparent blur-xl rounded-[100%] translate-y-4"
                  />
                  {/* Layer 3: Sharp golden edge line */}
                  <div className="absolute w-[70%] h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent blur-[1px] rounded-full translate-y-2" />
                </div>

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
                <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-48 h-10 z-20 flex justify-center overflow-visible">
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
            </div>

            {/* Position the avatars exactly over the image using responsive padding */}
            <div className="relative z-30 w-full max-w-[850px] flex justify-between items-end px-1 sm:px-12 mx-auto h-full pb-0">
              {/* 2nd Place (Left) */}
              <div className="flex-1 flex justify-center items-end pb-[42%] sm:pb-[48%]">
                {top3[1] && <PodiumStep player={top3[1]} rank={2} delay={0.2} />}
              </div>
              
              {/* 1st Place (Center) */}
              <div className="flex-1 flex justify-center items-end pb-[55%] sm:pb-[62%]">
                {top3[0] && <PodiumStep player={top3[0]} rank={1} delay={0} />}
              </div>
              
              {/* 3rd Place (Right) */}
              <div className="flex-1 flex justify-center items-end pb-[35%] sm:pb-[38%]">
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
      className={`flex flex-col items-center relative z-10 ${isFirst ? 'w-28 sm:w-56' : 'w-24 sm:w-48'}`}
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

      <div className={`relative z-10 flex flex-col items-center mb-1 sm:mb-4 ${isFirst ? 'scale-100 sm:scale-105 mt-4 sm:mt-12' : 'mt-0'}`}>
        <div className="relative flex flex-col items-center hover:scale-105 transition-transform duration-300">
          
          {/* Crown Floating above avatar top */}
          {isFirst && (
            <div className="absolute -top-10 sm:-top-14 z-50 w-16 h-16 sm:w-28 sm:h-28 pointer-events-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
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
          <div className={`relative p-[3px] sm:p-[4px] rounded-full bg-gradient-to-tr ${ringGradients[rank] || ringGradients[1]} mb-1 sm:mb-1.5 shadow-[0_0_30px_rgba(0,0,0,0.8)]`}>
            <Avatar p={player} size={isFirst ? 72 : 56} className={`rounded-full shadow-inner border-[3px] sm:border-[4px] border-[#0a0c10] ${isFirst ? '!w-[72px] !h-[72px] sm:!w-[114px] sm:!h-[114px]' : '!w-[56px] !h-[56px] sm:!w-[88px] sm:!h-[88px]'}`} />
            
            {/* Rank Badge overlapping bottom right */}
            <div className={`absolute -bottom-2 -right-2 sm:-bottom-2 sm:-right-2 z-20 ${isFirst ? 'w-10 h-10 sm:w-16 sm:h-16' : 'w-8 h-8 sm:w-12 sm:h-12'} drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] hover:scale-110 transition-transform`}>
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
        <div className="flex items-center justify-center gap-2 mb-1 w-full">
          <span className={`text-[12px] sm:text-[14px] font-black ${isFirst ? 'text-[#d4af37]' : rank === 2 ? 'text-slate-400' : 'text-amber-600'} italic`}>//</span>
          <h2 className={`font-heading font-black uppercase tracking-wider text-center drop-shadow-md truncate ${isFirst ? 'text-white text-[12px] sm:text-[18px] drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : rank === 2 ? 'text-slate-200 text-[11px] sm:text-[15px]' : 'text-orange-100 text-[11px] sm:text-[15px]'}`}>
            {player.name}
          </h2>
          <span className={`text-[12px] sm:text-[14px] font-black ${isFirst ? 'text-[#d4af37]' : rank === 2 ? 'text-slate-400' : 'text-amber-600'} italic`}>//</span>
        </div>

        {/* Angular Points Pill */}
        <div 
          className="relative flex items-center justify-center min-w-[80px] sm:min-w-[100px] mb-0 drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
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
            <span className={`font-score font-bold tracking-widest text-[10px] sm:text-[14px] uppercase ${isFirst ? 'text-[#ffd76a]' : rank === 2 ? 'text-slate-300' : 'text-amber-500'}`}>
              {player.rankingPoints ?? 1000} <span className="text-white/60 ml-1">PTS</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
