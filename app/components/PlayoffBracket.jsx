import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import MatchCard from './MatchCard';

function EmptyState({ text }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
      <div className="text-muted-foreground font-medium">{text}</div>
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
    <div className="w-full overflow-x-auto snap-x snap-mandatory pb-6">
      {/* Container for the 3 columns (Round 1, Round 2, Final) */}
      <div className="flex min-w-[900px] md:min-w-0 md:grid md:grid-cols-3 gap-8 p-4">
        
        {/* Round 1 (Qualifiers / Eliminator) */}
        <div className="flex-1 shrink-0 snap-start flex flex-col justify-center gap-12 relative min-w-[280px]">
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-gold">Qualifier (1st vs 2nd)</div>
            {semiA ? <MatchCard m={semiA} players={players} onClick={onMatchClick} /> : <EmptyState text="TBD" />}
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-claret">Eliminator (3rd vs 4th)</div>
            {semiB ? <MatchCard m={semiB} players={players} onClick={onMatchClick} /> : <EmptyState text="TBD" />}
          </div>
        </div>

        {/* Round 2 (Challenger) */}
        <div className="flex-1 shrink-0 snap-start flex flex-col justify-center relative min-w-[280px]">
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-muted-foreground">Challenger</div>
            {challenger ? <MatchCard m={challenger} players={players} onClick={onMatchClick} /> : <EmptyState text="TBD" />}
          </div>
        </div>

        {/* Round 3 (Grand Final) */}
        <div className="flex-1 shrink-0 snap-start flex flex-col justify-center relative min-w-[280px]">
          <div>
            <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-pitch-bright">Grand Final</div>
            {final ? <MatchCard m={final} players={players} onClick={onMatchClick} /> : <EmptyState text="TBD" />}
          </div>
          
          {final?.status === "completed" && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-6 text-center bg-gradient-to-br from-gold/20 to-transparent border border-gold/50 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gold/5 animate-pulse" />
              <Trophy className="mx-auto mb-3 text-gold" size={40} />
              <div className="text-xl sm:text-2xl font-bold font-display text-gold">
                {byId[matchWinnerId(final)]?.name} is the Champion! 🏆
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
