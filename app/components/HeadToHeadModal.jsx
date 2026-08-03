import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Trophy, Activity, Target } from 'lucide-react';
import { Avatar, Badge, MagicCard } from './UI';
import { NumberTicker } from './ui/number-ticker';
import MatchCard from './MatchCard';

function ComparisonBar({ leftValue, rightValue, middleValue = 0, label, suffix = "", leftColor = "bg-pitch-bright", rightColor = "bg-claret", middleColor = "bg-slate-600" }) {
  const sum = leftValue + rightValue + middleValue || 1;
  const leftPct = (leftValue / sum) * 100;
  const midPct = (middleValue / sum) * 100;
  const rightPct = (rightValue / sum) * 100;

  const leftWins = leftValue > rightValue;
  const rightWins = rightValue > leftValue;

  return (
    <div className="flex flex-col gap-2 w-full px-6 py-4 border-b border-border/30 bg-secondary/10">
      <div className="flex justify-between items-end font-score font-bold">
        <span className={`text-2xl flex items-baseline gap-1.5 ${leftColor.replace('bg-', 'text-')}`}>
          {leftWins && <Trophy size={14} className="text-amber-400 mb-1" />}
          <NumberTicker value={leftValue} />{suffix}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground pb-1.5">{label}</span>
        <span className={`text-2xl flex items-baseline gap-1.5 ${rightColor.replace('bg-', 'text-')}`}>
          <NumberTicker value={rightValue} />{suffix}
          {rightWins && <Trophy size={14} className="text-amber-400 mb-1" />}
        </span>
      </div>
      <div className="flex h-2.5 w-full bg-background rounded-full overflow-hidden shadow-inner">
        <motion.div className={leftColor} initial={{ width: 0 }} animate={{ width: `${leftPct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
        {middleValue > 0 && (
           <motion.div className={middleColor} initial={{ width: 0 }} animate={{ width: `${midPct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
        )}
        <motion.div className={rightColor} initial={{ width: 0 }} animate={{ width: `${rightPct}%` }} transition={{ duration: 1, ease: "easeOut" }} />
      </div>
    </div>
  );
}

function H2HMatchRow({ m, players, onClick }) {
  const h = players.find(p => p.id === m.homeId);
  const a = players.find(p => p.id === m.awayId);
  return (
    <MagicCard 
      onClick={() => onClick(m.id)}
      className="flex items-center justify-between p-3 sm:p-4 bg-secondary/30 hover:bg-secondary/60 transition-colors cursor-pointer border border-border/30 rounded-xl shadow-sm"
    >
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Avatar p={h} size={32} />
        <span className="font-bold text-sm truncate max-w-[80px] sm:max-w-none">{h?.name}</span>
      </div>
      <div className="px-4 text-center shrink-0">
        <div className="font-bold text-lg font-score text-foreground bg-background px-3 py-0.5 rounded-full shadow-inner border border-border/50">
          {m.homeScore} – {m.awayScore}
        </div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">FT</div>
      </div>
      <div className="flex-1 flex items-center justify-end gap-3 min-w-0">
        <span className="font-bold text-sm truncate text-right max-w-[80px] sm:max-w-none">{a?.name}</span>
        <Avatar p={a} size={32} />
      </div>
    </MagicCard>
  );
}

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

  // Calculate Overall Win Rates
  const getOverallWinRate = (playerId) => {
    const matches = allMatches.filter(m => (m.homeId === playerId || m.awayId === playerId) && m.status === 'completed');
    if (matches.length === 0) return 0;
    let wins = 0;
    matches.forEach(m => {
      const isHome = m.homeId === playerId;
      if (isHome && m.homeScore > m.awayScore) wins++;
      if (!isHome && m.awayScore > m.homeScore) wins++;
    });
    return Math.round((wins / matches.length) * 100);
  };

  const aWinRate = getOverallWinRate(playerA.id);
  const bWinRate = getOverallWinRate(playerB.id);

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
          className="w-full max-w-3xl bg-card border border-border/50 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 pb-8 text-center border-b border-border/30 bg-gradient-to-b from-secondary/50 to-card">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-6">HEAD TO HEAD</div>
            
            <div className="flex items-center justify-center gap-4 sm:gap-8">
              <div className="flex flex-col items-center gap-4 flex-1 min-w-0">
                <div className="rounded-full ring-4 ring-pitch-bright ring-offset-4 ring-offset-card shadow-xl">
                  <Avatar p={playerA} size={84} />
                </div>
                <span className="font-heading font-bold text-lg sm:text-xl truncate w-full text-center">{playerA.name}</span>
              </div>
              
              <div className="flex flex-col items-center justify-center shrink-0">
                <Badge variant="secondary" className="px-3 py-1 font-score text-xs font-bold border-border/50 bg-secondary/80 flex items-center gap-1.5 shadow-sm text-muted-foreground">
                  <Swords size={14} className="opacity-70" />
                  {total} MATCHES
                </Badge>
              </div>

              <div className="flex flex-col items-center gap-4 flex-1 min-w-0">
                <div className="rounded-full ring-4 ring-claret ring-offset-4 ring-offset-card shadow-xl">
                  <Avatar p={playerB} size={84} />
                </div>
                <span className="font-heading font-bold text-lg sm:text-xl truncate w-full text-center">{playerB.name}</span>
              </div>
            </div>
          </div>

          {/* Comparative Stats Bars */}
          <div className="flex flex-col">
            <ComparisonBar leftValue={aWins} rightValue={bWins} middleValue={draws} label="Wins" />
            <ComparisonBar leftValue={aGoals} rightValue={bGoals} label="Goals" />
            <ComparisonBar leftValue={aWinRate} rightValue={bWinRate} label="Overall Win Rate" suffix="%" />
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
                  <H2HMatchRow m={m} players={players} onClick={onMatchClick} />
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
