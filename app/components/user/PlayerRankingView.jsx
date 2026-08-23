'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Info, TrendingUp, TrendingDown, Minus, Medal } from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import { PageHeader } from '@/app/components/shared/PageHeader';
import { PlayStyleBadge } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';

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
            
            {/* Ambient Background Glows - perfectly faded to prevent box clipping */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5%] w-[120%] max-w-[1000px] h-[70%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/15 via-orange-900/5 to-transparent pointer-events-none rounded-[100%]" />
            <div className="absolute bottom-[5%] left-[20%] w-[30%] h-64 bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[5%] right-[20%] w-[30%] h-64 bg-amber-500/15 blur-[120px] rounded-full pointer-events-none" />

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

        {/* Leaderboard Contenders Section */}
        {rest.length > 0 && (
          <div className="flex flex-col gap-3 mt-2 sm:mt-4">
            {/* Section Divider Header */}
            <div className="flex items-center justify-between gap-4 px-1 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-mono text-xs sm:text-sm font-black tracking-wider">//</span>
                <h3 className="font-heading font-black uppercase text-xs sm:text-sm tracking-[0.2em] text-foreground/90 flex items-center gap-2">
                  Global Contenders
                  <span className="text-[10px] sm:text-xs font-score font-bold px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-muted-foreground">
                    TOP {rest.length + 3}
                  </span>
                </h3>
              </div>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 via-white/10 to-transparent" />
            </div>

            {/* List View for Rest */}
            <div className="flex flex-col gap-2.5">
              {rest.map((p, i) => {
                const rank = i + 4;
                const trend = getPlayerTrend(p.id);
                const TrendIcon = trend.icon;
                const pBadgeUrl = getPlayerIdentityBadgeUrl(p);

                // Accent colors for rank brackets (4-10 get ice-cyan, 11+ get sleek titanium)
                const isTop10 = rank <= 10;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.04), type: 'spring', damping: 25 }}
                    whileHover={{ scale: 1.008, x: 2 }}
                    key={p.id}
                    className="relative flex items-center gap-3 sm:gap-4 bg-[#0a0d14]/75 hover:bg-[#101522]/90 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 rounded-2xl p-2.5 sm:p-3.5 shadow-lg shadow-black/40 transition-all duration-300 group overflow-hidden"
                  >
                    {/* Left Cyberpunk Accent Line */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300 ${
                        isTop10 
                          ? 'bg-gradient-to-b from-cyan-400 via-blue-500 to-transparent group-hover:w-[4px] group-hover:shadow-[0_0_12px_rgba(6,182,212,0.8)]' 
                          : 'bg-gradient-to-b from-white/20 via-white/5 to-transparent group-hover:w-[4px] group-hover:bg-amber-500'
                      }`} 
                    />

                    {/* Rank Badge */}
                    <div className="relative shrink-0 flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-xl bg-gradient-to-br from-white/[0.08] via-[#121624] to-[#07090e] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] group-hover:border-amber-400/40 transition-colors ml-1">
                      <span className="font-score font-black text-xs sm:text-sm text-slate-300 group-hover:text-amber-300 transition-colors">
                        #{rank < 10 ? `0${rank}` : rank}
                      </span>
                    </div>

                    {/* Avatar with Titanium Ring & Optional Badge */}
                    <div className="relative shrink-0">
                      <div className="p-[2px] rounded-full bg-gradient-to-br from-white/25 via-white/5 to-transparent shadow-[0_0_15px_rgba(0,0,0,0.6)]">
                        <Avatar p={p} size={44} className="rounded-full border border-[#0a0d14]" />
                      </div>
                      {pBadgeUrl && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0a0d14] p-0.5 border border-white/20 shadow-md">
                          <img src={pBadgeUrl} alt="badge" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="font-heading font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-2 truncate group-hover:text-amber-200 transition-colors">
                        <span className="truncate">{p.name}</span>
                        {p.playStyle && <PlayStyleBadge style={p.playStyle} showLabel={false} size="sm" />}
                      </div>
                      <div className="text-[11px] sm:text-xs text-muted-foreground/90 flex items-center gap-1.5 mt-0.5 truncate">
                        {p.favoriteClub || p.teamName ? (
                          <span className="text-slate-300 font-medium truncate">{p.favoriteClub || p.teamName}</span>
                        ) : null}
                        {(p.favoriteClub || p.teamName) && <span className="text-white/20">·</span>}
                        <span className="text-muted-foreground truncate">@{p.username}</span>
                      </div>
                    </div>

                    {/* Points & Form Pill */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-1">
                      {/* Angular Points Pill */}
                      <div 
                        className="relative flex items-center justify-center min-w-[78px] sm:min-w-[94px] drop-shadow-md"
                        style={{
                          clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 7px, 100% calc(100% - 7px), calc(100% - 7px) 100%, 7px 100%, 0 calc(100% - 7px), 0 7px)',
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.05))',
                          padding: '1px'
                        }}
                      >
                        <div 
                          className="w-full h-full bg-[#080a10] flex items-center justify-center px-2.5 sm:px-3.5 py-1 sm:py-1.5"
                          style={{ clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)' }}
                        >
                          <span className="font-score font-black text-xs sm:text-sm text-amber-400 tracking-wider">
                            {p.rankingPoints ?? 1000} <span className="text-[9px] sm:text-[10px] text-white/50 font-normal ml-0.5">PTS</span>
                          </span>
                        </div>
                      </div>

                      {/* Form Trend Pill */}
                      <div className={`hidden xs:flex sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] font-score font-bold uppercase tracking-wider ${trend.color}`}>
                        <TrendIcon size={12} strokeWidth={3} />
                        <span className="hidden sm:inline">FORM</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {top3.length === 0 && rest.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No ranked players available.
          </div>
        )}
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
