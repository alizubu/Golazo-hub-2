import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronDown, Star } from 'lucide-react';
import { toTitleCase, Avatar } from '@/app/components/shared/UI';
import { BorderBeam } from '@/app/components/magicui/BorderBeam';

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

  const aWinning = valA > valB;
  const bWinning = valB > valA;

  return (
    <motion.div 
      className="flex flex-col mb-4 last:mb-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <motion.div 
          className={`w-10 text-left text-sm font-bold font-score ${aWinning ? 'text-emerald-400' : 'text-muted-foreground/60'}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.04, type: 'spring', stiffness: 400 }}
        >
          {displayA}
        </motion.div>
        <div className="text-center text-[10px] sm:text-[11px] tracking-[0.15em] text-muted-foreground/50 uppercase font-bold px-2 truncate">
          {label}
        </div>
        <motion.div 
          className={`w-10 text-right text-sm font-bold font-score ${bWinning ? 'text-emerald-400' : 'text-muted-foreground/60'}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 + index * 0.04, type: 'spring', stiffness: 400 }}
        >
          {displayB}
        </motion.div>
      </div>
      <div className="flex w-full h-[6px] bg-white/[0.03] rounded-full overflow-hidden ring-1 ring-white/[0.04]">
        <motion.div 
          className={`h-full rounded-r-full ${aWinning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-muted-foreground/20'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 1, type: 'spring', bounce: 0.15, delay: 0.25 + index * 0.04 }}
        />
        <motion.div 
          className={`h-full rounded-l-full ${bWinning ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-muted-foreground/20'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${pctB}%` }}
          transition={{ duration: 1, type: 'spring', bounce: 0.15, delay: 0.25 + index * 0.04 }}
        />
      </div>
    </motion.div>
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

  const formatKickoff = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCardClick = () => {
    if (isCompleted && hasStats) {
      setIsExpanded(!isExpanded);
    } else if (isCompleted && onClick && !hasStats) {
      onClick(m.id);
    }
  };

  return (
    <motion.div 
      whileHover={isCompleted ? { scale: 1.005 } : {}}
      whileTap={isCompleted ? { scale: 0.995 } : {}}
      onClick={handleCardClick}
      className={`
        relative w-full rounded-2xl overflow-hidden transition-all duration-300
        ${isCompleted ? 'cursor-pointer' : ''}
        ${isLive ? 'shadow-[0_0_30px_rgba(220,38,38,0.15)]' : ''}
      `}
    >
      {/* Outer Card Shell */}
      <div className={`
        relative rounded-2xl overflow-hidden
        bg-gradient-to-br from-[#181a20] to-[#12141a]
        border transition-all duration-300
        ${homeWon || awayWon ? 'border-white/[0.06] hover:border-white/[0.12]' : 'border-white/[0.04] hover:border-white/[0.08]'}
        ${isLive ? 'border-red-500/30' : ''}
      `}>
        {/* LIVE BorderBeam */}
        {isLive && (
          <BorderBeam size={120} duration={4} delay={0} colorFrom="#ef4444" colorTo="transparent" />
        )}

        {/* Main Scorecard Content */}
        <div className="relative z-10 p-4 sm:p-5">
          {/* Top Row: Matchday + Status */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] font-score">
              {m.matchday ? `Matchday ${m.matchday}` : m.round === 'league' ? 'League' : toTitleCase(m.round || '')}
            </span>

            <div className="flex items-center gap-2">
              {isCompleted && hasStats && (
                <motion.div 
                  animate={{ rotate: isExpanded ? 180 : 0 }} 
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors bg-white/[0.03] rounded-lg p-1"
                >
                  <ChevronDown size={14} />
                </motion.div>
              )}
              {isCompleted && !hasStats && (
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] font-score bg-white/[0.03] px-2.5 py-1 rounded-lg">FT</span>
              )}
              {isLive && (
                <motion.div 
                  animate={{ opacity: [1, 0.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-[0_0_12px_rgba(220,38,38,0.6)]"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span className="text-[9px] text-white font-bold tracking-[0.15em]">LIVE</span>
                </motion.div>
              )}
              {!isCompleted && !isLive && !isTbd && (
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.15em] font-score bg-white/[0.03] px-2.5 py-1 rounded-lg">
                  {formatKickoff(m.scheduledAt)}
                </span>
              )}
            </div>
          </div>

          {/* Center Row: Player A — Score — Player B */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Home Player (Left) */}
            <div className={`flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 ${homeWon ? '' : 'opacity-70'}`}>
              {isTbd || !h ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
              ) : (
                <div className="relative shrink-0">
                  <Avatar p={h} size={48} className={`w-10 h-10 sm:w-12 sm:h-12 border-2 transition-colors ${homeWon ? 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-white/[0.06]'}`} />
                  {homeWon && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -45 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                      className="absolute -top-1.5 -right-1.5"
                    >
                      <Trophy size={14} className="text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                    </motion.div>
                  )}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-sm sm:text-[15px] truncate leading-tight ${homeWon ? 'text-foreground' : 'text-muted-foreground/60'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                  {isTbd || !h ? 'TBD' : toTitleCase(h?.name)}
                </span>
              </div>
            </div>

            {/* Score Center */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0 px-2 sm:px-4">
              {isCompleted || isLive ? (
                <>
                  <motion.span 
                    key={`h-${m.homeScore}`} 
                    initial={{ scale: 1.3, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className={`text-2xl sm:text-3xl font-black font-score tabular-nums ${homeWon ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  >
                    {m.homeScore ?? 0}
                  </motion.span>
                  <span className="text-muted-foreground/20 font-light text-lg">—</span>
                  <motion.span 
                    key={`a-${m.awayScore}`} 
                    initial={{ scale: 1.3, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className={`text-2xl sm:text-3xl font-black font-score tabular-nums ${awayWon ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  >
                    {m.awayScore ?? 0}
                  </motion.span>
                </>
              ) : (
                <span className="text-sm font-bold text-muted-foreground/20 uppercase tracking-[0.2em] font-score">VS</span>
              )}
            </div>

            {/* Away Player (Right) */}
            <div className={`flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0 justify-end ${awayWon ? '' : 'opacity-70'}`}>
              <div className="flex flex-col min-w-0 items-end">
                <span className={`font-bold text-sm sm:text-[15px] truncate leading-tight text-right ${awayWon ? 'text-foreground' : 'text-muted-foreground/60'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                  {isTbd || !a ? 'TBD' : toTitleCase(a?.name)}
                </span>
              </div>
              {isTbd || !a ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
              ) : (
                <div className="relative shrink-0">
                  <Avatar p={a} size={48} className={`w-10 h-10 sm:w-12 sm:h-12 border-2 transition-colors ${awayWon ? 'border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-white/[0.06]'}`} />
                  {awayWon && (
                    <motion.div 
                      initial={{ scale: 0, rotate: 45 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.2 }}
                      className="absolute -top-1.5 -left-1.5"
                    >
                      <Trophy size={14} className="text-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Stats Section */}
        <AnimatePresence>
          {isExpanded && hasStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated Divider */}
              <div className="relative h-[1px] mx-5">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                />
              </div>

              <div className="p-5 sm:p-6">
                {/* MOTM Spotlight */}
                {m.stats.motm && m.stats.motm !== 'none' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                    className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/15 flex items-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
                    <motion.div 
                      className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    >
                      <Star size={16} className="text-amber-500 fill-amber-500" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] uppercase tracking-[0.15em] text-amber-500/70 font-bold">Man of the Match</div>
                      <div className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {m.stats.motm === 'home' ? h?.name : a?.name}
                      </div>
                    </div>
                    {m.stats.ratings && m.stats.ratings[m.stats.motm === 'home' ? 'a' : 'b'] && (
                      <motion.div 
                        className="text-sm font-bold text-amber-400 font-score shrink-0 pr-2 drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 500 }}
                      >
                        ⭐ {m.stats.ratings[m.stats.motm === 'home' ? 'a' : 'b']}
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Stats Grid with staggered animations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10">
                  <div className="flex flex-col">
                    {statDefinitions.slice(0, 7).map((def, i) => {
                      const valA = m.stats[def.key]?.a ?? 0;
                      const valB = m.stats[def.key]?.b ?? 0;
                      return <StatBar key={def.key} index={i} label={def.label} valueA={valA} valueB={valB} format={def.format} />;
                    })}
                  </div>
                  <div className="flex flex-col">
                    {statDefinitions.slice(7).map((def, i) => {
                      const valA = m.stats[def.key]?.a ?? 0;
                      const valB = m.stats[def.key]?.b ?? 0;
                      return <StatBar key={def.key} index={i + 7} label={def.label} valueA={valA} valueB={valB} format={def.format} />;
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default React.memo(MatchCard);
