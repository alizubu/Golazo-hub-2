'use client';

import React from 'react';
import { Trophy, Clock, TrendingUp, ListOrdered, Target, Calendar, Swords, Users, Archive, Bell, Camera, X, Check, KeyRound } from 'lucide-react';
import { Card, Btn, Input, Label, Badge, Avatar, PlayerChip, SectionTitle, EmptyState } from './UI';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';

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
    <div className="rounded-2xl p-4 relative overflow-hidden transition-all-fast" style={{ background: `linear-gradient(135deg, var(--surface3), var(--surface))`, border: `1px solid rgba(178,58,72,0.3)` }}>
      <div className="flex items-center justify-center gap-2 mb-3">
        <Badge color="var(--claret)" pulse>LIVE</Badge>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <Avatar p={h} size={48} />
          <span className="text-sm font-semibold truncate text-center">{h?.name}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 px-2">
          <span className="score-pop text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{m.homeScore ?? 0}</span>
          <span className="text-2xl opacity-40" style={{ fontFamily: 'var(--font-mono)' }}>-</span>
          <span className="score-pop text-4xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{m.awayScore ?? 0}</span>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <Avatar p={a} size={48} />
          <span className="text-sm font-semibold truncate text-center">{a?.name}</span>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ m, players }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  return (
    <div className="flex items-center justify-between p-3 rounded-xl transition-all-fast" style={{ background: 'var(--surface2)', border: `1px solid var(--border)` }}>
      <div className="flex-1 min-w-0"><PlayerChip p={h} size={18} /></div>
      <div className="px-3 text-center shrink-0">
        {m.status === "completed" ? (
          <div>
            <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-mono)', color: 'var(--pitchBright)' }}>{m.homeScore} – {m.awayScore}</div>
            <div className="flex items-center gap-1 justify-center mt-0.5">
              <span className="text-[9px]" style={{ color: 'var(--textFaint)' }}>FT</span>
            </div>
          </div>
        ) : m.status === "live" ? (
          <div>
            <Badge color="var(--claret)" pulse>LIVE</Badge>
            <div className="font-bold text-lg mt-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
              <span className="score-pop">{m.homeScore ?? 0}</span> – <span className="score-pop">{m.awayScore ?? 0}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs" style={{ color: 'var(--textFaint)', fontFamily: 'var(--font-mono)' }}>TBD</div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex justify-end"><PlayerChip p={a} size={18} /></div>
    </div>
  );
}

function PlayerDashboard({ me, activeTournament, matches, players, setTab }) {
  const t = activeTournament;
  const tMatches = t ? matches.filter((m) => m.tournamentId === t.id) : [];
  const standings = t ? computeStandings(tMatches, players, t.id) : [];
  const myRank = standings.findIndex((s) => s.id === me.id) + 1;
  const myRow = standings.find((s) => s.id === me.id);
  const live = tMatches.filter((m) => m.status === "live");
  const myLive = live.filter((m) => m.homeId === me.id || m.awayId === me.id);
  const upcoming = tMatches.filter((m) => m.status === "scheduled" && (m.homeId === me.id || m.awayId === me.id)).slice(0, 3);

  if (!t) return <Card className="fade-up p-8 text-center"><Trophy className="mx-auto mb-3" color="var(--textFaint)" size={32} /><div style={{ fontFamily: 'var(--font-display)', fontSize: 20 }}>No active tournament</div></Card>;

  return (
    <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Card className="fade-up p-6 flex flex-col items-center text-center gap-3" style={{ background: `linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)` }}>
        <Avatar p={me} size={76} ring="var(--pitch)" glow />
        <div>
          <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{me.name} {me.flag}</div>
          <div className="text-xs" style={{ color: 'var(--textDim)' }}>{me.teamLogo} {me.teamName}</div>
        </div>
        <div className="flex items-center gap-6 mt-1" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
          <div className="text-center"><div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{myRank || "–"}</div><div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--textFaint)' }}>Position</div></div>
          <div className="text-center"><div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--pitchBright)' }}>{myRow?.pts ?? 0}</div><div className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--textFaint)' }}>Points</div></div>
        </div>
      </Card>

      {myLive.map((m) => <div key={m.id} className="fade-up"><LiveScoreboard m={m} players={players} /></div>)}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <Card className="fade-up p-4" style={{ padding: '1rem' }}>
          <SectionTitle icon={Clock}>Upcoming</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{upcoming.length ? upcoming.map((m) => <MatchCard key={m.id} m={m} players={players} />) : <div className="text-sm py-4 text-center" style={{ color: 'var(--textFaint)' }}>No fixtures scheduled.</div>}</div>
        </Card>
      </div>
    </div>
  );
}

function StandingsView({ activeTournament, matches, players, me }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id);
  const standings = computeStandings(tMatches, players, activeTournament.id);
  
  return (
    <Card className="fade-up p-4" style={{ padding: '1rem' }}>
      <SectionTitle icon={ListOrdered}>{activeTournament.name} — Table</SectionTitle>
      <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--textFaint)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.5rem' }}>#</th>
              <th style={{ padding: '0.5rem' }}>Player</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>P</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>W</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>D</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>L</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>GF</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>GA</th>
              <th style={{ padding: '0.5rem', textAlign: 'center' }}>Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid var(--border)', background: s.id === me.id ? 'rgba(31, 138, 92, 0.1)' : 'transparent' }}>
                <td style={{ padding: '0.5rem' }}>{i + 1}</td>
                <td style={{ padding: '0.5rem' }}><PlayerChip p={s} size={16} /></td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.played}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.won}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.drawn}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.lost}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.gf}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>{s.ga}</td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', color: 'var(--pitchBright)' }}>{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MatchesView({ activeTournament, matches, players }) {
  if (!activeTournament) return <EmptyState text="No active tournament yet." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league");
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Card className="fade-up" style={{ padding: '1rem' }}>
        <SectionTitle icon={Calendar}>All Matches</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {tMatches.map(m => <MatchCard key={m.id} m={m} players={players} />)}
        </div>
      </Card>
    </div>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Card className="fade-up p-4" style={{ padding: '1rem' }}>
        <SectionTitle icon={Camera}>Profile</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          <div><Label>Name</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
          <div><Label>Team Name</Label><Input value={form.teamName} onChange={e => setForm({...form, teamName: e.target.value})} /></div>
        </div>
        <Btn className="w-full mt-4" style={{ marginTop: '1rem', width: '100%' }} onClick={saveProfile}>Save profile</Btn>
      </Card>
      
      <Card className="fade-up p-4" style={{ padding: '1rem' }}>
        <SectionTitle icon={KeyRound}>Change Password</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
          <div><Label>New Password</Label><Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} /></div>
          <div><Label>Confirm</Label><Input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} /></div>
        </div>
        <Btn className="w-full mt-4" style={{ marginTop: '1rem', width: '100%' }} onClick={savePassword}>Update Password</Btn>
      </Card>
    </div>
  );
}
