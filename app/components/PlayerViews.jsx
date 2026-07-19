'use client';

import React from 'react';
import { Trophy, Clock, ListOrdered, Calendar, Swords, Camera, KeyRound } from 'lucide-react';
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
      if (m.homeScore > m.awayScore) { h.won++; a.lost++; h.pts += 3; }
      else if (m.homeScore < m.awayScore) { a.won++; h.lost++; a.pts += 3; }
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

function PlayerDashboard({ me, activeTournament, matches, players }) {
  const t = activeTournament;
  const tMatches = t ? matches.filter((m) => m.tournamentId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);
  const live = tMatches.filter((m) => m.status === "live");
  const myLive = live.filter((m) => m.homeId === me.id || m.awayId === me.id);
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).slice(0, 3);

  if (!t) return <FadeIn delay={0.1}><Card className="p-8 text-center"><Trophy className="mx-auto mb-4 text-muted-foreground" size={40} /><div className="text-2xl font-bold font-display">No active tournament</div></Card></FadeIn>;

  return (
    <div className="flex flex-col gap-6">
      <FadeIn delay={0.1}>
        <MagicCard className="p-8 flex flex-col items-center text-center gap-4 bg-gradient-to-br from-card to-secondary">
          <Avatar p={me} size={88} ring="var(--pitch)" glow />
          <div>
            <div className="text-2xl font-bold font-display tracking-wide">{me.name} {me.flag}</div>
            <div className="text-sm text-muted-foreground mt-1">{me.teamLogo} {me.teamName}</div>
          </div>
          <div className="flex items-center gap-8 mt-2">
            <div className="text-center">
              <NumberTicker value={myRank || 0} className="text-3xl font-bold font-mono text-gold" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Position</div>
            </div>
            <div className="text-center">
              <NumberTicker value={myRow?.pts ?? 0} className="text-3xl font-bold font-mono text-pitch-bright" />
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">Points</div>
            </div>
          </div>
        </MagicCard>
      </FadeIn>

      {myLive.map((m, i) => <FadeIn key={m.id} delay={0.2 + i*0.1}><LiveScoreboard m={m} players={players} /></FadeIn>)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FadeIn delay={0.3}>
          <Card className="p-5 bg-card/50 backdrop-blur">
            <SectionTitle icon={Clock}>Upcoming Fixtures</SectionTitle>
            <div className="flex flex-col gap-3">
              {upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <div className="text-sm py-6 text-center text-muted-foreground">No fixtures scheduled.</div>}
            </div>
          </Card>
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

function PlayoffsView() { return <EmptyState text="Playoffs logic goes here." />; }
function RosterView() { return <EmptyState text="Roster view goes here." />; }
function HistoryView() { return <EmptyState text="Tournament history goes here." />; }
function NotificationsView() { return <EmptyState text="Notifications view goes here." />; }

function ProfileView({ me, showToast }) {
  const [form, setForm] = React.useState({ name: me.name, teamName: me.teamName, avatar: me.avatar, avatarImage: me.avatarImage, flag: me.flag, teamLogo: me.teamLogo });
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
          <div className="grid gap-4 mt-2">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div><Label>Team Name</Label><Input value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} /></div>
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
    </div>
  );
}
