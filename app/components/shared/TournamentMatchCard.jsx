'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/app/components/shared/UI';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { CLUBS } from '@/lib/data/clubs';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { Trophy, BarChart2, Radio } from 'lucide-react';
import { FlickeringGrid } from '@/app/components/magicui/FlickeringGrid';

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
    vsBadge: 'stroke-white/10 fill-white/5 text-white',
    startBtn: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:bg-cyan-500/20'
  },
  'qualifier-1': {
    label: 'QUALIFIER 1',
    labelClass: 'bg-gradient-to-r from-[#0d2a5c] to-[#04122d] border-[#1769FF]/50 text-white shadow-none',
    bgClass: 'bg-gradient-to-r from-[#031024] via-[#051c42] to-[#031024] border-[#1769FF]/30',
    gridColor: '#1769FF',
    gridOpacity: 0.35,
    vsBadge: 'stroke-[#FFB800]/80 fill-[#0a0b10] text-[#FFB800] drop-shadow-md',
    startBtn: 'border-[#1769FF]/50 bg-[#1769FF]/20 text-[#00C8FF] shadow-none hover:bg-[#1769FF]/30'
  },
  'eliminator': {
    label: 'ELIMINATOR',
    labelClass: 'bg-gradient-to-r from-[#5c0f0f] to-[#240505] border-[#FF2C2C]/50 text-white shadow-none',
    bgClass: 'bg-gradient-to-r from-[#240505] via-[#3a0808] to-[#240505] border-[#FF2C2C]/30',
    gridColor: '#FF2C2C',
    gridOpacity: 0.35,
    vsBadge: 'stroke-[#FFB800]/80 fill-[#0a0b10] text-[#FFB800] drop-shadow-md',
    startBtn: 'border-[#FF2C2C]/50 bg-[#FF2C2C]/20 text-[#FF4F4F] shadow-none hover:bg-[#FF2C2C]/30'
  },
  'qualifier-2': {
    label: 'QUALIFIER 2',
    labelClass: 'bg-[#022c22] border-[#10b981]/50 text-[#6ee7b7] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    bgClass: 'bg-gradient-to-r from-[#021f18] via-[#064e3b] to-[#021f18] border-[#10b981]/30',
    gridColor: '#10b981',
    gridOpacity: 0.35,
    vsBadge: 'stroke-[#34d399] fill-[#022c22] text-[#34d399] drop-shadow-[0_0_10px_rgba(52,211,153,0.3)] stroke-[1.5px]',
    startBtn: 'border-[#10b981]/60 bg-[#065f46]/30 text-[#6ee7b7] hover:bg-[#065f46]/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] px-6 py-2'
  },
  'final': {
    label: '👑 GRAND FINAL',
    labelClass: 'bg-gradient-to-b from-[#1E1609] to-[#0D0A05] border-x border-b border-[#F59E0B]/50 text-[#FFD700] shadow-[0_8px_30px_rgba(245,158,11,0.2)] px-8 py-1.5 font-black text-[14px]',
    bgClass: 'bg-gradient-to-b from-[#0e0f14] via-[#090a0e] to-[#06070a] border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    gridColor: '#F59E0B',
    gridOpacity: 0.16,
    vsBadge: 'stroke-[#FFD700] fill-[#06070a] text-[#FFD700] drop-shadow-md stroke-[2px]',
    startBtn: 'border-[#F4D06F] bg-gradient-to-r from-[#C58A18] via-[#F4D06F] to-[#C58A18] text-[#110c03] shadow-[0_0_20px_rgba(243,199,95,0.4)] hover:shadow-[0_0_30px_rgba(243,199,95,0.6)] px-10 py-2.5 font-black border-2'
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
      {/* Keyframes for Final Stage */}
      {isFinal && (
        <style>{`
          @keyframes particleRise {
            0% { transform: translate3d(0, 40px, 0) scale(0.6); opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 0.75; }
            100% { transform: translate3d(var(--drift), -180px, 0) scale(1); opacity: 0; }
          }
          @keyframes edgeLight {
            0%, 100% { transform: translateX(-200%); opacity: 0; }
            50% { transform: translateX(300%); opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
          }
          @keyframes shockwave {
            0% { transform: scale(0.2); opacity: 0.8; border-width: 4px; }
            100% { transform: scale(1.5); opacity: 0; border-width: 1px; }
          }
          @keyframes foilGlint {
            0%, 80% { left: -50%; }
            100% { left: 150%; }
          }
          /* New Pro-Max Animations */
          @keyframes spin3D {
            from { transform: rotateX(75deg) rotateY(30deg) rotateZ(0deg); }
            to { transform: rotateX(75deg) rotateY(30deg) rotateZ(360deg); }
          }
          @keyframes spin3DReverse {
            from { transform: rotateX(65deg) rotateY(-20deg) rotateZ(360deg); }
            to { transform: rotateX(65deg) rotateY(-20deg) rotateZ(0deg); }
          }
          @keyframes gemGlint {
            0%, 40% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
            50% { transform: translateX(100%) skewX(-15deg); opacity: 0.8; }
            60%, 100% { transform: translateX(200%) skewX(-15deg); opacity: 0; }
          }
          @keyframes heartbeatPulse {
            0%, 100% { transform: scale(1); opacity: 0.4; }
            50% { transform: scale(1.15); opacity: 0.8; }
          }
          @keyframes sonarSweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes hologramGlitch {
            0%, 96%, 98%, 100% { transform: translate(0,0); text-shadow: 0 0 15px rgba(245,158,11,0.5); }
            97% { transform: translate(-2px, 1px); text-shadow: -2px 0 #f00, 2px 0 #0f0; }
            99% { transform: translate(2px, -1px); text-shadow: 2px 0 #00f, -2px 0 #f00; }
          }
          @keyframes goldFoilSheen {
            0%, 100% { background-position: -200% center; }
            50% { background-position: 200% center; }
          }
          @keyframes floatUp {
            0% { transform: translateY(10px) scale(0.5); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-20px) scale(1); opacity: 0; }
          }
          @keyframes breatheWatermark {
            0%, 100% { transform: translateY(-50%) scale(1); opacity: 0.03; }
            50% { transform: translateY(-50%) scale(1.05); opacity: 0.08; }
          }
        `}</style>
      )}

      {/* Background Layers */}
      {config.glowClass && <div className={`absolute inset-0 bg-gradient-to-br ${config.glowClass} opacity-50 pointer-events-none transition-all duration-500`} />}
      {config.hoverGlowClass && <div className={`absolute -inset-[1px] rounded-[24px] bg-gradient-to-r ${config.hoverGlowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />}
      
      {/* Hover Light Flare Sweep */}
      {isFinal && (
         <div className="absolute inset-0 overflow-hidden rounded-[24px] pointer-events-none z-0">
           <div className="absolute top-0 -left-[100%] w-[50%] h-[200%] bg-gradient-to-r from-transparent via-amber-200/10 to-transparent skew-x-[-30deg] opacity-0 group-hover:opacity-100 group-hover:animate-[edgeLight_1.5s_ease-out]" />
         </div>
      )}
      
      {/* Golden bottom glow for Final */}
      {isFinal && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[300px] h-[140px] bg-[radial-gradient(ellipse,rgba(255,200,74,0.25),transparent_70%)] blur-2xl animate-pulse pointer-events-none z-0" />
      )}

      {/* Gold Particles for Final */}
      {isFinal && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[24px]">
          {/* Layer 1: Background Bokeh */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={`bg-${i}`}
              className="absolute bg-[#F4D06F] rounded-full opacity-0 animate-[particleRise_var(--duration)_linear_infinite]"
              style={{
                width: `${4 + Math.random() * 6}px`,
                height: `${4 + Math.random() * 6}px`,
                left: `${Math.random() * 100}%`,
                bottom: '-20px',
                '--duration': `${8 + Math.random() * 10}s`,
                animationDelay: `${Math.random() * 10}s`,
                '--drift': `${(Math.random() - 0.5) * 200}px`,
                filter: 'blur(3px)'
              }}
            />
          ))}
          {/* Layer 2: Foreground Sparks */}
          {[...Array(20)].map((_, i) => (
            <div 
              key={`fg-${i}`}
              className="absolute w-1 h-1 bg-[#FFF2C8] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-0 animate-[particleRise_var(--duration)_linear_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                bottom: '-10px',
                '--duration': `${3 + Math.random() * 5}s`,
                animationDelay: `${Math.random() * 5}s`,
                '--drift': `${(Math.random() - 0.5) * 80}px`
              }}
            />
          ))}
        </div>
      )}
      
      {/* Foil Glint Overlay */}
      {isFinal && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[24px] z-40" style={{ mixBlendMode: 'overlay' }}>
           <div className="absolute -top-[50%] w-[120px] h-[200%] bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-[foilGlint_5s_ease-in-out_infinite] blur-[2px]" style={{ transform: 'rotate(25deg)' }} />
        </div>
      )}

      {/* Stage specific grids */}
      {config.gridColor && (
        <FlickeringGrid 
          className="z-0 absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]" 
          color={config.gridColor}
          maxOpacity={config.gridOpacity || 0.12} 
          flickerSpeed={0.3} 
          gridSize={16} 
        />
      )}

      {/* Top Stage / Match Pill */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
        {config.label ? (
          isFinal ? (
            <div className={`relative flex items-center justify-center rounded-b-2xl ${config.labelClass}`}>
              {/* Firefly Emitter behind the pill */}
              <div className="absolute inset-0 overflow-hidden rounded-b-2xl pointer-events-none">
                {[...Array(5)].map((_, i) => (
                  <div key={`firefly-${i}`} className="absolute w-[2px] h-[2px] bg-amber-200 rounded-full animate-[floatUp_2s_ease-in-out_infinite]" style={{ left: `${20 + i*15}%`, animationDelay: `${i*0.4}s` }} />
                ))}
              </div>
              <div className="absolute bottom-0 left-0 w-[40%] h-[2px] bg-gradient-to-r from-transparent via-[#FFF2C8] to-transparent opacity-90 animate-[edgeLight_3s_ease-in-out_infinite] z-0" />
              <span className="text-[15px] tracking-[0.3em] font-score relative z-10 animate-[shimmer_3s_linear_infinite] bg-gradient-to-r from-[#FFF2C8] via-[#C58A18] to-[#FFF2C8] bg-[length:200%_auto] text-transparent bg-clip-text">
                {config.label}
              </span>
            </div>
          ) : (
            <div className={`flex items-center justify-center px-6 py-1 rounded-b-xl border-x border-b ${config.labelClass} transform transition-all duration-500`}>
              <span className="text-[12px] tracking-[0.2em] font-score font-bold uppercase text-white">{config.label}</span>
            </div>
          )
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
          <div className="relative shrink-0 order-1 md:order-1 z-20">
            {/* Avatar Champion Frame */}
            <div className={`relative rounded-full ${isFinal ? 'p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.4)]' : 'p-1 bg-black'} overflow-hidden`}>
              {isFinal && (
                 <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,rgba(245,158,11,1)_100%)] animate-[sonarSweep_2s_linear_infinite]" />
              )}
              <div className={`relative rounded-full overflow-hidden z-10 ${isFinal ? 'bg-[#090a0e]' : 'bg-black'}`}>
                <Avatar p={h} size={isFinal ? 92 : 80} className={`rounded-full ${isFinal ? 'ring-2 ring-[#090a0e]' : 'ring-2 ring-white/10'}`} />
              </div>
            </div>
            {/* Club Badge Overlap */}
            {hBadgeUrl && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#0a0b10] border border-white/10 p-1 shadow-lg z-30">
                <img src={hBadgeUrl} alt="badge" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
          
          <div className={`flex flex-col items-center md:items-start min-w-0 order-2 md:order-2 relative ${isFinal ? 'px-4' : ''}`}>
            {isFinal && hBadgeUrl && (
              <img src={hBadgeUrl} alt="watermark" className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 opacity-[0.05] grayscale mix-blend-overlay pointer-events-none animate-[breatheWatermark_4s_ease-in-out_infinite]" />
            )}
            <span className={`font-black text-xl md:text-2xl truncate text-center md:text-left relative z-10 ${isFinal ? 'text-white drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] animate-[goldFoilSheen_5s_linear_infinite] bg-gradient-to-r from-white via-[#FFF2C8] to-white bg-[length:200%_auto] text-transparent bg-clip-text' : 'text-white drop-shadow-md'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(h?.name)}
            </span>
            <div className={`flex items-center gap-2 mt-1 relative z-10`}>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isFinal ? 'bg-white/5 border border-white/10 text-amber-300/90' : 'text-slate-400'}`}>
                {h?.favoriteClub || 'TBD'}
              </span>
            </div>
          </div>
        </div>

        {/* Center VS Area */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[140px] relative order-3 md:order-2 my-4 md:my-0">
          
          {/* Final Trophy & Shockwaves */}
          {isFinal && (
            <div className="relative z-10 flex flex-col items-center justify-center mb-2 mt-4 perspective-[800px]">
              <div className="relative flex items-center justify-center w-56 h-36">
                {/* Orbital Rings */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-[140px] pointer-events-none z-0">
                  <div className="absolute inset-0 w-full h-full rounded-full border border-[#F3C75F]/20 border-t-[#F3C75F]/50 border-b-[#F3C75F]/50 animate-[spin3D_6s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }} />
                  <div className="absolute inset-0 w-full h-full rounded-full border-[2px] border-[#FFF2C8]/10 border-l-[#FFF2C8]/60 animate-[spin3DReverse_8s_linear_infinite]" style={{ transformStyle: 'preserve-3d' }} />
                </div>
                
                {/* Central Trophy Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,201,77,0.35)_0%,transparent_70%)] blur-[20px] pointer-events-none mix-blend-screen z-0" />

                {/* Trophy on Pedestal Effect */}
                <div className="absolute bottom-[-10px] w-24 h-4 rounded-full bg-amber-500/30 blur-md animate-[heartbeatPulse_2.5s_ease-in-out_infinite]" />
                
                {/* Trophy Asset with Glint Mask */}
                <div className="relative z-10 w-32 h-full overflow-hidden">
                   <img src="/assets/trophies/BB-Champion.png" alt="Trophy" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(243,199,95,0.4)]" />
                   {/* Glint Mask layer over the trophy */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 animate-[gemGlint_4s_linear_infinite]" style={{ mixBlendMode: 'overlay' }} />
                </div>
              </div>
              {/* Stakes Badge */}
              <div className="mt-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm shadow-[0_0_15px_rgba(245,158,11,0.15)] animate-[heartbeatPulse_4s_ease-in-out_infinite_reverse]">
                 <span className="text-[9px] font-black uppercase tracking-widest text-amber-300">Championship Title</span>
              </div>
            </div>
          )}

          {/* Central Connecting Line - Hidden for Final */}
          {!isFinal && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block`} />
          )}
          
          {/* VS Polygon - Hidden for Final */}
          {!isFinal && (
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
          )}
          
          {/* START Button */}
          {!isCompleted && onStartClick && (
             <div 
               onClick={(e) => {
                 if (onStartClick) {
                   e.stopPropagation();
                   onStartClick();
                 }
               }}
               className={`relative overflow-hidden flex items-center justify-center px-5 py-1.5 mt-2 rounded-full border backdrop-blur-md cursor-pointer transition-all duration-300 transform group-hover:-translate-y-1 z-20 ${config.startBtn}`}
             >
               {isFinal && (
                  <div className="absolute top-0 -left-[100%] w-[50%] h-[100%] bg-gradient-to-r from-transparent via-white to-transparent opacity-60 animate-[foilGlint_3s_ease-in-out_infinite]" style={{ transform: 'skewX(-45deg)' }} />
               )}
               <span className={`text-[14px] font-black uppercase tracking-[0.25em] relative z-10 ${isFinal ? 'drop-shadow-none' : ''}`}>Start</span>
             </div>
          )}
        </div>

        {/* Away Player (Right) */}
        <div className="flex flex-col md:flex-row items-center gap-4 flex-1 w-full justify-end order-4 md:order-3">
          
          <div className={`flex flex-col items-center md:items-end min-w-0 order-2 md:order-1 relative ${isFinal ? 'px-4' : ''}`}>
            {isFinal && aBadgeUrl && (
              <img src={aBadgeUrl} alt="watermark" className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 opacity-[0.05] grayscale mix-blend-overlay pointer-events-none animate-[breatheWatermark_4s_ease-in-out_infinite]" />
            )}
            <span className={`font-black text-xl md:text-2xl truncate text-center md:text-right relative z-10 ${isFinal ? 'text-white drop-shadow-[0_2px_12px_rgba(245,158,11,0.35)] animate-[goldFoilSheen_5s_linear_infinite] bg-gradient-to-r from-white via-[#FFF2C8] to-white bg-[length:200%_auto] text-transparent bg-clip-text' : 'text-white drop-shadow-md'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              {isFinal && (!a || a?.name === 'TBD') ? (
                <span className="animate-[hologramGlitch_4s_linear_infinite] inline-block">Awaiting Challenger</span>
              ) : formatName(a?.name)}
            </span>
            <div className={`flex items-center justify-center md:justify-end gap-2 mt-1 relative z-10`}>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isFinal ? 'bg-white/5 border border-white/10 text-amber-300/90' : 'text-slate-400'}`}>
                {isFinal && (!a || a?.name === 'TBD') ? 'Semi-Final Winner' : (a?.favoriteClub || 'TBD')}
              </span>
            </div>
          </div>

          <div className="relative shrink-0 order-1 md:order-2 z-20">
            {isFinal && (!a || a?.name === 'TBD') ? (
              <div className="relative rounded-full ring-2 ring-white/10 ring-offset-4 ring-offset-[#090a0e] overflow-hidden w-[80px] h-[80px] md:w-[92px] md:h-[92px] bg-white/5 backdrop-blur-sm flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {/* Sonar Sweep */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,transparent_80%,rgba(245,158,11,0.6)_100%)] animate-[sonarSweep_3s_linear_infinite]" />
                {/* Holographic Question Mark */}
                <span className="text-3xl md:text-4xl font-black text-amber-500/40 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-[hologramGlitch_5s_ease-in-out_infinite]">?</span>
                {/* Energy Gravity Pull (Particles) */}
                <div className="absolute inset-0 pointer-events-none">
                   {[...Array(6)].map((_, i) => (
                     <div key={`pull-${i}`} className="absolute w-1 h-1 bg-amber-400 rounded-full animate-[particleRise_2s_ease-in_infinite]" style={{ left: `${Math.random()*100}%`, bottom: '-10px', animationDelay: `${i*0.3}s` }} />
                   ))}
                </div>
              </div>
            ) : (
              <div className={`relative rounded-full ${isFinal ? 'p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.4)]' : 'p-1 bg-black'} overflow-hidden`}>
                {isFinal && (
                   <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,rgba(245,158,11,1)_100%)] animate-[sonarSweep_2s_linear_infinite]" />
                )}
                <div className={`relative rounded-full overflow-hidden z-10 ${isFinal ? 'bg-[#090a0e]' : 'bg-black'}`}>
                  <Avatar p={a} size={isFinal ? 92 : 80} className={`rounded-full ${isFinal ? 'ring-2 ring-[#090a0e]' : 'ring-2 ring-white/10'}`} />
                </div>
              </div>
            )}
            
            {aBadgeUrl && (!isFinal || (a && a?.name !== 'TBD')) && (
              <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-[#0a0b10] border border-white/10 p-1 shadow-lg z-30">
                <img src={aBadgeUrl} alt="badge" className="w-full h-full object-contain" />
              </div>
            )}
          </div>

        </div>
      </div>

    </motion.div>
  );
}
