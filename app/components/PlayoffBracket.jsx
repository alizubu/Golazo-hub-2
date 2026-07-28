'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import MatchCard from './MatchCard';

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-[130px] w-[320px] p-4 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
      <div className="text-muted-foreground font-medium text-sm">{text}</div>
    </div>
  );
}

function MatchNode({ centerY, left, width = 320, label, labelColor, m, players, onClick, delay }) {
  return (
    <div className="absolute z-10 pointer-events-auto" style={{ top: centerY, left, width, transform: 'translateY(-50%)' }}>
      <div className={`absolute -top-6 left-2 text-[10px] uppercase tracking-wider font-bold ${labelColor}`}>
        {label}
      </div>
      <motion.div 
        className="w-full"
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ delay, duration: 0.4 }}
      >
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
    <div className="w-full relative py-6">
      {/* Scroll container with fade edges */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory scrollbar-hide relative bg-background/30 rounded-2xl border border-border/30 shadow-inner">
        
        {/* Left/Right fade overlays for scroll hint */}
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none md:hidden" />
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none md:hidden" />

        {/* Fixed coordinate canvas */}
        <div className="min-w-[1152px] h-[480px] relative mx-auto my-4 px-8">
          
          {/* Snap points for mobile scroll */}
          <div className="absolute inset-0 flex snap-x snap-mandatory pointer-events-none z-0">
            <div className="w-[384px] h-full shrink-0 snap-center" />
            <div className="w-[384px] h-full shrink-0 snap-center" />
            <div className="w-[384px] h-full shrink-0 snap-center" />
          </div>

          {/* SVG Connector Lines */}
          <svg className="absolute top-0 left-8 w-[1088px] h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="grad-q-gf" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="grad-q-c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(251, 191, 36)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(148, 163, 184)" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="grad-e-c" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="rgb(225, 29, 72)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(148, 163, 184)" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="grad-c-gf" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="rgb(148, 163, 184)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            
            {/* Qualifier to Grand Final */}
            <path d="M 320 105 L 736 105 L 736 205 L 768 205" fill="none" stroke="url(#grad-q-gf)" strokeWidth="2" strokeDasharray={semiA?.status === 'completed' ? "none" : "6 6"} className={semiA?.status === 'completed' ? "opacity-100" : "opacity-40"} />
            
            {/* Qualifier to Challenger */}
            <path d="M 320 105 L 352 105 L 352 305 L 384 305" fill="none" stroke="url(#grad-q-c)" strokeWidth="2" strokeDasharray={semiA?.status === 'completed' ? "none" : "6 6"} className={semiA?.status === 'completed' ? "opacity-100" : "opacity-40"} />
            
            {/* Eliminator to Challenger */}
            <path d="M 320 375 L 352 375 L 352 305" fill="none" stroke="url(#grad-e-c)" strokeWidth="2" strokeDasharray={semiB?.status === 'completed' ? "none" : "6 6"} className={semiB?.status === 'completed' ? "opacity-100" : "opacity-40"} />
            
            {/* Challenger to Grand Final */}
            <path d="M 704 305 L 736 305 L 736 205" fill="none" stroke="url(#grad-c-gf)" strokeWidth="2" strokeDasharray={challenger?.status === 'completed' ? "none" : "6 6"} className={challenger?.status === 'completed' ? "opacity-100" : "opacity-40"} />
            
            {/* Junction Dots */}
            <circle cx="352" cy="105" r="4" className={semiA?.status === 'completed' ? "fill-amber-400" : "fill-border"} />
            <circle cx="352" cy="305" r="4" className={(semiA?.status === 'completed' || semiB?.status === 'completed') ? "fill-slate-400" : "fill-border"} />
            <circle cx="736" cy="305" r="4" className={challenger?.status === 'completed' ? "fill-slate-400" : "fill-border"} />
            <circle cx="736" cy="205" r="4" className={(semiA?.status === 'completed' || challenger?.status === 'completed') ? "fill-green-500" : "fill-border"} />
          </svg>

          {/* Node: Qualifier */}
          <MatchNode 
            centerY={105} left={32} 
            label="Qualifier (1st vs 2nd)" labelColor="text-amber-500" 
            m={semiA} players={players} onClick={onMatchClick} delay={0.1}
          />

          {/* Node: Eliminator */}
          <MatchNode 
            centerY={375} left={32} 
            label="Eliminator (3rd vs 4th)" labelColor="text-rose-500" 
            m={semiB} players={players} onClick={onMatchClick} delay={0.2}
          />

          {/* Node: Challenger */}
          <MatchNode 
            centerY={305} left={416} 
            label="Challenger" labelColor="text-slate-400" 
            m={challenger} players={players} onClick={onMatchClick} delay={0.3}
          />

          {/* Node: Grand Final */}
          <MatchNode 
            centerY={205} left={800} 
            label="Grand Final" labelColor="text-green-500" 
            m={final} players={players} onClick={onMatchClick} delay={0.4}
            isFinal={true}
          />

          {/* Winner Banner */}
          {final?.status === "completed" && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className="absolute left-[800px] top-[290px] w-[320px] p-4 text-center bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-500/50 rounded-2xl"
            >
              <Trophy className="mx-auto mb-2 text-amber-400" size={28} />
              <div className="text-lg font-bold font-display text-amber-400">
                {byId[matchWinnerId(final)]?.name} is the Champion! 🏆
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
