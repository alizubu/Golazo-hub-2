'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import MatchCard from '@/app/components/shared/MatchCard';

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[120px] w-full p-4 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
      <div className="text-muted-foreground font-medium text-sm animate-pulse">{text}</div>
    </div>
  );
}

function MatchNode({ label, labelColor, m, players, onClick, delay = 0, isFinal = false }) {
  return (
    <div className="relative w-full z-10 pointer-events-auto flex flex-col gap-2">
      <div className={`text-[10px] md:text-xs uppercase tracking-widest font-bold ${labelColor} pl-2 text-center md:text-left`}>
        {label}
      </div>
      <motion.div 
        className="w-full h-full flex relative group"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      >
        {isFinal && <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-yellow-300/20 to-amber-500/20 blur-xl opacity-50 rounded-[2rem] -z-10 group-hover:opacity-75 transition-opacity" />}
        {m ? <MatchCard m={m} players={players} onClick={onClick} /> : <EmptyState text="TBD" />}
      </motion.div>
    </div>
  );
}

export default function PlayoffBracket({ matches, players, onMatchClick }) {
  const byRound = Object.fromEntries(matches.map((m) => [m.round, m]));
  const { semiA, semiB, challenger, final } = byRound;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };

  return (
    <div className="w-full relative py-6 md:py-12 px-2 sm:px-6 md:px-8 max-w-5xl mx-auto overflow-hidden">
      
      {/* Background cinematic glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none z-0" />

      <div className="flex flex-col gap-8 md:gap-14 relative z-10 w-full">
        
        {/* Top Tier: Grand Final */}
        <div className="flex flex-col items-center justify-center w-full relative">
          {final?.status === "completed" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0, type: 'spring' }}
              className="absolute -top-12 z-20"
            >
              <Trophy size={48} className="text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
            </motion.div>
          )}
          
          <div className="w-full md:w-2/3 max-w-lg z-10">
            <MatchNode label="Grand Final" labelColor="text-amber-400" m={final} players={players} onClick={onMatchClick} delay={0.6} isFinal={true} />
            
            {/* Winner Banner */}
            {final?.status === "completed" && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, type: 'spring' }}
                className="mt-6 w-full p-6 text-center bg-gradient-to-b from-amber-500/15 to-amber-900/10 border border-amber-500/40 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.15)] backdrop-blur-sm"
              >
                <div className="text-2xl md:text-3xl font-black font-heading tracking-tight text-white drop-shadow-md">
                  {byId[matchWinnerId(final)]?.name}
                </div>
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-amber-500 mt-1">
                  Season Champion
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Middle Tier: Challenger (Left) and Qualifier (Right) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full relative">
          {/* Subtle connecting glow line on desktop */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
          
          {/* Challenger */}
          <div className="w-full md:w-1/2 max-w-md">
            <MatchNode label="Challenger" labelColor="text-emerald-400" m={challenger} players={players} onClick={onMatchClick} delay={0.4} />
          </div>

          {/* Qualifier */}
          <div className="w-full md:w-1/2 max-w-md md:mt-16">
            <MatchNode label="Qualifier (1st vs 2nd)" labelColor="text-blue-400" m={semiA} players={players} onClick={onMatchClick} delay={0.1} />
          </div>
        </div>

        {/* Bottom Tier: Eliminator (Left-aligned under Challenger) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 w-full relative">
          {/* Eliminator */}
          <div className="w-full md:w-1/2 max-w-md">
            <MatchNode label="Eliminator (3rd vs 4th)" labelColor="text-rose-400" m={semiB} players={players} onClick={onMatchClick} delay={0.2} />
          </div>
          
          {/* Empty spacer to align Eliminator under Challenger on desktop */}
          <div className="hidden md:block w-full md:w-1/2 max-w-md pointer-events-none" />
        </div>

      </div>
    </div>
  );
}
