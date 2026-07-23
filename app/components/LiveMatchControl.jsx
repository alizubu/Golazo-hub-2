import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Minus, Plus, Calendar } from 'lucide-react';
import { Btn, Badge, Avatar, MagicCard, SectionTitle } from './UI';
import { NumberTicker } from './ui/number-ticker';
import MatchDetailsModal from './MatchDetailsModal';
import { updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { supabase } from '@/lib/supabaseClient';

export default function LiveMatchControl({ matches, players, activeSeason, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Find currently live match
  const liveMatch = matches.find(m => m.status === 'live');
  
  // Find next scheduled match
  const nextMatch = matches.find(m => m.status === 'scheduled' && m.seasonId === activeSeason?.id);

  const startNextMatch = async () => {
    if (!nextMatch) return;
    setLoading(true);
    const res = await updateMatchStatus(nextMatch.id, { 
      status: 'live', 
      liveState: { phase: 'first', paused: false, clock: 0 },
      homeScore: 0,
      awayScore: 0
    });
    if (res.error) showToast(res.error);
    else showToast("Match Started!");
    setLoading(false);
  };

  const handleScore = async (homeDelta, awayDelta) => {
    if (!liveMatch) return;
    const newHome = Math.max(0, (liveMatch.homeScore || 0) + homeDelta);
    const newAway = Math.max(0, (liveMatch.awayScore || 0) + awayDelta);
    
    // Optimistic UI updates are handled by Supabase Realtime in the parent, but we push directly to DB.
    const res = await updateMatchScore(liveMatch.id, newHome, newAway);
    if (res.error) {
      showToast(res.error);
      return;
    }
    
    const byId = Object.fromEntries(players.map(p => [p.id, p]));
    const home = byId[liveMatch.homeId];
    const away = byId[liveMatch.awayId];
    const scorer = homeDelta > 0 ? home?.name : away?.name;
    
    if (homeDelta > 0 || awayDelta > 0) {
      showToast(`${scorer} Scored! ${newHome} - ${newAway}`);
      // Push event to Supabase so everything updates
      supabase.channel('matches-page').send({
        type: 'broadcast',
        event: 'match_update',
        payload: { ...liveMatch, homeScore: newHome, awayScore: newAway }
      });
    }
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
    setLoading(false);
  };

  const finishMatch = async (finalData) => {
    setLoading(true);
    // 1. Call server action to finish match, compute ratings, MOTM, ELO, standings
    const response = await fetch('/api/matches/' + liveMatch.id + '/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalData)
    });
    
    const data = await response.json();
    setLoading(false);
    
    if (data.error) {
      showToast(data.error);
      return false;
    }
    
    showToast("Match completed & stats saved!");
    setModalOpen(false);
    
    supabase.channel('matches-page').send({
      type: 'broadcast',
      event: 'match_update',
      payload: data.match
    });
    
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
            <h2 className="font-display font-bold text-white text-lg">Live Match Control</h2>
          </div>
          {isPaused ? (
            <Badge color="var(--amber-500)" pulse>⏸ PAUSED</Badge>
          ) : (
            <Badge color="var(--destructive)" pulse>🔴 LIVE</Badge>
          )}
        </div>

        {/* Score Display Area */}
        <div className="flex items-center justify-between p-6 sm:p-8 relative">
          {isPaused && <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"></div>}
          
          <div className="flex-1 flex flex-col items-center gap-3">
            <Avatar p={h} size={64} className="ring-2 ring-pitch" />
            <span className="font-bold font-display text-base text-center text-white">{h?.name}</span>
          </div>
          
          <div className="px-4 sm:px-8 flex flex-col items-center gap-2">
            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              72&apos;
            </div>
            <div className="flex items-center gap-3">
              <NumberTicker value={liveMatch.homeScore || 0} className="text-5xl sm:text-6xl font-mono font-bold text-pitch-bright" />
              <span className="text-3xl text-muted-foreground/30 font-mono">-</span>
              <NumberTicker value={liveMatch.awayScore || 0} className="text-5xl sm:text-6xl font-mono font-bold text-white" />
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center gap-3">
            <Avatar p={a} size={64} className="ring-2 ring-claret" />
            <span className="font-bold font-display text-base text-center text-white">{a?.name}</span>
          </div>
        </div>

        {/* Controls Area */}
        <div className="grid grid-cols-2 gap-4 px-6 sm:px-8 pb-6 border-b border-border/50">
          <div className="flex items-center justify-center gap-3">
            <button disabled={isPaused} onClick={() => handleScore(-1, 0)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50">
              <Minus size={20} />
            </button>
            <button disabled={isPaused} onClick={() => handleScore(1, 0)} className="flex-1 h-12 flex items-center justify-center rounded-xl bg-pitch/10 text-pitch font-bold hover:bg-pitch/20 transition-colors disabled:opacity-50">
              <Plus size={18} className="mr-2" /> 1 Goal
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <button disabled={isPaused} onClick={() => handleScore(0, 1)} className="flex-1 h-12 flex items-center justify-center rounded-xl bg-claret/10 text-claret font-bold hover:bg-claret/20 transition-colors disabled:opacity-50">
              <Plus size={18} className="mr-2" /> 1 Goal
            </button>
            <button disabled={isPaused} onClick={() => handleScore(0, -1)} className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50">
              <Minus size={20} />
            </button>
          </div>
        </div>

        {/* State Controls */}
        <div className="p-4 sm:p-5 bg-background flex flex-wrap items-center justify-center gap-3">
          <Btn onClick={togglePause} disabled={loading} variant="outline" className="border-border text-muted-foreground hover:text-white">
            {isPaused ? <><Play size={16} className="mr-2" /> Resume Match</> : <><Pause size={16} className="mr-2" /> Pause Match</>}
          </Btn>
          <Btn onClick={() => setModalOpen(true)} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
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
