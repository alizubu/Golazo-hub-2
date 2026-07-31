'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Activity, Trophy, Swords, Target, Handshake, TrendingUp, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagicCard, FadeIn } from '@/app/components/UI';
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
    
    // Skip fetch if initial render with the default selected season
    // But actually, we might want to fetch if the parent passes a new season
    fetchStats();
    
    return () => { isMounted = false; };
  }, [selectedSeasonId, playerId]);

  const selectedSeason = seasons.find(s => s.id === selectedSeasonId) || activeSeason;
  const isActive = selectedSeason?.id === activeSeason?.id;

  const { rank, elo, played, winRate, goals, assists } = stats || {};
  const hasData = played > 0;

  return (
    <FadeIn delay={0.2} className="col-span-12">
      <MagicCard gradientColor="rgba(255, 255, 255, 0.03)" className="relative overflow-hidden group w-full">
        {/* Subtle top accent gradient */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        {/* Ambient lighting background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e12] to-[#12161c] z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3 group-hover:bg-emerald-500/15 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3 group-hover:bg-amber-500/10 transition-colors duration-1000" />
        
        <Card className="bg-transparent border-none shadow-none flex flex-col relative z-10 w-full">
          {/* Unified Header */}
          <CardHeader className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
            <CardTitle className="text-xl sm:text-2xl font-heading font-bold flex items-center gap-2.5 text-stadium-primary">
              <Activity className="text-white/70" size={24}/> Season Stats
            </CardTitle>
            
            {/* Pill-Style Season Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-pitch-bright rounded-full">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50 hover:bg-secondary/80 hover:border-border transition-colors cursor-pointer text-sm font-semibold shadow-sm w-fit">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-foreground">{selectedSeason?.name || "Select Season"}</span>
                  
                  {/* Indicator Dot */}
                  {isActive ? (
                    <span className="relative flex h-2 w-2 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                  ) : (
                    <span className="relative flex items-center ml-1">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-muted-foreground/50 mr-1.5" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Archived</span>
                    </span>
                  )}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border/50 shadow-xl rounded-xl z-[60]">
                {seasons.map(s => {
                  const isAct = s.id === activeSeason?.id;
                  const isSel = s.id === selectedSeasonId;
                  return (
                    <DropdownMenuItem 
                      key={s.id} 
                      onClick={() => onSeasonChange(s.id)}
                      className="flex items-center justify-between cursor-pointer rounded-lg hover:bg-secondary py-2 px-3 m-1"
                    >
                      <div className="flex items-center gap-2">
                        {isAct ? (
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                        )}
                        <span className={`font-semibold ${isSel ? 'text-foreground' : 'text-muted-foreground'}`}>{s.name}</span>
                      </div>
                      {isSel && <Check size={14} className="text-pitch-bright" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-2 sm:grid-cols-6 auto-rows-min gap-3">
              {/* Tile 1: Current Rank (Hero) */}
              <div className="col-span-2 sm:col-span-2 sm:row-span-2 flex">
                <StatTile 
                  icon={Trophy}
                  label="Rank"
                  value={hasData && rank ? `#${rank}` : null}
                  loaded={!loading}
                  colorAccent="gold"
                  size="hero"
                  emptyStateText="Unranked"
                  subtext={isActive && hasData ? "Active season" : null}
                />
              </div>

              {/* Tile 2: Elo Rating */}
              <div className="col-span-2 sm:col-span-2 flex">
                <StatTile 
                  icon={Activity}
                  label="Elo Rating"
                  value={hasData ? elo : null}
                  loaded={!loading}
                  colorAccent="blue"
                  size="medium"
                  isCountUp={true}
                  emptyStateText="No matches"
                />
              </div>

              {/* Tile 3: Win Rate */}
              <div className="col-span-2 sm:col-span-2 flex">
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
              <div className="col-span-2 sm:col-span-2 flex h-full min-h-[90px]">
                <StatTile 
                  icon={Swords}
                  label="Matches"
                  value={hasData ? played : null}
                  loaded={!loading}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No matches yet"
                />
              </div>

              {/* Tile 5: Goals */}
              <div className="col-span-1 sm:col-span-2 flex h-full min-h-[90px]">
                <StatTile 
                  icon={Target}
                  label="Goals"
                  value={hasData ? goals : null}
                  loaded={!loading}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No goals"
                />
              </div>

              {/* Tile 6: Assists */}
              <div className="col-span-1 sm:col-span-2 flex h-full min-h-[90px]">
                <StatTile 
                  icon={Handshake}
                  label="Assists"
                  value={hasData ? assists : null}
                  loaded={!loading}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No assists"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </MagicCard>
    </FadeIn>
  );
}
