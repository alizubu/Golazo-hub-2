'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords, Edit2, ListOrdered, BarChart2, AlertTriangle, ArrowRight, Megaphone, ChevronDown, Package, MoreVertical, History, CheckCircle2 } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Badge, Avatar, toTitleCase } from './UI';
import { motion, AnimatePresence } from 'framer-motion';
import AdminOverviewDashboard from './AdminOverviewDashboard';
import { generateFixtures, generatePlayoffs, updateMatchStatus, updateMatchScore, adminTriggerBracketProgress } from '@/app/actions/match';
import { awardTrophy, removeTrophy, updateTrophy, createAnnouncement, deleteAnnouncement, endCelebration, retriggerCelebration, getCelebrations, getTrophyTemplates, createTrophyTemplate, deleteTrophyTemplate } from '@/app/actions/admin';
import { startSeason, renameSeason, completeSeason } from '@/app/actions/season';
import { signUpPlayer, adminUpdatePlayer, adminDeletePlayer } from '@/app/actions/player';
import { supabase } from '@/lib/supabaseClient';
import PlayoffBracket from './PlayoffBracket';
import { getCode } from 'country-list';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { useRouter } from 'next/navigation';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
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
  if (tab === "admin") return <ErrorBoundary><AdminOverview {...props} /></ErrorBoundary>;
  if (tab === "admin-players") return <ErrorBoundary><AdminPlayers {...props} /></ErrorBoundary>;
  if (tab === "admin-season") return <ErrorBoundary><AdminSeason {...props} /></ErrorBoundary>;
  if (tab === "admin-matches") return <ErrorBoundary><AdminMatches {...props} /></ErrorBoundary>;
  if (tab === "admin-playoffs") return <ErrorBoundary><AdminPlayoffs {...props} /></ErrorBoundary>;
  if (tab === "admin-settings") return <ErrorBoundary><AdminSettings {...props} /></ErrorBoundary>;
  if (tab === "admin-trophies") return <ErrorBoundary><AdminTrophies {...props} /></ErrorBoundary>;
  if (tab === "admin-announcements") return <ErrorBoundary><AdminAnnouncements {...props} /></ErrorBoundary>;
  return <EmptyState text="Admin feature in progress..." />;
}

import ErrorBoundary from './ErrorBoundary';
import dynamic from 'next/dynamic';
import RichTextEditor from './RichTextEditor';

function AdminOverview(props) {
  return (
    <ErrorBoundary>
      <AdminOverviewDashboard {...props} />
    </ErrorBoundary>
  );
}

export function AdminPlayers({ players, showToast }) {
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const blank = { name: "", username: "", email: "", avatar: null, flag: null, teamName: "", teamLogo: null, password: "" };
  const [form, setForm] = useState(blank);
  const startNew = () => { setForm(blank); setEditing("new"); };
  const startEdit = (p) => { setForm({ ...p, password: "" }); setEditing(p.id); };

  const save = async () => {
    if (!form.name.trim()) return showToast("Enter a player name");
    setLoading(true);
    if (editing === "new") {
      if (!form.username.trim() || !form.email.trim()) { setLoading(false); return showToast("Username and email are required"); }
      if (form.password.length < 4) { setLoading(false); return showToast("Set a temporary password (4+ chars)"); }
      
      const res = await signUpPlayer(form);
      if (res.error) showToast(res.error);
      else showToast(`${form.name} added`);
    } else {
      const res = await adminUpdatePlayer(editing, form);
      if (res.error) showToast(res.error);
      else showToast("Player updated");
    }
    setLoading(false);
    setEditing(null);
  };
  
  const remove = async (id) => { 
    if (!confirm("Delete player?")) return;
    setLoading(true);
    const res = await adminDeletePlayer(id);
    if (res.error) showToast(res.error);
    else showToast("Player removed");
    setLoading(false);
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
            <div className="text-xl font-bold font-heading tracking-wide mb-4 text-gold">
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
              <ShinyButton onClick={save} loading={loading}><Check size={15} /> Save</ShinyButton>
              <Btn variant="ghost" onClick={() => setEditing(null)} disabled={loading}>Cancel</Btn>
            </div>
          </Card>
        </FadeIn>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05}>
            <MagicCard className="p-4 flex items-center gap-4">
              <Avatar p={p} size={48} />
              <div className="flex-1 min-w-0">
                <div className="font-bold font-heading truncate text-lg">{p.name} {p.flag}</div>
                <div className="text-xs text-muted-foreground truncate">{p.teamLogo} {p.teamName} · @{p.username}</div>
              </div>
              <Btn variant="ghost" className="p-2" onClick={() => startEdit(p)} disabled={loading}>Edit</Btn>
              <Btn variant="danger" className="p-2" onClick={() => remove(p.id)} loading={loading}>Del</Btn>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export function AdminMatches({ matches, activeSeason, players, showToast, setTab }) {
  if (!activeSeason) return <EmptyState text="Start a season first." />;
  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id);
  
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={Radio}>Match Control</SectionTitle>
      <div className="grid gap-4">
        {tMatches.map((m, i) => (
          <FadeIn key={m.id} delay={i * 0.05}>
            <AdminMatchControl m={m} players={players} showToast={showToast} setTab={setTab} isPlayoff={false} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function AdminMatchControl({ m, players, showToast, setTab, isPlayoff = false }) {
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const [loading, setLoading] = useState(false);
  const [optHome, setOptHome] = useState(m.homeScore || 0);
  const [optAway, setOptAway] = useState(m.awayScore || 0);

  const [prevScores, setPrevScores] = useState({ home: m.homeScore, away: m.awayScore });
  if (m.homeScore !== prevScores.home || m.awayScore !== prevScores.away) {
    setPrevScores({ home: m.homeScore, away: m.awayScore });
    setOptHome(m.homeScore || 0);
    setOptAway(m.awayScore || 0);
  }

  const update = async (data) => {
    setLoading(true);
    const res = await updateMatchStatus(m.id, data);
    if (res.error) showToast(res.error);
    else if (res.match) {
      supabase.channel('league-events').send({
        type: 'broadcast',
        event: 'match_update',
        payload: res.match
      });
    }
    setLoading(false);
  };

  const startMatch = () => update({ status: "live", liveState: { phase: "first" }, homeScore: 0, awayScore: 0 });
  
  const bumpScore = (side, delta) => {
    const nextHome = side === "home" ? Math.max(0, optHome + delta) : optHome;
    const nextAway = side === "away" ? Math.max(0, optAway + delta) : optAway;
    
    setOptHome(nextHome);
    setOptAway(nextAway);

    const optMatch = { ...m, homeScore: nextHome, awayScore: nextAway };
    supabase.channel('league-events').send({
      type: 'broadcast',
      event: 'match_update',
      payload: optMatch
    });

    updateMatchScore(m.id, nextHome, nextAway).then(res => {
      if (res?.error) {
        showToast(res.error);
        setOptHome(m.homeScore || 0);
        setOptAway(m.awayScore || 0);
      } else if (res?.match) {
        setOptHome(res.match.homeScore);
        setOptAway(res.match.awayScore);
      }
    });
  };

  const endRegulation = () => {
    if (m.decisive && optHome === optAway) {
      update({ liveState: { phase: "extra" }, wentToExtra: true });
    } else finishMatch();
  };
  const endExtra = () => {
    if (optHome === optAway) {
      update({ liveState: { phase: "penalties", penalties: { kicks: [], winner: null } } });
    } else finishMatch();
  };
  const finishMatch = () => update({ status: "completed", liveState: null });

  if (m.status === "completed") {
    return <CompletedMatchCard m={m} h={h} a={a} players={players} showToast={showToast} isPlayoff={isPlayoff} />;
  }

  if (m.status === "scheduled") {
    const hFlagUrl = nationalTeamsData.find(nt => nt.name === h?.flag)?.flag_url;
    const aFlagUrl = nationalTeamsData.find(nt => nt.name === a?.flag)?.flag_url;

    return (
      <MagicCard className="group p-3 sm:p-4 bg-secondary/30 relative overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-2 items-center w-full pr-8">
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <span className="text-foreground text-sm font-semibold truncate max-w-[100px] sm:max-w-none text-right" title={h?.name}>
                {toTitleCase(h?.name)}
              </span>
              {hFlagUrl && <img src={hFlagUrl} alt={h?.flag} className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <Avatar p={h} size={40} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground font-score uppercase tracking-widest font-bold mb-1">vs</span>
              <ShinyButton onClick={startMatch} loading={loading} className="px-3 py-1 text-xs">
                <Radio size={12} className="mr-1.5"/> Start
              </ShinyButton>
            </div>

            <div className="flex items-center justify-start gap-2 sm:gap-3">
              <Avatar p={a} size={40} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
              {aFlagUrl && <img src={aFlagUrl} alt={a?.flag} className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <span className="text-foreground text-sm font-semibold truncate max-w-[100px] sm:max-w-none text-left" title={a?.name}>
                {toTitleCase(a?.name)}
              </span>
            </div>
          </div>
        </div>
      </MagicCard>
    );
  }

  return (
    <MagicCard className="p-5 border-destructive/50 bg-destructive/5">
      <div className="flex items-center justify-center mb-4">
        <Badge color="#e11d48" pulse>
          🔴 LIVE • {m.liveState?.clock ? `${m.liveState.clock}'` : (m.liveState?.phase === 'first' ? '1ST HALF' : m.liveState?.phase === 'second' ? '2ND HALF' : m.liveState?.phase === 'extra' ? 'AET' : m.liveState?.phase === 'penalties' ? 'PENS' : 'IN PROGRESS')}
        </Badge>
      </div>
      <div className="flex items-center justify-between gap-2 sm:gap-6">
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
          <div className="font-bold text-center truncate w-full px-2" title={h?.name}>{h?.name || 'Home'}</div>
          <div className="text-4xl font-score text-center font-black">{optHome}</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 shrink-0">
          <div className="text-sm font-score opacity-30 font-bold select-none">-</div>
        </div>
        <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-3 w-full">
          <div className="font-bold text-center truncate w-full px-2" title={a?.name}>{a?.name || 'Away'}</div>
          <div className="text-4xl font-score text-center font-black">{optAway}</div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-border/50 flex justify-center">
        <Btn variant="primary" onClick={() => setTab?.('admin')} className="font-bold uppercase tracking-wider text-sm px-6 py-2.5 cursor-pointer bg-destructive hover:bg-destructive-bright">
          Manage in Dashboard
        </Btn>
      </div>
    </MagicCard>
  );
}

function CompletedMatchCard({ m, h, a, players, showToast, isPlayoff = false }) {
  const [saving, setSaving] = useState(false);

  const hScore = m.homeScore || 0;
  const aScore = m.awayScore || 0;
  const hWon = hScore > aScore;
  const aWon = aScore > hScore;
  
  const hFlagUrl = nationalTeamsData.find(nt => nt.name === h?.flag)?.flag_url;
  const aFlagUrl = nationalTeamsData.find(nt => nt.name === a?.flag)?.flag_url;

  const router = useRouter();



  const handleReset = async () => {
    setSaving(true);
    const res = await updateMatchStatus(m.id, { status: 'scheduled', homeScore: 0, awayScore: 0 });
    if (res.error) showToast(res.error);
    else showToast('✅ Match reset to scheduled');
    setSaving(false);
  };

  return (
    <MagicCard className="group p-3 sm:p-4 bg-secondary/30 hover:bg-secondary/40 transition-all duration-300 relative overflow-hidden">
      <div className="flex items-center gap-2">
        <div className="grid grid-cols-3 gap-2 items-center w-full pr-8">
          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <span className="text-foreground text-sm font-semibold truncate max-w-[100px] sm:max-w-none text-right" title={h?.name}>
              {toTitleCase(h?.name)}
            </span>
            {hFlagUrl && <img src={hFlagUrl} alt={h?.flag} className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
            <Avatar p={h} size={40} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
          </div>

          <div className="flex items-center justify-center">
            <div className={`w-20 sm:w-24 h-9 bg-black/40 border ${m.status === 'live' ? 'border-red-500/50' : 'border-border/50'} rounded-lg flex items-center justify-center gap-2`}>
              <span className={`font-score text-base ${hWon ? 'text-pitch-bright font-black drop-shadow-md' : 'text-muted-foreground font-semibold'}`}>{hScore}</span>
              <span className="text-muted-foreground/30 font-score text-sm">-</span>
              <span className={`font-score text-base ${aWon ? 'text-pitch-bright font-black drop-shadow-md' : 'text-muted-foreground font-semibold'}`}>{aScore}</span>
            </div>
          </div>

          <div className="flex items-center justify-start gap-2 sm:gap-3">
            <Avatar p={a} size={40} className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
            {aFlagUrl && <img src={aFlagUrl} alt={a?.flag} className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
            <span className="text-foreground text-sm font-semibold truncate max-w-[100px] sm:max-w-none text-left" title={a?.name}>
              {toTitleCase(a?.name)}
            </span>
          </div>
        </div>

        <div className="absolute right-3 sm:right-4 flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-2xl rounded-xl w-40">
              {isPlayoff ? (
                <>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={(e) => { e.preventDefault(); handleReset(); }}>
                    <Clock size={14} className="mr-2" /> Postpone
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); if (window.confirm('Reset this playoff result?')) handleReset(); }}>
                    <AlertTriangle size={14} className="mr-2" /> Reset Result
                  </DropdownMenuItem>
                </>
              ) : (
                 <DropdownMenuItem className="cursor-pointer rounded-lg py-2">
                    <CheckCircle2 size={14} className="mr-2 text-muted-foreground" /> View Match
                 </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    </MagicCard>
  );
}

export function AdminPlayoffs({ activeSeason, matches, players, showToast, setTab }) {
  if (!activeSeason) return <EmptyState text="Start a season first." />;

  const playoffMatches = matches.filter(
    m => m.seasonId === activeSeason.id && m.round !== 'league' && m.round !== 'friendly'
  );

  const leagueMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round === 'league');
  const leagueCompleted = leagueMatches.length > 0 && leagueMatches.every(m => m.status === 'completed');
  const leagueProgress = leagueMatches.length > 0
    ? Math.round((leagueMatches.filter(m => m.status === 'completed').length / leagueMatches.length) * 100)
    : 0;

  const hasBracket = playoffMatches.length > 0;

  if (!hasBracket) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed border-2 gap-4">
        <div className="p-4 rounded-full bg-secondary/50">
          <Swords size={40} className="text-muted-foreground opacity-50" />
        </div>
        <h2 className="text-2xl font-bold font-heading">Playoff Bracket Not Yet Generated</h2>
        {leagueCompleted ? (
          <p className="text-muted-foreground max-w-md">
            All league matches are complete. The bracket will auto-generate momentarily — if it doesn&apos;t appear within a few seconds, reload the page.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground max-w-md">
              The playoff bracket auto-generates the moment the final league match is completed.
              No manual action required.
            </p>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>League Progress</span>
                <span className="font-score font-bold">{leagueProgress}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pitch to-pitch-bright transition-all duration-700"
                  style={{ width: `${leagueProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {leagueMatches.filter(m => m.status === 'completed').length} / {leagueMatches.length} league matches played
              </p>
            </div>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <SectionTitle icon={Swords}>Playoff Bracket</SectionTitle>
        <Badge color="#29C179">
          <Check size={10} className="mr-1" strokeWidth={3} /> Auto-Generated
        </Badge>
      </div>

      <PlayoffBracket
        matches={playoffMatches}
        players={players}
        onMatchClick={null}
      />

      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Playoff Match Controls</h3>
            <Badge color="#475569">{playoffMatches.length} Matches</Badge>
          </div>
          <Btn 
            variant="ghost" 
            className="text-xs h-7 py-1 px-3 border border-border" 
            onClick={async () => {
              const res = await adminTriggerBracketProgress(activeSeason.id);
              if (res.error) showToast(res.error);
              else showToast("Bracket synchronized!");
            }}
          >
            Sync Bracket
          </Btn>
        </div>
        {playoffMatches.map((m, i) => (
          <FadeIn key={m.id} delay={i * 0.05}>
            <AdminMatchControl m={m} players={players} showToast={showToast} setTab={setTab} isPlayoff={true} />
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export function AdminSettings({ showToast }) {
  return (
    <Card className="p-6">
      <SectionTitle icon={Settings}>League Settings</SectionTitle>
      <EmptyState text="Admin settings config (password changes, rules) go here." />
    </Card>
  );
}

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
              <Avatar p={selected} size={24} className="inline-block align-middle" />
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
                  <Avatar p={p} size={32} />
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

function TrophyIconPicker({ value, onChange }) {
  const [mode, setMode] = useState('png');
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

function RevokeDialog({ open, onOpenChange, trophy, players, onConfirm }) {
  const player = players.find(p => p.id === trophy?.playerId);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border/50 shadow-2xl max-w-sm w-full p-6 rounded-2xl z-10"
          >
            <div className="flex items-center gap-2 text-destructive text-lg font-bold mb-2">
              <Trash2 size={18} /> Revoke Trophy?
            </div>
            <div className="text-sm text-muted-foreground mt-2 space-y-1">
              <p>Are you sure you want to revoke <strong className="text-foreground">{trophy?.title}</strong></p>
              <p>from <strong className="text-foreground">{player?.name || 'this player'}</strong>? This cannot be undone.</p>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => onOpenChange(false)} className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</Btn>
              <Btn variant="danger" onClick={onConfirm}>Revoke</Btn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function EditTrophyDialog({ open, onOpenChange, trophy, players, onSave }) {
  const [form, setForm] = useState({ title: '', season: '', icon: '🏆', description: '' });
  const [prevTrophy, setPrevTrophy] = useState(null);
  
  if (open && trophy !== prevTrophy) {
    setPrevTrophy(trophy);
    setForm({ title: trophy.title, season: trophy.season, icon: trophy.icon || '🏆', description: trophy.description || '' });
  }

  const player = players.find(p => p.id === trophy?.playerId);
  
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-card border border-border/50 shadow-2xl max-w-md w-full p-6 rounded-2xl z-10 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center gap-2 text-lg font-bold mb-4">
              <Edit2 size={18} /> Edit Trophy
            </div>
            <div className="space-y-4">
              {player && (
                <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                  <Avatar p={player} size={28} />
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
            <div className="mt-6 flex gap-3 justify-end">
              <Btn variant="ghost" onClick={() => onOpenChange(false)} className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</Btn>
              <ShinyButton onClick={() => onSave(form)}>Save Changes</ShinyButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function AdminTrophies({ players, trophies = [], seasons, showToast }) {
  const router = useRouter();
  const blankForm = { playerId: '', title: '', season: '', description: '', icon: '/assets/trophies/Golden-boot.png' };
  const [form, setForm] = useState(blankForm);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isAwarding, setIsAwarding] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [celebrations, setCelebrations] = useState([]);
  
  const [dbTemplates, setDbTemplates] = useState([]);
  const [newTemplate, setNewTemplate] = useState({ name: '', icon: '🏆', description: '' });
  const [templateSaving, setTemplateSaving] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      const templates = await getTrophyTemplates();
      setDbTemplates(templates);
    }
    async function loadCelebrations() {
      const res = await getCelebrations();
      if (res.celebrations) setCelebrations(res.celebrations);
    }
    loadTemplates();
    loadCelebrations();
  }, [trophies]);

  const allTemplates = [
    ...TROPHY_TEMPLATES,
    ...dbTemplates.map(t => ({ ...t, defaultDesc: t.description || '' })),
  ];

  const handleAward = async () => {
    if (!form.playerId || !form.title || !form.season) return showToast('Player, Title, and Season are required.');
    setIsAwarding(true);
    const res = await awardTrophy(form);
    if (res.error) {
      showToast(res.error);
    } else {
      const playerName = players.find(p => p.id === form.playerId)?.name || 'Player';
      showToast(`🏆 ${form.title} awarded to ${playerName}`);
      setForm(blankForm);
    }
    setIsAwarding(false);
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    const target = revokeTarget;

    try {
      const res = await fetch(`/api/admin/trophies/${target.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!data.success) {
        showToast(`❌ Failed to revoke trophy: ${data.error}`);
      } else {
        const playerName = players.find(p => p.id === target.playerId)?.name || 'Player';
        showToast(`🗑️ ${target.title} revoked from ${playerName}`);
        setRevokeTarget(null);
        router.refresh();
      }
    } catch (err) {
      showToast(`❌ Network error revoking trophy: ${err.message}`);
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
    }
  };

  const handleEndCelebration = async (id) => {
    const res = await endCelebration(id);
    if (res.error) showToast(res.error);
    else {
      showToast("Celebration ended early.");
      setCelebrations(prev => prev.map(c => c.id === id ? { ...c, status: 'ended_early' } : c));
    }
  };

  const handleRetrigger = async (trophyId) => {
    const res = await retriggerCelebration(trophyId);
    if (res.error) showToast(res.error);
    else {
      showToast("Celebration re-triggered!");
      const fresh = await getCelebrations();
      if (fresh.celebrations) setCelebrations(fresh.celebrations);
    }
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

          <TabsTrigger value="templates" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Package size={14} className="mr-1.5" /> Templates
          </TabsTrigger>

          <TabsTrigger value="celebrations" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Megaphone size={14} className="mr-1.5" /> Celebrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="award" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={Trophy}>Award a Trophy</SectionTitle>
            
            <div className="mb-5">
              <Label>Quick-fill from template</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTemplates.map(t => (
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
            <ShinyButton className="mt-6" onClick={handleAward} disabled={isAwarding} loading={isAwarding}>🏆 Award Trophy</ShinyButton>
          </Card>

          <Card className="p-6">
            <SectionTitle icon={History}>Award History</SectionTitle>
            <p className="text-sm text-muted-foreground mb-6">
              View and manage all trophies awarded across the platform.
            </p>
            {trophies.length === 0 ? (
              <EmptyState text="No trophies awarded yet." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border/50">
                      <th className="pb-3 text-left px-2 font-semibold">Trophy</th>
                      <th className="pb-3 text-left px-2 font-semibold">Player</th>
                      <th className="pb-3 text-left px-2 font-semibold">Season</th>
                      <th className="pb-3 text-left px-2 font-semibold">Awarded On</th>
                      <th className="pb-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {trophies.map((t, i) => (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            {t.icon && (t.icon.startsWith('/') || t.icon.startsWith('http')) ? (
                              <img src={t.icon} className="w-6 h-6 object-contain drop-shadow-sm" alt="" />
                            ) : (
                              <span className="text-lg">{t.icon || '🏆'}</span>
                            )}
                            <div>
                              <div className="font-bold text-foreground leading-tight">{t.title}</div>
                              {t.description && <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[200px]">{t.description}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {t.player && (
                            <div className="flex items-center gap-2">
                              <Avatar p={t.player} size={24} />
                              <span className="font-semibold truncate max-w-[150px] block">{t.player.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground font-score text-xs font-semibold">
                          {t.season}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground font-score text-xs">
                          {new Date(t.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex justify-end gap-1">
                            <Btn variant="ghost" className="h-7 w-7 p-0 rounded-md text-stadium-secondary hover:text-white" onClick={() => setEditTarget(t)}>
                              <Edit2 size={13} />
                            </Btn>
                            <Btn variant="ghost" className="h-7 w-7 p-0 rounded-md text-stadium-secondary hover:text-red-400 hover:bg-red-500/10" onClick={() => setRevokeTarget(t)}>
                              <Trash2 size={13} />
                            </Btn>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>


        <TabsContent value="celebrations" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={Megaphone}>Trophy Celebrations</SectionTitle>
            <p className="text-sm text-muted-foreground mb-6">
              Manage 24-hour celebration banners that appear on all player dashboards when a trophy is awarded.
            </p>
            {celebrations.length === 0 ? (
              <EmptyState text="No celebrations yet." />
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="text-muted-foreground text-[11px] uppercase tracking-wider border-b border-border/50">
                      <th className="pb-3 text-left px-2 font-semibold">Status</th>
                      <th className="pb-3 text-left px-2 font-semibold">Trophy</th>
                      <th className="pb-3 text-left px-2 font-semibold">Player</th>
                      <th className="pb-3 text-left px-2 font-semibold">Started At</th>
                      <th className="pb-3 text-left px-2 font-semibold">Expires At</th>
                      <th className="pb-3 px-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {celebrations.map((c, i) => {
                      const isActive = c.status === 'active' && new Date(c.expiresAt) > new Date();
                      return (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="py-3 px-2">
                            {isActive ? (
                              <Badge color="var(--pitch)" pulse>ACTIVE</Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-border/50">{c.status === 'ended_early' ? 'ENDED EARLY' : 'EXPIRED'}</Badge>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              {c.trophy.icon && (c.trophy.icon.startsWith('/') || c.trophy.icon.startsWith('http')) ? (
                                <img src={c.trophy.icon} className="w-5 h-5 object-contain" alt="" />
                              ) : (
                                <span>{c.trophy.icon || '🏆'}</span>
                              )}
                              <span className="font-semibold">{c.trophy.title}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Avatar p={c.trophy.player} size={20} />
                              <span className="font-medium">{c.trophy.player.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 font-score text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(c.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-2 font-score text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(c.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-2 text-right">
                            {isActive && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Btn variant="danger" className="py-1 px-2 text-[10px] h-6 rounded-md">End Now</Btn>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border/50">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>End this celebration early?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      It will stop showing on all dashboards immediately. The player keeps the trophy in their permanent Trophy Cabinet.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleEndCelebration(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      End Now
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
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

        <TabsContent value="templates" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={Package}>Manage Templates</SectionTitle>
            <p className="text-sm text-muted-foreground mb-6">
              Create new &quot;Core&quot; trophies. These will instantly appear as &quot;locked&quot; silhouettes in every player&apos;s cabinet!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div><Label>Template Name</Label><Input value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="e.g. Defender of the Year" /></div>
              <div><Label>Icon</Label><TrophyIconPicker value={newTemplate.icon} onChange={v => setNewTemplate({...newTemplate, icon: v})} /></div>
              <div className="md:col-span-2"><Label>Description (Optional)</Label><Input value={newTemplate.description} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} placeholder="e.g. Awarded to the best defender" /></div>
              <div className="md:col-span-2 flex justify-end">
                <ShinyButton onClick={handleSaveTemplate} disabled={templateSaving} loading={templateSaving}>💾 Create Template</ShinyButton>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {dbTemplates.map((t, i) => (
                <FadeIn key={t.id} delay={i * 0.05}>
                  <MagicCard className="p-4 flex flex-col justify-between h-full group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Btn variant="ghost" className="h-6 w-6 p-0 rounded-md text-red-500 hover:bg-red-500/20" onClick={() => handleDeleteTemplate(t.id, t.name)}><Trash2 size={13} /></Btn>
                    </div>
                    <div className="flex items-center gap-3">
                      {t.icon && (t.icon.startsWith('/') || t.icon.startsWith('http')) ? (
                        <img src={t.icon} className="w-8 h-8 object-contain" alt="" />
                      ) : (
                        <span className="text-2xl">{t.icon || '🏆'}</span>
                      )}
                      <div>
                        <div className="font-bold text-sm leading-tight">{t.name}</div>
                        {t.description && <div className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{t.description}</div>}
                      </div>
                    </div>
                  </MagicCard>
                </FadeIn>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <RevokeDialog
        open={!!revokeTarget}
        onOpenChange={open => !open && !isRevoking && setRevokeTarget(null)}
        trophy={revokeTarget}
        players={players}
        onConfirm={handleRevoke}
      />

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

export function AdminAnnouncements({ announcements, showToast }) {
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!form.title || !form.content) return showToast("Title and Content required.");
    setLoading(true);
    const res = await createAnnouncement(form);
    if (res.error) showToast(res.error);
    else { showToast("Announcement posted!"); setForm({ title: "", content: "" }); }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    if (!confirm("Remove announcement?")) return;
    setLoading(true);
    const res = await deleteAnnouncement(id);
    if (res.error) showToast(res.error);
    else showToast("Announcement removed.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Megaphone}>Post Announcement</SectionTitle>
        <div className="grid gap-4 mt-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Season Start!" /></div>
          <div>
            <Label>Message</Label>
            <div className="mt-2">
              <RichTextEditor 
                value={form.content} 
                onChange={val => setForm({...form, content: val})} 
              />
            </div>
          </div>
        </div>
        <ShinyButton className="mt-6" onClick={handlePost} loading={loading}>Publish</ShinyButton>
      </Card>

      <div className="flex flex-col gap-4">
        {announcements?.map((a, i) => (
          <FadeIn key={a.id} delay={i * 0.05}>
            <MagicCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="font-bold">{a.title}</div>
                <div 
                  className="text-sm text-muted-foreground mt-1 max-w-none" 
                  dangerouslySetInnerHTML={{ __html: a.content }}
                />
              </div>
              <Btn variant="danger" className="shrink-0" onClick={() => handleRemove(a.id)} loading={loading}>Delete</Btn>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

export function AdminSeason({ activeSeason, matches = [], players = [], showToast, setTab }) {
  const [name, setName] = useState("");
  const [seasonType, setSeasonType] = useState("League (Single)");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rename, setRename] = useState("");
  const [loading, setLoading] = useState(false);
  // Delete Season — type-to-confirm state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return showToast("Enter a season name");
    setLoading(true);
    const res = await startSeason(name, seasonType, startDate);
    if (res.error) showToast(res.error);
    else { showToast("Season started with fixtures generated!"); setName(""); }
    setLoading(false);
  };

  const handleRename = async () => {
    if (!rename.trim()) return showToast("Enter a new name");
    setLoading(true);
    const res = await renameSeason(activeSeason.id, rename);
    if (res.error) showToast(res.error);
    else { showToast("Season renamed!"); setRename(""); }
    setLoading(false);
  };

  // ── Delete Season — rebuilt from zero ──────────────────────────────────────
  const handleDeleteSeason = async () => {
    if (!activeSeason) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/seasons/${activeSeason.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) {
        console.error('Delete season failed:', data.error);
        showToast(`❌ Failed to delete season: ${data.error}`);
      } else {
        showToast(`🗑️ "${activeSeason.name}" deleted.`);
        setDeleteConfirmText('');
        // Reload — with no active season the page will show the empty "Create Season" state
        window.location.reload();
      }
    } catch (err) {
      console.error('Delete season network error:', err);
      showToast(`❌ Network error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateFixtures = async () => {
    if (!activeSeason) return;
    setLoading(true);
    const res = await generateFixtures(activeSeason.id, players.map(p => p.id));
    if (res.error) showToast(res.error);
    else showToast("Fixtures generated!");
    setLoading(false);
  };

  if (!activeSeason) {
    return (
      <Card className="p-12 flex flex-col items-center justify-center text-center border-dashed border-2">
        <Trophy size={64} className="text-gold mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
        <h2 className="text-3xl font-bold font-heading mb-3">No Active Season</h2>
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
          <ShinyButton onClick={handleStart} className="w-full mt-2" loading={loading}>Create Season & Generate Fixtures</ShinyButton>
        </div>
      </Card>
    );
  }

  const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === 'league');
  // Use ALL season matches (not just league) for hasPlayoffs check
  const allSeasonMatches = matches.filter((m) => m.seasonId === activeSeason.id);
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

  const totalAssists = players.reduce((acc, p) => acc + (p.assists || 0), 0);
  let totalPoss = 0, possCount = 0;
  let yellowCards = 0, redCards = 0;
  let cleanSheets = 0;
  let highestMatch = null;

  completedMatches.forEach(m => {
    if (m.stats?.possession?.a) { totalPoss += Number(m.stats.possession.a); possCount++; }
    if (m.stats?.possession?.b) { totalPoss += Number(m.stats.possession.b); possCount++; }
    if (m.stats?.yellowCards?.a) yellowCards += Number(m.stats.yellowCards.a);
    if (m.stats?.yellowCards?.b) yellowCards += Number(m.stats.yellowCards.b);
    if (m.stats?.redCards?.a) redCards += Number(m.stats.redCards.a);
    if (m.stats?.redCards?.b) redCards += Number(m.stats.redCards.b);
    if ((m.homeScore || 0) === 0 || (m.awayScore || 0) === 0) cleanSheets++;
    if (!highestMatch || ((m.homeScore || 0) + (m.awayScore || 0)) > ((highestMatch.homeScore || 0) + (highestMatch.awayScore || 0))) {
      highestMatch = m;
    }
  });

  const avgPoss = possCount > 0 ? `${Math.round(totalPoss / possCount)}%` : "50%";
  const highestMatchText = highestMatch ? `${table[highestMatch.homeId]?.name || 'Home'} ${highestMatch.homeScore} - ${highestMatch.awayScore} ${table[highestMatch.awayId]?.name || 'Away'}` : "None yet";
  
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

      <div className="flex flex-col gap-6">
           <Card className="p-6 flex-1 w-full">
             <div className="flex items-center justify-between mb-6">
                <SectionTitle icon={ListOrdered}>League Standings</SectionTitle>
                <div className="text-xs font-score text-muted-foreground flex items-center gap-2">
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
                       <td className="px-4 py-4 text-center font-score font-bold text-lg">
                         {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : <span className="text-muted-foreground">{idx + 1}</span>}
                       </td>
                       <td className="px-4 py-4 font-bold text-base flex items-center gap-2">
                         {row.name} {row.flag}
                       </td>
                       <td className="px-3 py-4 text-center font-score text-muted-foreground">{row.p}</td>
                       <td className="px-3 py-4 text-center font-score text-muted-foreground">{row.w}</td>
                       <td className="px-3 py-4 text-center font-score text-muted-foreground">{row.d}</td>
                       <td className="px-3 py-4 text-center font-score text-muted-foreground">{row.l}</td>
                       <td className="px-3 py-4 text-center font-score">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                       <td className="px-4 py-4 text-center font-score font-bold text-xl text-primary">{row.pts}</td>
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

          <Card className="p-6 flex-1 flex flex-col w-full">
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
                            <span className="text-[10px] font-score text-muted-foreground px-3 py-1 bg-background rounded-full mx-2">VS</span>
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <SectionTitle icon={BarChart2}>Statistics</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/50 mt-4 rounded-xl overflow-hidden border border-border/50">
            <div className="flex flex-col bg-card p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Goals</span>
              <span className="text-3xl font-heading font-bold text-pitch-bright">{totalGoals}</span>
            </div>
            <div className="flex flex-col bg-card p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Total Assists</span>
              <span className="text-3xl font-heading font-bold text-blue-400">{totalAssists}</span>
            </div>
            <div className="flex flex-col bg-card p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Avg Possession</span>
              <span className="text-3xl font-heading font-bold text-purple-400">{avgPoss}</span>
            </div>
            <div className="flex flex-col bg-card p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Cards (Y/R)</span>
              <span className="text-3xl font-heading font-bold"><span className="text-yellow-500">{yellowCards}</span> <span className="text-muted-foreground/30 font-score text-xl">/</span> <span className="text-red-500">{redCards}</span></span>
            </div>
            <div className="flex flex-col bg-card p-4">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Clean Sheets</span>
              <span className="text-3xl font-heading font-bold text-green-400">{cleanSheets}</span>
            </div>
            <div className="flex flex-col bg-card p-4 col-span-2 lg:col-span-3">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">Highest Scoring Match</span>
              <span className="text-xl font-bold mt-1">{highestMatchText}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionTitle icon={Swords}>Playoff Status</SectionTitle>
          <div className="flex flex-col gap-2 mt-4">
            {standings.map((row, idx) => {
              const isQualified = idx < 4;
              return (
                <div key={row.id} className="flex flex-col gap-2 p-3 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{row.name}</span>
                    {isCompleted ? (
                       <div className={`flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-2 py-0.5 rounded ${isQualified ? 'text-success bg-success/10' : 'text-muted-foreground bg-background border border-border/50'}`}>
                          {isQualified ? <><Check size={12} strokeWidth={3} /> Qualified</> : 'Eliminated'}
                       </div>
                    ) : (
                       <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-muted-foreground bg-background px-2 py-0.5 rounded border border-border/50">
                          {isQualified ? `Qualifying (${progressPercent}%)` : `In Progress (${progressPercent}%)`}
                       </div>
                    )}
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 overflow-hidden border border-border/30">
                    <div className={`h-full ${isQualified ? 'bg-success' : 'bg-pitch'}`} style={{ width: `${isCompleted ? (isQualified ? 100 : 20) : Math.max(10, progressPercent)}%` }} />
                  </div>
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
              // Use allSeasonMatches so non-league rounds (semiA, semiB, final) are detected
              const hasPlayoffs = allSeasonMatches.some(m => m.round !== 'league' && m.round !== 'friendly');
              let state = 'upcoming'; // upcoming, active, completed, skipped
              let dateStr = null;

              if (idx === 0) {
                 state = 'completed';
                 dateStr = activeSeason.createdAt ? new Date(activeSeason.createdAt).toLocaleDateString() : null;
              } else if (idx === 1) {
                 if (hasFixtures && progressPercent === 0) state = 'active';
                 else if (hasFixtures && progressPercent > 0) state = 'completed';
              } else if (idx === 2) {
                 if (hasFixtures && progressPercent > 0 && progressPercent < 100) state = 'active';
                 else if (progressPercent >= 100) state = 'completed';
              } else if (idx === 3) {
                 if (!hasPlayoffs && progressPercent >= 100) state = 'skipped';
                 else if (hasPlayoffs && !isCompleted) state = 'active';
                 else if (hasPlayoffs && isCompleted) state = 'completed';
              } else if (idx === 4) {
                 if (isCompleted) {
                    state = 'completed';
                    dateStr = activeSeason.completedAt ? new Date(activeSeason.completedAt).toLocaleDateString() : null;
                 }
              }
              
              return (
                 <div key={step} className="relative z-10 flex flex-col items-center gap-4 w-20 text-center" title={dateStr ? `${step} — ${dateStr}` : step}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                       state === 'completed' ? 'bg-gold text-gold-900 ring-4 ring-gold/20' : 
                       state === 'active' ? 'bg-background border-2 border-gold text-gold animate-pulse shadow-[0_0_15px_rgba(232,179,76,0.5)]' :
                       state === 'skipped' ? 'bg-secondary/50 text-muted-foreground/30 ring-4 ring-background line-through' :
                       'bg-secondary text-muted-foreground ring-4 ring-background'
                    }`}>
                       {state === 'completed' ? <Check size={12} strokeWidth={4} /> : 
                        state === 'active' ? <div className="w-2 h-2 rounded-full bg-gold animate-ping" /> : 
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest font-bold ${
                       state === 'completed' || state === 'active' ? 'text-foreground' : 
                       state === 'skipped' ? 'text-muted-foreground/40 line-through' : 
                       'text-muted-foreground'
                    }`}>{step}</span>
                 </div>
              );
           })}
        </div>
      </Card>


    </div>
  );
}
