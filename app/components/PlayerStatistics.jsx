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
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 h-full"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1, transition: { staggerChildren: 0.08 } }
              }}
            >
              {/* Tile 1: Current Rank (Hero) */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-2 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={Trophy}
                  label="Current Rank"
                  value={myRank ? `#${myRank}` : null}
                  loaded={statsLoaded}
                  colorAccent="gold"
                  tier="hero"
                  emptyStateText="Unranked"
                />
              </motion.div>

              {/* Tile 2: Elo Rating */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-1 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={Activity}
                  label="Elo Rating"
                  value={elo}
                  loaded={statsLoaded}
                  colorAccent="blue"
                  isCountUp={true}
                  emptyStateText="No matches"
                />
              </motion.div>

              {/* Tile 3: Matches */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-1 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={Swords}
                  label="Matches"
                  value={played}
                  loaded={statsLoaded}
                  colorAccent="slate"
                  isCountUp={true}
                  emptyStateText="No matches yet"
                  onClick={() => {
                    // Placeholder for future deep-linking
                    console.log("Navigating to Matches...");
                  }}
                />
              </motion.div>

              {/* Tile 4: Win Rate */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-1 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={TrendingUp}
                  label="Win Rate"
                  value={winRate}
                  loaded={statsLoaded}
                  colorAccent="green"
                  isPercentage={true}
                  emptyStateText="Play 1+ match"
                />
              </motion.div>

              {/* Tile 5: Goals */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-1 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={Target}
                  label="Goals"
                  value={goals}
                  loaded={statsLoaded}
                  colorAccent="orange"
                  isCountUp={true}
                  emptyStateText="No goals yet"
                />
              </motion.div>

              {/* Tile 6: Assists */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="col-span-2 md:col-span-1 lg:col-span-1">
                <StatTile 
                  icon={Handshake}
                  label="Assists"
                  value={assists}
                  loaded={statsLoaded}
                  colorAccent="purple"
                  isCountUp={true}
                  emptyStateText="No assists yet"
                />
              </motion.div>

            </motion.div>
          </CardContent>
        </Card>
      </MagicCard>
    </FadeIn>
  );
}
