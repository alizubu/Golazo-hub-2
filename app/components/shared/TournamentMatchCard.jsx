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
    gridOpacity: 0.08,
    vsBadge: 'stroke-[#FFB800]/80 fill-[#0a0b10] text-[#FFB800] drop-shadow-md',
    startBtn: 'border-[#1769FF]/50 bg-[#1769FF]/20 text-[#00C8FF] shadow-none hover:bg-[#1769FF]/30'
  },
  'eliminator': {
    label: 'ELIMINATOR',
    labelClass: 'bg-gradient-to-r from-[#5c0f0f] to-[#240505] border-[#FF2C2C]/50 text-white shadow-none',
    bgClass: 'bg-gradient-to-r from-[#240505] via-[#3a0808] to-[#240505] border-[#FF2C2C]/30',
    gridColor: '#FF2C2C',
    gridOpacity: 0.08,
    vsBadge: 'stroke-[#FFB800]/80 fill-[#0a0b10] text-[#FFB800] drop-shadow-md',
    startBtn: 'border-[#FF2C2C]/50 bg-[#FF2C2C]/20 text-[#FF4F4F] shadow-none hover:bg-[#FF2C2C]/30'
  },
  'qualifier-2': {
    label: 'QUALIFIER 2',
    labelClass: 'bg-gradient-to-r from-[#4a340a] to-[#211707] border-[#C58A18]/50 text-white shadow-none',
    bgClass: 'bg-gradient-to-r from-[#171003] via-[#332200] to-[#171003] border-[#C58A18]/30',
    gridColor: '#F3C75F',
    gridOpacity: 0.08,
    vsBadge: 'stroke-[#F3C75F]/80 fill-[#0a0b10] text-[#F3C75F] drop-shadow-md',
    startBtn: 'border-[#F3C75F]/50 bg-[#C58A18]/20 text-[#FFD978] shadow-none hover:bg-[#C58A18]/30'
  },
  'final': {
    label: 'FINAL',
    labelClass: 'bg-gradient-to-r from-[#2c200b] via-[#4a3610] to-[#2c200b] border-y-[#F3C75F] border-x-transparent border-y-[2px] text-[#FFE7A3] shadow-none px-8 py-1.5 font-black text-[14px]',
    bgClass: 'bg-gradient-to-r from-[#211707] via-[#5C4000] to-[#211707] border-[#F4D06F]/50',
    gridColor: '#FFE7A3',
    gridOpacity: 0.12,
    vsBadge: 'stroke-[#F4D06F] fill-[#11100D] text-[#F4D06F] drop-shadow-md stroke-[2px]',
    startBtn: 'border-[#C99A32]/80 bg-[#8A641C]/30 text-[#FFE7A3] shadow-none hover:bg-[#C99A32]/40 px-6 py-2'
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
        `}</style>
      )}

      {/* Background Layers */}
      {config.glowClass && <div className={`absolute inset-0 bg-gradient-to-br ${config.glowClass} opacity-50 pointer-events-none transition-all duration-500`} />}
      {config.hoverGlowClass && <div className={`absolute -inset-[1px] rounded-[24px] bg-gradient-to-r ${config.hoverGlowClass} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />}
      
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
            <div className="relative flex items-center justify-center mt-2 px-8 py-4">
              {/* Sunburst God-Rays */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                 <div className="w-[180px] h-[180px] bg-[conic-gradient(from_0deg,transparent_0%,rgba(243,199,95,0.4)_10%,transparent_20%,rgba(243,199,95,0.4)_30%,transparent_40%,rgba(243,199,95,0.4)_50%,transparent_60%,rgba(243,199,95,0.4)_70%,transparent_80%,rgba(243,199,95,0.4)_90%,transparent_100%)] animate-[spin_20s_linear_infinite]" style={{ maskImage: 'radial-gradient(circle, white 0%, transparent 70%)' }} />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(243,199,95,0.5),transparent_60%)] blur-lg pointer-events-none" />
              
              <span className="text-[16px] tracking-[0.4em] font-score font-black relative z-10 bg-gradient-to-r from-[#FFF2C8] via-[#C58A18] to-[#FFF2C8] bg-[length:200%_auto] text-transparent bg-clip-text animate-[shimmer_3s_linear_infinite] drop-shadow-[0_0_12px_rgba(243,199,95,0.8)]">
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
            {/* Heavy 3D Rotating Bezel */}
            <div className={`relative rounded-full ${isFinal ? 'p-[6px] bg-[#1a1104] shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'p-1 bg-black'} overflow-hidden`}>
              {isFinal && (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-br from-[#FFF2C8] via-[#C58A18] to-[#4a3610]" />
                   <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#ffffff_90%,transparent_100%)] animate-[spin_3s_linear_infinite]" />
                 </>
              )}
              <div className={`relative rounded-full overflow-hidden z-10 ${isFinal ? 'bg-[#0a0702] border-[4px] border-[#100A02] shadow-[inset_0_0_15px_rgba(0,0,0,1)]' : 'bg-black'}`}>
                <Avatar p={h} size={isFinal ? 76 : 80} className={`rounded-full ${isFinal ? '' : 'ring-2 ring-white/10'}`} />
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
            {isFinal && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,199,95,0.25),transparent_70%)] blur-xl pointer-events-none" />
            )}
            {isFinal && hBadgeUrl && (
              <img src={hBadgeUrl} alt="watermark" className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-16 opacity-[0.08] grayscale mix-blend-overlay pointer-events-none" />
            )}
            <span className={`font-bold text-xl md:text-2xl truncate text-center md:text-left drop-shadow-md relative z-10 ${isFinal ? 'bg-gradient-to-b from-[#FFF2C8] via-[#F4D06F] to-[#B37700] text-transparent bg-clip-text' : 'text-white'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(h?.name)}
            </span>
            <div className={`flex items-center gap-2 mt-1 relative z-10 ${isFinal ? 'text-[#C58A18]' : 'text-slate-400'}`}>
              <span className="text-sm font-semibold">{h?.favoriteClub || 'TBD'}</span>
            </div>
          </div>
        </div>

        {/* Center VS Area */}
        <div className="flex flex-col items-center justify-center shrink-0 min-w-[140px] relative order-3 md:order-2 my-4 md:my-0">
          
          {/* Final Trophy & Shockwaves */}
          {isFinal && (
            <div className="relative z-10 flex items-center justify-center w-56 h-36 mb-2 mt-4 perspective-[800px]">
              
              {/* Seismic Shockwave */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] w-[180px] h-[180px] pointer-events-none z-0">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={`shockwave-${i}`}
                    className="absolute inset-0 w-full h-full rounded-full border-[2px] border-[#F4D06F] opacity-0 animate-[shockwave_3s_ease-out_infinite]"
                    style={{ animationDelay: `${i * 1}s` }}
                  />
                ))}
              </div>
              
              {/* Central Trophy Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,201,77,0.4)_0%,transparent_70%)] blur-[15px] pointer-events-none mix-blend-screen z-0" />

              {/* Trophy - Static NO Exaggerated float */}
              <img src="/assets/trophies/BB-Champion.png" alt="Trophy" className="w-32 h-full object-contain drop-shadow-[0_0_25px_rgba(243,199,95,0.6)] opacity-100 relative z-10" />
              
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
          
          <div className={`flex flex-col items-center md:items-end min-w-0 order-2 md:order-1 relative ${isFinal ? 'px-4' : ''}`}>
            {isFinal && (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,199,95,0.25),transparent_70%)] blur-xl pointer-events-none" />
            )}
            {isFinal && aBadgeUrl && (
              <img src={aBadgeUrl} alt="watermark" className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-16 opacity-[0.08] grayscale mix-blend-overlay pointer-events-none" />
            )}
            <span className={`font-bold text-xl md:text-2xl truncate text-center md:text-right drop-shadow-md relative z-10 ${isFinal ? 'bg-gradient-to-b from-[#FFF2C8] via-[#F4D06F] to-[#B37700] text-transparent bg-clip-text' : 'text-white'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
              {formatName(a?.name)}
            </span>
            <div className={`flex items-center gap-2 mt-1 relative z-10 ${isFinal ? 'text-[#C58A18]' : 'text-slate-400'}`}>
              <span className="text-sm font-semibold">{a?.favoriteClub || 'TBD'}</span>
            </div>
          </div>

          <div className="relative shrink-0 order-1 md:order-2 z-20">
            {/* Heavy 3D Rotating Bezel */}
            <div className={`relative rounded-full ${isFinal ? 'p-[6px] bg-[#1a1104] shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'p-1 bg-black'} overflow-hidden`}>
              {isFinal && (
                 <>
                   <div className="absolute inset-0 bg-gradient-to-br from-[#FFF2C8] via-[#C58A18] to-[#4a3610]" />
                   <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,transparent_70%,#ffffff_90%,transparent_100%)] animate-[spin_3s_linear_infinite]" />
                 </>
              )}
              <div className={`relative rounded-full overflow-hidden z-10 ${isFinal ? 'bg-[#0a0702] border-[4px] border-[#100A02] shadow-[inset_0_0_15px_rgba(0,0,0,1)]' : 'bg-black'}`}>
                <Avatar p={a} size={isFinal ? 76 : 80} className={`rounded-full ${isFinal ? '' : 'ring-2 ring-white/10'}`} />
              </div>
            </div>
            {/* Club Badge Overlap */}
            {aBadgeUrl && (
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
