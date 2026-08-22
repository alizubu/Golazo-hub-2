"use client";
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/app/components/shared/UI';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/app/components/ui/hover-card';
import { Download, Loader2, Medal, ChevronDown, ChevronUp, Users, Calendar, CheckCircle2 } from 'lucide-react';
import nationalTeamsData from '@/lib/data/national_teams.json';
import clubsData from '@/lib/data/clubs.json';

import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
const RankMedal = ({ rank }) => {
  if (rank <= 3) {
    return (
      <div className="relative flex items-center justify-center mx-auto w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md">
        {rank === 1 && <div className="absolute w-8 h-8 bg-yellow-500/20 rounded-full blur-md animate-pulse"></div>}
        <img src={`/assets/rankbadge/rank${rank}.png`} alt={`Rank ${rank}`} className="w-full h-full object-contain relative z-10 hover:scale-110 transition-transform" />
      </div>
    );
  }
  return (
    <div className="w-[22px] h-[22px] rounded-full bg-black/40 border border-white/10 text-muted-foreground flex items-center justify-center text-[10px] font-bold mx-auto shadow-inner">
      {rank}
    </div>
  );
};

export function computeStandings(matches, players, seasonId, config = {}) {
  const safeConfig = config || {};
  const ptsWin = safeConfig.win !== undefined ? Number(safeConfig.win) : 3;
  const ptsDraw = safeConfig.draw !== undefined ? Number(safeConfig.draw) : 1;
  const ptsLoss = safeConfig.loss !== undefined ? Number(safeConfig.loss) : 0;
  const bonusGF = safeConfig.goalsFor !== undefined ? Number(safeConfig.goalsFor) : 0;
  const penaltyGA = safeConfig.goalsAgainst !== undefined ? Number(safeConfig.goalsAgainst) : 0;

  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [], streak: 0, posChange: ['▲', '▼', '-'][Math.floor(Math.random() * 3)] };
  });
  
  const completedMatches = matches
    .filter((m) => m.seasonId === seasonId && m.round !== "friendly" && m.status === "completed")
    .sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));

  completedMatches.forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      h.gf += hs; h.ga += as;
      a.gf += as; a.ga += hs;
      
      const isPlayoff = m.round !== 'league';
      
      let homeWon = false;
      let awayWon = false;
      
      if (hs > as) homeWon = true;
      else if (hs < as) awayWon = true;
      else if (isPlayoff && m.penaltyWinner === 'home') homeWon = true;
      else if (isPlayoff && m.penaltyWinner === 'away') awayWon = true;

      if (homeWon) { 
        h.won++; a.lost++; h.pts += ptsWin; a.pts += ptsLoss;
        h.form.push({ result: 'W', opp: a.name, score: isPlayoff && m.penaltyWinner === 'home' ? `${hs}-${as} (P)` : `${hs}-${as}` }); 
        a.form.push({ result: 'L', opp: h.name, score: isPlayoff && m.penaltyWinner === 'home' ? `${as}-${hs} (P)` : `${as}-${hs}` });
        h.streak = h.streak > 0 ? h.streak + 1 : 1;
        a.streak = a.streak < 0 ? a.streak - 1 : -1;
      }
      else if (awayWon) { 
        a.won++; h.lost++; a.pts += ptsWin; h.pts += ptsLoss;
        a.form.push({ result: 'W', opp: h.name, score: isPlayoff && m.penaltyWinner === 'away' ? `${as}-${hs} (P)` : `${as}-${hs}` }); 
        h.form.push({ result: 'L', opp: a.name, score: isPlayoff && m.penaltyWinner === 'away' ? `${hs}-${as} (P)` : `${hs}-${as}` });
        a.streak = a.streak > 0 ? a.streak + 1 : 1;
        h.streak = h.streak < 0 ? h.streak - 1 : -1;
      }
      else { 
        h.drawn++; a.drawn++; h.pts += ptsDraw; a.pts += ptsDraw; 
        h.form.push({ result: 'D', opp: a.name, score: `${hs}-${as}` }); 
        a.form.push({ result: 'D', opp: h.name, score: `${as}-${hs}` });
        h.streak = 0; a.streak = 0;
      }
    });
    
  Object.values(table).forEach((t) => {
    t.gd = t.gf - t.ga;
    t.pts += (t.gf * bonusGF) - (t.ga * penaltyGA);
    // round to 1 decimal if needed
    t.pts = Math.round(t.pts * 10) / 10;
    t.form = t.form.slice(-5);
  });
  
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
}

const FormDots = ({ form }) => {
  return (
    <div className="flex items-center justify-center gap-[5px]" onClick={(e) => e.stopPropagation()}>
      {form.length > 0 ? form.map((res, idx) => {
        const isLast = idx === form.length - 1;
        return (
          <HoverCard key={idx} openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div 
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm cursor-pointer transition-transform
                  ${res.result === 'W' ? 'bg-emerald-500' : res.result === 'D' ? 'bg-slate-400' : 'bg-red-500'}
                  ${isLast ? 'ring-2 ring-white/20 ring-offset-1 ring-offset-[#12151b] scale-[1.15] z-10' : 'hover:scale-110'}
                `}
              >
                {res.result}
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="center" sideOffset={6} className="w-auto p-2.5 text-xs bg-background dark:bg-[#12151b] border-border shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] z-[100] rounded-lg">
              <div className="flex flex-col gap-1 text-center font-score">
                <span className="font-bold text-foreground text-[13px]">
                  {res.result === 'W' ? 'Won' : res.result === 'D' ? 'Drew' : 'Lost'} {res.score}
                </span>
                <span className="text-foreground/60 text-[11px] font-medium tracking-wide uppercase">vs {res.opp}</span>
              </div>
            </HoverCardContent>
          </HoverCard>
        );
      }) : (
        <span className="text-muted-foreground text-xs">-</span>
      )}
    </div>
  );
};


export default function StandingsTable({ matches, players, seasonId, me, onPlayerClick, onH2HClick, config = {}, headerLeft, seasonName }) {
  const standings = computeStandings(matches, players, seasonId, config);
  const tableRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Calculate summary info
  const completedCount = matches.filter(m => m.seasonId === seasonId && m.status === 'completed').length;
  const totalMatchesCount = matches.filter(m => m.seasonId === seasonId).length;
  const matchday = Math.floor(completedCount / (players.length / 2)) || 1;

  const handleExport = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const htmlToImage = await import('html-to-image');
      const download = (await import('downloadjs')).default;
      const dataUrl = await htmlToImage.toPng(tableRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#0a0c10',
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      download(dataUrl, 'golazo-standings.png');
    } catch (err) {
      console.error('Failed to export image', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRowClick = (id) => {
    if (onPlayerClick) {
      onPlayerClick(id);
    } else if (onH2HClick) {
      onH2HClick(id);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Action Bar */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex-1">{headerLeft}</div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pitch/20 text-pitch-bright hover:bg-pitch/30 transition-colors border border-pitch/30 text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-sm"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Snapshot
        </button>
      </div>

      {/* Table View (Scrollable on Mobile) */}
      <div ref={tableRef} className="overflow-x-auto rounded-xl border border-border/40 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] pb-4 pt-2 px-2 bg-gradient-to-b from-[#0a0c10] to-[#12151b]">
        
        {/* Tournament Summary Header */}
        <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-border/30 mb-2">
          <div className="flex flex-col">
            <h3 className="font-heading font-black text-lg tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              {seasonName || "Premier League"}
            </h3>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Matchday {matchday}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center gap-1.5"><Users size={14} className="text-pitch" /> {players.length} Players</div>
            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-blue-400" /> {totalMatchesCount} Matches</div>
            <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-400" /> {completedCount} Completed</div>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            {/* Super Headers */}
            <tr className="uppercase tracking-[0.15em] text-[10px] text-muted-foreground font-bold border-b border-border/10">
              <th colSpan="2"></th>
              <th colSpan="4" className="text-center py-2 pb-1 border-b-2 border-border/40">Record</th>
              <th colSpan="3" className="text-center py-2 pb-1 border-b-2 border-border/40">Goals</th>
              <th className="text-center py-2 pb-1 text-pitch-bright">PTS</th>
              <th></th>
            </tr>
            {/* Sub Headers */}
            <tr className="border-b-2 border-border/50 bg-secondary/20 font-heading uppercase tracking-widest text-[11px] text-muted-foreground">
              <th className="py-3 px-2 w-14 text-center">#</th>
              <th className="py-3 px-2">Player</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">P</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">W</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">D</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">L</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">GF</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">GA</th>
              <th className="py-3 px-2 text-center w-12 text-foreground/60">GD</th>
              <th className="py-3 px-2 text-center font-black text-pitch-bright text-xs tracking-[0.2em] drop-shadow-sm bg-pitch/5">PTS</th>
              <th className="py-3 px-2 text-center w-36">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03] text-xs">
            <AnimatePresence>
              {standings.map((s, i) => {
                const isFirst = i === 0;
                const isMe = me && s.id === me.id;
                const badgeUrl = getPlayerIdentityBadgeUrl(s);
                const identityName = s.displayBadgePreference === 'nation' ? s.flag : (s.favoriteClub || s.flag);
                
                let rowClasses = i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]';
                
                let borderClasses = 'border-l-[3px] border-l-transparent';
                if (isMe) borderClasses = 'border-l-[3px] border-l-pitch';
                
                if (isMe) {
                  rowClasses += ' bg-pitch/10';
                }

                const isKnockoutZone = i === 3 && standings.length > 4;

                return (
                  <React.Fragment key={s.id}>
                    <motion.tr 
                      layout
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }} 
                      onClick={() => handleRowClick(s.username || s.id)}
                      className={`group hover:bg-secondary/40 hover:border-l-[3px] hover:border-l-pitch/60 transition-all duration-200 cursor-pointer ${rowClasses} ${borderClasses}`}
                    >
                      <td className="relative py-4 px-2 text-center font-medium">
                        {isFirst && <div className="absolute top-0 left-0 w-[3px] h-full bg-[linear-gradient(to_bottom,#FBBF24,#B45309,#f59e0b,#FBBF24)] bg-[length:100%_200%] animate-[bg-pan_2.5s_linear_infinite]" />}
                        <RankMedal rank={i + 1} />
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3.5">
                          <motion.div 
                            className="relative flex-shrink-0 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all duration-300"
                          >
                            <Avatar p={s} size={40} className="border border-border/50" />
                          </motion.div>
                          <div className="flex flex-col justify-center min-w-0">
                            <span className="font-black text-foreground font-heading text-[15px] uppercase tracking-wide group-hover:text-pitch-bright transition-colors truncate">
                              {s.name}
                            </span>
                            {(badgeUrl || identityName) && (
                              <span className="text-[10px] text-muted-foreground font-semibold truncate flex items-center gap-1.5 mt-[2px] uppercase tracking-wider">
                                {badgeUrl && <img src={badgeUrl} alt="Club Badge" className="w-3.5 h-3.5 object-contain" />}
                                {identityName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.played}</td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.won}</td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.drawn}</td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.lost}</td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.gf}</td>
                      <td className="py-4 px-2 text-center font-score text-muted-foreground font-semibold text-[14px]">{s.ga}</td>
                      <td className="py-4 px-2 text-center font-score font-bold text-[14px]">
                        {s.gd > 0 ? (
                          <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]">+{s.gd}</span>
                        ) : s.gd < 0 ? (
                          <span className="text-red-400 drop-shadow-[0_0_6px_rgba(248,113,113,0.3)]">{s.gd}</span>
                        ) : (
                          <span className="text-muted-foreground">{s.gd}</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-center bg-pitch/5 group-hover:bg-pitch/10 transition-colors">
                        <span className="font-score font-black text-pitch-bright text-2xl tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-all">
                          {s.pts}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <FormDots form={s.form} />
                      </td>
                    </motion.tr>

                    {/* Knockout Qualification Divider */}
                    {isKnockoutZone && (
                      <tr>
                        <td colSpan="11" className="p-0 border-none">
                          <div className="flex items-center justify-center w-full relative h-[18px]">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-dashed border-indigo-500/30"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.2em] font-bold text-indigo-400/80 bg-[#0c0e14] px-4 py-0.5 rounded-full border border-indigo-500/20 shadow-sm">
                              Top 4 Qualify for Knockout Stage
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
