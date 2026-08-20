'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Swords, Target, TrendingUp, Calendar, Check, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/app/components/shared/UI';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';
import { NumberTicker } from '@/app/components/ui/number-ticker';
import { ProgressCircle } from '@tremor/react';
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
      <div className="relative overflow-hidden w-full bg-[#0B0F14] border border-white/[0.08] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
        <div className="h-[55px] md:h-[60px] px-5 sm:px-6 flex items-center justify-between gap-4 relative border-b border-white/[0.06]">
          <div className="text-[17px] md:text-[19px] font-[800] flex items-center gap-2.5 text-[#F5F7FA] uppercase tracking-wide">
            <Activity className="text-amber-500" size={20}/> SEASON OVERVIEW
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-colors cursor-pointer text-xs font-[700] text-[#F5F7FA] shadow-sm w-fit h-[32px]">
                <Calendar size={12} className="text-[#8B95A3]" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">{selectedSeason?.name || "Select Season"}</span>
                
                {isActive ? (
                  <motion.div 
                    className="w-1.5 h-1.5 ml-1 rounded-full bg-[#22c55e]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <div className="w-1.5 h-1.5 ml-1 rounded-full bg-[#4b5563]" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0D1218] border border-[#202630] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] rounded-xl z-[60] text-[#F5F7FA]">
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
        <div className="pt-4 pb-6 px-4 md:pt-6 md:pb-8 flex flex-col md:flex-row items-stretch w-full overflow-hidden">
          
          {/* 1. WIN RATE (Hero Column) */}
          <div className="flex flex-col items-center justify-center relative group w-full md:w-1/6 md:min-w-[140px] py-4">
            <div className="relative flex items-center justify-center mb-2 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <ProgressCircle value={hasData ? winRate : 0} radius={64} strokeWidth={8} color={winRate >= 50 ? "amber" : "red"}>
                <div className="flex flex-col items-center justify-center text-center mt-1">
                  <span className="text-[28px] md:text-[32px] font-[900] tracking-tight leading-none text-white">
                    {loading ? '-' : (hasData ? <NumberTicker value={winRate} /> : 0)}<span className="text-lg opacity-80 text-amber-500">%</span>
                  </span>
                  <span className="text-[9px] uppercase font-[700] text-[#8B95A3] tracking-[0.08em] mt-1">WIN RATE</span>
                </div>
              </ProgressCircle>
            </div>
            
            {hasData && rank ? (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center mt-2 group-hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-1.5 bg-[#0B0F14] border border-[#F5B72B] px-3 py-1 rounded-[6px] shadow-[0_0_10px_rgba(245,183,43,0.1)] mb-1.5">
                  <Trophy size={10} className="text-[#F5B72B]" />
                  <span className="text-[11px] font-[800] text-[#F5B72B]">#{rank}</span>
                </div>
                <span className="text-[9px] font-[700] text-[#8B95A3] uppercase tracking-widest">SEASON RANK</span>
              </motion.div>
            ) : (
              <div className="h-10 mt-2"></div>
            )}
          </div>

          {/* Vertical Divider for desktop */}
          <div className="hidden md:block w-px bg-white/[0.08] my-4 mx-2"></div>
          {/* Horizontal Divider for mobile */}
          <div className="md:hidden h-px w-full bg-white/[0.08] my-2"></div>

          {/* Remaining 6 Stats Container */}
          <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-6 items-stretch">
            
            {/* Matches */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 relative group hover:-translate-y-1 transition-transform cursor-default">
               <Swords size={26} className="text-[#A855F7] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData ? <NumberTicker value={played} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#A855F7] tracking-[0.08em] mb-1.5">MATCHES</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">Played</span>
            </motion.div>

            {/* Vertical Divider */}
            <div className="hidden lg:block w-px bg-white/[0.08] my-4 absolute right-0 top-0 bottom-0"></div>

            {/* Wins */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 lg:border-l lg:border-white/[0.08] relative group hover:-translate-y-1 transition-transform cursor-default">
               <Trophy size={26} className="text-[#F5B72B] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(245,183,43,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData ? <NumberTicker value={won || 0} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#F5B72B] tracking-[0.08em] mb-1.5">WINS</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">—</span>
            </motion.div>

            {/* Losses */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 lg:border-l lg:border-white/[0.08] relative group hover:-translate-y-1 transition-transform cursor-default">
               <TrendingUp size={26} className="text-[#EF4444] mb-2 rotate-180 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData ? <NumberTicker value={lost || 0} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#EF4444] tracking-[0.08em] mb-1.5">LOSSES</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">Total</span>
            </motion.div>

            {/* Goals */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 lg:border-l lg:border-white/[0.08] relative group hover:-translate-y-1 transition-transform cursor-default">
               <Target size={26} className="text-[#22C55E] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData ? <NumberTicker value={goals} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#22C55E] tracking-[0.08em] mb-1.5">GOALS</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">Scored</span>
            </motion.div>
            
            {/* Gls/Game */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 lg:border-l lg:border-white/[0.08] relative group hover:-translate-y-1 transition-transform cursor-default">
               <Activity size={26} className="text-[#3B82F6] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData && played > 0 ? <NumberTicker value={Math.round((goals/played)*10)/10} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#3B82F6] tracking-[0.08em] mb-1.5">GLS/GAME</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">Average</span>
            </motion.div>

            {/* Assists */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="flex flex-col items-center justify-center py-5 md:py-4 px-2 md:px-0 lg:border-l lg:border-white/[0.08] relative group hover:-translate-y-1 transition-transform cursor-default">
               <Shield size={26} className="text-[#A855F7] mb-2 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all" />
               <span className="text-[28px] md:text-[32px] font-[800] text-[#F5F7FA] leading-none mb-1.5">{loading ? '-' : (hasData ? <NumberTicker value={assists} /> : 0)}</span>
               <span className="text-[10px] md:text-[11px] uppercase font-[700] text-[#A855F7] tracking-[0.08em] mb-1.5">ASSISTS</span>
               <span className="text-[11px] md:text-[12px] font-[500] text-[#8B95A3] opacity-70">Total</span>
            </motion.div>

          </div>
        </div>
      </div>
    </FadeIn>
  );
}
