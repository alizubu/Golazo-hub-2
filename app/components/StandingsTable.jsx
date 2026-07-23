import React from 'react';
import { motion } from 'framer-motion';

export function computeStandings(matches, players, seasonId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches
    .filter((m) => m.seasonId === seasonId && m.round === "league" && m.status === "completed")
    .forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      const hs = Number(m.homeScore) || 0;
      const as = Number(m.awayScore) || 0;
      h.gf += hs; h.ga += as;
      a.gf += as; a.ga += hs;
      if (hs > as) { h.won++; a.lost++; h.pts += 3; }
      else if (hs < as) { a.won++; h.lost++; a.pts += 3; }
      else { h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; }
    });
  Object.values(table).forEach((t) => (t.gd = t.gf - t.ga));
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
}

export default function StandingsTable({ matches, players, seasonId, me }) {
  const standings = computeStandings(matches, players, seasonId);

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border/50 bg-secondary/30 pb-2">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead>
          <tr className="text-muted-foreground text-[10px] sm:text-[11px] uppercase tracking-wider border-b border-border/50">
            <th className="p-3 font-semibold text-center w-8">#</th>
            <th className="p-3 font-semibold">Player</th>
            <th className="p-2 sm:p-3 text-center font-semibold">P</th>
            <th className="p-2 sm:p-3 text-center font-semibold hidden sm:table-cell">W</th>
            <th className="p-2 sm:p-3 text-center font-semibold hidden sm:table-cell">D</th>
            <th className="p-2 sm:p-3 text-center font-semibold hidden sm:table-cell">L</th>
            <th className="p-2 sm:p-3 text-center font-semibold">GF</th>
            <th className="p-2 sm:p-3 text-center font-semibold">GA</th>
            <th className="p-2 sm:p-3 text-center font-semibold">GD</th>
            <th className="p-2 sm:p-3 text-center font-semibold text-pitch-bright">Pts</th>
          </tr>
        </thead>
        <tbody>
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
              <td className="p-3 flex items-center gap-2">
                <img src={s.avatarImage || '/default-avatar.png'} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                <span className="font-bold text-white font-display text-sm">{s.name}</span>
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
