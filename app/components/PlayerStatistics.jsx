'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Activity, Trophy, Swords, Target, Handshake, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { MagicCard, FadeIn } from '@/app/components/UI';
import { StatTile } from './StatTile';

export function PlayerStatistics({ myRank, elo, played, winRate, goals, assists, statsLoaded }) {
  return (
    <FadeIn delay={0.2} className="col-span-1 md:col-span-12 h-full">
      <MagicCard gradientColor="rgba(255, 255, 255, 0.03)" className="h-full relative overflow-hidden group">
        
        {/* Ambient lighting background: Sleek gradients instead of dot pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c0e12] to-[#12161c] z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none transform translate-x-1/3 -translate-y-1/3 group-hover:bg-emerald-500/15 transition-colors duration-1000" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/3 translate-y-1/3 group-hover:bg-amber-500/10 transition-colors duration-1000" />
        
        {/* Noise overlay for premium texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay z-0 pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

        <Card className="h-full bg-transparent border-none shadow-none flex flex-col relative z-10">
          <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between relative">
            {/* Subtle glow on the divider */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            <CardTitle className="text-lg sm:text-xl font-display font-bold flex items-center gap-2.5 text-stadium-primary">
              <Activity className="text-white/70" size={20}/> Player Statistics
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider shadow-[0_0_12px_-2px_rgba(16,185,129,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400" />
                </span> 
                S2026 ACTIVE
              </span>
            </div>
          </CardHeader>
          
          <CardContent className="pt-5 pb-3 flex-1">
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-6 grid-rows-auto sm:grid-rows-2 gap-3 sm:gap-4 h-full"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
            >
              {/* Tile 1: Current Rank (Hero) - Tall on desktop, full width on mobile */}
              <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-2 sm:col-span-2 sm:row-span-2 flex">
                <StatTile 
                  icon={Trophy}
                  label="Current Rank"
                  value={myRank ? `#${myRank}` : null}
                  loaded={statsLoaded}
                  colorAccent="gold"
                  size="hero"
                  emptyStateText="Unranked"
                  subtext="↑2 this season"
                />
              </motion.div>

              {/* Tile 2: Elo Rating - Row 1 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="col-span-1 sm:col-span-2 flex">
                <StatTile 
                  icon={Activity}
                  label="Elo Rating"
                  value={elo}
                  loaded={statsLoaded}
                  colorAccent="blue"
                  size="medium"
                  isCountUp={true}
                  emptyStateText="No matches"
                />
              </motion.div>

              {/* Tile 3: Matches - Row 1 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="col-span-2 sm:col-span-2 flex">
                <StatTile 
                  icon={Swords}
                  label="Matches"
                  value={played}
                  loaded={statsLoaded}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No matches yet"
                  onClick={() => {
                    console.log("Navigating to Matches...");
                  }}
                />
              </motion.div>

              {/* Tile 4: Win Rate - Row 2 (under Elo) */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="col-span-1 sm:col-span-2 flex">
                <StatTile 
                  icon={TrendingUp}
                  label="Win Rate"
                  value={winRate}
                  loaded={statsLoaded}
                  colorAccent="green"
                  size="medium"
                  isPercentage={true}
                  emptyStateText="Play 1+ match"
                />
              </motion.div>

              {/* Tile 5: Goals - Row 2 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="col-span-1 sm:col-span-1 flex">
                <StatTile 
                  icon={Target}
                  label="Goals"
                  value={goals}
                  loaded={statsLoaded}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No goals"
                />
              </motion.div>

              {/* Tile 6: Assists - Row 2 */}
              <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} className="col-span-1 sm:col-span-1 flex">
                <StatTile 
                  icon={Handshake}
                  label="Assists"
                  value={assists}
                  loaded={statsLoaded}
                  colorAccent="slate"
                  size="small"
                  isCountUp={true}
                  emptyStateText="No assists"
                />
              </motion.div>

            </motion.div>
          </CardContent>
        </Card>
      </MagicCard>
    </FadeIn>
  );
}
