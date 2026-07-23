'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords, Edit2, ListOrdered, BarChart2, AlertTriangle, ArrowRight, Megaphone, ChevronDown, Package } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Badge } from './UI';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import LiveMatchControl from './LiveMatchControl';
import { startSeason, deleteSeason, renameSeason, completeSeason } from '@/app/actions/season';
import { generateFixtures, generatePlayoffs, updateMatchStatus, updateMatchScore } from '@/app/actions/match';
import { getTrophyTemplates, awardTrophy, removeTrophy, updateTrophy, createTrophyTemplate, deleteTrophyTemplate, createAnnouncement, deleteAnnouncement } from '@/app/actions/admin';
import { signUpPlayer, adminUpdatePlayer, adminDeletePlayer } from '@/app/actions/player';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/app/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';
import { motion } from 'framer-motion';

// Trophy template data — the 6 official trophies
const TROPHY_TEMPLATES = [
  { id: 'bb-champion', name: 'BB Champion', image: '/assets/trophies/BB-Champion.png', icon: '/assets/trophies/BB-Champion.png', defaultDesc: 'Champion of the BB League season.' },
  { id: 'world-cup', name: 'World Cup Winner', image: '/assets/trophies/World-Cup-Winner-Trophy.png', icon: '/assets/trophies/World-Cup-Winner-Trophy.png', defaultDesc: 'Won the World Cup season.' },
  { id: 'golden-boot', name: 'Golden Boot', image: '/assets/trophies/Golden-boot.png', icon: '/assets/trophies/Golden-boot.png', defaultDesc: 'Top goalscorer of the season.' },
  { id: 'mvp', name: 'MVP', image: '/assets/trophies/MVP.png', icon: '/assets/trophies/MVP.png', defaultDesc: 'Most Valuable Player of the season.' },
  { id: 'la-liga', name: 'La Liga Champion', image: '/assets/trophies/La-Liga-trophy.png', icon: '/assets/trophies/La-Liga-trophy.png', defaultDesc: 'La Liga season champion.' },
  { id: 'premier-league', name: 'Premier League Champion', image: '/assets/trophies/Premier-League.png', icon: '/assets/trophies/Premier-League.png', defaultDesc: 'Premier League season champion.' },
];

export default function AdminConsole(props) {
  const { tab } = props;
  if (tab === "admin") return <AdminOverview {...props} />;
  if (tab === "admin-players") return <AdminPlayers {...props} />;
  if (tab === "admin-season") return <AdminSeason {...props} />;
  if (tab === "admin-matches") return <AdminMatches {...props} />;
  if (tab === "admin-playoffs") return <AdminPlayoffs {...props} />;
  if (tab === "admin-settings") return <AdminSettings {...props} />;
  if (tab === "admin-trophies") return <AdminTrophies {...props} />;
  if (tab === "admin-announcements") return <AdminAnnouncements {...props} />;
  return <EmptyState text="Admin feature in progress..." />;
}

function AdminOverview({ players, activeSeason, matches, announcements }) {
  return <AdminOverviewDashboard players={players} activeSeason={activeSeason} matches={matches} announcements={announcements} />;
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
      
      const res = await signUpPlayer(form);
      if (res.error) showToast(res.error);
      else showToast(`${form.name} added`);
    } else {
      const res = await adminUpdatePlayer(editing, form);
      if (res.error) showToast(res.error);
      else showToast("Player updated");
    }
    setEditing(null);
  };
  
  const remove = async (id) => { 
    if (!confirm("Delete player?")) return;
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

function AdminMatches({ matches, activeSeason, players, showToast }) {
  if (!activeSeason) return <EmptyState text="Start a season first." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id);
  
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

function AdminPlayoffs({ activeSeason, matches, players, showToast }) {
  if (!activeSeason) return <EmptyState text="Start a season first." />;
  
  const handleGeneratePlayoffs = async () => {
    const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league" && m.status === "completed");
    
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
    
    const res = await generatePlayoffs(activeSeason.id, top4);
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

// ─── Player Combobox ─────────────────────────────────────────────────────────
function PlayerCombobox({ players, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = players.find(p => p.id === value);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center justify-between w-full bg-secondary text-foreground p-3 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors text-sm"
          role="combobox"
          aria-expanded={open}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none">{selected.avatarImage ? <img src={selected.avatarImage} className="w-6 h-6 rounded-full object-cover inline" alt="" /> : selected.avatar || '👤'}</span>
              <span className="font-semibold">{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Select player...</span>
          )}
          <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-card border-border/50 shadow-2xl rounded-xl" align="start">
        <Command className="bg-transparent">
          <CommandInput placeholder="Search players..." className="h-10 border-b border-border/30 rounded-none" />
          <CommandList className="max-h-56 p-1">
            <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">No player found.</CommandEmpty>
            <CommandGroup>
              {players.map(p => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => { onChange(p.id); setOpen(false); }}
                  className="flex items-center gap-3 rounded-lg cursor-pointer py-2.5"
                >
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary overflow-hidden text-base">
                    {p.avatarImage ? <img src={p.avatarImage} className="w-full h-full object-cover" alt="" /> : (p.avatar || '👤')}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{p.name}</div>
                    {p.teamName && <div className="text-xs text-muted-foreground truncate">{p.teamName}</div>}
                  </div>
                  {value === p.id && <Check size={14} className="ml-auto text-pitch-bright shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Trophy Icon Picker ───────────────────────────────────────────────────────
function TrophyIconPicker({ value, onChange }) {
  const [mode, setMode] = useState('png'); // 'png' | 'custom'
  const [custom, setCustom] = useState(value && !TROPHY_TEMPLATES.find(t => t.icon === value) ? value : '');
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('png')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'png' ? 'bg-pitch text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          Trophy PNGs
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'custom' ? 'bg-pitch text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          Custom Emoji/URL
        </button>
      </div>
      
      {mode === 'png' ? (
        <div className="grid grid-cols-3 gap-2">
          {TROPHY_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => onChange(t.icon)}
              className={`relative flex flex-col items-center p-2.5 rounded-xl border transition-all ${
                value === t.icon
                  ? 'border-gold bg-gold/10 ring-1 ring-gold/50'
                  : 'border-border/50 bg-secondary/30 hover:bg-secondary/60'
              }`}
            >
              <img src={t.image} alt={t.name} className="w-10 h-10 object-contain" />
              <span className="text-[9px] text-muted-foreground mt-1 text-center leading-tight">{t.name}</span>
              {value === t.icon && (
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-pitch-bright rounded-full flex items-center justify-center">
                  <Check size={9} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={custom}
            onChange={e => { setCustom(e.target.value); onChange(e.target.value); }}
            placeholder="🏆 or https://..."
            className="flex-1"
          />
          {custom && (
            <div className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-xl shrink-0">
              {custom.startsWith('http') ? <img src={custom} className="w-8 h-8 object-contain" alt="" /> : custom}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Revoke Confirm Dialog ────────────────────────────────────────────────────
function RevokeDialog({ open, onOpenChange, trophy, players, onConfirm }) {
  const player = players.find(p => p.id === trophy?.playerId);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 shadow-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 size={18} /> Revoke Trophy?
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mt-2 space-y-1">
          <p>Are you sure you want to revoke <strong className="text-foreground">{trophy?.title}</strong></p>
          <p>from <strong className="text-foreground">{player?.name || 'this player'}</strong>? This cannot be undone.</p>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <DialogClose asChild>
            <Btn variant="ghost">Cancel</Btn>
          </DialogClose>
          <Btn variant="danger" onClick={onConfirm}>Revoke</Btn>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Trophy Dialog ───────────────────────────────────────────────────────
function EditTrophyDialog({ open, onOpenChange, trophy, players, onSave }) {
  const [form, setForm] = useState(
    trophy ? { title: trophy.title, season: trophy.season, icon: trophy.icon || '🏆', description: trophy.description || '' }
    : { title: '', season: '', icon: '🏆', description: '' }
  );
  
  const player = players.find(p => p.id === trophy?.playerId);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 shadow-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 size={16} /> Edit Trophy
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {player && (
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <span className="text-lg">{player.avatar || '👤'}</span>
              <span className="font-semibold text-sm">{player.name}</span>
            </div>
          )}
          <div><Label>Trophy Title</Label><Input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} /></div>
          <div><Label>Season</Label><Input value={form.season || ''} onChange={e => setForm({...form, season: e.target.value})} /></div>
          <div>
            <Label>Icon</Label>
            <TrophyIconPicker value={form.icon} onChange={v => setForm({...form, icon: v})} />
          </div>
          <div><Label>Description</Label><Input value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} /></div>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <DialogClose asChild><Btn variant="ghost">Cancel</Btn></DialogClose>
          <ShinyButton onClick={() => onSave(form)}>Save Changes</ShinyButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Admin Trophies — 3-Tab System ───────────────────────────────────────────
function AdminTrophies({ players, trophies = [], showToast }) {
  const blankForm = { playerId: '', title: '', season: '', description: '', icon: '/assets/trophies/Golden-boot.png' };
  const [form, setForm] = useState(blankForm);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  // DB-backed custom templates (loaded on mount, persisted on save)
  const [dbTemplates, setDbTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', icon: '🏆', description: '' });
  const [templateSaving, setTemplateSaving] = useState(false);

  // Load persisted custom templates from DB
  useEffect(() => {
    async function loadTemplates() {
      const templates = await getTrophyTemplates();
      setDbTemplates(templates);
    }
    loadTemplates();
  }, []);

  const allTemplates = [
    ...TROPHY_TEMPLATES,
    ...dbTemplates.map(t => ({ ...t, defaultDesc: t.description || '' })),
  ];

  const handleAward = async () => {
    if (!form.playerId || !form.title || !form.season) return showToast('Player, Title, and Season are required.');
    const res = await awardTrophy(form);
    if (res.error) return showToast(res.error);
    const playerName = players.find(p => p.id === form.playerId)?.name || 'Player';
    showToast(`🏆 ${form.title} awarded to ${playerName}`);
    setForm(blankForm);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    const res = await removeTrophy(revokeTarget.id);
    if (res.error) showToast(res.error);
    else {
      const playerName = players.find(p => p.id === revokeTarget.playerId)?.name || 'Player';
      showToast(`🗑️ ${revokeTarget.title} revoked from ${playerName}`);
    }
    setRevokeTarget(null);
  };

  const handleEdit = async (updatedData) => {
    if (!editTarget) return;
    const res = await updateTrophy(editTarget.id, updatedData);
    if (res.error) showToast(res.error);
    else showToast(`✏️ Trophy updated`);
    setEditTarget(null);
  };

  const applyTemplate = (template) => {
    setForm(prev => ({ ...prev, title: template.name, icon: template.icon || template.image, description: template.defaultDesc || template.description || '' }));
  };

  const handleSaveTemplate = async () => {
    if (!newTemplate.name.trim()) return showToast('Template name required');
    setTemplateSaving(true);
    const res = await createTrophyTemplate(newTemplate);
    if (res.error) { showToast(res.error); }
    else {
      setDbTemplates(prev => [...prev, res.template]);
      showToast(`✅ Template "${newTemplate.name}" saved`);
      setNewTemplate({ name: '', icon: '🏆', description: '' });
    }
    setTemplateSaving(false);
  };

  const handleDeleteTemplate = async (id, name) => {
    const res = await deleteTrophyTemplate(id);
    if (res.error) showToast(res.error);
    else {
      setDbTemplates(prev => prev.filter(t => t.id !== id));
      showToast(`🗑️ Template "${name}" deleted`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="award" className="w-full">
        <TabsList className="mb-6 bg-secondary/50 rounded-xl p-1">
          <TabsTrigger value="award" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Plus size={14} className="mr-1.5" /> Award
          </TabsTrigger>
          <TabsTrigger value="manage" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <ListOrdered size={14} className="mr-1.5" /> Manage
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Package size={14} className="mr-1.5" /> Templates
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: AWARD ── */}
        <TabsContent value="award" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={Trophy}>Award a Trophy</SectionTitle>
            
            {/* Quick templates */}
            <div className="mb-5">
              <Label>Quick-fill from template</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {TROPHY_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => applyTemplate(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-full text-xs font-semibold transition-colors"
                  >
                    <img src={t.image} className="w-4 h-4 object-contain" alt="" />
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="md:col-span-2">
                <Label>Player</Label>
                <PlayerCombobox players={players} value={form.playerId} onChange={v => setForm({...form, playerId: v})} />
              </div>
              <div><Label>Trophy Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Golden Boot" /></div>
              <div><Label>Season</Label><Input value={form.season} onChange={e => setForm({...form, season: e.target.value})} placeholder="e.g. Season 1" /></div>
              <div className="md:col-span-2">
                <Label>Icon</Label>
                <TrophyIconPicker value={form.icon} onChange={v => setForm({...form, icon: v})} />
              </div>
              <div className="md:col-span-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="e.g. Top goalscorer with 25 goals." /></div>
            </div>
            <ShinyButton className="mt-6" onClick={handleAward}>🏆 Award Trophy</ShinyButton>
          </Card>
        </TabsContent>

        {/* ── TAB 2: MANAGE ── */}
        <TabsContent value="manage" className="space-y-4">
          <Card className="p-6">
            <SectionTitle icon={ListOrdered}>All Awarded Trophies ({trophies.length})</SectionTitle>
            {trophies.length === 0 ? (
              <EmptyState text="No trophies awarded yet." />
            ) : (
              <div className="overflow-x-auto -mx-2 mt-4">
                <table className="w-full text-sm min-w-[560px]">
                  <thead>
                    <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border/50">
                      <th className="pb-3 text-left px-2 font-semibold">Icon</th>
                      <th className="pb-3 text-left px-2 font-semibold">Trophy</th>
                      <th className="pb-3 text-left px-2 font-semibold">Player</th>
                      <th className="pb-3 text-left px-2 font-semibold">Season</th>
                      <th className="pb-3 text-left px-2 font-semibold">Date</th>
                      <th className="pb-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trophies.map((t, i) => {
                      const player = players.find(p => p.id === t.playerId);
                      return (
                        <motion.tr
                          key={t.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-3 px-2">
                            {t.icon ? (
                              t.icon.startsWith('/') || t.icon.startsWith('http') ? (
                                <img src={t.icon} className="w-8 h-8 object-contain" alt="" />
                              ) : (
                                <span className="text-xl">{t.icon}</span>
                              )
                            ) : <span className="text-xl">🏆</span>}
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-semibold">{t.title}</div>
                            {t.description && <div className="text-xs text-muted-foreground truncate max-w-[160px]">{t.description}</div>}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base leading-none">{player?.avatar || '👤'}</span>
                              <span className="font-medium">{player?.name || t.playerId}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-mono text-muted-foreground text-xs">{t.season}</td>
                          <td className="py-3 px-2 font-mono text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(t.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Btn variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <ChevronDown size={14} />
                                </Btn>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-2xl rounded-xl w-36">
                                <DropdownMenuItem onClick={() => setEditTarget(t)} className="cursor-pointer rounded-lg py-2">
                                  <Edit2 size={14} className="mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-border/30" />
                                <DropdownMenuItem
                                  onClick={() => setRevokeTarget(t)}
                                  className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 size={14} className="mr-2" /> Revoke
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* ── TAB 3: TEMPLATES ── */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={Package}>Trophy Templates</SectionTitle>
            <p className="text-sm text-muted-foreground mb-6">
              Use templates to quickly fill the Award form. The 6 official trophies are pre-loaded. Custom templates you add here are saved permanently.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {allTemplates.map(t => (
                <MagicCard
                  key={t.id}
                  className="p-4 flex items-center gap-3 group"
                >
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => applyTemplate(t)}
                  >
                    {(t.image || (t.icon && (t.icon.startsWith('/') || t.icon.startsWith('http')))) ? (
                      <img src={t.image || t.icon} className="w-10 h-10 object-contain shrink-0" alt={t.name} />
                    ) : (
                      <span className="text-2xl shrink-0">{t.icon || '🏆'}</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{t.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{t.defaultDesc || t.description || 'Click to use in Award form'}</div>
                    </div>
                  </button>
                  {/* Only show delete for DB-persisted custom templates */}
                  {t.id && !t.id.startsWith('bb-') && !t.id.startsWith('world-') && !t.id.startsWith('golden-') && !t.id.startsWith('mvp') && !t.id.startsWith('la-') && !t.id.startsWith('premier-') && (
                    <button
                      onClick={() => handleDeleteTemplate(t.id, t.name)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"
                      title="Delete template"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </MagicCard>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border/30">
              <h4 className="font-semibold text-sm mb-3">Add Custom Template</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label>Template Name</Label><Input value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="e.g. Hat-Trick Hero" /></div>
                <div><Label>Icon (emoji or path)</Label><Input value={newTemplate.icon} onChange={e => setNewTemplate({...newTemplate, icon: e.target.value})} placeholder="🎩" /></div>
                <div><Label>Description (optional)</Label><Input value={newTemplate.description || ''} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} placeholder="Short description" /></div>
              </div>
              <ShinyButton
                className="mt-3"
                onClick={handleSaveTemplate}
                disabled={templateSaving}
              >
                <Plus size={15} className="mr-1" /> {templateSaving ? 'Saving...' : 'Save Template'}
              </ShinyButton>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Revoke Confirm Dialog */}
      <RevokeDialog
        open={!!revokeTarget}
        onOpenChange={open => !open && setRevokeTarget(null)}
        trophy={revokeTarget}
        players={players}
        onConfirm={handleRevoke}
      />

      {/* Edit Dialog */}
      <EditTrophyDialog
        key={editTarget?.id || 'edit-dialog-new'}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
        trophy={editTarget}
        players={players}
        onSave={handleEdit}
      />
    </div>
  );
}

function AdminAnnouncements({ announcements, showToast }) {
  const [form, setForm] = useState({ title: "", content: "" });

  const handlePost = async () => {
    if (!form.title || !form.content) return showToast("Title and Content required.");
    const res = await createAnnouncement(form);
    if (res.error) showToast(res.error);
    else { showToast("Announcement posted!"); setForm({ title: "", content: "" }); }
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove announcement?")) return;
    const res = await deleteAnnouncement(id);
    if (res.error) showToast(res.error);
    else showToast("Announcement removed.");
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Megaphone}>Post Announcement</SectionTitle>
        <div className="grid gap-4 mt-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Season Start!" /></div>
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

function AdminSeason({ activeSeason, matches = [], players = [], showToast, setTab }) {
  const [name, setName] = useState("");
  const [seasonType, setSeasonType] = useState("League (Single)");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [rename, setRename] = useState("");

  const handleStart = async () => {
    if (!name.trim()) return showToast("Enter a season name");
    const res = await startSeason(name, seasonType, startDate);
    if (res.error) showToast(res.error);
    else { showToast("Season started with fixtures generated!"); setName(""); }
  };

  const handleRename = async () => {
    if (!rename.trim()) return showToast("Enter a new name");
    const res = await renameSeason(activeSeason.id, rename);
    if (res.error) showToast(res.error);
    else { showToast("Season renamed!"); setRename(""); }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to completely delete the active season? This cannot be undone.")) return;
    const res = await deleteSeason(activeSeason.id);
    if (res.error) showToast(res.error);
    else showToast("Season deleted.");
  };

  const handleGenerateFixtures = async () => {
    if (!activeSeason) return;
    const res = await generateFixtures(activeSeason.id, players.map(p => p.id));
    if (res.error) showToast(res.error);
    else showToast("Fixtures generated!");
  };

  if (!activeSeason) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
        <Trophy size={64} className="text-gold mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
        <h2 className="text-3xl font-bold font-display mb-3">No Active Season</h2>
        <p className="text-muted-foreground mb-8 max-w-md text-lg">Create a new season to begin league matches, track standings, and manage playoffs.</p>
        
        <div className="flex flex-col gap-4 w-full max-w-sm mt-4 text-left">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Season Name</Label>
            <Input className="w-full bg-secondary border-border" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Season 4" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Season Type</Label>
            <select className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch" value={seasonType} onChange={e => setSeasonType(e.target.value)}>
              <option value="League (Single)">League (Single)</option>
              <option value="League (Double)">League (Double)</option>
              <option value="League + Playoffs (Single)">League + Playoffs (Single)</option>
              <option value="League + Playoffs (Double)">League + Playoffs (Double)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Start Date</Label>
            <Input type="date" className="w-full bg-secondary border-border" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <ShinyButton onClick={handleStart} className="w-full mt-2">Create Season & Generate Fixtures</ShinyButton>
        </div>
      </Card>
    );
  }

  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league");
  const isDoubleRoundRobin = tMatches.length > 10;
  const expectedMatches = isDoubleRoundRobin ? 20 : 10;
  
  const completedMatches = tMatches.filter(m => m.status === 'completed');
  const progressPercent = expectedMatches > 0 ? Math.round((completedMatches.length / expectedMatches) * 100) : 0;
  
  const scheduledMatches = tMatches.filter(m => m.status === 'scheduled' || m.status === 'live');
  const upcoming = scheduledMatches.slice(0, 3);
  
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
  
  const isCompleted = progressPercent >= 100;
  const hasFixtures = tMatches.length > 0;
  // Use actual theme color values — CSS vars like --primary/--success don't map to Badge's color prop
  const statusBadge = isCompleted
    ? <span className="ml-3"><Badge color="#1F8A5C">COMPLETED</Badge></span>
    : (hasFixtures
        ? <span className="ml-3"><Badge color="#29C179" pulse>LIVE</Badge></span>
        : <span className="ml-3"><Badge color="#D9A93B">DRAFT</Badge></span>
      );

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-8 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background relative overflow-hidden">
        <div className="absolute -right-16 -top-16 opacity-[0.03] pointer-events-none">
          <Trophy size={300} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="text-xs font-bold tracking-widest text-primary uppercase mb-2">League Stage</div>
            <div className="flex items-center">
              <h1 className="text-4xl font-display font-bold tracking-wide">{activeSeason.name}</h1>
              {statusBadge}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-mono mt-4">
              <div className="flex items-center gap-1.5"><Calendar size={14} /> Started: {new Date(activeSeason.createdAt).toLocaleDateString()}</div>
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

    <LiveMatchControl matches={matches} players={players} activeSeason={activeSeason} showToast={showToast} />

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={!hasFixtures ? handleGenerateFixtures : () => showToast("Fixtures already exist")}>
          <div className={`p-3 rounded-full ${!hasFixtures ? 'bg-gold/20 text-gold' : 'bg-secondary text-muted-foreground opacity-50'}`}>
             <Calendar size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Generate Fixtures</span>
        </MagicCard>
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={() => {
            const newName = prompt("Enter new season name:", activeSeason.name);
            if (newName && newName !== activeSeason.name) {
                renameSeason(activeSeason.id, newName).then(res => {
                    if(res.error) showToast(res.error);
                    else showToast("Season renamed!");
                });
            }
        }}>
          <div className="p-3 rounded-full bg-pitch-bright/20 text-pitch-bright">
             <Edit2 size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Edit Season</span>
        </MagicCard>
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={() => setTab && setTab("admin-playoffs")}>
          <div className="p-3 rounded-full bg-claret/20 text-claret">
             <Swords size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">Manage Playoffs</span>
        </MagicCard>

        {activeSeason.type?.includes("Playoffs") && isCompleted && (
          <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={async () => {
             const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league" && m.status === "completed");
             const top4 = standings.slice(0, 4).map(s => s.id);
             if (top4.length < 4) return showToast("Not enough players for playoffs (need 4)");
             
             const res = await generatePlayoffs(activeSeason.id, top4);
             if (res.error) showToast(res.error);
             else { showToast("Playoff bracket generated!"); setTab("admin-playoffs"); }
          }}>
            <div className="p-3 rounded-full bg-gold/20 text-gold">
               <Swords size={24} />
            </div>
            <span className="text-sm font-bold tracking-wide">Start Playoffs</span>
          </MagicCard>
        )}
        
        <MagicCard className="p-5 flex flex-col items-center justify-center gap-3 hover:bg-secondary/80 cursor-pointer transition-colors group" onClick={async () => {
            if (!isCompleted && !confirm("League phase is not 100% complete. End and archive anyway?")) return;
            if (activeSeason.type?.includes("Playoffs")) {
              const playoffMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round !== "league");
              const incompletePlayoffs = playoffMatches.filter(m => m.status !== "completed");
              if (playoffMatches.length === 0) return showToast("Please start and finish playoffs first.");
              if (incompletePlayoffs.length > 0) return showToast("Finish all playoff matches first.");
            }

            if (!confirm("Are you sure you want to end this season? This will automatically calculate standings, assign awards and issue trophies.")) return;
             
            const championId = standings[0]?.id;
            const runnerUpId = standings[1]?.id;
            const thirdId = standings[2]?.id;
            const mvpId = standings[0]?.id; // Default MVP to Champion
             
            const trophies = [];
            if (championId) trophies.push({ playerId: championId, title: "League Champion", season: activeSeason.name, icon: "🏆", description: `Won the ${activeSeason.name} league.` });
            if (runnerUpId) trophies.push({ playerId: runnerUpId, title: "Runner-Up", season: activeSeason.name, icon: "🥈", description: `2nd place in ${activeSeason.name}.` });
             
            const byGoals = [...standings].sort((a, b) => b.gf - a.gf);
            const topScorer = byGoals[0];
            if (topScorer && topScorer.gf > 0) {
              trophies.push({ playerId: topScorer.id, title: "Golden Boot", season: activeSeason.name, icon: "👟", description: `Top scorer with ${topScorer.gf} goals.` });
            }
             
            const eligibleForGlove = [...standings].filter(s => s.p >= 3);
            if (eligibleForGlove.length > 0) {
                const byGlove = eligibleForGlove.sort((a, b) => (a.ga / a.p) - (b.ga / b.p));
                const topGlove = byGlove[0];
                trophies.push({ playerId: topGlove.id, title: "Golden Glove", season: activeSeason.name, icon: "🧤", description: `Fewest goals conceded (${topGlove.ga} in ${topGlove.p} games).` });
            }

            const res = await completeSeason(activeSeason.id, {
                championId, runnerUpId, thirdId, mvpId, championName: standings[0]?.name, trophies
            });
             
            if (res.error) showToast(res.error);
            else { showToast("Season archived & trophies issued!"); setTab("admin-overview"); }
        }}>
          <div className="p-3 rounded-full bg-muted-foreground/20 text-muted-foreground">
             <Archive size={24} />
          </div>
          <span className="text-sm font-bold tracking-wide">End Season</span>
        </MagicCard>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
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
                   {standings.map((row, idx) => (
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
                   ))}
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
      
      <Card className="p-8">
        <SectionTitle icon={Clock}>Season Timeline</SectionTitle>
        <div className="flex items-center justify-between mt-10 relative px-4 md:px-12">
           <div className="absolute top-3 left-10 right-10 md:left-16 md:right-16 h-1 bg-secondary -translate-y-1/2 z-0">
              <div className="h-full bg-gold transition-all duration-1000" style={{ width: isCompleted ? '100%' : hasFixtures ? (progressPercent > 0 ? '75%' : '50%') : '25%' }} />
           </div>
           
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

      <Card className="p-6 border-claret/30 bg-claret/5">
        <div className="flex items-center gap-2 mb-2 text-claret">
           <AlertTriangle size={20} />
           <h2 className="text-lg font-display font-bold">Danger Zone</h2>
        </div>
        <p className="text-sm text-claret/70 mb-6">These actions are destructive and cannot be easily undone. Please proceed with caution.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <Btn variant="outline" className="border-claret/30 text-claret hover:bg-claret hover:text-white justify-center" onClick={() => showToast("Not implemented in this demo")}>
              Reset Standings
           </Btn>
           <Btn variant="outline" className="border-claret/30 text-claret hover:bg-claret hover:text-white justify-center" onClick={() => showToast("Not implemented in this demo")}>
              Remove Fixtures
           </Btn>
           <Btn variant="danger" className="justify-center font-bold" onClick={handleDelete}>
              Delete Season
           </Btn>
        </div>
      </Card>
    </div>
  );
}
