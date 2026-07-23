import React from 'react';
import { motion } from 'framer-motion';

export default function MatchCard({ m, players, onClick }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId];
  const a = byId[m.awayId];

  const isLive = m.status === 'live';
  const isCompleted = m.status === 'completed';

  const formatKickoff = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      whileHover={isCompleted ? { scale: 1.01 } : {}}
      whileTap={isCompleted ? { scale: 0.98 } : {}}
      onClick={() => { if (isCompleted && onClick) onClick(m.id); }}
      className={`
        relative w-full rounded-2xl transition-all duration-300 overflow-hidden bg-secondary/80
        ${isCompleted ? 'cursor-pointer hover:border-pitch hover:bg-secondary border border-border/50' : ''}
        ${!isCompleted && !isLive ? 'border border-border/50' : ''}
        ${isLive ? 'shadow-[0_0_20px_rgba(220,38,38,0.3)]' : ''}
      `}
    >
      {/* Shimmer Border for LIVE matches */}
      {isLive && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(45deg,transparent_25%,rgba(220,38,38,0.5)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
      )}
      
      {/* Inner Content Wrapper (covers the shimmer background except for the 1px border) */}
      <div className={`relative z-10 flex items-center justify-between p-4 sm:p-5 m-[1px] rounded-[15px] ${isLive ? 'bg-[#0f1117]/95 backdrop-blur-sm' : ''}`}>
        
        {/* Home Player */}
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <img 
            src={h?.avatarImage || '/default-avatar.png'} 
            alt={h?.name} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ring-2 ring-[#0f1117]"
          />
          <div className="font-bold font-display text-sm sm:text-base truncate">{h?.name}</div>
        </div>

        {/* Center Score / Status */}
        <div className="px-4 shrink-0 flex flex-col items-center justify-center text-center">
          {isCompleted ? (
            <>
              <div className="flex items-center gap-2">
                <span className={`text-xl sm:text-2xl font-bold font-mono ${m.homeScore > m.awayScore ? 'text-pitch-bright' : 'text-white'}`}>{m.homeScore ?? 0}</span>
                <span className="text-muted-foreground/50 font-medium">—</span>
                <span className={`text-xl sm:text-2xl font-bold font-mono ${m.awayScore > m.homeScore ? 'text-pitch-bright' : 'text-white'}`}>{m.awayScore ?? 0}</span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-widest mt-1">FT</div>
            </>
          ) : isLive ? (
            <>
              <motion.div 
                animate={{ opacity: [1, 0.5, 1] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="flex items-center gap-1.5 mb-1 bg-red-600 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.8)]"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[9px] sm:text-[10px] text-white font-bold tracking-widest">LIVE</span>
              </motion.div>
              <div className="flex items-center gap-2">
                <motion.span key={`h-${m.homeScore}`} initial={{ scale: 1.3, color: '#fff' }} animate={{ scale: 1, color: '#fff' }} className="text-xl sm:text-2xl font-bold font-mono text-white">{m.homeScore ?? 0}</motion.span>
                <span className="text-muted-foreground/50 font-medium">—</span>
                <motion.span key={`a-${m.awayScore}`} initial={{ scale: 1.3, color: '#fff' }} animate={{ scale: 1, color: '#fff' }} className="text-xl sm:text-2xl font-bold font-mono text-white">{m.awayScore ?? 0}</motion.span>
              </div>
            </>
          ) : (
            <>
              <div className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">{formatKickoff(m.scheduledAt)}</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-muted-foreground">vs</div>
            </>
          )}
        </div>

        {/* Away Player */}
        <div className="flex flex-1 min-w-0 items-center justify-end gap-3 text-right">
          <div className="font-bold font-display text-sm sm:text-base truncate">{a?.name}</div>
          <img 
            src={a?.avatarImage || '/default-avatar.png'} 
            alt={a?.name} 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ring-2 ring-[#0f1117]"
          />
        </div>
        
      </div>
    </motion.div>
  );
}
