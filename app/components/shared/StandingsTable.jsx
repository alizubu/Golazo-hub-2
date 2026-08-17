"use client";
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/app/components/shared/UI';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/app/components/ui/hover-card';
import { Download, Loader2, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import nationalTeamsData from '@/lib/data/national_teams.json';
import clubsData from '@/lib/data/clubs.json';

import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
const RankMedal = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="relative flex items-center justify-center">
        <div className="absolute w-8 h-8 bg-yellow-500/20 rounded-full blur-md animate-pulse"></div>
        <Medal className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] relative z-10" size={24} strokeWidth={2.5} />
      </div>
    );
  }
  if (rank === 2) {
    return <Medal className="text-slate-300 drop-shadow-[0_0_4px_rgba(203,213,225,0.4)] mx-auto" size={22} strokeWidth={2} />;
  }
  if (rank === 3) {
    return <Medal className="text-amber-600 drop-shadow-[0_0_4px_rgba(217,119,6,0.4)] mx-auto" size={22} strokeWidth={2} />;
  }
  return <span className="font-bold font-score text-muted-foreground">{rank}</span>;
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
    <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      {form.length > 0 ? form.map((res, idx) => {
        const isLast = idx === form.length - 1;
        return (
          <HoverCard key={idx} openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <div 
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-foreground shadow-inner cursor-pointer
                  ${res.result === 'W' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 led-breathe-green' : res.result === 'D' ? 'bg-gradient-to-br from-slate-400 to-slate-600 shadow-[0_0_8px_rgba(148,163,184,0.4)]' : 'bg-gradient-to-br from-red-400 to-red-600 led-breathe-red'}
                  ${isLast ? 'ring-2 ring-white/20 ring-offset-1 ring-offset-[#12151b] drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] scale-110 z-10' : ''}
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


export default function StandingsTable({ matches, players, seasonId, me, onPlayerClick, onH2HClick, config = {}, headerLeft }) {
  const standings = computeStandings(matches, players, seasonId, config);
  const tableRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleExport = async () => {
    if (!tableRef.current) return;
    setIsExporting(true);
    try {
      const htmlToImage = await import('html-to-image');
      const download = (await import('downloadjs')).default;
      const dataUrl = await htmlToImage.toPng(tableRef.current, {
        quality: 1,
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
          Share Graphic
        </button>
      </div>

      {/* Table View (Scrollable on Mobile) */}
      <div ref={tableRef} className="overflow-x-auto rounded-xl border border-border/40 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-border/50 bg-secondary/80 font-heading uppercase tracking-widest text-[11px] text-muted-foreground">
              <th className="py-4 px-2 w-16 text-center">#</th>
              <th className="py-4 px-2">Player</th>
              <th className="py-4 px-2 text-center w-12">P</th>
              <th className="py-4 px-2 text-center w-12">W</th>
              <th className="py-4 px-2 text-center w-12">D</th>
              <th className="py-4 px-2 text-center w-12">L</th>
              <th className="py-4 px-2 text-center w-12">GF</th>
              <th className="py-4 px-2 text-center w-12">GA</th>
              <th className="py-4 px-2 text-center w-12">GD</th>
              <th className="py-4 px-2 text-center font-bold text-foreground text-xs tracking-[0.2em]">PTS</th>
              <th className="py-4 px-2 text-center w-36">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-xs">
            <AnimatePresence>
              {standings.map((s, i) => {
                const isFirst = i === 0;
                const isMe = me && s.id === me.id;
                const badgeUrl = getPlayerIdentityBadgeUrl(s);
                
                let rowClasses = i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]';
                
                let borderClasses = 'border-l-4 border-l-transparent';
                if (isMe) borderClasses = 'border-l-4 border-l-pitch';
                
                if (isMe) {
                  rowClasses += ' bg-pitch/10 hover:bg-pitch/20';
                }

                return (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }} 
                    key={s.id} 
                    onClick={() => handleRowClick(s.username || s.id)}
                    className={`border-b border-border/30 last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer group ${rowClasses} ${borderClasses}`}
                  >
                    <td className="relative py-5 px-2 text-center font-medium">
                      {isFirst && <div className="absolute top-0 left-0 w-[4px] h-full bg-[linear-gradient(to_bottom,#FBBF24,#B45309,#f59e0b,#FBBF24)] bg-[length:100%_200%] animate-[bg-pan_2.5s_linear_infinite]" />}
                      <RankMedal rank={i + 1} />
                    </td>
                    <td className="py-5 px-2">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          className="relative flex-shrink-0"
                          whileHover={{ scale: 1.15, rotateX: 10, rotateY: -10 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{ perspective: 1000 }}
                        >
                          <Avatar p={s} size={32} />
                          {badgeUrl && (
                            <div className="absolute -bottom-1 -right-1 bg-transparent rounded-full p-0.5">
                              <img src={badgeUrl} alt="badge" className="w-5 h-5 object-contain drop-shadow-md" />
                            </div>
                          )}
                        </motion.div>
                        <span className="font-bold text-foreground font-heading text-[15px] group-hover:underline">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.played}</td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.won}</td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.drawn}</td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.lost}</td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.gf}</td>
                    <td className="py-5 px-2 text-center font-score text-muted-foreground font-semibold text-[15px]">{s.ga}</td>
                    <td className={`py-5 px-2 text-center font-score font-bold text-[15px] ${s.gd > 0 ? 'text-emerald-500' : s.gd < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {s.gd > 0 ? `+${s.gd}` : s.gd}
                    </td>
                    <td className="py-5 px-2 text-center font-score font-bold text-pitch-bright text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">{s.pts}</td>
                    <td className="py-5 px-2 text-center">
                      <FormDots form={s.form} />
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
