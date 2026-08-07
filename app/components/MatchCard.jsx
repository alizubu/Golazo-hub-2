import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown } from 'lucide-react';
import { toTitleCase, Avatar } from './UI';

const statDefinitions = [
  { key: 'possession', label: 'BALL POSSESSION', format: 'percent' },
  { key: 'shots', label: 'TOTAL SHOTS', format: 'number' },
  { key: 'shotsOnTarget', label: 'SHOTS ON TARGET', format: 'number' },
  { key: 'fouls', label: 'FOULS', format: 'number' },
  { key: 'offsides', label: 'OFFSIDES', format: 'number' },
  { key: 'corners', label: 'CORNER KICKS', format: 'number' },
  { key: 'freeKicks', label: 'FREE KICKS', format: 'number' },
  { key: 'passes', label: 'PASSES', format: 'number' },
  { key: 'successfulPasses', label: 'SUCCESSFUL PASSES', format: 'number' },
  { key: 'crosses', label: 'CROSSES', format: 'number' },
  { key: 'interceptions', label: 'INTERCEPTIONS', format: 'number' },
  { key: 'tackles', label: 'TACKLES', format: 'number' },
  { key: 'saves', label: 'SAVES', format: 'number' },
];

function StatBar({ label, valueA, valueB, colorA, colorB, format = 'number', index }) {
  const valA = Number(valueA) || 0;
  const valB = Number(valueB) || 0;
  const total = valA + valB;
  const pctA = total === 0 ? 50 : (valA / total) * 100;
  const pctB = total === 0 ? 50 : (valB / total) * 100;
  
  const displayA = format === 'percent' ? `${valA}%` : valA;
  const displayB = format === 'percent' ? `${valB}%` : valB;

  return (
    <motion.div 
      className="flex flex-col mb-4 last:mb-0"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.03 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="w-10 text-left text-sm font-bold font-score" style={{ color: colorA }}>{displayA}</div>
        <div className="text-center text-[10px] sm:text-[11px] tracking-[0.1em] text-zinc-400 uppercase font-bold px-2 truncate">
          {label}
        </div>
        <div className="w-10 text-right text-sm font-bold font-score" style={{ color: colorB }}>{displayB}</div>
      </div>
      <div className="flex w-full h-2 bg-zinc-900 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
        <motion.div 
          className="h-full rounded-r-full shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" 
          style={{ backgroundColor: colorA }}
          initial={{ width: '0%' }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.2, delay: 0.2 + index * 0.03 }}
        />
        <motion.div 
          className="h-full rounded-l-full shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" 
          style={{ backgroundColor: colorB }}
          initial={{ width: '0%' }}
          animate={{ width: `${pctB}%` }}
          transition={{ duration: 1.2, type: 'spring', bounce: 0.2, delay: 0.2 + index * 0.03 }}
        />
      </div>
    </motion.div>
  );
}

function PlayerRow({ player, isWinner, isLoser, isTbd }) {
  return (
    <div className={`flex items-center gap-3 p-2 rounded-xl transition-colors
      ${isWinner ? 'bg-green-500/10 border-l-4 border-green-500' : 'border-l-4 border-transparent'}
      ${!isWinner && !isLoser && !isTbd ? 'bg-secondary/40' : ''}
      ${isTbd ? 'bg-secondary/20 border-dashed border border-border/50' : ''}
    `}>
      {isTbd ? (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/50 animate-pulse shrink-0" />
      ) : (
        <Avatar p={player} size={40} ring="#0f1117" className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
      )}
      
      <div className="flex-1 min-w-0 flex items-center">
        {isTbd ? (
          <span className="text-sm font-semibold text-muted-foreground/50 animate-pulse uppercase tracking-wider">TBD</span>
        ) : (
          <span className={`font-bold font-heading text-sm sm:text-base break-words ${isWinner ? 'text-green-400' : isLoser ? 'text-muted-foreground' : 'text-foreground'}`}>
            {toTitleCase(player?.name)}
          </span>
        )}
      </div>

      {isWinner && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 mr-1">
          <Trophy className="text-green-500" size={16} />
        </motion.div>
      )}
    </div>
  );
}

function MatchCard({ m, players, onClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId];
  const a = byId[m.awayId];

  const isLive = m.status === 'live';
  const isCompleted = m.status === 'completed';
  const isTbd = m.status === 'tbd' || (!h && !a);
  const hasStats = isCompleted && m.stats && Object.keys(m.stats).length > 0;

  const homeWon = isCompleted && m.homeScore > m.awayScore;
  const awayWon = isCompleted && m.awayScore > m.homeScore;
  const homeLost = isCompleted && m.homeScore < m.awayScore;
  const awayLost = isCompleted && m.awayScore < m.homeScore;

  const formatKickoff = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCardClick = () => {
    if (isCompleted && hasStats) {
      setIsExpanded(!isExpanded);
    } else if (isCompleted && onClick && !hasStats) {
      // Fallback for matches without full stats (maybe still open modal or do nothing)
      onClick(m.id);
    }
  };

  return (
    <motion.div 
      whileHover={isCompleted ? { scale: 1.01 } : {}}
      whileTap={isCompleted ? { scale: 0.99 } : {}}
      onClick={handleCardClick}
      className={`
        relative w-full min-w-[14rem] sm:min-w-[16rem] rounded-2xl transition-all duration-300 overflow-hidden bg-secondary/80
        ${isCompleted ? 'cursor-pointer hover:border-green-500/50 hover:bg-secondary border border-border/50 shadow-sm' : ''}
        ${!isCompleted && !isLive ? 'border border-border/50' : ''}
        ${isLive ? 'shadow-[0_0_20px_rgba(220,38,38,0.3)]' : ''}
      `}
    >
      {/* Shimmer Border for LIVE matches */}
      {isLive && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      )}
      
      {/* Inner Content Wrapper */}
      <div className={`relative z-10 flex flex-col gap-2 p-3 sm:p-4 m-[1px] rounded-[15px] ${isLive ? 'bg-[#0f1117]/95 backdrop-blur-sm' : 'bg-background/50'} ${isExpanded ? 'rounded-b-none border-b border-border/30' : ''}`}>
        
        {/* Status Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center justify-end z-20 pointer-events-none">
          {isCompleted && !hasStats && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-2 py-0.5 rounded-md">FT</span>}
          {isCompleted && hasStats && (
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="text-muted-foreground bg-secondary/80 rounded-md p-1">
              <ChevronDown size={14} />
            </motion.div>
          )}
          {isLive && (
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-[9px] text-foreground font-bold tracking-widest">LIVE</span>
            </motion.div>
          )}
          {!isCompleted && !isLive && !isTbd && (
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-2 py-0.5 rounded-md">
              {formatKickoff(m.scheduledAt)}
            </span>
          )}
        </div>

        {/* Home Player */}
        <PlayerRow player={h} isWinner={homeWon} isLoser={homeLost} isTbd={!h} />

        {/* Center Score */}
        <div className="flex items-center justify-center gap-6 py-1 relative">
          {isCompleted || isLive ? (
             <div className="flex items-center gap-4">
               <motion.span key={`h-${m.homeScore}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-2xl font-bold font-score ${homeWon ? 'text-green-400' : isLive ? 'text-foreground' : 'text-foreground/70'}`}>
                 {m.homeScore ?? 0}
               </motion.span>
               <span className="text-muted-foreground/40 font-medium text-sm">—</span>
               <motion.span key={`a-${m.awayScore}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-2xl font-bold font-score ${awayWon ? 'text-green-400' : isLive ? 'text-foreground' : 'text-foreground/70'}`}>
                 {m.awayScore ?? 0}
               </motion.span>
             </div>
          ) : (
             <span className="text-sm font-bold text-muted-foreground/30 uppercase tracking-widest">VS</span>
          )}
        </div>

        {/* Away Player */}
        <PlayerRow player={a} isWinner={awayWon} isLoser={awayLost} isTbd={!a} />
        
      </div>

      {/* Expanded Stats Section */}
      <AnimatePresence>
        {isExpanded && hasStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden bg-[#0a0c10] border-t border-border/30 shadow-[inset_0_5px_15px_rgba(0,0,0,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 flex flex-col">
              
              {/* MOTM Spotlight */}
              {m.stats.motm && m.stats.motm !== 'none' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.3 }}
                  className="mb-6 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Trophy size={14} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] uppercase tracking-wider text-amber-500/80 font-bold">Man of the Match</div>
                    <div className="text-sm font-bold text-foreground truncate">
                      {m.stats.motm === 'home' ? h?.name : a?.name}
                    </div>
                  </div>
                  {m.stats.ratings && m.stats.ratings[m.stats.motm === 'home' ? 'a' : 'b'] && (
                    <div className="text-sm font-bold text-amber-500 font-score shrink-0 pr-2">
                      ⭐ {m.stats.ratings[m.stats.motm === 'home' ? 'a' : 'b']}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Categorized Stats (or just split into two columns for wide screens) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
                <div className="flex flex-col">
                  {statDefinitions.slice(0, 7).map((def, i) => {
                    const valA = m.stats[def.key]?.a ?? 0;
                    const valB = m.stats[def.key]?.b ?? 0;
                    return <StatBar key={def.key} index={i} label={def.label} valueA={valA} valueB={valB} colorA="#29C179" colorB="#B23A48" format={def.format} />;
                  })}
                </div>
                <div className="flex flex-col">
                  {statDefinitions.slice(7).map((def, i) => {
                    const valA = m.stats[def.key]?.a ?? 0;
                    const valB = m.stats[def.key]?.b ?? 0;
                    return <StatBar key={def.key} index={i + 7} label={def.label} valueA={valA} valueB={valB} colorA="#29C179" colorB="#B23A48" format={def.format} />;
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default React.memo(MatchCard);
