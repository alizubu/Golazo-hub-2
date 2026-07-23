import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/app/components/ui/skeleton';

const statDefinitions = [
  { key: 'possession', label: 'BALL POSSESSION', format: 'percent' },
  { key: 'shots', label: 'TOTAL SHOTS', format: 'number' },
  { key: 'shotsOnTarget', label: 'SHOTS ON TARGET', format: 'number' },
  { key: 'passes', label: 'PASSES', format: 'number' },
  { key: 'accuratePasses', label: 'ACCURATE PASSES', format: 'number' },
  { key: 'crosses', label: 'CROSSES', format: 'number' },
  { key: 'interceptions', label: 'INTERCEPTIONS', format: 'number' },
  { key: 'tackles', label: 'TACKLES', format: 'number' },
  { key: 'saves', label: 'SAVES', format: 'number' },
  { key: 'corners', label: 'CORNER KICKS', format: 'number' },
  { key: 'fouls', label: 'FOULS', format: 'number' },
  { key: 'freeKicks', label: 'FREE KICKS', format: 'number' },
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.05 }}
    >
      <div className="text-center text-[10px] tracking-[0.1em] text-muted-foreground uppercase mb-1 font-semibold">
        {label}
      </div>
      <div className="flex items-center gap-3">
        <div className="w-8 text-right text-xs font-bold font-mono" style={{ color: colorA }}>{displayA}</div>
        <div className="flex-1 flex h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full rounded-full" 
            style={{ backgroundColor: colorA }}
            initial={{ width: '0%' }}
            animate={{ width: `${pctA}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + index * 0.05 }}
          />
          <motion.div 
            className="h-full rounded-full" 
            style={{ backgroundColor: colorB }}
            initial={{ width: '0%' }}
            animate={{ width: `${pctB}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 + index * 0.05 }}
          />
        </div>
        <div className="w-8 text-left text-xs font-bold font-mono" style={{ color: colorB }}>{displayB}</div>
      </div>
    </motion.div>
  );
}

export default function MatchStatsModal({ matchId, onClose }) {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const prevScore = useRef({ home: null, away: null });
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    
    let isMounted = true;
    
    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (isMounted) {
          setMatch(data);
          prevScore.current = { home: data.homeScore, away: data.awayScore };
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setLoading(false);
      }
    };
    
    fetchMatch();
    
    // Subscribe if we are potentially live
    const channel = supabase.channel(`modal-match-${matchId}`)
      .on('broadcast', { event: 'match_update' }, (payload) => {
        if (!isMounted) return;
        const updated = payload.payload;
        if (updated.id === matchId) {
          setMatch(prev => {
            if (prev && (prev.homeScore !== updated.homeScore || prev.awayScore !== updated.awayScore)) {
              setFlash(true);
              setTimeout(() => setFlash(false), 800);
            }
            return { ...prev, ...updated };
          });
        }
      })
      .subscribe();
      
    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  if (!matchId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div 
          className="relative w-full max-w-[420px] bg-[#0f1117] sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden border-t sm:border border-border/50 max-h-[90vh] flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          {/* Header Actions */}
          <div className="absolute top-3 right-3 z-10 flex gap-2">
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {loading ? (
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-20 h-16" />
                <Skeleton className="w-16 h-16 rounded-full" />
              </div>
              <Skeleton className="w-full h-[300px] rounded-xl" />
            </div>
          ) : !match ? (
            <div className="p-8 text-center text-muted-foreground">Match not found.</div>
          ) : (
            <div className="overflow-y-auto hide-scrollbar p-6">
              {/* Match Header info (Optional) */}
              {match.label && (
                <div className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6">
                  {match.label}
                </div>
              )}
              
              {/* Scoreboard Section */}
              <div className="flex justify-between items-center mb-8 relative">
                {/* Home Player */}
                <div className="flex flex-col items-center gap-2 relative">
                  <div className="relative">
                    <img 
                      src={match.home.avatarImage || '/default-avatar.png'} 
                      alt={match.home.name} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-pitch-bright shadow-lg"
                    />
                    {match.stats?.homeRating && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                        className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-full bg-pitch text-white text-[10px] font-bold border-2 border-[#0f1117]"
                      >
                        {match.stats.homeRating}
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white font-display text-center truncate w-24">{match.home.name}</div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  {match.status === 'live' && (
                    <motion.div 
                      animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-claret mb-2"
                    />
                  )}
                  {match.status === 'scheduled' ? (
                    <div className="text-lg font-mono text-muted-foreground">TBD</div>
                  ) : (
                    <motion.div 
                      className="flex flex-col items-center"
                      animate={flash ? { scale: [1, 1.2, 1], color: ['#fff', '#29C179', '#fff'] } : {}}
                    >
                      <div className={`text-4xl font-bold font-mono leading-none ${match.homeScore > match.awayScore ? 'text-pitch-bright' : 'text-white'}`}>
                        {match.homeScore ?? 0}
                      </div>
                      <div className="w-4 h-px bg-white/20 my-1" />
                      <div className={`text-4xl font-bold font-mono leading-none ${match.awayScore > match.homeScore ? 'text-pitch-bright' : 'text-muted-foreground'}`}>
                        {match.awayScore ?? 0}
                      </div>
                    </motion.div>
                  )}
                  {match.status === 'completed' && (
                    <div className="mt-2 text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">FT</div>
                  )}
                </div>

                {/* Away Player */}
                <div className="flex flex-col items-center gap-2 relative">
                  <div className="relative">
                    <img 
                      src={match.away.avatarImage || '/default-avatar.png'} 
                      alt={match.away.name} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-claret shadow-lg"
                    />
                    {match.stats?.awayRating && (
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
                        className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-claret text-white text-[10px] font-bold border-2 border-[#0f1117]"
                      >
                        {match.stats.awayRating}
                      </motion.div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-white font-display text-center truncate w-24">{match.away.name}</div>
                </div>
              </div>

              {/* MOTM Callout */}
              {match.status === 'completed' && match.stats?.motmId && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
                  className="mb-8 p-3 rounded-xl bg-gradient-to-r from-gold/10 via-gold/5 to-transparent border border-gold/20 flex items-center gap-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                    <Trophy size={14} className="text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] uppercase tracking-wider text-gold font-semibold">Man of the Match</div>
                    <div className="text-sm font-bold text-white truncate">
                      {match.stats.motmId === match.homeId ? match.home.name : match.away.name}
                    </div>
                  </div>
                  {match.stats.motmRating && (
                    <div className="text-sm font-bold text-gold font-mono shrink-0">⭐ {match.stats.motmRating}</div>
                  )}
                </motion.div>
              )}

              <div className="w-full h-px bg-border/40 mb-6" />

              {/* Stats Bars */}
              <div className="flex flex-col">
                {statDefinitions.map((def, i) => {
                  // Fallback to "-" or "0" if stats aren't filled yet
                  const valA = match.stats?.[def.key]?.home ?? (match.status === 'scheduled' ? '-' : 0);
                  const valB = match.stats?.[def.key]?.away ?? (match.status === 'scheduled' ? '-' : 0);
                  
                  return (
                    <StatBar 
                      key={def.key}
                      index={i}
                      label={def.label}
                      valueA={valA}
                      valueB={valB}
                      colorA="var(--pitch-bright)"
                      colorB="var(--claret)"
                      format={def.format}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
