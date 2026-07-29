import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Trophy, Activity, Target } from 'lucide-react';
import { Avatar, Badge, MagicCard } from './UI';
import { NumberTicker } from './ui/number-ticker';
import MatchCard from './MatchCard';

export default function HeadToHeadModal({ playerA, playerB, allMatches, onClose, onMatchClick, players }) {
  // Filter matches between these two players (any season, any round)
  const h2hMatches = allMatches.filter(m => 
    (m.homeId === playerA.id && m.awayId === playerB.id) ||
    (m.homeId === playerB.id && m.awayId === playerA.id)
  ).filter(m => m.status === 'completed').sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

  let aWins = 0;
  let bWins = 0;
  let draws = 0;
  let aGoals = 0;
  let bGoals = 0;

  h2hMatches.forEach(m => {
    const isAHome = m.homeId === playerA.id;
    const aScore = isAHome ? m.homeScore : m.awayScore;
    const bScore = isAHome ? m.awayScore : m.homeScore;
    
    aGoals += aScore;
    bGoals += bScore;

    if (aScore > bScore) aWins++;
    else if (bScore > aScore) bWins++;
    else draws++;
  });

  const total = aWins + bWins + draws;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-8 text-center border-b border-border/30 bg-gradient-to-b from-secondary/50 to-card">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
              <X size={20} />
            </button>
            
            <Badge color="var(--pitch)" className="mb-4 inline-flex">Head to Head</Badge>
            
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <Avatar p={playerA} size={80} className="border-4 border-pitch" />
                <span className="font-heading font-bold text-xl truncate w-full text-center">{playerA.name}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center shrink-0 text-muted-foreground">
                <Swords size={32} className="opacity-50 mb-2" />
                <span className="font-score text-sm font-bold tracking-widest">{total} MATCHES</span>
              </div>

              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <Avatar p={playerB} size={80} className="border-4 border-muted" />
                <span className="font-heading font-bold text-xl truncate w-full text-center">{playerB.name}</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-px bg-border/50">
            <div className="bg-card p-4 text-center">
              <div className="text-3xl font-score font-bold text-pitch-bright"><NumberTicker value={aWins} /></div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Wins</div>
            </div>
            <div className="bg-card p-4 text-center">
              <div className="text-3xl font-score font-bold text-muted-foreground"><NumberTicker value={draws} /></div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Draws</div>
            </div>
            <div className="bg-card p-4 text-center">
              <div className="text-3xl font-score font-bold text-foreground"><NumberTicker value={bWins} /></div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mt-1">Wins</div>
            </div>
          </div>

          {/* Goals Bar */}
          <div className="px-6 py-4 bg-secondary/20 border-b border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-pitch-bright font-bold font-score">
              <Target size={16} /> {aGoals} Goals
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Goal Diff</div>
            <div className="flex items-center gap-2 text-foreground font-bold font-score">
              {bGoals} Goals <Target size={16} />
            </div>
          </div>

          {/* Match History */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-card space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <History size={16} /> Match History
            </h3>
            {h2hMatches.length === 0 ? (
              <div className="text-center p-8 border border-dashed border-border/50 rounded-xl text-muted-foreground">
                No matches played between these two yet.
              </div>
            ) : (
              h2hMatches.map((m, i) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <MatchCard m={m} players={players} onClick={onMatchClick} />
                </motion.div>
              ))
            )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function History({ size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <path d="M12 7v5l4 2"/>
    </svg>
  );
}
