import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './UI';

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
        h.form.push('W'); a.form.push('L');
        h.streak = h.streak > 0 ? h.streak + 1 : 1;
        a.streak = a.streak < 0 ? a.streak - 1 : -1;
      }
      else if (hs < as) { 
        a.won++; h.lost++; a.pts += 3; 
        a.form.push('W'); h.form.push('L');
        a.streak = a.streak > 0 ? a.streak + 1 : 1;
        h.streak = h.streak < 0 ? h.streak - 1 : -1;
      }
      else { 
        h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; 
        h.form.push('D'); a.form.push('D');
        h.streak = 0; a.streak = 0;
      }
    });
    
  Object.values(table).forEach((t) => {
    t.gd = t.gf - t.ga;
    t.form = t.form.slice(-5); // Keep last 5 matches
  });
  
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
}

export default function StandingsTable({ matches, players, seasonId, me, onH2HClick }) {
  const standings = computeStandings(matches, players, seasonId);
  const totalPlayers = standings.length;

  return (
    <div className="overflow-x-auto rounded-xl border border-border/50 bg-card shadow-lg">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-secondary/80 font-heading uppercase tracking-wider text-xs text-muted-foreground">
            <th className="p-3 w-12 text-center">#</th>
            <th className="p-3">Player</th>
            <th className="p-2 sm:p-3 text-center">P</th>
            <th className="p-2 sm:p-3 text-center hidden sm:table-cell">W</th>
            <th className="p-2 sm:p-3 text-center hidden sm:table-cell">D</th>
            <th className="p-2 sm:p-3 text-center hidden sm:table-cell">L</th>
            <th className="p-2 sm:p-3 text-center hidden lg:table-cell">GF</th>
            <th className="p-2 sm:p-3 text-center hidden lg:table-cell">GA</th>
            <th className="p-2 sm:p-3 text-center">GD</th>
            <th className="p-2 sm:p-3 text-center font-bold text-white">PTS</th>
            <th className="p-2 sm:p-3 text-center hidden md:table-cell w-32">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 font-score text-xs">
          {standings.map((s, i) => {
            const isTop4 = i < 4;
            const isBottom3 = i >= totalPlayers - 3 && totalPlayers > 6;
            
            let rowBorderClass = 'border-l-4 border-l-transparent';
            if (isTop4) rowBorderClass = 'border-l-4 border-l-emerald-500';
            else if (isBottom3) rowBorderClass = 'border-l-4 border-l-red-500';
            
            if (me && s.id === me.id) {
              rowBorderClass += ' bg-pitch/10';
            }

            return (
              <motion.tr 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: i * 0.05 }} 
                key={s.id} 
                className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${rowBorderClass}`}
              >
                <td className="p-3 text-center font-medium text-muted-foreground">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </td>
                <td className="p-3">
                  <div 
                    className={`flex items-center gap-2 ${me && s.id !== me.id ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={() => me && s.id !== me.id && onH2HClick && onH2HClick(s.id)}
                  >
                    <Avatar p={s} size={24} />
                    <span className="font-bold text-white font-heading text-sm">{s.name}</span>
                  </div>
                </td>
                <td className="p-2 sm:p-3 text-center">{s.played}</td>
                <td className="p-2 sm:p-3 text-center text-muted-foreground hidden sm:table-cell">{s.won}</td>
                <td className="p-2 sm:p-3 text-center text-muted-foreground hidden sm:table-cell">{s.drawn}</td>
                <td className="p-2 sm:p-3 text-center text-muted-foreground hidden sm:table-cell">{s.lost}</td>
                <td className="p-2 sm:p-3 text-center hidden lg:table-cell">{s.gf}</td>
                <td className="p-2 sm:p-3 text-center hidden lg:table-cell">{s.ga}</td>
                <td className="p-2 sm:p-3 text-center text-muted-foreground">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
                <td className="p-2 sm:p-3 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
                <td className="p-2 sm:p-3 text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    {s.form.length > 0 ? s.form.map((res, idx) => (
                      <span key={idx} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white
                        ${res === 'W' ? 'bg-emerald-500' : res === 'D' ? 'bg-slate-400' : 'bg-red-500'}
                      `}>
                        {res}
                      </span>
                    )) : (
                      <span className="text-muted-foreground text-[10px]">-</span>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
