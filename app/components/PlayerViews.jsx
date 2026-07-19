'use client';

import React from 'react';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Camera, KeyRound, Megaphone } from 'lucide-react';
import { Btn, Input, Label, Badge, Avatar, PlayerChip, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Card } from './UI';
import { NumberTicker } from './ui/number-ticker';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';
import { motion } from 'framer-motion';

export default function PlayerViews(props) {
  const { tab } = props;
  if (tab === "dashboard") return <PlayerDashboard {...props} />;
  if (tab === "standings") return <StandingsView {...props} />;
  if (tab === "matches") return <MatchesView {...props} />;
  if (tab === "playoffs") return <PlayoffsView {...props} />;
  if (tab === "players") return <RosterView {...props} />;
  if (tab === "history") return <HistoryView {...props} />;
  if (tab === "notifications") return <NotificationsView {...props} />;
  if (tab === "profile") return <ProfileView {...props} />;
  return null;
}

function computeStandings(matches, players, tournamentId) {
  const table = {};
  players.forEach((p) => {
    table[p.id] = { ...p, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });
  matches
    .filter((m) => m.tournamentId === tournamentId && m.round === "league" && m.status === "completed")
    .forEach((m) => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.played++; a.played++;
      h.gf += m.homeScore || 0; h.ga += m.awayScore || 0;
      a.gf += m.awayScore || 0; a.ga += m.homeScore || 0;
      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.pts += 2; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.pts += 2; }
      else { h.drawn++; a.drawn++; h.pts += 1; a.pts += 1; }
    });
  Object.values(table).forEach((t) => (t.gd = t.gf - t.ga));
  return Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.name.localeCompare(y.name));
}

function LiveScoreboard({ m, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  return (
    <MagicCard className="p-5 bg-gradient-to-br from-surface-3 to-surface border-claret/30">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Badge color="var(--claret)" pulse>LIVE</Badge>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <Avatar p={h} size={56} />
          <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 px-2">
          <NumberTicker value={m.homeScore ?? 0} className="text-5xl font-bold font-mono text-foreground" />
          <span className="text-3xl opacity-40 font-mono">-</span>
          <NumberTicker value={m.awayScore ?? 0} className="text-5xl font-bold font-mono text-foreground" />
        </div>
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <Avatar p={a} size={56} />
          <span className="text-sm font-semibold truncate text-center">{a?.name}</span>
        </div>
      </div>
    </MagicCard>
  );
}

function MatchCard({ m, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  return (
    <MagicCard className="flex items-center justify-between p-4 bg-secondary">
      <div className="flex-1 min-w-0"><PlayerChip p={h} size={20} /></div>
      <div className="px-4 text-center shrink-0">
        {m.status === "completed" ? (
          <div>
            <div className="font-bold text-xl font-mono text-pitch-bright">{m.homeScore} – {m.awayScore}</div>
            <div className="flex items-center gap-1 justify-center mt-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">FT</span>
            </div>
          </div>
        ) : m.status === "live" ? (
          <div>
            <Badge color="var(--claret)" pulse>LIVE</Badge>
            <div className="font-bold text-xl mt-1 font-mono text-foreground">
              <span className="score-pop">{m.homeScore ?? 0}</span> – <span className="score-pop">{m.awayScore ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground font-mono font-medium">TBD</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex justify-end"><PlayerChip p={a} size={20} /></div>
    </MagicCard>
  );
}

function CircularProgress({ value, color = "var(--pitch-bright)", label }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="40" cy="40" r={radius} fill="transparent" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <motion.circle 
            cx="40" cy="40" r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="6"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute font-mono font-bold text-lg">{value}%</div>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</div>
    </div>
  );
}

function PlayerDashboard({ me, activeTournament, matches, players, announcements = [], trophies = [], notifications = [], setTab }) {
  const t = activeTournament;
  const tMatches = t ? matches.filter((m) => m.tournamentId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);
  
  const myMatches = tMatches.filter((m) => (m.homeId === me.id || m.awayId === me.id) && m.status === 'completed');
  const myLive = tMatches.filter((m) => m.status === "live" && (m.homeId === me.id || m.awayId === me.id));
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).slice(0, 1);
  const nextMatch = upcoming[0];
  
  const recent = [...myMatches].sort((a,b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)).slice(0, 5);
  
  const getMatchResult = (m) => {
    if (!m) return null;
    const isHome = m.homeId === me.id;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    if (myScore > oppScore) return 'W';
    if (myScore < oppScore) return 'L';
    return 'D';
  };
  const getOpponent = (m) => {
    const oppId = m.homeId === me.id ? m.awayId : m.homeId;
    return players.find(p => p.id === oppId);
  };

  const form = recent.map(getMatchResult).reverse();
  const winRate = myRow && myRow.played > 0 ? Math.round((myRow.won / myRow.played) * 100) : 0;
  const myTrophies = trophies.filter(tr => tr.playerId === me.id);
  const elo = 1200 + ((myRow?.pts || 0) * 15);

  if (!t) return <FadeIn delay={0.1}><Card className="p-8 text-center bg-card/50 backdrop-blur"><Trophy className="mx-auto mb-4 text-muted-foreground" size={40} /><div className="text-2xl font-bold font-display">No active tournament</div></Card></FadeIn>;

  return (
    <div className="flex flex-col gap-6 pb-10">
      {announcements.length > 0 && (
        <FadeIn delay={0.05}>
          <div className="flex flex-col gap-3">
            {announcements.map((ann, i) => (
              <MagicCard key={ann.id} className="p-4 bg-secondary/80 border-pitch/50 border-l-4 border-l-pitch backdrop-blur-sm">
                <div className="flex gap-3">
                  <Megaphone className="text-pitch-bright shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-sm">{ann.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{ann.content}</div>
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Row 1: Welcome Header */}
      <FadeIn delay={0.1}>
        <div className="px-1">
          <h1 className="text-2xl font-bold font-display">Welcome Back, {me.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">{t.name} • Friends eLeague</p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Row 2: Hero Profile & Stats Cards */}
        <FadeIn delay={0.15} className="col-span-12 md:col-span-4 h-full">
          <MagicCard className="h-full p-6 flex flex-col justify-between bg-gradient-to-br from-card/80 to-secondary/80 backdrop-blur-md">
            <div className="flex items-start gap-4">
              <Avatar p={me} size={64} ring="var(--gold)" />
              <div>
                <div className="font-display font-bold text-xl">{me.name}</div>
                <Badge color="var(--gold)" bg="rgba(255, 215, 0, 0.1)">Rank #{myRank || '-'}</Badge>
              </div>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm text-muted-foreground">ELO Rating</span>
                <span className="font-mono font-bold text-gold">{elo}</span>
              </div>
              <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <span className="text-sm text-muted-foreground">Current Form</span>
                <div className="flex gap-1">
                  {form.length > 0 ? form.map((r, i) => (
                    <div key={i} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${r === 'W' ? 'bg-green-500' : r === 'L' ? 'bg-red-500' : 'bg-yellow-500'}`}>{r}</div>
                  )) : <span className="text-xs text-muted-foreground">-</span>}
                </div>
              </div>
              <div className="flex justify-between items-center pb-2">
                <span className="text-sm text-muted-foreground">Season Record</span>
                <span className="font-mono font-bold">{myRow?.won || 0}W {myRow?.drawn || 0}D {myRow?.lost || 0}L</span>
              </div>
            </div>
            
            <Btn variant="ghost" className="w-full mt-4 text-xs" onClick={() => setTab('profile')}>Edit Profile</Btn>
          </MagicCard>
        </FadeIn>

        <div className="col-span-12 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
          <FadeIn delay={0.2} className="h-full"><MagicCard className="h-full p-4 flex flex-col items-center justify-center gap-2 bg-card/50 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Rank</div><NumberTicker value={myRank || 0} className="text-4xl font-bold font-mono text-gold" /><div className="text-xl">🏆</div></MagicCard></FadeIn>
          <FadeIn delay={0.25} className="h-full"><MagicCard className="h-full p-4 flex flex-col items-center justify-center gap-2 bg-card/50 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Goals</div><NumberTicker value={myRow?.gf || 0} className="text-4xl font-bold font-mono text-foreground" /><div className="text-xl">⚽</div></MagicCard></FadeIn>
          <FadeIn delay={0.3} className="h-full"><MagicCard className="h-full p-4 flex flex-col items-center justify-center gap-2 bg-card/50 backdrop-blur"><CircularProgress value={winRate} label="Win Rate" /></MagicCard></FadeIn>
          <FadeIn delay={0.35} className="h-full"><MagicCard className="h-full p-4 flex flex-col items-center justify-center gap-2 bg-card/50 backdrop-blur"><div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Trophies</div><NumberTicker value={myTrophies.length} className="text-4xl font-bold font-mono text-foreground" /><div className="text-xl">🎖️</div></MagicCard></FadeIn>
        </div>

        {/* Live Matches */}
        {myLive.map((m, i) => (
          <FadeIn key={m.id} delay={0.4} className="col-span-12">
            <LiveScoreboard m={m} players={players} />
          </FadeIn>
        ))}

        {/* Row 3: League Table & Upcoming */}
        <FadeIn delay={0.4} className="col-span-12 md:col-span-7 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur overflow-hidden flex flex-col">
            <SectionTitle icon={ListOrdered}>League Standings</SectionTitle>
            <div className="overflow-x-auto mt-2 flex-1">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/50">
                    <th className="pb-2 font-semibold w-8">#</th>
                    <th className="pb-2 font-semibold">Player</th>
                    <th className="pb-2 text-center font-semibold">P</th>
                    <th className="pb-2 text-center font-semibold">W</th>
                    <th className="pb-2 text-center font-semibold">L</th>
                    <th className="pb-2 text-center font-semibold">GF</th>
                    <th className="pb-2 text-center font-semibold">GA</th>
                    <th className="pb-2 text-center font-semibold text-pitch-bright">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.slice(0, 5).map((s, i) => (
                    <tr key={s.id} className={`border-b border-border/30 last:border-0 ${s.id === me.id ? 'bg-white/5' : ''}`}>
                      <td className="py-2.5 font-bold font-mono">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-muted-foreground ml-1">{i + 1}</span>}
                      </td>
                      <td className="py-2.5"><PlayerChip p={s} size={20} /></td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.played}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.won}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.lost}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.gf}</td>
                      <td className="py-2.5 text-center text-muted-foreground">{s.ga}</td>
                      <td className="py-2.5 text-center font-bold text-pitch-bright">{s.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.45} className="col-span-12 md:col-span-5 h-full">
          <MagicCard className="h-full p-6 flex flex-col bg-card/50 backdrop-blur">
            <SectionTitle icon={Calendar}>Upcoming Fixture</SectionTitle>
            <div className="flex-1 flex flex-col justify-center">
              {nextMatch ? (
                <div className="flex flex-col items-center bg-secondary/50 rounded-2xl p-6 border border-border/50 shadow-inner">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-4 text-center">
                    Week {nextMatch.matchday || 1} • {new Date(nextMatch.scheduledAt || Date.now()).toLocaleDateString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit'})}
                  </div>
                  <div className="flex items-center justify-center gap-6 w-full">
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.homeId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.homeId)?.name}</span>
                    </div>
                    <div className="font-mono text-xl text-muted-foreground font-bold">VS</div>
                    <div className="flex flex-col items-center gap-2 flex-1">
                      <Avatar p={players.find(p => p.id === nextMatch.awayId)} size={56} />
                      <span className="font-bold text-sm truncate w-full text-center">{players.find(p => p.id === nextMatch.awayId)?.name}</span>
                    </div>
                  </div>
                  <Btn variant="primary" className="mt-6 w-full text-xs" onClick={() => setTab('matches')}>View All Fixtures</Btn>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-4xl mb-4 opacity-50">🎉</span>
                  <div className="font-semibold text-foreground">No upcoming fixtures.</div>
                  <div className="text-sm text-muted-foreground mt-1">Enjoy your break!</div>
                </div>
              )}
            </div>
          </MagicCard>
        </FadeIn>

        {/* Row 4: Recent Matches & Progress */}
        <FadeIn delay={0.5} className="col-span-12 md:col-span-6 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Clock}>Last Five Matches</SectionTitle>
            <div className="flex flex-col gap-2 flex-1 justify-center">
              {recent.length > 0 ? recent.map((m, i) => {
                const res = getMatchResult(m);
                const opp = getOpponent(m);
                const isHome = m.homeId === me.id;
                const myScore = isHome ? m.homeScore : m.awayScore;
                const oppScore = isHome ? m.awayScore : m.homeScore;
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${res === 'W' ? 'bg-green-500' : res === 'L' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                      {res === 'W' ? '✅' : res === 'L' ? '❌' : '➖'}
                    </div>
                    <div className="text-sm font-semibold flex-1 flex items-center gap-1">
                      {res === 'W' ? 'Won' : res === 'L' ? 'Lost' : 'Draw'} 
                      <span className="font-mono text-muted-foreground ml-1">{myScore}–{oppScore}</span> 
                      <span className="text-muted-foreground mx-1">vs</span> 
                      <span className="truncate max-w-[100px]">{opp?.name}</span>
                    </div>
                  </div>
                );
              }) : (
                <EmptyState text="No completed matches yet." />
              )}
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.55} className="col-span-12 md:col-span-6 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Calendar}>Season Progress</SectionTitle>
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              <CircularProgress 
                value={myRow ? Math.round((myRow.played / (players.length * 2 - 2)) * 100) || 0 : 0} 
                label="Matches Played" 
                color="var(--gold)"
              />
              <div className="text-sm mt-6 text-center text-muted-foreground">
                <span className="font-bold text-foreground">{myRow?.played || 0}</span> out of <span className="font-bold text-foreground">{players.length * 2 - 2}</span> matches completed
              </div>
            </div>
          </MagicCard>
        </FadeIn>

        {/* Row 5: Trophy Cabinet & Notifications */}
        <FadeIn delay={0.6} className="col-span-12 md:col-span-7 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Trophy}>Trophy Cabinet</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 content-start">
              {myTrophies.slice(0, 4).map((t) => (
                <div key={t.id} className="flex flex-col items-center p-3 rounded-xl bg-gold/10 border border-gold/20 text-center">
                  <span className="text-3xl mb-1">{t.icon || "🏆"}</span>
                  <span className="text-xs font-bold leading-tight">{t.title}</span>
                </div>
              ))}
              {myTrophies.length > 4 && (
                <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/50 border border-border/50 text-center cursor-pointer hover:bg-secondary transition-colors" onClick={() => setTab('profile')}>
                  <span className="text-xl font-bold text-muted-foreground mb-1">+{myTrophies.length - 4}</span>
                  <span className="text-xs font-semibold text-muted-foreground">More</span>
                </div>
              )}
              {myTrophies.length === 0 && (
                <div className="col-span-full py-6"><EmptyState text="No trophies earned yet." /></div>
              )}
            </div>
          </MagicCard>
        </FadeIn>

        <FadeIn delay={0.65} className="col-span-12 md:col-span-5 h-full">
          <MagicCard className="h-full p-5 bg-card/50 backdrop-blur flex flex-col">
            <SectionTitle icon={Bell}>Notifications</SectionTitle>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className={`mt-1 shrink-0 w-2 h-2 rounded-full ${n.type === 'tournament' ? 'bg-gold' : n.type === 'fixtures' ? 'bg-pitch-bright' : 'bg-claret'}`} />
                  <div>
                    <div className="text-xs font-medium">{n.text}</div>
                    <div className="text-[9px] mt-0.5 text-muted-foreground font-mono">{new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="py-6"><EmptyState text="No recent notifications." /></div>
              )}
            </div>
          </MagicCard>
        </FadeIn>
      </div>
    </div>
  );
}

function StandingsView({ activeTournament, matches, players, me }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id);
  const standings = computeStandings(tMatches, players, activeTournament.id);
  
  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={ListOrdered}>{activeTournament.name} — Table</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border/50">
                <th className="p-3 font-semibold">#</th>
                <th className="p-3 font-semibold">Player</th>
                <th className="p-3 text-center font-semibold">P</th>
                <th className="p-3 text-center font-semibold">W</th>
                <th className="p-3 text-center font-semibold">D</th>
                <th className="p-3 text-center font-semibold">L</th>
                <th className="p-3 text-center font-semibold">GF</th>
                <th className="p-3 text-center font-semibold">GA</th>
                <th className="p-3 text-center font-semibold text-pitch-bright">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, i) => (
                <motion.tr 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.05 }} 
                  key={s.id} 
                  className={`border-b border-border/30 last:border-0 hover:bg-secondary/50 transition-colors ${s.id === me.id ? 'bg-pitch/10 hover:bg-pitch/20' : ''}`}
                >
                  <td className="p-3 font-medium text-muted-foreground">{i + 1}</td>
                  <td className="p-3"><PlayerChip p={s} size={20} /></td>
                  <td className="p-3 text-center">{s.played}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.won}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.drawn}</td>
                  <td className="p-3 text-center text-muted-foreground">{s.lost}</td>
                  <td className="p-3 text-center">{s.gf}</td>
                  <td className="p-3 text-center">{s.ga}</td>
                  <td className="p-3 text-center font-bold text-pitch-bright text-base">{s.pts}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </FadeIn>
  );
}

function MatchesView({ activeTournament, matches, players }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league");
  return (
    <FadeIn delay={0.1}>
      <Card className="p-5">
        <SectionTitle icon={Calendar}>All Matches</SectionTitle>
        <div className="flex flex-col gap-3">
          {tMatches.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <MatchCard m={m} players={players} />
            </motion.div>
          ))}
        </div>
      </Card>
    </FadeIn>
  );
}

function PlayoffBracketDisplay({ tMatches, players }) {
  const byRound = Object.fromEntries(tMatches.map((m) => [m.round, m]));
  const { semiA, semiB, challenger, final } = byRound;
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-gold">Top match (Rank 1 vs 2)</div>
          {semiA ? (semiA.status === "live" ? <LiveScoreboard m={semiA} players={players} /> : <MatchCard m={semiA} players={players} />) : <EmptyState text="Not generated yet." />}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-claret">Bottom match (Rank 3 vs 4)</div>
          {semiB ? (semiB.status === "live" ? <LiveScoreboard m={semiB} players={players} /> : <MatchCard m={semiB} players={players} />) : <EmptyState text="Not generated yet." />}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-muted-foreground">Challenger match — Top match loser vs Bottom match winner</div>
        {challenger ? (challenger.status === "live" ? <LiveScoreboard m={challenger} players={players} /> : <MatchCard m={challenger} players={players} />) : <EmptyState text="Unlocks once both matches above are completed." />}
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider mb-2 font-semibold text-pitch-bright">Final — Top match winner vs Challenger winner</div>
        {final ? (final.status === "live" ? <LiveScoreboard m={final} players={players} /> : <MatchCard m={final} players={players} />) : <EmptyState text="Unlocks once the challenger match is completed." />}
      </div>
      {final?.status === "completed" && (
        <FadeIn>
          <MagicCard className="p-8 text-center bg-gradient-to-br from-gold/20 to-transparent border-gold/50">
            <Trophy className="mx-auto mb-4 text-gold" size={48} />
            <div className="text-3xl font-bold font-display text-gold">{byId[matchWinnerId(final)]?.name} is the Champion! 🏆</div>
          </MagicCard>
        </FadeIn>
      )}
    </div>
  );
}

function PlayoffsView({ activeTournament, matches, players }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round !== "league");
  
  if (tMatches.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="Playoffs haven't started yet. They unlock once the admin closes the league phase." /></Card></FadeIn>;
  return (
    <FadeIn delay={0.1}>
      <Card className="p-6">
        <SectionTitle icon={Swords}>Playoff bracket</SectionTitle>
        <PlayoffBracketDisplay tMatches={tMatches} players={players} />
      </Card>
    </FadeIn>
  );
}

function RosterView({ players, matches }) {
  const matchWinnerId = (m) => {
    if (!m || m.status !== "completed") return null;
    if (m.homeScore > m.awayScore) return m.homeId;
    if (m.awayScore > m.homeScore) return m.awayId;
    if (m.penaltyWinner) return m.penaltyWinner === "home" ? m.homeId : m.awayId;
    return null;
  };
  const matchLoserId = (m) => {
    const w = matchWinnerId(m);
    if (!w) return null;
    return w === m.homeId ? m.awayId : m.homeId;
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {players.map((p, i) => {
        const pm = matches.filter((m) => m.status === "completed" && (m.homeId === p.id || m.awayId === p.id));
        const wins = pm.filter((m) => matchWinnerId(m) === p.id).length;
        const losses = pm.filter((m) => matchLoserId(m) === p.id).length;
        const draws = pm.length - wins - losses;
        const golds = matches.filter((m) => m.round === "final" && m.status === "completed" && matchWinnerId(m) === p.id).length;
        
        return (
          <FadeIn key={p.id} delay={i * 0.05}>
            <MagicCard className="p-5 flex items-center gap-4 hover:border-border transition-colors cursor-default">
              <Avatar p={p} size={64} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg font-display flex items-center gap-2">{p.name} <span>{p.flag}</span></div>
                <div className="text-sm text-muted-foreground mt-0.5">{p.teamLogo} {p.teamName}</div>
                <div className="flex gap-4 mt-3 text-xs font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">{wins}W</span>
                  <span className="font-semibold text-foreground">{draws}D</span>
                  <span className="font-semibold text-foreground">{losses}L</span>
                  {golds > 0 && <span className="flex items-center gap-1 text-gold"><Trophy size={12} />{golds}</span>}
                </div>
              </div>
            </MagicCard>
          </FadeIn>
        );
      })}
      {players.length === 0 && <EmptyState text="No players yet." />}
    </div>
  );
}

function HistoryView({ history, players }) {
  if (!history || history.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No completed tournaments yet." /></Card></FadeIn>;
  
  return (
    <div className="flex flex-col gap-4">
      {history.map((t, i) => {
        const champ = players.find((p) => p.id === t.championId);
        const runner = players.find((p) => p.id === t.runnerUpId);
        const third = players.find((p) => p.id === t.thirdId);
        const mvp = players.find((p) => p.id === t.mvpId);
        
        return (
          <FadeIn key={t.id} delay={i * 0.1}>
            <MagicCard className="p-6 bg-gradient-to-br from-card to-secondary/50">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-2">
                <div className="font-bold text-2xl font-display">{t.name}</div>
                <span className="text-sm text-muted-foreground font-mono bg-background/50 px-3 py-1 rounded-full w-fit">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
                  <Trophy size={24} className="mx-auto mb-2 text-gold" />
                  <div className="text-sm font-bold font-display tracking-wide">{champ?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Champion</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-400/10 border border-zinc-400/20">
                  <Trophy size={24} className="mx-auto mb-2 text-zinc-400" />
                  <div className="text-sm font-bold font-display tracking-wide">{runner?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Runner-up</div>
                </div>
                <div className="p-4 rounded-xl bg-[#CD7F32]/10 border border-[#CD7F32]/20">
                  <Trophy size={24} className="mx-auto mb-2 text-[#CD7F32]" />
                  <div className="text-sm font-bold font-display tracking-wide">{third?.name || "—"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Third place</div>
                </div>
              </div>
              {mvp && (
                <div className="mt-4 text-sm flex items-center gap-2 justify-center text-pitch-bright font-medium">
                  <Trophy size={16} /> MVP of the tournament: <strong className="font-bold">{mvp.name}</strong>
                </div>
              )}
            </MagicCard>
          </FadeIn>
        );
      })}
    </div>
  );
}

function NotificationsView({ notifications }) {
  if (!notifications || notifications.length === 0) return <FadeIn delay={0.1}><Card className="p-6"><EmptyState text="No notifications yet." /></Card></FadeIn>;
  return (
    <FadeIn delay={0.1}>
      <Card className="p-6">
        <SectionTitle icon={Trophy}>Notifications</SectionTitle>
        <div className="flex flex-col gap-3">
          {notifications.map((n, i) => (
            <motion.div 
              key={n.id} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="p-4 rounded-xl flex items-start gap-3 bg-secondary/50 border border-border/50"
            >
              <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${n.type === 'tournament' ? 'bg-gold' : n.type === 'fixtures' ? 'bg-pitch-bright' : 'bg-claret'}`} />
              <div>
                <div className="text-sm font-medium">{n.text}</div>
                <div className="text-[10px] mt-1 text-muted-foreground font-mono">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </FadeIn>
  );
}

function ProfileView({ me, showToast, trophies }) {
  const [form, setForm] = React.useState({ 
    name: me.name || "", 
    teamName: me.teamName || "", 
    avatar: me.avatar || "", 
    avatarImage: me.avatarImage || "", 
    flag: me.flag || "", 
    teamLogo: me.teamLogo || "",
    bio: me.bio || "",
    nationality: me.nationality || "",
    favoriteClub: me.favoriteClub || "",
    favoriteCompetition: me.favoriteCompetition || ""
  });
  const [pwd, setPwd] = React.useState(""); 
  const [pwd2, setPwd2] = React.useState("");

  const saveProfile = async () => {
    const res = await updatePlayerProfile(me.id, form);
    if (res.error) showToast(res.error);
    else showToast("Profile updated");
  };

  const savePassword = async () => {
    if (pwd !== pwd2) return showToast("Passwords don't match");
    const res = await changePlayerPassword(me.id, pwd);
    if (res.error) showToast(res.error);
    else { showToast("Password updated"); setPwd(""); setPwd2(""); }
  };

  return (
    <div className="flex flex-col gap-6">
      <FadeIn delay={0.1}>
        <Card className="p-6">
          <SectionTitle icon={Camera}>Profile</SectionTitle>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <div><Label>Display Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Bio</Label><Input value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Short bio..." /></div>
            
            <div className="md:col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2 border-b border-border/50 pb-1">Football Identity</div>
            <div><Label>Team Name</Label><Input value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} /></div>
            <div><Label>Nationality (Emoji)</Label><Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="e.g. 🇧🇷" /></div>
            <div><Label>Favorite Club</Label><Input value={form.favoriteClub} onChange={e => setForm({...form, favoriteClub: e.target.value})} placeholder="e.g. Real Madrid" /></div>
            <div><Label>Favorite Competition</Label><Input value={form.favoriteCompetition} onChange={e => setForm({...form, favoriteCompetition: e.target.value})} placeholder="e.g. Champions League" /></div>
            
            <div className="md:col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mt-2 border-b border-border/50 pb-1">Media (Emojis or URLs)</div>
            <div><Label>Avatar</Label><Input value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} placeholder="Avatar emoji or URL" /></div>
            <div><Label>Team Logo</Label><Input value={form.teamLogo} onChange={e => setForm({...form, teamLogo: e.target.value})} placeholder="Team logo emoji or URL" /></div>
          </div>
          <ShinyButton className="w-full mt-6" onClick={saveProfile}>Save Profile</ShinyButton>
        </Card>
      </FadeIn>
      
      <FadeIn delay={0.2}>
        <Card className="p-6">
          <SectionTitle icon={KeyRound}>Change Password</SectionTitle>
          <div className="grid gap-4 mt-2">
            <div><Label>New Password</Label><Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} /></div>
            <div><Label>Confirm</Label><Input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} /></div>
          </div>
          <Btn variant="ghost" className="w-full mt-6" onClick={savePassword}>Update Password</Btn>
        </Card>
      </FadeIn>
      
      <FadeIn delay={0.3}>
        <Card className="p-6">
          <SectionTitle icon={Trophy}>Trophy Cabinet</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {trophies?.filter(t => t.playerId === me.id).map((t, i) => (
              <motion.div 
                key={t.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", delay: 0.4 + (i * 0.1) }}
                className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-gold/20 to-transparent border border-gold/30 rounded-xl text-center shadow-lg"
              >
                <div className="text-4xl mb-2">{t.icon || "🏆"}</div>
                <div className="font-bold text-sm leading-tight">{t.title}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t.season}</div>
                {t.description && <div className="text-[10px] opacity-70 mt-1">{t.description}</div>}
              </motion.div>
            ))}
            {(!trophies || trophies.filter(t => t.playerId === me.id).length === 0) && (
              <div className="col-span-full text-center text-sm text-muted-foreground py-8">
                No trophies earned yet.
              </div>
            )}
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
