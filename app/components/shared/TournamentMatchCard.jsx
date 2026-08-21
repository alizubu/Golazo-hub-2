'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { CLUBS } from '@/lib/data/clubs';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { Trophy, BarChart2, Radio } from 'lucide-react';

const formatName = (name) => {
  if (!name) return 'TBD';
  return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

const getLeagueFlag = (leagueName) => {
  if (!leagueName) return null;
  if (leagueName.includes('Serie A')) return nationalTeamsData.find(n => n.name === 'Italy')?.flag_url;
  if (leagueName.includes('La Liga') || leagueName.includes('LaLiga')) return nationalTeamsData.find(n => n.name === 'Spain')?.flag_url;
  if (leagueName.includes('Ligue 1')) return nationalTeamsData.find(n => n.name === 'France')?.flag_url;
  if (leagueName.includes('Premier League')) return nationalTeamsData.find(n => n.name === 'England')?.flag_url;
  if (leagueName.includes('Bundesliga')) return nationalTeamsData.find(n => n.name === 'Germany')?.flag_url;
  return null;
};

// Stage Configurations
const STAGE_CONFIG = {
  'normal': {
    label: null,
    bgClass: 'bg-[#0a0b10] border-white/5',
    glowClass: 'from-purple-500/5 via-transparent to-blue-500/5',
    hoverGlowClass: 'from-purple-500/10 to-blue-500/10',
    gridClass: null,
    vsBadge: 'stroke-white/10 fill-white/5 text-white',
    startBtn: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-500/20'
  },
  'qualifier-1': {
    label: 'QUALIFIER 1',
    labelClass: 'bg-[#08183a] border-[#1769FF] text-white shadow-[0_0_20px_rgba(23,105,255,0.3)]',
    bgClass: 'bg-[#050B16] border-[#1769FF]/30',
    glowClass: 'from-[#1769FF]/10 via-[#050B16] to-[#00C8FF]/10',
    hoverGlowClass: 'from-[#1769FF]/20 to-[#00C8FF]/20',
    gridClass: 'bg-[radial-gradient(circle_at_center,rgba(23,105,255,0.15)_0%,transparent_70%)]',
    vsBadge: 'stroke-[#FFB800]/50 fill-[#0a0b10] text-[#FFB800] drop-shadow-[0_0_10px_rgba(23,105,255,0.4)]',
    startBtn: 'border-[#1769FF]/50 bg-[#1769FF]/10 text-[#00C8FF] shadow-[0_0_15px_rgba(23,105,255,0.4)] hover:bg-[#1769FF]/20'
  },
  'eliminator': {
    label: 'ELIMINATOR',
    labelClass: 'bg-[#2a083a] border-[#8B2CFF] text-white shadow-[0_0_20px_rgba(139,44,255,0.4)]',
    bgClass: 'bg-[#0B0612] border-[#8B2CFF]/30',
    glowClass: 'from-[#8B2CFF]/10 via-[#0B0612] to-[#FF4FD8]/10',
    hoverGlowClass: 'from-[#8B2CFF]/20 to-[#FF4FD8]/20',
    gridClass: 'bg-[radial-gradient(circle_at_center,rgba(139,44,255,0.15)_0%,transparent_70%)]',
    vsBadge: 'stroke-[#FFB800]/50 fill-[#0a0b10] text-[#FFB800] drop-shadow-[0_0_10px_rgba(139,44,255,0.4)]',
    startBtn: 'border-[#8B2CFF]/50 bg-[#8B2CFF]/10 text-[#FF4FD8] shadow-[0_0_15px_rgba(139,44,255,0.4)] hover:bg-[#8B2CFF]/20'
  },
  'qualifier-2': {
    label: 'QUALIFIER 2',
    labelClass: 'bg-[#3a2808] border-[#F3C75F] text-white shadow-[0_0_20px_rgba(243,199,95,0.3)]',
    bgClass: 'bg-[#0D0A05] border-[#C58A18]/30',
    glowClass: 'from-[#C58A18]/10 via-[#0D0A05] to-[#FFD978]/10',
    hoverGlowClass: 'from-[#C58A18]/20 to-[#FFD978]/20',
    gridClass: 'bg-[radial-gradient(circle_at_center,rgba(197,138,24,0.15)_0%,transparent_70%)]',
    vsBadge: 'stroke-[#F3C75F]/60 fill-[#0a0b10] text-[#F3C75F] drop-shadow-[0_0_10px_rgba(197,138,24,0.4)]',
    startBtn: 'border-[#F3C75F]/50 bg-[#C58A18]/10 text-[#FFD978] shadow-[0_0_15px_rgba(197,138,24,0.4)] hover:bg-[#C58A18]/20'
  },
  'final': {
    label: 'FINAL',
    labelClass: 'bg-gradient-to-r from-[#2c200b] via-[#4a3610] to-[#2c200b] border-y-[#F3C75F] border-x-transparent border-y-[2px] text-[#FFE7A3] shadow-[0_0_30px_rgba(243,199,95,0.4)] px-8 py-1.5 font-black text-[14px]',
    bgClass: 'bg-[#050403] border-[#8A641C]/50',
    glowClass: 'from-[#C99A32]/10 via-[#050403] to-[#8A641C]/10',
    hoverGlowClass: 'from-[#C99A32]/20 to-[#8A641C]/20',
    gridClass: 'bg-[radial-gradient(circle_at_center,rgba(201,154,50,0.25)_0%,transparent_70%)]',
    vsBadge: 'stroke-[#F4D06F] fill-[#11100D] text-[#F4D06F] drop-shadow-[0_0_15px_rgba(244,208,111,0.5)] stroke-[2px]',
    startBtn: 'border-[#C99A32]/80 bg-[#8A641C]/20 text-[#FFE7A3] shadow-[0_0_25px_rgba(201,154,50,0.5)] hover:bg-[#C99A32]/30 px-6 py-2'
  }
};

export function TournamentMatchCard({ stage = 'normal', m, h, a, hStats, aStats, index, onClick, onStartClick }) {
  const isCompleted = m?.status === 'completed';
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG['normal'];
  const isFinal = stage === 'final';

  const hClub = CLUBS.find(c => c.name === h?.favoriteClub);
  const aClub = CLUBS.find(c => c.name === a?.favoriteClub);

  const hLeagueFlag = hClub ? getLeagueFlag(hClub.league) : null;
  const aLeagueFlag = aClub ? getLeagueFlag(aClub.league) : null;

  const hBadgeUrl = getPlayerIdentityBadgeUrl(h);
  const aBadgeUrl = getPlayerIdentityBadgeUrl(a);

  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`relative flex flex-col w-full p-6 pt-10 md:pt-6 rounded-[24px] ${config.bgClass} border shadow-2xl cursor-pointer overflow-hidden group transition-all duration-500`}
    >
      {/* Background Layers */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.glowClass} opacity-50 pointer-events-none transition-all duration-500`} />
      <div className={`absolute -inset-[1px] rounded-[24px] ${config.hoverGlowClass ? `bg-gradient-to-r ${config.hoverGlowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500` : ''} pointer-events-none`} />
      
      {/* Stage specific grids / atmospheric glows */}
      {config.gridClass && (
        <div className={`absolute inset-0 ${config.gridClass} opacity-60 pointer-events-none mix-blend-screen`} />
      )}
      
      {/* Eliminator Embers */}
      {stage === 'eliminator' && (
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 pointer-events-none mix-blend-overlay" />
      )}

      {/* Top Stage / Match Pill */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
        {config.label ? (
          <div className={`flex items-center justify-center px-6 py-1 rounded-b-xl border-x border-b ${config.labelClass} transform group-hover:shadow-[0_0_30px_currentColor] transition-all duration-500`}>
            <span className={`text-[12px] tracking-[0.2em] font-score ${isFinal ? '' : 'font-bold uppercase'}`}>{config.label}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-4 py-1 rounded-b-xl bg-white/5 border border-white/10 border-t-0 backdrop-blur-md mt-0">
            <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-score">Match {index + 1}</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 mt-6 md:mt-2 relative z-10">
        
        {/* Home Player (Left) */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full justify-start">
          <div className="relative shrink-0 order-1 md:order-1">
            <div className="absolute -inset-2 bg-gradient-to-br from-red-600 to-rose-600 rounded-full blur-[10px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative p-1 rounded-full bg-black">
              <Avatar p={h} size={80} className="rounded-full ring-2 ring-red-500/50" />
            </div>
            {/* Club Badge Overlap */}
            {hBadgeUrl && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0a0b10] border border-white/10 p-1 shadow-lg z-10">
                <img src={hBadgeUrl} alt="badge" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-center md:items-start min-w-0 order-2 md:order-2">
            <span className="font-bold text-xl md:text-2xl text-white truncate text-center md:text-left drop-shadow-md" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(h?.name)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <span className="text-sm font-semibold">{h?.favoriteClub || 'TBD'}</span>
            </div>
            {/* Desktop Stats */}
            <div className="hidden md:flex items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Rank</span>
                <span className="font-score font-black text-xl text-white">#{hStats?.rank || '-'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Wins</span>
                <span className="font-score font-black text-xl text-emerald-400">{hStats?.wins || '0'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center VS Area */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[140px] relative order-3 md:order-2 my-4 md:my-0">
          
          {/* Final Trophy & Laurels */}
          {isFinal && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-48 h-32 pointer-events-none z-0 flex items-center justify-center">
              {/* Left Laurel */}
              <svg viewBox="0 0 100 200" className="w-12 h-24 absolute left-0 top-6 drop-shadow-[0_0_10px_rgba(243,199,95,0.4)] opacity-80" preserveAspectRatio="xMidYMid meet">
                <path d="M90 190 C70 170 30 130 10 90 C-10 50 10 20 40 10 C60 50 80 120 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="2" />
                <path d="M80 160 C50 140 10 110 5 70 C0 40 20 20 50 20 C70 60 75 110 80 160 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M70 130 C40 110 10 80 5 40 C0 10 30 0 60 10 C70 50 70 90 70 130 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M90 190 C80 180 50 150 40 120 C30 90 40 60 70 50 C80 90 90 140 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M90 190 C80 180 50 150 40 120 C30 90 40 60 70 50 C80 90 90 140 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <defs>
                  <linearGradient id="laurel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE7A3" />
                    <stop offset="50%" stopColor="#C58A18" />
                    <stop offset="100%" stopColor="#4a3610" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Trophy */}
              <img src="/assets/trophies/BB-Champion.png" alt="Trophy" className="w-24 h-full object-contain drop-shadow-[0_0_20px_rgba(243,199,95,0.4)] opacity-95 relative z-10" />
              
              {/* Right Laurel */}
              <svg viewBox="0 0 100 200" className="w-12 h-24 absolute right-0 top-6 drop-shadow-[0_0_10px_rgba(243,199,95,0.4)] opacity-80" preserveAspectRatio="xMidYMid meet" style={{ transform: 'scaleX(-1)' }}>
                <path d="M90 190 C70 170 30 130 10 90 C-10 50 10 20 40 10 C60 50 80 120 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="2" />
                <path d="M80 160 C50 140 10 110 5 70 C0 40 20 20 50 20 C70 60 75 110 80 160 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M70 130 C40 110 10 80 5 40 C0 10 30 0 60 10 C70 50 70 90 70 130 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M90 190 C80 180 50 150 40 120 C30 90 40 60 70 50 C80 90 90 140 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
                <path d="M90 190 C80 180 50 150 40 120 C30 90 40 60 70 50 C80 90 90 140 90 190 Z" fill="url(#laurel-grad)" stroke="#F3C75F" strokeWidth="1" />
              </svg>
            </div>
          )}

          {/* Central Connecting Line */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block ${isFinal ? 'via-[#C58A18]/50' : ''}`} />
          
          {/* VS Polygon */}
          <div className="relative z-10 flex flex-col items-center justify-center w-20 h-24 mb-3 mt-2">
            <svg viewBox="0 0 100 100" className={`absolute inset-0 w-full h-full ${config.vsBadge.includes('drop-shadow') ? '' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}>
              <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" className={config.vsBadge} strokeWidth="2" />
            </svg>
            
            {isCompleted ? (
              <div className="flex flex-col items-center justify-center z-20">
                <span className="text-xl font-score font-black text-white leading-none">{m.homeScore ?? 0}</span>
                <div className="w-4 h-[1px] bg-white/30 my-1" />
                <span className="text-xl font-score font-black text-white leading-none">{m.awayScore ?? 0}</span>
              </div>
            ) : (
              <span className={`text-[22px] mt-1 font-black relative z-20 font-score tracking-wider drop-shadow-md ${config.vsBadge.includes('text-') ? config.vsBadge.match(/text-\S+/)[0] : 'text-white'}`}>VS</span>
            )}
          </div>
          
          {/* START Button */}
          {!isCompleted && (
             <div 
               onClick={(e) => {
                 if (onStartClick) {
                   e.stopPropagation();
                   onStartClick();
                 }
               }}
               className={`flex items-center justify-center px-5 py-1.5 mt-2 rounded-full border backdrop-blur-md cursor-pointer transition-all duration-300 transform group-hover:-translate-y-1 z-20 ${config.startBtn}`}
             >
               <span className="text-[11px] font-black uppercase tracking-[0.2em]">Start</span>
             </div>
          )}
        </div>

        {/* Away Player (Right) */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full justify-end order-4 md:order-3">
          
          <div className="flex flex-col items-center md:items-end min-w-0 order-2 md:order-1">
            <span className="font-bold text-xl md:text-2xl text-white truncate text-center md:text-right drop-shadow-md" style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(a?.name)}
            </span>
            <div className="flex items-center gap-2 mt-1 text-slate-400">
              <span className="text-sm font-semibold">{a?.favoriteClub || 'TBD'}</span>
            </div>
            {/* Desktop Stats */}
            <div className="hidden md:flex items-center gap-6 mt-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Rank</span>
                <span className="font-score font-black text-xl text-white">#{aStats?.rank || '-'}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Wins</span>
                <span className="font-score font-black text-xl text-emerald-400">{aStats?.wins || '0'}</span>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 order-1 md:order-2">
            <div className="absolute -inset-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full blur-[10px] opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative p-1 rounded-full bg-black">
              <Avatar p={a} size={80} className="rounded-full ring-2 ring-cyan-500/50" />
            </div>
            {/* Club Badge Overlap */}
            {aBadgeUrl && (
              <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-[#0a0b10] border border-white/10 p-1 shadow-lg z-10">
                <img src={aBadgeUrl} alt="badge" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
}
