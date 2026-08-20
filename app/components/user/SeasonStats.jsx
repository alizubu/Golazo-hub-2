'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Swords, Target, Handshake, TrendingUp, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/app/components/shared/UI';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { NumberTicker } from '@/app/components/ui/number-ticker';

export function SeasonStats({ playerId, initialStats, seasons, activeSeason, selectedSeasonId, onSeasonChange }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/players/${playerId}/stats?seasonId=${selectedSeasonId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch season stats", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchStats();
    return () => { isMounted = false; };
  }, [selectedSeasonId, playerId]);

  const isOverall = selectedSeasonId === 'overall';
  const selectedSeason = isOverall ? { name: "Overall Career", id: 'overall' } : (seasons.find(s => s.id === selectedSeasonId) || activeSeason);
  const isActive = !isOverall && selectedSeason?.id === activeSeason?.id;

  const { rank, played, winRate, goals, assists, won, lost } = stats || {};
  const hasData = played > 0;

  const winRateColor = winRate >= 50 ? "#22c55e" : "#ef4444";
  const radius = 64;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - ((hasData ? winRate : 0) / 100) * circumference;

  return (
    <FadeIn delay={0.2} className="col-span-12">
      <div className="relative overflow-hidden w-full bg-card dark:bg-card border border-border/80 dark:border-white/[0.08] rounded-[20px] shadow-sm">
        <div className="pb-3 pt-5 px-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative border-b border-border/40 dark:border-white/[0.06]">
          <div className="text-xl sm:text-2xl font-black flex items-center gap-2.5 text-foreground uppercase tracking-wide" style={{ fontFamily: "'Sora', sans-serif", fontWeight: 900 }}>
            <Activity className="text-amber-500" size={24}/> SEASON OVERVIEW
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background dark:bg-background dark:bg-[#12151b] border border-border hover:bg-secondary dark:hover:bg-secondary dark:bg-[#1a1e27] hover:border-border dark:hover:border-border dark:border-white/20 transition-colors cursor-pointer text-sm font-[600] text-foreground shadow-sm w-fit h-[36px]">
                <Calendar size={14} className="text-[#6b7280]" />
                <span>{selectedSeason?.name || "Select Season"}</span>
                
                {isActive ? (
                  <motion.div 
                    className="w-2 h-2 ml-1 rounded-full bg-[#22c55e]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <div className="w-2 h-2 ml-1 rounded-full bg-[#4b5563]" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background dark:bg-[#12151b] border-border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] rounded-xl z-[60] text-foreground">
              <DropdownMenuItem 
                onClick={() => onSeasonChange('overall')}
                className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/5 py-2 px-3 m-1 focus:bg-white/5 focus:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className={`font-[600] ${isOverall ? 'text-foreground' : 'text-[#6b7280]'}`}>Overall Career</span>
                </div>
                {isOverall && <Check size={14} className="text-foreground" />}
              </DropdownMenuItem>
              {seasons.map(s => {
                const isAct = s.id === activeSeason?.id;
                const isSel = s.id === selectedSeasonId;
                return (
                  <DropdownMenuItem 
                    key={s.id} 
                    onClick={() => onSeasonChange(s.id)}
                    className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/5 py-2 px-3 m-1 focus:bg-white/5 focus:text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      {isAct ? (
                        <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#4b5563]" />
                      )}
                      <span className={`font-[600] ${isSel ? 'text-foreground' : 'text-[#6b7280]'}`}>{s.name}</span>
                    </div>
                    {isSel && <Check size={14} className="text-foreground" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="pt-8 pb-10 px-5 sm:px-6 flex flex-col md:flex-row items-center gap-10 md:gap-14">
          
          {/* 1. The Fitness Ring (Win Rate) + Rank */}
          <div className="flex flex-col items-center justify-center shrink-0 relative group">
            <div className="relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 mb-4">
              {/* Background Track */}
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90 drop-shadow-xl scale-110 md:scale-125">
                <circle
                  stroke="rgba(255,255,255,0.05)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                {/* Progress Ring */}
                {!loading && (
                  <motion.circle
                    stroke={winRateColor}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                    className="drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                  />
                )}
              </svg>
              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl md:text-4xl font-black font-score tracking-tighter" style={{ color: winRateColor }}>
                  {loading ? '-' : (hasData ? <NumberTicker value={winRate} /> : 0)}<span className="text-xl opacity-80">%</span>
                </span>
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest mt-1">Win Rate</span>
              </div>
            </div>
            {hasData && rank && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Trophy size={12} className="text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase">#{rank} Season Rank</span>
              </motion.div>
            )}
          </div>

          {/* 2. Flat Stat Row */}
          <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row lg:justify-between gap-6 md:gap-4 relative z-10">
            
            {/* Matches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center lg:items-start group">
               <Swords size={20} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData ? <NumberTicker value={played} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-gray-300 tracking-widest">Matches</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">Played</span>
               </div>
            </motion.div>

            {/* Wins */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col items-center lg:items-start group">
               <Trophy size={20} className="text-amber-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData ? <NumberTicker value={won || 0} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-amber-500 tracking-widest drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">Wins</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">-</span>
               </div>
            </motion.div>

            {/* Losses */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center lg:items-start group">
               <TrendingUp size={20} className="text-red-500 mb-2 rotate-180 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData ? <NumberTicker value={lost || 0} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-red-500 tracking-widest drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">Losses</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">Total</span>
               </div>
            </motion.div>

            {/* Goals */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col items-center lg:items-start group">
               <Target size={20} className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData ? <NumberTicker value={goals} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-amber-500 tracking-widest drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">Goals</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">Scored</span>
               </div>
            </motion.div>
            
            {/* Gls/Game */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center lg:items-start group">
               <Activity size={20} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData && played > 0 ? <NumberTicker value={Math.round((goals/played)*10)/10} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-gray-300 tracking-widest">Gls/Game</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">Average</span>
               </div>
            </motion.div>

            {/* Assists */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex flex-col items-center lg:items-start group">
               <Handshake size={20} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
               <span className="text-2xl md:text-3xl font-black text-white font-score drop-shadow-md">{loading ? '-' : (hasData ? <NumberTicker value={assists} /> : 0)}</span>
               <div className="flex items-center gap-1 mt-1">
                 <span className="text-[10px] md:text-xs uppercase font-black text-amber-500 tracking-widest drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">Assists</span>
                 <span className="text-[10px] md:text-xs text-muted-foreground ml-1">Total</span>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </FadeIn>
  );
}
