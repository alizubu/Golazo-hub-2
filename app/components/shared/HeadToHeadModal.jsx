import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Swords, Trophy, History } from 'lucide-react';
import { Avatar, Badge, MagicCard } from '@/app/components/shared/UI';
import { NumberTicker } from '@/app/components/ui/number-ticker';

function TugOfWarBar({ leftValue, rightValue, label, suffix = "", leftColor = "bg-pitch-bright", rightColor = "bg-claret", delay = 0 }) {
  const max = Math.max(leftValue, rightValue) || 1;
  const leftPct = (leftValue / max) * 100;
  const rightPct = (rightValue / max) * 100;

  const leftWins = leftValue > rightValue;
  const rightWins = rightValue > leftValue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex flex-col w-full py-5 relative z-10"
    >
      {/* Label */}
      <div className="text-center text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-3">
        {label}
      </div>
      
      <div className="relative flex items-center justify-between px-6 sm:px-10">
        {/* Left Number */}
        <span className={`text-2xl sm:text-3xl font-score font-bold w-20 text-left ${leftWins ? leftColor.replace('bg-', 'text-') : 'text-muted-foreground'}`}>
          <NumberTicker value={leftValue} />{suffix}
        </span>
        
        {/* The Bars */}
        <div className="flex-1 flex h-2.5 mx-4 bg-secondary/30 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-card z-20 shadow-[0_0_5px_rgba(0,0,0,0.5)]" />
          
          {/* Left half */}
          <div className="w-1/2 flex justify-end items-center pr-[1px]">
            <motion.div className={`${leftColor} h-full rounded-l-full shadow-[0_0_10px_currentColor]`} initial={{ width: 0 }} animate={{ width: `${leftPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }} />
          </div>
          
          {/* Right half */}
          <div className="w-1/2 flex justify-start items-center pl-[1px]">
            <motion.div className={`${rightColor} h-full rounded-r-full shadow-[0_0_10px_currentColor]`} initial={{ width: 0 }} animate={{ width: `${rightPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: delay + 0.2 }} />
          </div>
        </div>

        {/* Right Number */}
        <span className={`text-2xl sm:text-3xl font-score font-bold w-20 text-right ${rightWins ? rightColor.replace('bg-', 'text-') : 'text-muted-foreground'}`}>
          <NumberTicker value={rightValue} />{suffix}
        </span>
      </div>
    </motion.div>
  );
}

function TimelineMatchRow({ m, playerA, playerB, onClick, index }) {
  const isAWinner = m.homeId === playerA.id ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
  const isBWinner = m.homeId === playerB.id ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
  const isDraw = m.homeScore === m.awayScore;

  const aScore = m.homeId === playerA.id ? m.homeScore : m.awayScore;
  const bScore = m.homeId === playerB.id ? m.homeScore : m.awayScore;

  const renderCardContent = () => (
    <MagicCard 
      className={`w-full max-w-[200px] p-3 cursor-pointer hover:scale-[1.03] transition-transform shadow-md border ${
        isAWinner ? 'bg-pitch-bright/10 border-pitch-bright/30' : 
        isBWinner ? 'bg-claret/10 border-claret/30' : 
        'bg-secondary/40 mx-auto border-border/40'
      }`}
      onClick={() => onClick(m.id)}
    >
      <div className="flex items-center justify-between">
        <span className={`font-score font-black text-xl sm:text-2xl ${isAWinner ? 'text-pitch-bright' : isDraw ? 'text-foreground' : 'text-muted-foreground'}`}>{aScore}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold px-2 text-center leading-tight">
          {new Date(m.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}<br/>FT
        </span>
        <span className={`font-score font-black text-xl sm:text-2xl ${isBWinner ? 'text-claret' : isDraw ? 'text-foreground' : 'text-muted-foreground'}`}>{bScore}</span>
      </div>
    </MagicCard>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + (index * 0.05) }}
      className="flex w-full relative py-2 sm:py-3 group"
    >
      {/* Center timeline dot */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-border group-hover:bg-foreground group-hover:scale-125 transition-all z-10 shadow-sm border-2 border-card" />
      
      {/* Left side */}
      <div className="w-1/2 flex justify-end pr-6 sm:pr-10 relative z-10">
        {isAWinner && renderCardContent()}
        {isDraw && (
          <div className="absolute right-0 translate-x-1/2 z-20 w-[140px] sm:w-[180px]">
            {renderCardContent()}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="w-1/2 flex justify-start pl-6 sm:pl-10 relative z-10">
        {isBWinner && renderCardContent()}
      </div>
    </motion.div>
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
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-background/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-card border border-border/50 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[95vh] md:max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header - Split Screen */}
          <div className="relative flex overflow-hidden border-b border-border/50 shadow-sm shrink-0">
            {/* Left Background (Player A) */}
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-pitch-bright/10 to-pitch-bright/5 border-r border-border/30" />
            
            {/* Right Background (Player B) */}
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-claret/10 to-claret/5" />
            
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-background/50 backdrop-blur hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-50 shadow-sm border border-border/50">
              <X size={20} />
            </button>
            
            <div className="w-full flex pt-12 pb-8 relative z-10">
              {/* Player A */}
              <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col items-center gap-4">
                <Avatar p={playerA} size={96} className="ring-[6px] ring-pitch-bright ring-offset-4 ring-offset-card shadow-2xl" />
                <span className="font-heading font-black text-xl sm:text-2xl truncate text-center px-2 sm:px-6 w-full text-white">{playerA.name}</span>
              </motion.div>
              
              {/* VS Center */}
              <div className="flex flex-col justify-center items-center px-1 sm:px-4 shrink-0 relative z-20">
                <div className="text-[9px] sm:text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground mb-3 bg-card px-2 py-1 rounded-full shadow-inner border border-border/50">H2H</div>
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }} 
                  animate={{ scale: 1, rotate: 0 }} 
                  transition={{ type: "spring", delay: 0.4 }}
                  className="bg-background border-4 border-border shadow-2xl rounded-full w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center font-black font-heading text-xl sm:text-2xl text-foreground"
                >
                  VS
                </motion.div>
                <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mt-3">{total} Matches</div>
              </div>

              {/* Player B */}
              <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex flex-col items-center gap-4">
                <Avatar p={playerB} size={96} className="ring-[6px] ring-claret ring-offset-4 ring-offset-card shadow-2xl" />
                <span className="font-heading font-black text-xl sm:text-2xl truncate text-center px-2 sm:px-6 w-full text-white">{playerB.name}</span>
              </motion.div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-card/50 relative">
            {/* Center Background Line spanning the entire body */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-border/40 z-0 pointer-events-none" />

            {/* Comparative Stats Bars */}
            <div className="flex flex-col pt-4 pb-2 border-b border-border/40 relative z-10 bg-card shadow-sm">
              <TugOfWarBar leftValue={aWins} rightValue={bWins} label="Wins" delay={0.1} />
              <div className="w-full h-px bg-border/30" />
              <TugOfWarBar leftValue={aGoals} rightValue={bGoals} label="Goals" delay={0.2} />
              <div className="w-full h-px bg-border/30" />
              <TugOfWarBar leftValue={aWinRate} rightValue={bWinRate} label="Overall Win Rate" suffix="%" delay={0.3} />
            </div>

            {/* Match History Timeline */}
            <div className="flex-1 p-2 sm:p-6 space-y-2 sm:space-y-4 relative z-10 py-8">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-center text-muted-foreground mb-8 flex flex-col items-center gap-2 bg-card w-max mx-auto px-4 py-2 rounded-full border border-border/50 shadow-sm relative z-20">
                <History size={16} /> Match Timeline
              </h3>
              
              {h2hMatches.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-border/50 rounded-2xl text-muted-foreground bg-card mx-6">
                  No matches played between these two yet.
                </div>
              ) : (
                <div className="relative">
                  {h2hMatches.map((m, i) => (
                    <TimelineMatchRow key={m.id} m={m} playerA={playerA} playerB={playerB} onClick={onMatchClick} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
