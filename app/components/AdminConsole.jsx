'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton } from './UI';
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

function AdminTournament({ activeTournament, showToast }) {
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

  if (activeTournament) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="p-6 border-gold/50 bg-gold/5">
          <SectionTitle icon={Trophy}>Active Tournament</SectionTitle>
          <div className="text-2xl font-bold font-display tracking-wide mb-6">{activeTournament.name}</div>
          
          <div className="grid gap-4 max-w-sm">
            <div>
              <Label>Rename Tournament</Label>
              <div className="flex gap-2 mt-1">
                <Input value={rename} onChange={e => setRename(e.target.value)} placeholder="New name" />
                <Btn onClick={handleRename}>Rename</Btn>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-red-500/20 bg-red-500/5">
          <SectionTitle icon={Trash2}>Danger Zone</SectionTitle>
          <p className="text-sm text-muted-foreground mb-4 mt-2">Deleting the tournament will remove all matches and standings associated with it.</p>
          <Btn variant="danger" onClick={handleDelete}>Delete Tournament</Btn>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Plus}>Start New Tournament</SectionTitle>
        <div className="grid gap-4 mt-4 max-w-sm">
          <div>
            <Label>Tournament Name</Label>
            <div className="flex gap-2 mt-1">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Season 4" />
              <ShinyButton onClick={handleStart}>Start</ShinyButton>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
