'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords, Edit2, ListOrdered, BarChart2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Badge } from './UI';
import { startTournament, deleteTournament, renameTournament } from '@/app/actions/tournament';
import { generateFixtures } from '@/app/actions/match';

export default function AdminConsole(props) {
  const { tab } = props;
  if (tab === "admin") return <AdminOverview {...props} />;
  if (tab === "admin-players") return <AdminPlayers {...props} />;
  if (tab === "admin-tournament") return <AdminTournament {...props} />;
  if (tab === "admin-matches") return <AdminMatches {...props} />;
  if (tab === "admin-playoffs") return <AdminPlayoffs {...props} />;
  if (tab === "admin-settings") return <AdminSettings {...props} />;
  if (tab === "admin-trophies") return <AdminTrophies {...props} />;
  if (tab === "admin-announcements") return <AdminAnnouncements {...props} />;
  return <EmptyState text="Admin feature in progress..." />;
}

function AdminOverview({ players, activeTournament, matches, history }) {
  const tMatches = activeTournament ? matches.filter((m) => m.tournamentId === activeTournament.id) : [];
  const live = tMatches.filter((m) => m.status === "live").length;
  const scheduled = tMatches.filter((m) => m.status === "scheduled").length;
  const completed = tMatches.filter((m) => m.status === "completed").length;
  
  const stats = [
    { label: "Players", value: players.length, icon: Users, color: 'text-pitch-bright' },
    { label: "Live now", value: live, icon: Radio, color: 'text-claret' },
    { label: "Upcoming", value: scheduled, icon: Clock, color: 'text-gold' },
    { label: "Completed", value: completed, icon: Check, color: 'text-muted-foreground' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; 
          return (
            <FadeIn delay={i * 0.1} key={s.label}>
              <MagicCard className="p-5 flex flex-col items-center justify-center text-center">
                <Icon size={24} className={`mb-3 ${s.color}`} />
                <div className="text-3xl font-bold font-mono tracking-tighter">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{s.label}</div>
              </MagicCard>
            </FadeIn>
          ); 
        })}
      </div>
      <FadeIn delay={0.4}>
        <Card className="p-6">
          <SectionTitle icon={Trophy}>Current tournament</SectionTitle>
          {activeTournament ? 
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">{activeTournament.name}</strong> — started {new Date(activeTournament.createdAt).toLocaleDateString()}</div> 
            : <EmptyState text="No active tournament. Go to the Tournament tab to start one." />
          }
        </Card>
      </FadeIn>
      <FadeIn delay={0.5}>
        <Card className="p-6">
          <SectionTitle icon={Archive}>Completed seasons</SectionTitle>
          <div className="text-4xl font-bold font-mono text-gold">{history.length}</div>
        </Card>
      </FadeIn>
    </div>
  );
}

function AdminPlayers({ players, showToast }) {
  const [editing, setEditing] = useState(null);
  const blank = { name: "", username: "", email: "", avatar: null, flag: null, teamName: "", teamLogo: null, password: "" };
  const [form, setForm] = useState(blank);
  const startNew = () => { setForm(blank); setEditing("new"); };
  const startEdit = (p) => { setForm({ ...p, password: "" }); setEditing(p.id); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Enter a player name");
    
    if (editing === "new") {
      if (!form.username.trim() || !form.email.trim()) return showToast("Username and email are required");
      if (form.password.length < 4) return showToast("Set a temporary password (4+ chars)");
      
      const { signUpPlayer } = await import('@/app/actions/player');
      const res = await signUpPlayer(form);
      if (res.error) showToast(res.error);
      else showToast(`${form.name} added`);
    } else {
      const { adminUpdatePlayer } = await import('@/app/actions/player');
      const res = await adminUpdatePlayer(editing, form);
      if (res.error) showToast(res.error);
      else showToast("Player updated");
    }
    setEditing(null);
  };
  
  const remove = async (id) => { 
    if (!confirm("Delete player?")) return;
    const { adminDeletePlayer } = await import('@/app/actions/player');
    const res = await adminDeletePlayer(id);
    if (res.error) showToast(res.error);
    else showToast("Player removed");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Users}>Players ({players.length})</SectionTitle>
        <ShinyButton onClick={startNew}><Plus size={15} /> Add player</ShinyButton>
      </div>
      {editing && (
        <FadeIn>
          <Card className="p-6 border-gold/50 bg-gold/5">
            <div className="text-xl font-bold font-display tracking-wide mb-4 text-gold">
              {editing === "new" ? "New player account" : "Edit player"}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Display name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Player name" /></div>
              <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" /></div>
              <div className="md:col-span-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" /></div>
              <div className="md:col-span-2"><Label>{editing === "new" ? "Temporary password" : "Reset password (leave blank to keep)"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="4+ characters" /></div>
              {editing !== "new" && (
                <>
                  <div><Label>Team name</Label><Input value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} /></div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <ShinyButton onClick={save}><Check size={15} /> Save</ShinyButton>
              <Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn>
            </div>
          </Card>
        </FadeIn>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {players.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <MagicCard className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-secondary rounded-full text-2xl">{p.avatar || '👤'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold font-display truncate text-lg">{p.name} {p.flag}</div>
                <div className="text-xs text-muted-foreground truncate">{p.teamLogo} {p.teamName} · @{p.username}</div>
              </div>
              <Btn variant="ghost" className="p-2" onClick={() => startEdit(p)}>Edit</Btn>
              <Btn variant="danger" className="p-2" onClick={() => remove(p.id)}>Del</Btn>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function AdminMatches({ matches, activeTournament, players, showToast }) {
  if (!activeTournament) return <EmptyState text="Start a tournament first." />;
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id);
  
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Radio}>Match Control</SectionTitle>
      <div className="grid gap-4">
        {tMatches.map((m, i) => (
          <FadeIn key={m.id} delay={i * 0.05}>
            <AdminMatchControl m={m} players={players} showToast={showToast} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function AdminMatchControl({ m, players, showToast }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const [loading, setLoading] = useState(false);

  const update = async (data) => {
    setLoading(true);
    const { updateMatchStatus } = await import('@/app/actions/match');
    const res = await updateMatchStatus(m.id, data);
    if (res.error) showToast(res.error);
    setLoading(false);
  };

  const startMatch = () => update({ status: "live", liveState: { phase: "first" }, homeScore: 0, awayScore: 0 });
  const bumpScore = async (side, delta) => {
    if (loading) return;
    const key = side === "home" ? "homeScore" : "awayScore";
    const next = Math.max(0, (m[key] || 0) + delta);
    setLoading(true);
    const { updateMatchScore } = await import('@/app/actions/match');
    await updateMatchScore(m.id, side === "home" ? next : (m.homeScore||0), side === "away" ? next : (m.awayScore||0));
    setLoading(false);
  };
  const endRegulation = () => {
    if (m.decisive && m.homeScore === m.awayScore) {
      update({ liveState: { phase: "extra" }, wentToExtra: true });
    } else finishMatch();
  };
  const endExtra = () => {
    if (m.homeScore === m.awayScore) {
      update({ liveState: { phase: "penalties", penalties: { kicks: [], winner: null } } });
    } else finishMatch();
  };
  const finishMatch = () => update({ status: "completed", liveState: null });

  if (m.status === "completed") {
    return (
      <MagicCard className="p-4 bg-secondary/50">
        <div className="flex items-center justify-between opacity-60">
          <div className="font-bold">{h?.name}</div>
          <div className="text-xl font-mono">{m.homeScore} - {m.awayScore}</div>
          <div className="font-bold">{a?.name}</div>
        </div>
      </MagicCard>
    );
  }

  if (m.status === "scheduled") {
    return (
      <MagicCard className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 font-bold truncate">{h?.name}</div>
          <span className="text-xs text-muted-foreground font-mono">VS</span>
          <div className="flex-1 text-right font-bold truncate">{a?.name}</div>
        </div>
        <div className="mt-4 flex justify-center">
          <ShinyButton onClick={startMatch} disabled={loading}><Radio size={14} className="mr-2"/> Start Live Match</ShinyButton>
        </div>
      </MagicCard>
    );
  }

  return (
    <MagicCard className="p-5 border-claret/50 bg-claret/5">
      <div className="flex items-center justify-center mb-4">
        <Badge color="var(--claret)" pulse>LIVE {m.liveState?.phase === "extra" ? " (AET)" : m.liveState?.phase === "penalties" ? " (PENS)" : ""}</Badge>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="font-bold">{h?.name}</div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" className="px-2" onClick={() => bumpScore("home", -1)}>-</Btn>
            <div className="text-3xl font-mono w-10 text-center font-bold">{m.homeScore}</div>
            <Btn className="px-2 bg-pitch hover:bg-pitch-bright" onClick={() => bumpScore("home", 1)}>+</Btn>
          </div>
        </div>
        <div className="text-sm font-mono opacity-30">VS</div>
        <div className="flex-1 flex flex-col items-center gap-3">
          <div className="font-bold">{a?.name}</div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" className="px-2" onClick={() => bumpScore("away", -1)}>-</Btn>
            <div className="text-3xl font-mono w-10 text-center font-bold">{m.awayScore}</div>
            <Btn className="px-2 bg-pitch hover:bg-pitch-bright" onClick={() => bumpScore("away", 1)}>+</Btn>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/50 flex justify-center gap-3">
        {m.liveState?.phase === "first" && <ShinyButton onClick={endRegulation} disabled={loading}>End Match</ShinyButton>}
        {m.liveState?.phase === "extra" && <ShinyButton onClick={endExtra} disabled={loading}>End Extra Time</ShinyButton>}
        {m.liveState?.phase === "penalties" && (
          <div className="flex flex-col gap-3 w-full">
            <div className="text-center text-sm mb-2 text-muted-foreground">Admin: Set penalty winner directly</div>
            <div className="flex gap-2 justify-center">
              <Btn className="flex-1 bg-claret hover:bg-claret-dim" onClick={() => update({ status: 'completed', penaltyResult: { winner: 'home', home: 1, away: 0 }})}>{h?.name} wins on pens</Btn>
              <Btn className="flex-1 bg-claret hover:bg-claret-dim" onClick={() => update({ status: 'completed', penaltyResult: { winner: 'away', home: 0, away: 1 }})}>{a?.name} wins on pens</Btn>
            </div>
          </div>
        )}
      </div>
    </MagicCard>
  );
}

function AdminPlayoffs({ activeTournament, matches, players, showToast }) {
  if (!activeTournament) return <EmptyState text="Start a tournament first." />;
  
  const handleGeneratePlayoffs = async () => {
    // Basic logic: get top 4 players from standings
    const { computeStandings } = await import('@/app/components/PlayerViews'); // We will duplicate logic here if needed or just use simple one
    const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league" && m.status === "completed");
    
    // Quick calculate standings
    const table = {};
    players.forEach(p => table[p.id] = { id: p.id, pts: 0, gd: 0, gf: 0 });
    tMatches.forEach(m => {
      const h = table[m.homeId], a = table[m.awayId];
      if (!h || !a) return;
      h.gf += m.homeScore; a.gf += m.awayScore;
      h.gd += (m.homeScore - m.awayScore); a.gd += (m.awayScore - m.homeScore);
      if (m.homeScore > m.awayScore) h.pts += 2;
      else if (m.homeScore < m.awayScore) a.pts += 2;
      else { h.pts++; a.pts++; }
    });
    const standings = Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
    
    const top4 = standings.slice(0, 4).map(s => s.id);
    if (top4.length < 4) return showToast("Not enough players for playoffs (need 4)");
    
    const { generatePlayoffs } = await import('@/app/actions/match');
    const res = await generatePlayoffs(activeTournament.id, top4);
    if (res.error) showToast(res.error);
    else showToast("Playoff bracket generated");
  };

  return (
    <Card className="p-6">
      <SectionTitle icon={Swords}>Playoffs Control</SectionTitle>
      <p className="text-sm text-muted-foreground mb-4">
        Once all league matches are complete, generate the Top Match and Bottom Match.
      </p>
      <ShinyButton onClick={handleGeneratePlayoffs}>Generate Playoff Semi-Finals</ShinyButton>
      
      <div className="mt-8 border-t border-border pt-6">
        <div className="text-sm mb-4">For Challenger and Final matches, you can create them manually based on the winners/losers of the semi-finals.</div>
        <Btn onClick={() => showToast("Not implemented in this UI demo.")}>Create Challenger / Final</Btn>
      </div>
    </Card>
  );
}

function AdminSettings() {
  return (
    <Card className="p-6">
      <SectionTitle icon={Settings}>League Settings</SectionTitle>
      <EmptyState text="Admin settings config (password changes, rules) go here." />
    </Card>
  );
}

function AdminTrophies({ players, trophies, showToast }) {
  const [form, setForm] = useState({ playerId: "", title: "", season: "", description: "", icon: "🏆" });

  const handleAward = async () => {
    if (!form.playerId || !form.title || !form.season) return showToast("Player, Title, and Season are required.");
    const { awardTrophy } = await import('@/app/actions/admin');
    const res = await awardTrophy(form);
    if (res.error) showToast(res.error);
    else { showToast("Trophy awarded!"); setForm({ playerId: "", title: "", season: "", description: "", icon: "🏆" }); }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove trophy?")) return;
    const { removeTrophy } = await import('@/app/actions/admin');
    const res = await removeTrophy(id);
    if (res.error) showToast(res.error);
    else showToast("Trophy removed.");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Trophy}>Award a Trophy</SectionTitle>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Player</Label>
            <select className="w-full bg-secondary text-foreground p-3 rounded-lg border-none mt-1" value={form.playerId} onChange={e => setForm({...form, playerId: e.target.value})}>
              <option value="">Select player...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div><Label>Trophy Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Golden Boot" /></div>
          <div><Label>Season</Label><Input value={form.season} onChange={e => setForm({...form, season: e.target.value})} placeholder="e.g. Season 1" /></div>
          <div><Label>Icon (Emoji/URL)</Label><Input value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="🏆" /></div>
          <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Top goalscorer with 25 goals." /></div>
        </div>
        <ShinyButton className="mt-6" onClick={handleAward}>Award Trophy</ShinyButton>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-4">
        {trophies?.map((t, i) => {
          const player = players.find(p => p.id === t.playerId);
          return (
            <FadeIn key={t.id} delay={i * 0.05}>
              <MagicCard className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{t.icon}</div>
                  <div>
                    <div className="font-bold">{t.title}</div>
                    <div className="text-sm text-muted-foreground">{player?.name} • {t.season}</div>
                  </div>
                </div>
                <Btn variant="danger" className="shrink-0 p-2" onClick={() => handleRemove(t.id)}><Trash2 size={16} /></Btn>
              </MagicCard>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}

function AdminAnnouncements({ announcements, showToast }) {
  const [form, setForm] = useState({ title: "", content: "" });

  const handlePost = async () => {
    if (!form.title || !form.content) return showToast("Title and Content required.");
    const { createAnnouncement } = await import('@/app/actions/admin');
    const res = await createAnnouncement(form);
    if (res.error) showToast(res.error);
    else { showToast("Announcement posted!"); setForm({ title: "", content: "" }); }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove announcement?")) return;
    const { deleteAnnouncement } = await import('@/app/actions/admin');
    const res = await deleteAnnouncement(id);
    if (res.error) showToast(res.error);
    else showToast("Announcement removed.");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Swords}>Post Announcement</SectionTitle>
        <div className="grid gap-4 mt-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Tournament Start!" /></div>
          <div><Label>Message</Label><Input value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Type message..." /></div>
        </div>
        <ShinyButton className="mt-6" onClick={handlePost}>Publish</ShinyButton>
      </Card>

      <div className="flex flex-col gap-4">
        {announcements?.map((a, i) => (
          <FadeIn key={a.id} delay={i * 0.05}>
            <MagicCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold">{a.title}</div>
                <div className="text-sm text-muted-foreground mt-1">{a.content}</div>
              </div>
              <Btn variant="danger" className="shrink-0" onClick={() => handleRemove(a.id)}>Delete</Btn>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function AdminTournament({ activeTournament, matches = [], players = [], showToast, setTab }) {
  const [name, setName] = useState("");
  const [rename, setRename] = useState("");

  const handleStart = async () => {
    if (!name.trim()) return showToast("Enter a tournament name");
    const res = await startTournament(name);
    if (res.error) showToast(res.error);
    else { showToast("Tournament started!"); setName(""); }
  };

  const handleRename = async () => {
    if (!rename.trim()) return showToast("Enter a new name");
    const res = await renameTournament(activeTournament.id, rename);
    if (res.error) showToast(res.error);
    else { showToast("Tournament renamed!"); setRename(""); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete the active tournament? This cannot be undone.")) return;
    const res = await deleteTournament(activeTournament.id);
    if (res.error) showToast(res.error);
    else showToast("Tournament deleted.");
  };

  const handleGenerateFixtures = async () => {
    if (!activeTournament) return;
    const res = await generateFixtures(activeTournament.id, players.map(p => p.id));
    if (res.error) showToast(res.error);
    else showToast("Fixtures generated!");
  };

  if (!activeTournament) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
        <Trophy size={64} className="text-gold mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
        <h2 className="text-3xl font-bold font-display mb-3">No Active Tournament</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">Create a new season to begin league matches, track standings, and manage playoffs.</p>
        
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <Label className="self-start text-muted-foreground">Tournament Name</Label>
          <div className="flex gap-2 w-full">
            <Input className="flex-1 bg-secondary border-border" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Season 4" />
            <ShinyButton onClick={handleStart} className="px-6">Create Season</ShinyButton>
          </div>
        </div>
      </Card>
    );
  }

  // --- Data Calculations ---
  const tMatches = matches.filter((m) => m.tournamentId === activeTournament.id && m.round === "league");
  // Assuming a single round-robin for a 5-player league = 10 matches total.
  // If double round-robin, it would be 20. We can guess based on generated matches.
  const isDoubleRoundRobin = tMatches.length > 10;
  const expectedMatches = isDoubleRoundRobin ? 20 : 10;
  
  const completedMatches = tMatches.filter(m => m.status === 'completed');
  const progressPercent = expectedMatches > 0 ? Math.round((completedMatches.length / expectedMatches) * 100) : 0;
  
  const scheduledMatches = tMatches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const upcoming = scheduledMatches.slice(0, 3);
  
  // --- Standings ---
  const table = {};
  players.forEach(p => table[p.id] = { id: p.id, name: p.name, flag: p.flag, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  
  completedMatches.forEach(m => {
    const h = table[m.homeId];
    const a = table[m.awayId];
    if (!h || !a) return;
    
    h.p++; a.p++;
    h.gf += m.homeScore; a.gf += m.awayScore;
    h.ga += m.awayScore; a.ga += m.homeScore;
    
    if (m.homeScore > m.awayScore) { h.w++; h.pts += 3; a.l++; }
    else if (m.homeScore < m.awayScore) { a.w++; a.pts += 3; h.l++; }
    else { h.d++; a.d++; h.pts++; a.pts++; }
  });
  
  Object.values(table).forEach(row => row.gd = row.gf - row.ga);
  
  const standings = Object.values(table).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  
  // --- Stats ---
  const totalGoals = completedMatches.reduce((acc, m) => acc + m.homeScore + m.awayScore, 0);
  const avgGoals = completedMatches.length > 0 ? (totalGoals / completedMatches.length).toFixed(1) : "0.0";
  
  let topScorer = null;
  let mostWins = null;
  if (standings.length > 0 && completedMatches.length > 0) {
    const byGoals = [...standings].sort((a, b) => b.gf - a.gf);
    topScorer = byGoals[0];
    const byWins = [...standings].sort((a, b) => b.w - a.w);
    mostWins = byWins[0];
  }
  
  // --- Status badges ---
  const isCompleted = progressPercent >= 100;
  const hasFixtures = tMatches.length > 0;
  const statusBadge = isCompleted 
    ? <Badge color="var(--primary)" className="ml-3">COMPLETED</Badge> 
    : (hasFixtures ? <Badge color="var(--success)" pulse className="ml-3">LIVE</Badge> : <Badge color="var(--gold)" className="ml-3">DRAFT</Badge>);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. HERO SECTION */}
      <Card className="p-8 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        <div className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none">
          <Trophy size={300} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-2">League Stage</div>
            <div className="flex items-center">
              <h1 className="text-4xl font-display font-bold tracking-wide">{activeTournament.name}</h1>
              {statusBadge}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono mt-4">
              <div className="flex items-center gap-1.5"><Calendar size={14} /> Started: {new Date(activeTournament.createdAt).toLocaleDateString()}</div>
              <div>•</div>
              <div className="flex items-center gap-1.5"><Users size={14} /> Players: {players.length} / 5</div>
              <div>•</div>
              <div className="flex items-center gap-1.5"><Radio size={14} /> Matches: {completedMatches.length} / {expectedMatches}</div>
              {isCompleted && (
                 <>
                    <div>•</div>
                    <div className="flex items-center gap-1.5 text-gold"><Trophy size={14} /> Champion: {standings[0]?.name || "—"}</div>
                 </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
            {!hasFixtures ? (
              <ShinyButton onClick={handleGenerateFixtures} className="w-full justify-center py-3 text-sm">Generate Fixtures</ShinyButton>
            ) : (
              <>
                <Btn className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90 py-3 text-sm" onClick={() => setTab && setTab("admin-matches")}>
                   View League Matches
                </Btn>
                {isCompleted && (
                   <Btn className="w-full justify-center border-gold text-gold hover:bg-gold/10 py-3 text-sm" variant="outline" onClick={() => setTab && setTab("admin-playoffs")}>
                      Open Playoffs
                   </Btn>
                )}
              </>
            )}
          </div>
        </div>
      </Card>

      {/* 2. QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={!hasFixtures ? handleGenerateFixtures : () => showToast("Fixtures already exist")}>
          <div className={`p-3 rounded-full ${!hasFixtures ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground opacity-50'}`}>
             <Calendar size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Generate Fixtures</span>
        </MagicCard>
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={() => {
            const newName = prompt("Enter new tournament name:", activeTournament.name);
            if (newName && newName !== activeTournament.name) {
                renameTournament(activeTournament.id, newName).then(res => {
                    if(res.error) showToast(res.error);
                    else showToast("Tournament renamed!");
                });
            }
        }}>
          <div className="p-3 rounded-full bg-pitch-bright/20 text-pitch-bright">
             <Edit2 size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Edit Tournament</span>
        </MagicCard>
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={() => setTab && setTab("admin-playoffs")}>
          <div className="p-3 rounded-full bg-claret/20 text-claret">
             <Swords size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Manage Playoffs</span>
        </MagicCard>
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={() => showToast("Archive functionality not yet implemented.")}>
          <div className="p-3 rounded-full bg-muted-foreground/20 text-muted-foreground">
             <Archive size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Archive Season</span>
        </MagicCard>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* 3. LEAGUE PROGRESS & FIXTURES */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <Card className="p-6">
            <SectionTitle icon={BarChart2}>League Progress</SectionTitle>
            <div className="mt-6">
              <div className="flex justify-between items-end mb-2">
                <span className="text-3xl font-display font-bold">{progressPercent}%</span>
                <span className="text-sm font-mono text-muted-foreground">{completedMatches.length} of {expectedMatches} Played</span>
              </div>
              <div className="h-4 w-full bg-secondary rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gold transition-all duration-1000 relative" style={{ width: `${progressPercent}%` }}>
                   <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle icon={Calendar}>Upcoming Fixtures</SectionTitle>
              <Btn variant="ghost" className="text-xs p-1 h-auto" onClick={() => setTab && setTab("admin-matches")}>View all <ArrowRight size={14} className="ml-1"/></Btn>
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
               {upcoming.length > 0 ? (
                 <div className="flex flex-col gap-3">
                   {upcoming.map((m, i) => {
                     const h = players.find(p => p.id === m.homeId);
                     const a = players.find(p => p.id === m.awayId);
                     return (
                       <div key={m.id} className="flex flex-col p-4 rounded-xl bg-secondary/30 border border-border/50 gap-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sm truncate flex-1">{h?.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground px-3 py-1 bg-background rounded-full mx-2">VS</span>
                            <span className="font-bold text-sm truncate flex-1 text-right">{a?.name}</span>
                          </div>
                          {m.status === 'live' && <div className="mt-2 text-[10px] text-claret font-bold text-center tracking-widest uppercase bg-claret/10 py-1.5 rounded flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-claret animate-pulse"></span> Match Live</div>}
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="py-8">
                    <EmptyState text={hasFixtures ? "All league matches completed" : "No fixtures generated yet"} />
                 </div>
               )}
            </div>
          </Card>
        </div>

        {/* 4. STANDINGS & PARTICIPANTS */}
        <div className="md:col-span-8 flex flex-col gap-6">
           <Card className="p-6 flex-1">
             <div className="flex items-center justify-between mb-6">
                <SectionTitle icon={ListOrdered}>League Standings</SectionTitle>
                <div className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success"></div> Top 4 Qualify
                </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-[11px] uppercase tracking-wider bg-secondary/50 text-muted-foreground">
                   <tr>
                     <th className="px-4 py-3 rounded-tl-lg w-10 text-center">Rank</th>
                     <th className="px-4 py-3">Player</th>
                     <th className="px-3 py-3 text-center">P</th>
                     <th className="px-3 py-3 text-center">W</th>
                     <th className="px-3 py-3 text-center">D</th>
                     <th className="px-3 py-3 text-center">L</th>
                     <th className="px-3 py-3 text-center">GD</th>
                     <th className="px-4 py-3 text-center font-bold text-primary rounded-tr-lg">Pts</th>
                   </tr>
                 </thead>
                 <tbody>
                   {standings.map((row, idx) => {
                     const isQualified = idx < 4;
                     return (
                       <tr key={row.id} className={`border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors ${idx === 3 ? 'border-b-2 border-b-success/30' : ''}`}>
                         <td className="px-4 py-4 text-center font-mono font-bold text-lg">
                           {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-muted-foreground">{idx + 1}</span>}
                         </td>
                         <td className="px-4 py-4 font-bold text-base flex items-center gap-2">
                           {row.name} {row.flag}
                         </td>
                         <td className="px-3 py-4 text-center font-mono text-muted-foreground">{row.p}</td>
                         <td className="px-3 py-4 text-center font-mono text-muted-foreground">{row.w}</td>
                         <td className="px-3 py-4 text-center font-mono text-muted-foreground">{row.d}</td>
                         <td className="px-3 py-4 text-center font-mono text-muted-foreground">{row.l}</td>
                         <td className="px-3 py-4 text-center font-mono">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                         <td className="px-4 py-4 text-center font-mono font-bold text-xl text-primary">{row.pts}</td>
                       </tr>
                     );
                   })}
                   {standings.length === 0 && (
                     <tr>
                       <td colSpan={8} className="py-12 text-center text-muted-foreground">No matches played yet</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </Card>
           
           <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <SectionTitle icon={Users}>Participants</SectionTitle>
                 <Btn variant="ghost" className="text-xs p-1 h-auto" onClick={() => setTab && setTab("admin-players")}>Manage <ArrowRight size={14} className="ml-1"/></Btn>
              </div>
              <div className="flex flex-wrap gap-2">
                 {players.map((p, i) => (
                    <div key={p.id} className="px-3 py-1.5 bg-secondary/50 border border-border rounded-full text-sm font-semibold flex items-center gap-2">
                       {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="w-4 h-4 flex items-center justify-center bg-background rounded-full text-[10px] text-muted-foreground">{i + 1}</span>}
                       {p.name}
                    </div>
                 ))}
                 {players.length === 0 && <span className="text-sm text-muted-foreground">No players added yet.</span>}
              </div>
           </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 5. STATISTICS */}
        <Card className="p-6">
          <SectionTitle icon={BarChart2}>Statistics</SectionTitle>
          <div className="grid grid-cols-2 gap-px bg-border/50 mt-4 rounded-xl overflow-hidden border border-border/50">
            <div className="flex flex-col bg-card p-5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Total Goals</span>
              <span className="text-4xl font-display font-bold text-pitch-bright">{totalGoals}</span>
            </div>
            <div className="flex flex-col bg-card p-5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Avg Goals/Match</span>
              <span className="text-4xl font-display font-bold text-gold">{avgGoals}</span>
            </div>
            <div className="flex flex-col bg-card p-5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Highest Scorer</span>
              <span className="text-2xl font-bold truncate mb-1">{topScorer ? topScorer.name : "—"}</span>
              {topScorer && <span className="text-xs font-mono text-muted-foreground">{topScorer.gf} Goals</span>}
            </div>
            <div className="flex flex-col bg-card p-5">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-2">Most Wins</span>
              <span className="text-2xl font-bold truncate mb-1">{mostWins ? mostWins.name : "—"}</span>
              {mostWins && <span className="text-xs font-mono text-muted-foreground">{mostWins.w} Wins</span>}
            </div>
          </div>
        </Card>

        {/* 6. PLAYOFF STATUS */}
        <Card className="p-6">
          <SectionTitle icon={Swords}>Playoff Status</SectionTitle>
          <div className="flex flex-col gap-2 mt-4">
            {standings.map((row, idx) => {
              const isQualified = idx < 4;
              return (
                <div key={row.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <span className="font-bold text-sm">{row.name}</span>
                  {isQualified ? (
                     <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-success bg-success/10 px-2 py-1 rounded">
                        <Check size={12} strokeWidth={3} /> Qualified
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-claret bg-claret/10 px-2 py-1 rounded">
                        <Trash2 size={12} /> Eliminated
                     </div>
                  )}
                </div>
              );
            })}
            {standings.length === 0 && <div className="py-8 text-center text-sm text-muted-foreground">Playoff picture will emerge here once matches begin.</div>}
          </div>
        </Card>
      </div>
      
      {/* 7. TOURNAMENT TIMELINE */}
      <Card className="p-8">
        <SectionTitle icon={Clock}>Tournament Timeline</SectionTitle>
        <div className="flex items-center justify-between mt-10 relative px-4 md:px-12">
           {/* Line behind steps */}
           <div className="absolute top-3 left-10 right-10 md:left-16 md:right-16 h-1 bg-secondary -translate-y-1/2 z-0">
              <div className="h-full bg-gold transition-all duration-1000" style={{ width: isCompleted ? '100%' : hasFixtures ? (progressPercent > 0 ? '75%' : '50%') : '25%' }} />
           </div>
           
           {/* Steps */}
           {['Created', 'Fixtures Generated', 'League Running', 'Playoffs', 'Champion'].map((step, idx) => {
              let active = false;
              if (idx === 0) active = true;
              else if (idx === 1 && hasFixtures) active = true;
              else if (idx === 2 && hasFixtures && progressPercent > 0) active = true;
              else if (idx === 3 && isCompleted) active = true;
              
              return (
                 <div key={step} className="relative z-10 flex flex-col items-center gap-4 w-20 text-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${active ? 'bg-gold text-gold-900 ring-4 ring-gold/20' : 'bg-secondary text-muted-foreground ring-4 ring-background'}`}>
                       {active ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                 </div>
              );
           })}
        </div>
      </Card>

      {/* 8. DANGER ZONE */}
      <Card className="p-6 border-claret/30 bg-claret/5">
        <div className="flex items-center gap-2 mb-2 text-claret">
           <AlertTriangle size={20} />
           <h2 className="text-lg font-display font-bold">Danger Zone</h2>
        </div>
        <p className="text-sm text-claret/70 mb-6">These actions are destructive and cannot be easily undone. Please proceed with caution.</p>
        
        <div className="grid md:grid-cols-3 gap-4">
           <Btn variant="outline" className="border-claret/30 text-claret hover:bg-claret hover:text-white justify-center" onClick={() => showToast("Not implemented in this demo")}>
              Reset Standings
           </Btn>
           <Btn variant="outline" className="border-claret/30 text-claret hover:bg-claret hover:text-white justify-center" onClick={() => showToast("Not implemented in this demo")}>
              Remove Fixtures
           </Btn>
           <Btn variant="danger" className="justify-center font-bold" onClick={handleDelete}>
              Delete Tournament
           </Btn>
        </div>
      </Card>
    </div>
  );
}
