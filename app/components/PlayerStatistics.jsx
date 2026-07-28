'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { Activity, Trophy, Swords, Target, Handshake, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { MagicCard, FadeIn } from '@/app/components/UI';
import { StatTile } from './StatTile';
import { DotPattern } from './magicui/DotPattern';

export function PlayerStatistics({ myRank, elo, played, winRate, goals, assists, statsLoaded }) {
  return (
    <FadeIn delay={0.2} className="col-span-1 md:col-span-12 h-full">
      <MagicCard gradientColor="rgba(250, 204, 21, 0.05)" className="h-full relative overflow-hidden">
        
        {/* Ambient lighting background */}
        <DotPattern className="opacity-40" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

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
