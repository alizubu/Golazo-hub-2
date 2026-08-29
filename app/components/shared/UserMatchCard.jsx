'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, BarChart2, Clock, AlertTriangle, CheckCircle2, Check } from 'lucide-react';

import { updateMatchStatus } from '@/app/actions/match';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { Avatar, Btn, ShinyButton, toTitleCase } from '@/app/components/shared/UI';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { FlickeringGrid } from '@/app/components/magicui/FlickeringGrid';

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

export default function UserMatchCard({ m, h, a, players, showToast, isPlayoff = false, isAdmin = false }) {
  const [saving, setSaving] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState(m.stats || {});

  const hScore = m.homeScore || 0;
  const aScore = m.awayScore || 0;
  const hWon = hScore > aScore;
  const aWon = aScore > hScore;
  
  const hFlagUrl = getPlayerIdentityBadgeUrl(h);
  const aFlagUrl = getPlayerIdentityBadgeUrl(a);

  const router = useRouter();

  const handleReset = async () => {
    if (!isAdmin) return;
    setSaving(true);
    const res = await updateMatchStatus(m.id, { status: 'scheduled', homeScore: 0, awayScore: 0 });
    if (res.error) showToast(res.error);
    else showToast('✅ Match reset to scheduled');
    setSaving(false);
  };

  const handleStatChange = (key, team, value) => {
    if (!isAdmin) return;
    setStatsForm(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { a: 0, b: 0 }),
        [team]: value === '' ? 0 : Number(value)
      }
    }));
  };

  const saveStats = async () => {
    if (!isAdmin) return;
    setSaving(true);
    const res = await updateMatchStatus(m.id, { 
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      liveState: m.liveState,
      stats: statsForm 
    });
    if (res.error) showToast(res.error);
    else {
      showToast('✅ Stats updated (ratings recalculated)');
      setIsEditingStats(false);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col mb-4">
      {/* Compact summary row — click to toggle edit */}
      <div
        onClick={() => {
          setIsEditingStats(!isEditingStats);
        }}
        className={`group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-[#0a0b10] border shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.005] cursor-pointer ${isEditingStats ? 'border-violet-500/40 rounded-b-none' : m.round === 'final' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />
        <div 
          className="absolute inset-0 z-0 opacity-20 mix-blend-color-dodge pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${m?.round === 'groupA' ? '#ef4444' : '#10b981'} 0%, transparent 60%)`
          }}
        />
        <FlickeringGrid 
          className="z-0 absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_center,white_0%,transparent_60%)]" 
          color={m?.round === 'groupA' ? '#ef4444' : '#10b981'}
          maxOpacity={0.7} 
          flickerSpeed={0.5} 
          gridSize={16} 
        />

        {m.round === 'final' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 sm:px-8 py-0.5 sm:py-1 rounded-b-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] z-30">
            Grand Final
          </div>
        )}

        {/* FINISHED pill */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">FINISHED</span>
          </div>
        </div>

        {/* Player header */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Home player */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative shrink-0 group/avatar">
              <div className="absolute -inset-2 bg-blue-500/40 rounded-full blur-[12px] opacity-70 group-hover/avatar:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full p-[2px] sm:p-[3px] bg-gradient-to-br from-[#00E5FF] via-[#0055FF] to-[#000822] shadow-[0_0_15px_rgba(0,85,255,0.4)] z-10">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                  <Avatar p={h} size={56} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
            {hFlagUrl && <img src={hFlagUrl} alt="" className="w-6 h-6 object-contain shrink-0 hidden sm:block" />}
            <div className="flex flex-col min-w-0">
              <span className={`text-xs sm:text-sm font-black truncate ${hWon ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(h?.name)}
              </span>
              <span className="text-[9px] text-slate-500 truncate">{h?.favoriteClub || ''}</span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className={`text-3xl sm:text-4xl font-score font-black tabular-nums ${hWon ? 'text-white' : 'text-slate-500'}`}>{hScore}</span>
            <span className="text-slate-600 font-score text-xl">-</span>
            <span className={`text-3xl sm:text-4xl font-score font-black tabular-nums ${aWon ? 'text-rose-400' : 'text-slate-500'}`}>{aScore}</span>
          </div>

          {/* Away player */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
            <div className="flex flex-col min-w-0 items-end">
              <span className={`text-xs sm:text-sm font-black truncate text-right ${aWon ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(a?.name)}
              </span>
              <span className="text-[9px] text-slate-500 truncate">{a?.favoriteClub || ''}</span>
            </div>
            {aFlagUrl && <img src={aFlagUrl} alt="" className="w-6 h-6 object-contain shrink-0 hidden sm:block" />}
            <div className="relative shrink-0 group/avatar">
              <div className="absolute -inset-2 bg-amber-500/40 rounded-full blur-[12px] opacity-70 group-hover/avatar:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full p-[2px] sm:p-[3px] bg-gradient-to-bl from-[#FFD700] via-[#FF3300] to-[#220400] shadow-[0_0_15px_rgba(255,51,0,0.4)] z-10">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                  <Avatar p={a} size={56} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown menu */}
        {isAdmin && (
          <div className="absolute right-3 top-3 z-10" onClick={e => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-2xl rounded-xl w-40">
                {isPlayoff ? (
                  <>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => setIsEditingStats(!isEditingStats)}>
                      <BarChart2 size={14} className="mr-2 text-rose-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={(e) => { e.preventDefault(); handleReset(); }}>
                      <Clock size={14} className="mr-2" /> Postpone
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); if (window.confirm('Reset this playoff result?')) handleReset(); }}>
                      <AlertTriangle size={14} className="mr-2" /> Reset Result
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => router.push(`/matches?matchId=${m.id}`)}>
                      <CheckCircle2 size={14} className="mr-2 text-muted-foreground" /> View Match
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => setIsEditingStats(!isEditingStats)}>
                      <BarChart2 size={14} className="mr-2 text-rose-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); if (window.confirm('Are you sure you want to undo this match result? This will remove the score and revert it to scheduled.')) handleReset(); }}>
                      <AlertTriangle size={14} className="mr-2" /> Undo Result
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Expandable stats edit panel */}
      <AnimatePresence>
        {isEditingStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-[#0c0d12] border border-rose-500/20 border-t-0 rounded-b-3xl shadow-2xl"
            >
              {/* Stats header divider */}
              <div className="px-4 sm:px-6 pt-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MATCH STATS</span>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                </div>
              </div>

              {/* Stat rows */}
              <div className="px-4 sm:px-6 pb-4">
                {statDefinitions.map(def => {
                  const valA = Number(statsForm[def.key]?.a) || 0;
                  const valB = Number(statsForm[def.key]?.b) || 0;
                  
                  // Sync icons with LiveMatchControl
                  const icon = {
                    possession: '⚽', shots: '🥅', shotsOnTarget: '🎯', fouls: '🚩',
                    offsides: '🏳️', corners: '🏁', freeKicks: '👥', passes: '🔗',
                    successfulPasses: '✅', crosses: '↪️', interceptions: '✋', tackles: '🛡', saves: '🧤'
                  }[def.key] || '📊';
                  
                  const displayLabel = def.key === 'successfulPasses' ? 'ACCURATE PASSES' : (def.key === 'corners' ? 'CORNERS' : def.label);

                  const total = valA + valB;
                  const homePercent = total > 0 ? (valA / total) * 100 : 50;
                  const awayPercent = total > 0 ? (valB / total) * 100 : 50;
                
                  const isAccuratePasses = def.key === "successfulPasses";
                  const isPercent = def.format === "percent";
                
                  let homeAccuracyStr = "";
                  let awayAccuracyStr = "";
                  if (isAccuratePasses) {
                    const homeTotalPasses = Number(statsForm.passes?.a) || 0;
                    const awayTotalPasses = Number(statsForm.passes?.b) || 0;
                    const hAcc = homeTotalPasses > 0 ? Math.round((valA / homeTotalPasses) * 100) : 0;
                    const aAcc = awayTotalPasses > 0 ? Math.round((valB / awayTotalPasses) * 100) : 0;
                    homeAccuracyStr = ` (${hAcc}%)`;
                    awayAccuracyStr = ` (${aAcc}%)`;
                  }
                
                  const boxWidthClasses = isAccuratePasses ? "w-20 sm:w-[96px]" : "w-14 sm:w-[72px]";

                  return (
                    <div key={def.key} className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-white/[0.04] last:border-0 group">
                      {/* Home value */}
                      <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-emerald-500/40 shadow-[0_0_10px_rgba(34,197,94,0.05)] focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
                        <input
                          type="number"
                          inputMode="numeric"
                          readOnly={!isAdmin}
                          value={statsForm[def.key]?.a === undefined ? "" : statsForm[def.key]?.a}
                          onChange={e => handleStatChange(def.key, 'a', e.target.value)}
                          className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-emerald-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
                        />
                        {(isAccuratePasses || isPercent) && (
                          <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-emerald-400 pr-2 whitespace-nowrap">
                            {isPercent ? '%' : homeAccuracyStr}
                          </span>
                        )}
                      </div>
                
                      {/* Center Area */}
                      <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
                        {/* Icons and Label */}
                        <div className="flex items-center justify-between px-1">
                          <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{icon}</span>
                          <span className="flex-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-slate-300 truncate px-2 font-sans">{displayLabel}</span>
                          <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{icon}</span>
                        </div>
                        
                        {/* Dual-color Progress Bar */}
                        <div className="flex items-center h-1.5 sm:h-2 w-full gap-1 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-l-full" style={{ width: `${homePercent}%` }} />
                          <div className="h-full bg-rose-600 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${awayPercent}%` }} />
                        </div>
                      </div>
                
                      {/* Away value */}
                      <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.05)] focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
                        <input
                          type="number"
                          inputMode="numeric"
                          readOnly={!isAdmin}
                          value={statsForm[def.key]?.b === undefined ? "" : statsForm[def.key]?.b}
                          onChange={e => handleStatChange(def.key, 'b', e.target.value)}
                          className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-rose-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
                        />
                        {(isAccuratePasses || isPercent) && (
                          <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-rose-400 pr-2 whitespace-nowrap">
                            {isPercent ? '%' : awayAccuracyStr}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action bar */}
              {isAdmin && (
                <div className="px-4 sm:px-6 pb-4 pt-2 flex gap-3 border-t border-white/[0.04]">
                  <Btn variant="ghost" onClick={() => setIsEditingStats(false)} disabled={saving} className="flex-1 h-11 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5">
                    Cancel
                  </Btn>
                  <ShinyButton onClick={saveStats} loading={saving} className="flex-[2] h-11 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                    <Check size={16} className="mr-2" /> Save Stats
                  </ShinyButton>
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
