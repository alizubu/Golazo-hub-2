import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Minus, Plus, Calendar } from 'lucide-react';
import { Btn, Badge, Avatar, MagicCard, SectionTitle } from './UI';
import { NumberTicker } from './ui/number-ticker';
import MatchDetailsModal from './MatchDetailsModal';
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';

// Module-level variable for debouncing, avoids React ref lint errors
let scoreTimeoutId = null;

export default function LiveMatchControl({ matches, players, activeSeason, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [optLiveMatch, setOptLiveMatch] = useState(null);
  const [isEnding, setIsEnding] = useState(false);
  
  // Find currently live match
  const serverLiveMatch = matches.find(m => m.status === 'live');
  const liveMatch = isEnding ? null : (optLiveMatch || serverLiveMatch);
  
  // Find next scheduled match
  const nextMatch = matches.find(m => m.status === 'scheduled' && m.seasonId === activeSeason?.id);

  const [optHome, setOptHome] = useState(liveMatch?.homeScore || 0);
  const [optAway, setOptAway] = useState(liveMatch?.awayScore || 0);
  const [isMutatingScore, setIsMutatingScore] = useState(false);

  // 1. Sync server catch-up for Start Match during render (React recommended pattern)
  const [prevServerMatchId, setPrevServerMatchId] = useState(serverLiveMatch?.id);
  if (serverLiveMatch?.id !== prevServerMatchId) {
    setPrevServerMatchId(serverLiveMatch?.id);
    if (serverLiveMatch && optLiveMatch && serverLiveMatch.id === optLiveMatch.id) {
       setOptLiveMatch(null);
    }
  }

  // 2. Sync server catch-up for Scores during render
  const currentLiveMatchHash = `${liveMatch?.id}-${liveMatch?.homeScore}-${liveMatch?.awayScore}`;
  const [prevLiveMatchHash, setPrevLiveMatchHash] = useState(currentLiveMatchHash);

  if (currentLiveMatchHash !== prevLiveMatchHash) {
    setPrevLiveMatchHash(currentLiveMatchHash);
    if (liveMatch && !isMutatingScore) {
      setOptHome(liveMatch.homeScore || 0);
      setOptAway(liveMatch.awayScore || 0);
    }
  }

  const startNextMatch = async () => {
    if (!nextMatch) return;
    
    // Optimistically start the match instantly
    setOptLiveMatch({
      ...nextMatch,
      status: 'live',
      homeScore: 0,
      awayScore: 0,
      liveState: { phase: 'first', paused: false, clock: 0 }
    });

    const res = await updateMatchStatus(nextMatch.id, { 
      status: 'live', 
      liveState: { phase: 'first', paused: false, clock: 0 },
      homeScore: 0,
      awayScore: 0
    });
    
    if (res.error) {
      setOptLiveMatch(null); // Rollback on error
      showToast(res.error);
    } else {
      showToast("Match Started!");
    }
  };

  const handleScore = (homeDelta, awayDelta) => {
    if (!liveMatch) return;
    const newHome = Math.max(0, optHome + homeDelta);
    const newAway = Math.max(0, optAway + awayDelta);
    
    // 1. Immediate optimistic UI update & lock server sync for 3 seconds
    setOptHome(newHome);
    setOptAway(newAway);
    setIsMutatingScore(true);
    clearTimeout(scoreTimeoutId);
    scoreTimeoutId = setTimeout(() => { setIsMutatingScore(false); }, 3000);

    const byId = Object.fromEntries(players.map(p => [p.id, p]));
    const home = byId[liveMatch.homeId];
    const away = byId[liveMatch.awayId];
    const scorer = homeDelta > 0 ? home?.name : away?.name;
    
    if (homeDelta > 0 || awayDelta > 0) {
      showToast(`${scorer || 'Team'} Scored! ${newHome} - ${newAway}`);
    }

    // 2. Immediate realtime broadcast to sync observers/widgets
    const optMatch = { ...liveMatch, homeScore: newHome, awayScore: newAway };
    supabase.channel('matches-page').send({
      type: 'broadcast',
      event: 'match_update',
      payload: optMatch
    });

    // 3. Background server sync without blocking UI
    updateMatchScore(liveMatch.id, newHome, newAway).then(res => {
      if (res?.error) {
        showToast(res.error);
        setOptHome(liveMatch.homeScore || 0);
        setOptAway(liveMatch.awayScore || 0);
      }
    });
  };

  const togglePause = async () => {
    if (!liveMatch) return;
    setLoading(true);
    const isPaused = liveMatch.liveState?.paused;
    const res = await updateMatchStatus(liveMatch.id, {
      ...liveMatch,
      liveState: { ...liveMatch.liveState, paused: !isPaused }
    });
    if (res.error) showToast(res.error);
    
    supabase.channel('matches-page').send({
      type: 'broadcast',
      event: 'match_update',
      payload: { ...liveMatch, liveState: { ...liveMatch.liveState, paused: !isPaused } }
    });
  };

  const finishMatch = async (finalData) => {
    setIsEnding(true); // Optimistically hide the match panel
    setModalOpen(false);

    // 1. Call server action to finish match, compute ratings, MOTM, ELO, standings
    const response = await fetch('/api/matches/' + liveMatch.id + '/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    });
    
    const data = await response.json();
    
    if (data.error) {
      setIsEnding(false); // Rollback on error
      showToast(data.error);
      return false;
    }
    
    showToast("Match completed & stats saved!");
    return true;
  };

  if (!liveMatch) {
    return (
      <MagicCard className="p-8 flex flex-col items-center justify-center gap-4 border-dashed border-border/50 bg-secondary/10">
        <div className="p-4 rounded-full bg-secondary text-muted-foreground opacity-50 mb-2">
          <Calendar size={32} />
        </div>
        <div className="text-muted-foreground font-bold text-sm tracking-wide uppercase">No Live Match In Progress</div>
        {nextMatch ? (
          <Btn onClick={startNextMatch} disabled={loading} className="mt-2 bg-pitch text-pitch-foreground hover:bg-pitch-bright">
            Start Next Match
          </Btn>
        ) : (
          <div className="text-xs text-muted-foreground">All scheduled matches are completed.</div>
        )}
      </MagicCard>
    );
  }

  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[liveMatch.homeId];
  const a = byId[liveMatch.awayId];
  const isPaused = liveMatch.liveState?.paused;

  return (
    <>
      <div className="bg-[#0f1117] rounded-2xl border border-border overflow-hidden shadow-xl mb-6">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/50 bg-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pitch/20 text-pitch rounded-lg">
              <Play size={18} />
            </div>
            <h2 className="font-heading font-bold text-white text-lg">Live Match Control</h2>
          </div>
          {isPaused ? (
            <Badge color="var(--amber-500)" pulse>⏸ PAUSED</Badge>
          ) : (
            <Badge color="#e11d48" pulse>
              🔴 LIVE • {liveMatch.liveState?.clock ? `${liveMatch.liveState.clock}'` : (liveMatch.liveState?.phase === 'first' ? '1st Half' : liveMatch.liveState?.phase === 'second' ? '2nd Half' : liveMatch.liveState?.phase === 'extra' ? 'Extra Time' : liveMatch.liveState?.phase === 'penalties' ? 'Penalties' : 'IN PROGRESS')}
            </Badge>
          )}
        </div>

        {/* Score Display Area */}
        <div className="flex items-center justify-between p-6 sm:p-8 relative gap-2 sm:gap-6">
          {isPaused && <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"></div>}
          
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
            <Avatar p={h} size={64} className="ring-2 ring-pitch shrink-0" />
            <span className="font-bold font-heading text-base text-center text-white truncate w-full px-2" title={h?.name}>{h?.name || 'Home'}</span>
          </div>
          
          <div className="px-2 sm:px-6 flex flex-col items-center justify-center gap-2 shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.span key={optHome} initial={{ scale: 1.3, color: '#22c55e' }} animate={{ scale: 1, color: 'inherit' }} className="text-5xl sm:text-6xl font-score font-bold text-pitch-bright select-none w-14 sm:w-16 text-center">{optHome}</motion.span>
              <span className="text-3xl text-muted-foreground/30 font-score select-none">-</span>
              <motion.span key={optAway} initial={{ scale: 1.3, color: '#22c55e' }} animate={{ scale: 1, color: 'inherit' }} className="text-5xl sm:text-6xl font-score font-bold text-white select-none w-14 sm:w-16 text-center">{optAway}</motion.span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
            <Avatar p={a} size={64} className="ring-2 ring-claret shrink-0" />
            <span className="font-bold font-heading text-base text-center text-white truncate w-full px-2" title={a?.name}>{a?.name || 'Away'}</span>
          </div>
        </div>

        {/* Controls Area */}
        <div className="flex flex-col gap-3 px-6 sm:px-8 pb-6 border-b border-border/50">
          {[
            { label: "Goal", actionHome: () => handleScore(1, 0), actionHomeUndo: () => handleScore(-1, 0), actionAway: () => handleScore(0, 1), actionAwayUndo: () => handleScore(0, -1), colorClass: "bg-pitch/10 text-pitch hover:bg-pitch/20" },
            { label: "Yellow Card", actionHome: () => showToast("Yellow Card (Home)"), actionHomeUndo: () => showToast("Undo Yellow"), actionAway: () => showToast("Yellow Card (Away)"), actionAwayUndo: () => showToast("Undo Yellow"), colorClass: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" },
            { label: "Red Card", actionHome: () => showToast("Red Card (Home)"), actionHomeUndo: () => showToast("Undo Red"), actionAway: () => showToast("Red Card (Away)"), actionAwayUndo: () => showToast("Undo Red"), colorClass: "bg-red-500/10 text-red-500 hover:bg-red-500/20" },
            { label: "Penalty", actionHome: () => showToast("Penalty (Home)"), actionHomeUndo: () => showToast("Undo Penalty"), actionAway: () => showToast("Penalty (Away)"), actionAwayUndo: () => showToast("Undo Penalty"), colorClass: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" },
            { label: "Own Goal", actionHome: () => showToast("Own Goal (Home)"), actionHomeUndo: () => showToast("Undo Own Goal"), actionAway: () => showToast("Own Goal (Away)"), actionAwayUndo: () => showToast("Undo Own Goal"), colorClass: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20" },
            { label: "Substitution", actionHome: () => showToast("Substitution (Home)"), actionHomeUndo: () => showToast("Undo Sub"), actionAway: () => showToast("Substitution (Away)"), actionAwayUndo: () => showToast("Undo Sub"), colorClass: "bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20" }
          ].map((event, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              {/* Home Controls */}
              <div className="flex items-center gap-2 w-1/3">
                <button disabled={isPaused} onClick={event.actionHomeUndo} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"><Minus size={14} /></button>
                <button disabled={isPaused} onClick={event.actionHome} className={`flex-1 h-8 px-2 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-50 cursor-pointer ${event.colorClass}`}><Plus size={14} className="mr-1 hidden sm:block" /> {event.label}</button>
              </div>
              
              {/* Label */}
              <div className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest text-center w-1/3 truncate px-1">
                {event.label}
              </div>
              
              {/* Away Controls */}
              <div className="flex items-center gap-2 w-1/3 justify-end">
                <button disabled={isPaused} onClick={event.actionAway} className={`flex-1 h-8 px-2 flex items-center justify-center rounded-lg font-bold transition-colors disabled:opacity-50 cursor-pointer ${event.colorClass}`}><Plus size={14} className="mr-1 hidden sm:block" /> {event.label}</button>
                <button disabled={isPaused} onClick={event.actionAwayUndo} className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"><Minus size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* State Controls */}
        <div className="p-4 sm:p-5 bg-background flex flex-wrap items-center justify-center gap-3">
          <Btn onClick={togglePause} disabled={loading} variant="outline" className="border-border text-muted-foreground hover:text-white cursor-pointer">
            {isPaused ? <><Play size={16} className="mr-2" /> Resume Match</> : <><Pause size={16} className="mr-2" /> Pause Match</>}
          </Btn>
          <Btn onClick={() => setModalOpen(true)} disabled={loading} variant="outline" className="border-destructive/80 text-destructive hover:bg-destructive/15 font-bold uppercase tracking-wider text-sm px-6 py-2.5 cursor-pointer">
            <Square size={14} className="mr-2" fill="currentColor" /> Finish Match
          </Btn>
        </div>
      </div>

      {modalOpen && (
        <MatchDetailsModal 
          match={liveMatch} 
          homePlayer={h} 
          awayPlayer={a} 
          onSave={finishMatch} 
          onCancel={() => setModalOpen(false)} 
        />
      )}
    </>
  );
}
