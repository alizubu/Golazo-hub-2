"use client";
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './UI';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/app/components/ui/hover-card';
import { Download, Loader2, Medal, ChevronDown, ChevronUp } from 'lucide-react';
import nationalTeamsData from '@/lib/data/national_teams.json';
import clubsData from '@/lib/data/clubs.json';

const getPlayerFlag = (player) => {
  if (player?.flag) {
    const nt = nationalTeamsData.find(n => n.name === player.flag);
    if (nt && nt.flag_url) return nt.flag_url;
  }
  if (player?.favoriteClub) {
    const club = clubsData.find(c => c.name === player.favoriteClub);
    if (club && club.logo_url) return club.logo_url;
  }
  return null;
};

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

export function computeStandings(matches, players, seasonId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, form: [], streak: 0, posChange: ['▲', '▼', '-'][Math.floor(Math.random() * 3)] };
  });
  
  const completedMatches = matches
    .filter((m) => m.seasonId === seasonId && m.round === "league" && m.status === "completed")
    .sort((a, b) => new Date(a.completedAt || 0) - new Date(b.completedAt || 0));

  completedMatches.forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      h.gf += hs; h.ga += as;
      a.gf += as; a.ga += hs;
      
      if (hs > as) { 
        h.won++; a.lost++; h.pts += 3; 
        h.form.push({ result: 'W', opp: a.name, score: `${hs}-${as}` }); 
        a.form.push({ result: 'L', opp: h.name, score: `${as}-${hs}` });
        h.streak = h.streak > 0 ? h.streak + 1 : 1;
        a.streak = a.streak < 0 ? a.streak - 1 : -1;
      }
      else if (hs < as) { 
        a.won++; h.lost++; a.pts += 3; 
        a.form.push({ result: 'W', opp: h.name, score: `${as}-${hs}` }); 
        h.form.push({ result: 'L', opp: a.name, score: `${hs}-${as}` });
        a.streak = a.streak > 0 ? a.streak + 1 : 1;
        h.streak = h.streak < 0 ? h.streak - 1 : -1;
      }
      else { 
        h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; 
        h.form.push({ result: 'D', opp: a.name, score: `${hs}-${as}` }); 
        a.form.push({ result: 'D', opp: h.name, score: `${as}-${hs}` });
        h.streak = 0; a.streak = 0;
      }
    });
    
  Object.values(table).forEach((t) => {
    t.gd = t.gf - t.ga;
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
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner cursor-pointer
                  ${res.result === 'W' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : res.result === 'D' ? 'bg-gradient-to-br from-slate-400 to-slate-600' : 'bg-gradient-to-br from-red-400 to-red-600'}
                  ${isLast ? 'ring-2 ring-white/20 ring-offset-1 ring-offset-[#12151b] drop-shadow-[0_0_6px_rgba(255,255,255,0.2)] scale-110 z-10' : ''}
                `}
              >
                {res.result}
              </div>
            </HoverCardTrigger>
            <HoverCardContent align="center" sideOffset={6} className="w-auto p-2.5 text-xs bg-[#12151b] border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)] z-[100] rounded-lg">
              <div className="flex flex-col gap-1 text-center font-score">
                <span className="font-bold text-white text-[13px]">
                  {res.result === 'W' ? 'Won' : res.result === 'D' ? 'Drew' : 'Lost'} {res.score}
                </span>
                <span className="text-white/60 text-[11px] font-medium tracking-wide uppercase">vs {res.opp}</span>
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

export default function StandingsTable({ matches, players, seasonId, me, onPlayerClick, onH2HClick }) {
  const standings = computeStandings(matches, players, seasonId);
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

  const MobileCard = ({ s, i }) => {
    const isExpanded = expandedRow === s.id;
    const isMe = me && s.id === me.id;
    const isFirst = i === 0;
    const flagUrl = getPlayerFlag(s);
    
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05 }}
        onClick={() => setExpandedRow(isExpanded ? null : s.id)}
        className={`relative overflow-hidden rounded-xl border p-4 shadow-md transition-colors
          ${isMe ? 'bg-pitch/10 border-pitch/30' : 'bg-card border-border/40'}
          ${isFirst ? 'border-l-4 border-l-yellow-500' : ''}
          ${isMe && !isFirst ? 'border-l-4 border-l-pitch' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 flex justify-center">
              <RankMedal rank={i + 1} />
            </div>
            <div className="relative" onClick={(e) => {
                e.stopPropagation();
                handleRowClick(s.id);
              }}>
              <Avatar p={s} size={40} />
              {flagUrl && (
                <div className="absolute -bottom-1 -right-1 w-[20px] h-[14px] bg-[#12151b] rounded-sm overflow-hidden shadow-sm">
                  <img src={flagUrl} alt="flag" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-foreground text-sm cursor-pointer hover:underline" onClick={(e) => {
                e.stopPropagation();
                handleRowClick(s.id);
              }}>
                {s.name}
              </div>
              <div className="text-xs text-muted-foreground font-score uppercase">PTS: <span className="font-bold text-pitch-bright text-sm">{s.pts}</span></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <FormDots form={s.form} />
            {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border/30 grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">P</span><span className="font-score font-bold">{s.played}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">W</span><span className="font-score font-bold">{s.won}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">D</span><span className="font-score font-bold">{s.drawn}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">L</span><span className="font-score font-bold">{s.lost}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">GF</span><span className="font-score font-bold">{s.gf}</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">GA</span><span className="font-score font-bold">{s.ga}</span></div>
                <div className="flex flex-col col-span-2"><span className="text-[10px] text-muted-foreground uppercase tracking-wider">GD</span>
                  <span className={`font-score font-bold ${s.gd > 0 ? 'text-emerald-500' : s.gd < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {s.gd > 0 ? `+${s.gd}` : s.gd}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action Bar */}
      <div className="flex justify-end">
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pitch/20 text-pitch-bright hover:bg-pitch/30 transition-colors border border-pitch/30 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Share Graphic
        </button>
      </div>

      {/* Mobile Stacked View */}
      <div className="flex flex-col gap-3 md:hidden">
        {standings.map((s, i) => <MobileCard key={s.id} s={s} i={i} />)}
      </div>

      {/* Desktop Table View */}
      <div ref={tableRef} className="hidden md:block overflow-x-auto rounded-xl border border-border/40 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-border/50 bg-secondary/80 font-heading uppercase tracking-widest text-[10px] text-muted-foreground">
              <th className="p-3 w-16 text-center">#</th>
              <th className="p-3">Player</th>
              <th className="p-3 text-center">P</th>
              <th className="p-3 text-center">W</th>
              <th className="p-3 text-center">D</th>
              <th className="p-3 text-center">L</th>
              <th className="p-3 text-center hidden lg:table-cell">GF</th>
              <th className="p-3 text-center hidden lg:table-cell">GA</th>
              <th className="p-3 text-center">GD</th>
              <th className="p-3 text-center font-bold text-white">PTS</th>
              <th className="p-3 text-center w-40">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-xs">
            <AnimatePresence>
              {standings.map((s, i) => {
                const isFirst = i === 0;
                const isMe = me && s.id === me.id;
                const flagUrl = getPlayerFlag(s);
                
                let rowClasses = i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]';
                
                let borderClasses = 'border-l-4 border-l-transparent';
                if (isFirst) borderClasses = 'border-l-4 border-l-yellow-500';
                else if (isMe) borderClasses = 'border-l-4 border-l-pitch';
                
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
                    onClick={() => handleRowClick(s.id)}
                    className={`border-b border-border/30 last:border-0 hover:bg-white/[0.04] transition-colors cursor-pointer group ${rowClasses} ${borderClasses}`}
                  >
                    <td className="p-3 text-center font-medium">
                      <RankMedal rank={i + 1} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <Avatar p={s} size={28} />
                          {flagUrl && (
                            <div className="absolute -bottom-1 -right-1 w-[18px] h-[14px] bg-[#12151b] rounded-sm overflow-hidden shadow-sm">
                              <img src={flagUrl} alt="flag" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-white font-heading text-[13px] group-hover:underline">{s.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px]">{s.played}</td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px]">{s.won}</td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px]">{s.drawn}</td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px]">{s.lost}</td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px] hidden lg:table-cell">{s.gf}</td>
                    <td className="p-3 text-center font-score text-muted-foreground font-semibold text-[13px] hidden lg:table-cell">{s.ga}</td>
                    <td className={`p-3 text-center font-score font-bold text-[13px] ${s.gd > 0 ? 'text-emerald-500' : s.gd < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {s.gd > 0 ? `+${s.gd}` : s.gd}
                    </td>
                    <td className="p-3 text-center font-score font-bold text-pitch-bright text-base">{s.pts}</td>
                    <td className="p-3 text-center">
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
