import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { toTitleCase, Avatar } from './UI';

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

export default function MatchCard({ m, players, onClick }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId];
  const a = byId[m.awayId];

  const isLive = m.status === 'live';
  const isCompleted = m.status === 'completed';
  const isTbd = m.status === 'tbd' || (!h && !a);

  const homeWon = isCompleted && m.homeScore > m.awayScore;
  const awayWon = isCompleted && m.awayScore > m.homeScore;
  const homeLost = isCompleted && m.homeScore < m.awayScore;
  const awayLost = isCompleted && m.awayScore < m.homeScore;

  const formatKickoff = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      whileHover={isCompleted ? { scale: 1.02 } : {}}
      whileTap={isCompleted ? { scale: 0.98 } : {}}
      onClick={() => { if (isCompleted && onClick) onClick(m.id); }}
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
      <div className={`relative z-10 flex flex-col gap-2 p-3 sm:p-4 m-[1px] rounded-[15px] ${isLive ? 'bg-[#0f1117]/95 backdrop-blur-sm' : 'bg-background/50'}`}>
        
        {/* Status Badge (Top Right) */}
        <div className="absolute top-3 right-3 flex items-center justify-end z-20 pointer-events-none">
          {isCompleted && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/80 px-2 py-0.5 rounded-md">FT</span>}
          {isLive && (
            <motion.div 
              animate={{ opacity: [1, 0.5, 1] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-[9px] text-white font-bold tracking-widest">LIVE</span>
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
               <motion.span key={`h-${m.homeScore}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-2xl font-bold font-score ${homeWon ? 'text-green-400' : isLive ? 'text-white' : 'text-white/70'}`}>
                 {m.homeScore ?? 0}
               </motion.span>
               <span className="text-muted-foreground/40 font-medium text-sm">—</span>
               <motion.span key={`a-${m.awayScore}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-2xl font-bold font-score ${awayWon ? 'text-green-400' : isLive ? 'text-white' : 'text-white/70'}`}>
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
    </motion.div>
  );
}
