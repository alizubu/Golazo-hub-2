import React from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './UI';

export function computeStandings(matches, players, seasonId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches
    .filter((m) => m.seasonId === seasonId && m.round === "league" && m.status === "completed")
    .forEach((m) => {
      if (!table[m.homeId] || !table[m.awayId]) return;
      const h = table[m.homeId];
      const a = table[m.awayId];
      h.played++;
      a.played++;
      h.gf += m.homeScore;
      h.ga += m.awayScore;
      a.gf += m.awayScore;
      a.ga += m.homeScore;
      if (m.homeScore > m.awayScore) {
        h.won++;
        h.pts += 3;
        a.lost++;
      } else if (m.homeScore < m.awayScore) {
        a.won++;
        a.pts += 3;
        h.lost++;
      } else {
        h.drawn++;
        a.drawn++;
        h.pts += 1;
        a.pts += 1;
      }
    });
  return Object.values(table)
    .map((s) => ({ ...s, gd: s.gf - s.ga }))
    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name));
}

export default function StandingsTable({ matches, players, seasonId, me, onH2HClick }) {
  const standings = computeStandings(matches, players, seasonId);

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
            <th className="p-2 sm:p-3 text-center">GF</th>
            <th className="p-2 sm:p-3 text-center">GA</th>
            <th className="p-2 sm:p-3 text-center">GD</th>
            <th className="p-2 sm:p-3 text-center font-bold text-white">PTS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/20 font-score text-xs">
          {standings.map((s, i) => (
            <motion.tr 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: i * 0.05 }} 
              key={s.id} 
              className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${me && s.id === me.id ? 'bg-pitch/10 border-l-4 border-l-pitch' : 'border-l-4 border-l-transparent'}`}
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
              <td className="p-2 sm:p-3 text-center">{s.gf}</td>
              <td className="p-2 sm:p-3 text-center">{s.ga}</td>
              <td className="p-2 sm:p-3 text-center text-muted-foreground">{s.gd > 0 ? `+${s.gd}` : s.gd}</td>
              <td className="p-2 sm:p-3 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
