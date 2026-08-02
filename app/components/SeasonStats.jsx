'use client';
import React, { useState, useEffect } from 'react';
import { Activity, Trophy, Swords, Target, Handshake, TrendingUp, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '@/app/components/UI';
import { StatTile } from './StatTile';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';

export function SeasonStats({ playerId, initialStats, seasons, activeSeason, selectedSeasonId, onSeasonChange }) {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);

  // Fetch new stats when season changes
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
    
    // Fetch stats for the new season
    fetchStats();
    
    return () => { isMounted = false; };
  }, [selectedSeasonId, playerId]);

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) || activeSeason;
  const isActive = selectedSeason?.id === activeSeason?.id;

  const { rank, elo, played, winRate, goals, assists } = stats || {};
  const hasData = played > 0;

  return (
    <FadeIn delay={0.2} className="col-span-12">
      {/* 
        Section Container:
        Subtle 1px solid rgba(255,255,255,0.08) border, border-radius: 20px
        Background: #0a0c10
      */}
      <div className="relative overflow-hidden group w-full bg-[#0a0c10] border border-white/[0.08] rounded-[20px]">
        {/* Unified Header */}
        <div className="pb-3 pt-5 px-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 text-white">
            <Activity className="text-white/70" size={24}/> Season Stats
          </div>
          
          {/* Pill-Style Season Selector Redesign */}
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-full">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12151b] border border-white/10 hover:bg-[#1a1e27] hover:border-white/20 transition-colors cursor-pointer text-sm font-[600] text-white shadow-sm w-fit h-[36px]">
                <Calendar size={14} className="text-[#6b7280]" />
                <span>{selectedSeason?.name || "Select Season"}</span>
                
                {/* Status Dot */}
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
            <DropdownMenuContent align="end" className="w-56 bg-[#12151b] border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] rounded-xl z-[60] text-white">
              {seasons.map(s => {
                const isAct = s.id === activeSeason?.id;
                const isSel = s.id === selectedSeasonId;
                return (
                  <DropdownMenuItem 
                    key={s.id} 
                    onClick={() => onSeasonChange(s.id)}
                    className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-white/5 py-2 px-3 m-1 focus:bg-white/5 focus:text-white"
                  >
                    <div className="flex items-center gap-2">
                      {isAct ? (
                        <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-[#4b5563]" />
                      )}
                      <span className={`font-[600] ${isSel ? 'text-white' : 'text-[#6b7280]'}`}>{s.name}</span>
                    </div>
                    {isSel && <Check size={14} className="text-white" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="pt-2 pb-5 px-5 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedSeasonId}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.06 }
                },
                exit: { opacity: 0, transition: { duration: 0.2 } }
              }}
              // MATHEMATICALLY PERFECT 8-COLUMN GRID
              // Mobile: 2 cols
              // Desktop: 8 cols to allow 2+3+3 on row 1, 2+2+2+2 on row 2
              className="grid grid-cols-2 lg:grid-cols-8 auto-rows-min gap-4"
            >
              {/* Tile 1: Current Rank (Hero) */}
              {/* Desktop: takes 2 cols, spans 2 rows */}
              {/* Mobile: takes 2 cols, normal height */}
              <div className="col-span-2 lg:col-span-2 lg:row-span-2 flex min-h-[140px] lg:min-h-auto">
                <StatTile 
                  icon={Trophy}
                  label="Rank"
                  value={hasData && rank ? `#${rank}` : null}
                  loaded={!loading}
                  size="hero"
                  emptyStateText="Unranked"
                  subtext={isActive && hasData ? "Active season" : null}
                />
              </div>

              {/* Tile 2: Elo Rating */}
              {/* Desktop: takes 3 cols out of 8 */}
              {/* Mobile: takes 1 col out of 2 */}
              <div className="col-span-1 lg:col-span-3 flex min-h-[140px]">
                <StatTile 
                  icon={Activity}
                  label="Elo Rating"
                  value={hasData ? elo : null}
                  loaded={!loading}
                  size="medium"
                  isCountUp={true}
                  emptyStateText="No matches"
                />
              </div>

              {/* Tile 3: Win Rate */}
              <div className="col-span-1 lg:col-span-3 flex min-h-[140px]">
                <StatTile 
                  icon={TrendingUp}
                  label="Win Rate"
                  value={hasData ? winRate : null}
                  loaded={!loading}
                  colorAccent="green"
                  size="medium"
                  isPercentage={true}
                  emptyStateText="Play 1+ match"
                />
              </div>

              {/* Tile 4: Matches */}
              {/* Desktop: takes 2 cols out of 8 */}
              {/* Mobile: takes 1 col */}
              <div className="col-span-1 lg:col-span-2 flex h-full min-h-[120px]">
                <StatTile 
                  icon={Swords}
                  label="Matches"
                  value={hasData ? played : null}
                  loaded={!loading}
                  size="small"
                  isCountUp={true}
                  emptyStateText="No matches"
                />
              </div>

              {/* Tile 5: Goals */}
              {/* Desktop: takes 2 cols out of 8 */}
              {/* Mobile: takes 1 col */}
              <div className="col-span-1 lg:col-span-2 flex h-full min-h-[120px]">
                <StatTile 
                  icon={Target}
                  label="Goals"
                  value={hasData ? goals : null}
                  loaded={!loading}
                  size="small"
                  isCountUp={true}
                  emptyStateText="No goals"
                />
              </div>

              {/* Tile 6: Assists */}
              {/* Desktop: takes 2 cols out of 8 */}
              {/* Mobile fallback: col-span-2 for 2+1 layout to avoid squishing */}
              <div className="col-span-2 sm:col-span-1 lg:col-span-2 flex h-full min-h-[120px]">
                <StatTile 
                  icon={Handshake}
                  label="Assists"
                  value={hasData ? assists : null}
                  loaded={!loading}
                  size="small"
                  isCountUp={true}
                  emptyStateText="No assists"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </FadeIn>
  );
}
