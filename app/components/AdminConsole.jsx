'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords, Edit2, ListOrdered, BarChart2, AlertTriangle, ArrowRight, Megaphone, ChevronDown, Package, MoreVertical, History, CheckCircle2, X } from 'lucide-react';
import { BorderBeam } from './magicui/BorderBeam';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Badge, Avatar, toTitleCase } from './UI';
import PlayerTag from './PlayerTag';
import { motion, AnimatePresence } from 'framer-motion';

import { generateFixtures, generatePlayoffs, updateMatchStatus, updateMatchScore, adminTriggerBracketProgress } from '@/app/actions/match';
import { awardTrophy, removeTrophy, updateTrophy, createAnnouncement, deleteAnnouncement, endCelebration, retriggerCelebration, getCelebrations, getSystemSettings, updateSystemSettings, createCustomNotification, deleteCustomNotification, clearAllNotifications } from '@/app/actions/admin';

import { startSeason, renameSeason, completeSeason, updateSeasonAwards } from '@/app/actions/season';
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
import AdminHistory from './AdminHistory';
import AdminNotifications from './AdminNotifications';
import { MobileStandingsList } from './AdminOverviewDashboard';

import dynamic from 'next/dynamic';
import RichTextEditor from './RichTextEditor';



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
      <div className="flex flex-col md:grid md:grid-cols-2 gap-0 md:gap-4 md:bg-transparent md:border-none md:divide-none bg-secondary/20 border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
        {players.map((p, i) => (
          <FadeIn key={p.id} delay={i * 0.05} className="h-full">
            <div className="p-3.5 sm:p-4 md:p-5 md:bg-secondary/20 md:border md:border-border/50 md:rounded-xl flex items-center gap-3 md:gap-4 transition-colors active:bg-secondary/40 md:hover:bg-secondary/40 h-full group">
              <Avatar p={p} size={44} className="shrink-0 ring-1 ring-border/50 shadow-sm" />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="font-bold text-[15px] text-white truncate leading-snug">{toTitleCase(p.name)}</div>
                <div className="text-[11px] text-muted-foreground truncate leading-relaxed">
                  {p.teamName ? `${p.teamLogo || ''} ${p.teamName} · ` : ''}@{p.username}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 -mr-2 text-muted-foreground hover:text-white md:opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-all active:bg-white/20 active:scale-95 outline-none">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 bg-card border-border/50 shadow-2xl rounded-xl z-50">
                  <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg" onSelect={() => startEdit(p)} disabled={loading}>
                    <Edit2 size={15} className="mr-2.5 text-muted-foreground" /> Edit Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/30 my-1" />
                  <DropdownMenuItem className="cursor-pointer py-2.5 rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10" onSelect={() => remove(p.id)} disabled={loading}>
                    <Trash2 size={15} className="mr-2.5" /> Remove Player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
    
    // Optimistically broadcast to all clients immediately
    const optMatch = { ...m, ...data };
    supabase.channel('league-events').send({
      type: 'broadcast',
      event: 'match_update',
      payload: optMatch
    });

    const res = await updateMatchStatus(m.id, data);
    if (res.error) {
      showToast(res.error);
      // Revert broadcast on error
      supabase.channel('league-events').send({
        type: 'broadcast',
        event: 'match_update',
        payload: m
      });
    } else if (res.match) {
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
          <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-3 gap-2 items-center w-full">
            <div className="flex w-full items-center justify-end gap-1.5 sm:gap-3">
              <span className="text-foreground text-[11px] sm:text-sm font-semibold truncate text-right" title={h?.name}>
                {toTitleCase(h?.name)}
              </span>
              {hFlagUrl && <img src={hFlagUrl} alt={h?.flag} className="w-3.5 h-2.5 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <Avatar p={h} size={40} className="w-6 h-6 sm:w-10 sm:h-10 shrink-0 hidden xs:block" />
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-[9px] sm:text-xs text-muted-foreground font-score uppercase tracking-widest font-bold mb-1">vs</span>
              <ShinyButton onClick={startMatch} loading={loading} className="px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-xs min-w-max">
                <Radio size={10} className="mr-1 sm:mr-1.5 sm:w-3 sm:h-3"/> Start
              </ShinyButton>
            </div>

            <div className="flex w-full items-center justify-start gap-1.5 sm:gap-3">
              <Avatar p={a} size={40} className="w-6 h-6 sm:w-10 sm:h-10 shrink-0 hidden xs:block" />
              {aFlagUrl && <img src={aFlagUrl} alt={a?.flag} className="w-3.5 h-2.5 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <span className="text-foreground text-[11px] sm:text-sm font-semibold truncate text-left" title={a?.name}>
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

const statDefinitions = [
  { key: 'possession', label: 'BALL POSSESSION', format: 'percent' },
  { key: 'shots', label: 'TOTAL SHOTS', format: 'number' },
  { key: 'shotsOnTarget', label: 'SHOTS ON TARGET', format: 'number' },
  { key: 'fouls', label: 'FOULS', format: 'number' },
  { key: 'offsides', label: 'OFFSIDES', format: 'number' },
  { key: 'corners', label: 'CORNER KICKS', format: 'number' },
  { key: 'freeKicks', label: 'FREE KICKS', format: 'number' },
  { key: 'passes', label: 'PASSES', format: 'number' },
  { key: 'successfulPasses', label: 'SUCCESSFUL PASSES', format: 'number' },
  { key: 'crosses', label: 'CROSSES', format: 'number' },
  { key: 'interceptions', label: 'INTERCEPTIONS', format: 'number' },
  { key: 'tackles', label: 'TACKLES', format: 'number' },
  { key: 'saves', label: 'SAVES', format: 'number' },
];

function CompletedMatchCard({ m, h, a, players, showToast, isPlayoff = false }) {
  const [saving, setSaving] = useState(false);
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState(m.stats || {});

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

  const handleStatChange = (key, team, value) => {
    setStatsForm(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { a: 0, b: 0 }),
        [team]: value === '' ? 0 : Number(value)
      }
    }));
  };

  const saveStats = async () => {
    setSaving(true);
    const res = await updateMatchStatus(m.id, { 
      status: m.status,
      homeScore: m.homeScore,
      awayScore: m.awayScore,
      liveState: m.liveState,
      stats: statsForm 
    });
    if (res.error) showToast(res.error);
    else {
      showToast('✅ Stats updated (ratings recalculated)');
      setIsEditingStats(false);
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col mb-4">
      <MagicCard 
        onClick={() => setIsEditingStats(!isEditingStats)}
        className={`group p-3 sm:p-4 transition-all duration-300 relative overflow-hidden cursor-pointer ${isEditingStats ? 'bg-secondary/60 shadow-lg border-green-500/30 rounded-b-none border-b-0 z-10' : 'bg-secondary/30 hover:bg-secondary/40 rounded-xl border border-border/30'}`}
      >
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-[1fr_auto_1fr] sm:grid-cols-3 gap-2 items-center w-full sm:pr-8 pr-6">
            <div className="flex w-full items-center justify-end gap-1.5 sm:gap-3">
              <span className="text-foreground text-[11px] sm:text-sm font-semibold truncate text-right" title={h?.name}>
                {toTitleCase(h?.name)}
              </span>
              {hFlagUrl && <img src={hFlagUrl} alt={h?.flag} className="w-3.5 h-2.5 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <Avatar p={h} size={40} className="w-6 h-6 sm:w-10 sm:h-10 shrink-0 hidden xs:block" />
            </div>

            <div className="flex items-center justify-center px-1 sm:px-2">
              <div className={`w-16 sm:w-24 h-7 sm:h-9 bg-black/40 border ${m.status === 'live' ? 'border-red-500/50' : 'border-border/50'} rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2`}>
                <span className={`font-score text-sm sm:text-base ${hWon ? 'text-pitch-bright font-black drop-shadow-md' : 'text-muted-foreground font-semibold'}`}>{hScore}</span>
                <span className="text-muted-foreground/30 font-score text-xs sm:text-sm">-</span>
                <span className={`font-score text-sm sm:text-base ${aWon ? 'text-pitch-bright font-black drop-shadow-md' : 'text-muted-foreground font-semibold'}`}>{aScore}</span>
              </div>
            </div>

            <div className="flex w-full items-center justify-start gap-1.5 sm:gap-3">
              <Avatar p={a} size={40} className="w-6 h-6 sm:w-10 sm:h-10 shrink-0 hidden xs:block" />
              {aFlagUrl && <img src={aFlagUrl} alt={a?.flag} className="w-3.5 h-2.5 sm:w-5 sm:h-3.5 object-cover rounded-[2px] shadow-sm shrink-0" />}
              <span className="text-foreground text-[11px] sm:text-sm font-semibold truncate text-left" title={a?.name}>
                {toTitleCase(a?.name)}
              </span>
            </div>
          </div>

          <div className="absolute right-3 sm:right-4 flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  onClick={(e) => e.stopPropagation()} 
                  className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
                >
                  <MoreVertical size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-2xl rounded-xl w-40">
                {isPlayoff ? (
                  <>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => setIsEditingStats(!isEditingStats)}>
                      <BarChart2 size={14} className="mr-2 text-green-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={(e) => { e.preventDefault(); handleReset(); }}>
                      <Clock size={14} className="mr-2" /> Postpone
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); if (window.confirm('Reset this playoff result?')) handleReset(); }}>
                      <AlertTriangle size={14} className="mr-2" /> Reset Result
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => router.push(`/matches?matchId=${m.id}`)}>
                      <CheckCircle2 size={14} className="mr-2 text-muted-foreground" /> View Match
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => setIsEditingStats(!isEditingStats)}>
                      <BarChart2 size={14} className="mr-2 text-green-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer rounded-lg py-2 text-destructive focus:text-destructive" onSelect={(e) => { e.preventDefault(); if (window.confirm('Are you sure you want to undo this match result? This will remove the score and revert it to scheduled.')) handleReset(); }}>
                      <AlertTriangle size={14} className="mr-2" /> Undo Result
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </MagicCard>
      
      <AnimatePresence>
        {isEditingStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-[#0a0c10] border border-green-500/30 border-t-0 rounded-b-xl shadow-inner relative z-0"
          >
            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              {statDefinitions.map(def => {
                const valA = statsForm[def.key]?.a ?? 0;
                const valB = statsForm[def.key]?.b ?? 0;
                return (
                  <div key={def.key} className="flex flex-col border-b border-white/5 pb-2">
                    <div className="text-center text-[10px] tracking-[0.2em] text-muted-foreground font-bold uppercase mb-2">
                      {def.label}
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <Input 
                        type="number" 
                        value={valA} 
                        onChange={e => handleStatChange(def.key, 'a', e.target.value)}
                        className="w-20 text-center font-score h-8"
                        style={{ borderColor: '#29C179' }}
                      />
                      <span className="text-muted-foreground/30 text-xs">VS</span>
                      <Input 
                        type="number" 
                        value={valB} 
                        onChange={e => handleStatChange(def.key, 'b', e.target.value)}
                        className="w-20 text-center font-score h-8"
                        style={{ borderColor: '#B23A48' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 bg-secondary/30 flex justify-end gap-3 border-t border-border/30">
              <Btn variant="ghost" onClick={() => setIsEditingStats(false)} disabled={saving}>Cancel</Btn>
              <ShinyButton onClick={saveStats} loading={saving} className="px-6 bg-green-500 hover:bg-green-400 text-black">
                <Check size={16} className="mr-2" /> Save Stats
              </ShinyButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[320px] p-0 bg-card border-border/50 shadow-2xl rounded-xl" align="start">
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

function TrophyTradingCard({ trophy, onEdit, onRevoke, hideActions }) {
  const isImage = trophy.icon && (trophy.icon.startsWith('/') || trophy.icon.startsWith('http'));
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative group rounded-2xl border border-white/[0.05] bg-[#12151b] overflow-hidden shadow-xl aspect-[3/4] flex flex-col"
    >
      {/* Gloss reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-0">
        <div className="relative mb-4">
          <div className="absolute -inset-4 bg-amber-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {isImage ? (
            <img src={trophy.icon} className="w-16 h-16 object-contain drop-shadow-2xl relative z-10 scale-95 group-hover:scale-105 transition-transform duration-500" alt="" />
          ) : (
            <span className="text-5xl relative z-10 block group-hover:scale-110 transition-transform duration-500">{trophy.icon || '🏆'}</span>
          )}
        </div>
        
        <h4 className="font-bold text-base text-center leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 mb-1 line-clamp-2 px-1">{trophy.title}</h4>
        {trophy.description && (
          <p className="text-[10px] text-muted-foreground text-center line-clamp-2 px-2 leading-relaxed">
            {trophy.description}
          </p>
        )}
      </div>

      <div className="p-3 bg-black/40 backdrop-blur-sm border-t border-white/[0.05] flex items-center justify-between relative z-20 mt-auto">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Awarded</span>
          <span className="text-xs font-score text-white/80">{trophy.season}</span>
        </div>
        {trophy.player && (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full pl-1.5 pr-2.5 py-1 border border-white/10 shadow-sm">
            <Avatar p={trophy.player} size={16} />
            <span className="text-[10px] font-bold truncate max-w-[70px]">{trophy.player.name}</span>
          </div>
        )}
      </div>

      {/* Overlay Actions */}
      {!hideActions && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-30 pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0">
          <Btn variant="outline" className="w-32 bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl gap-2 shadow-lg h-9 text-xs" onClick={(e) => { e.stopPropagation(); onEdit(trophy); }}>
            <Edit2 size={12} /> Edit Award
          </Btn>
          <Btn variant="danger" className="w-32 rounded-xl gap-2 shadow-lg border border-red-500/50 h-9 text-xs" onClick={(e) => { e.stopPropagation(); onRevoke(trophy); }}>
            <Trash2 size={12} /> Revoke
          </Btn>
        </div>
      )}
    </motion.div>
  );
}

function EditTrophyDrawer({ open, onOpenChange, trophy, players, onSave }) {
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
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => onOpenChange(false)}
          />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-background/95 backdrop-blur-2xl border-l border-border/50 shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-secondary/30 shrink-0">
              <div className="flex items-center gap-2 text-lg font-bold">
                <Edit2 size={18} className="text-amber-400" /> Edit Trophy
              </div>
              <Btn variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-secondary/80" onClick={() => onOpenChange(false)}>
                <X size={18} />
              </Btn>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
              {/* Live Preview */}
              <div>
                <Label className="mb-3 block text-muted-foreground text-[10px] uppercase tracking-widest font-semibold text-center">Live Preview</Label>
                <div className="flex justify-center">
                  <div className="relative pointer-events-none w-full max-w-[200px] shadow-2xl rounded-2xl">
                    <BorderBeam size={60} duration={12} delay={9} colorFrom="var(--gold)" colorTo="transparent" className="rounded-2xl z-40" />
                    <TrophyTradingCard 
                      trophy={{ ...trophy, ...form, player: player }} 
                      hideActions={true}
                    />
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5 flex-1">
                {player && (
                  <div>
                    <Label className="mb-2 block text-xs">Recipient</Label>
                    <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/50">
                      <Avatar p={player} size={32} />
                      <span className="font-semibold text-sm">{player.name}</span>
                    </div>
                  </div>
                )}
                <div><Label>Trophy Title</Label><Input value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className="bg-secondary/20 border-border/50 focus:border-amber-500/50" /></div>
                <div><Label>Season</Label><Input value={form.season || ''} onChange={e => setForm({...form, season: e.target.value})} className="bg-secondary/20 border-border/50 focus:border-amber-500/50" /></div>
                <div>
                  <Label>Icon</Label>
                  <TrophyIconPicker value={form.icon} onChange={v => setForm({...form, icon: v})} />
                </div>
                <div><Label>Description</Label><Input value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="bg-secondary/20 border-border/50 focus:border-amber-500/50" /></div>
              </div>
            </div>

            <div className="p-6 border-t border-border/50 bg-secondary/30 flex gap-3 justify-end mt-auto shrink-0">
              <Btn variant="ghost" onClick={() => onOpenChange(false)} className="bg-secondary text-foreground hover:bg-secondary/80 rounded-xl">Cancel</Btn>
              <ShinyButton onClick={() => onSave(form)} className="rounded-xl">Save Changes</ShinyButton>
            </div>
          </motion.div>
        </>
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
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [celebrations, setCelebrations] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    async function loadCelebrations() {
      const res = await getCelebrations();
      if (res.celebrations) setCelebrations(res.celebrations);
    }
    loadCelebrations();
    
    // Live timer
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [trophies]);

  const handleAward = async () => {
    if (!form.playerId || !form.title || !form.season) return showToast('Player, Title, and Season are required.');
    setIsAwarding(true);
    const res = await awardTrophy(form);
    if (res.error) {
      showToast(res.error);
      setIsAwarding(false);
    } else {
      const playerName = players.find(p => p.id === form.playerId)?.name || 'Player';
      showToast(`🏆 ${form.title} awarded to ${playerName}`);
      setIsAwarding(false);
      setIsCelebrating(true);
      setTimeout(() => {
        setIsCelebrating(false);
        setForm(blankForm);
      }, 3500);
    }
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setIsRevoking(true);
    try {
      const data = await removeTrophy(revokeTarget.id);
      if (data.error) showToast(`❌ Failed to revoke trophy: ${data.error}`);
      else {
        showToast(`🗑️ Trophy revoked`);
        setRevokeTarget(null);
        router.refresh();
      }
    } catch (err) {
      showToast(`❌ Error: ${err.message}`);
    } finally {
      setIsRevoking(false);
      setRevokeTarget(null);
    }
  };

  const handleEndCelebration = async (id) => {
    const res = await endCelebration(id);
    if (res.error) showToast(res.error);
    else {
      showToast("Broadcast terminated.");
      setCelebrations(prev => prev.map(c => c.id === id ? { ...c, status: 'ended_early' } : c));
    }
  };

  const handleEdit = async (updatedData) => {
    if (!editTarget) return;
    const res = await updateTrophy(editTarget.id, updatedData);
    if (res.error) showToast(res.error);
    else showToast(`✏️ Trophy updated`);
    setEditTarget(null);
  };

  const applyTemplate = (award) => {
    setForm(prev => ({ ...prev, title: award.name, icon: award.icon, description: award.defaultDesc || award.description }));
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="award" className="w-full">
        <TabsList className="mb-6 bg-secondary/50 rounded-xl p-1 flex flex-wrap overflow-x-auto hide-scrollbar">
          <TabsTrigger value="award" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Plus size={14} className="mr-1.5" /> Trophy Forge
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <History size={14} className="mr-1.5" /> Award History
          </TabsTrigger>
          <TabsTrigger value="celebrations" className="rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground">
            <Megaphone size={14} className="mr-1.5" /> Live Celebrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="award" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative bg-zinc-950 p-6 rounded-3xl border border-white/5 shadow-2xl">
            {/* Form Section */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Trophy size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">Mint Trophy</h2>
                  <p className="text-xs text-zinc-400 font-medium">Create and issue permanent awards to players.</p>
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block text-zinc-400 text-xs font-bold uppercase tracking-widest">Iconic Awards</Label>
                <div className="flex flex-wrap gap-3">
                  {TROPHY_TEMPLATES.map(a => (
                    <button
                      key={a.id}
                      onClick={() => applyTemplate(a)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
                    >
                      <span className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {a.icon && (a.icon.startsWith('/') || a.icon.startsWith('http')) ? (
                          <img src={a.icon} alt={a.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl">{a.icon}</span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-amber-400">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="md:col-span-2">
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Recipient</Label>
                  <PlayerCombobox players={players} value={form.playerId} onChange={v => setForm({...form, playerId: v})} />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Title</Label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-black/50 border-white/10 text-white font-bold" placeholder="e.g. Golden Boot" />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Season</Label>
                  <Input value={form.season} onChange={e => setForm({...form, season: e.target.value})} className="bg-black/50 border-white/10 text-white font-bold" placeholder="e.g. Season 1" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Icon Emoji / URL</Label>
                  <TrophyIconPicker value={form.icon} onChange={v => setForm({...form, icon: v})} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-zinc-400 text-xs uppercase tracking-wider mb-2 block">Description</Label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-black/50 border-white/10 text-white" placeholder="e.g. Top goalscorer with 25 goals." />
                </div>
              </div>

              <button
                onClick={handleAward}
                disabled={isAwarding || isCelebrating}
                className={`mt-4 w-full py-5 rounded-xl font-black uppercase tracking-widest text-lg transition-all ${
                  isAwarding || isCelebrating ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:scale-[1.02]'
                }`}
              >
                {isAwarding ? 'Minting...' : isCelebrating ? 'Success!' : '🏆 Award Trophy'}
              </button>
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center sticky lg:top-24 h-max min-h-[300px] sm:min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl pointer-events-none" />
              
              <AnimatePresence>
                {isCelebrating && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 2 }}
                      exit={{ opacity: 0, scale: 3 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="absolute inset-0 bg-amber-500/30 rounded-full blur-[100px] z-0 pointer-events-none"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 1, 0], y: [50, -50, -100, -150], scale: [0.5, 1.5, 1.5, 1] }}
                      transition={{ duration: 3, ease: "easeOut" }}
                      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                      <div className="text-[150px] filter drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">🏆</div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <motion.div 
                className="relative z-10 w-full max-w-[320px] perspective-1000"
                animate={isCelebrating ? { 
                  scale: [1, 1.15, 1], 
                  rotateY: [0, 15, -15, 0],
                  rotateX: [0, 10, -10, 0]
                } : {
                  rotateY: [-5, 5, -5],
                  rotateX: [2, -2, 2]
                }}
                transition={isCelebrating ? { duration: 1.5, ease: "easeInOut" } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <BorderBeam size={150} duration={8} delay={0} colorFrom="#f59e0b" colorTo="transparent" className="rounded-2xl z-40 opacity-70 pointer-events-none" />
                <TrophyTradingCard 
                  trophy={{ 
                    ...form, 
                    title: form.title || 'Legendary Award',
                    season: form.season || 'Season X',
                    icon: form.icon || '🏆',
                    player: players.find(p => p.id === form.playerId) || { name: 'Player Name', avatar: '' }
                  }} 
                  hideActions={true}
                />
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <SectionTitle icon={History}>Award Vault</SectionTitle>
            <p className="text-sm text-muted-foreground mb-6">
              Browse all permanent trophies awarded to players.
            </p>
            {trophies.length === 0 ? (
              <EmptyState text="No trophies awarded yet." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {trophies.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring' }}
                  >
                    <TrophyTradingCard
                      trophy={{ ...t, player: t.player || players.find(p => p.id === t.playerId) }}
                      onEdit={(trophyData) => setEditTarget(trophyData)}
                      onRevoke={(trophyData) => setRevokeTarget(trophyData)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="celebrations" className="space-y-6">
          <Card className="p-6 overflow-hidden bg-zinc-950 border-red-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <SectionTitle icon={Megaphone}>Live Broadcasts</SectionTitle>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                ON AIR
              </div>
            </div>
            
            <p className="text-sm text-zinc-400 mb-6">
              Manage active 24-hour celebration banners appearing on player dashboards.
            </p>

            {celebrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <span className="text-4xl mb-3 opacity-50">📡</span>
                <p className="text-zinc-500 font-medium">No active broadcasts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {celebrations.map((c, i) => {
                  const expiry = new Date(c.expiresAt);
                  const isActive = c.status === 'active' && expiry > now;
                  const msLeft = Math.max(0, expiry - now);
                  const hLeft = Math.floor(msLeft / (1000 * 60 * 60));
                  const mLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
                  const sLeft = Math.floor((msLeft % (1000 * 60)) / 1000);

                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative p-5 rounded-2xl border transition-all ${
                        isActive ? 'bg-black border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.15)]' : 'bg-white/5 border-white/10 opacity-60'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[9px] font-black tracking-widest rounded-bl-xl rounded-tr-xl">
                          LIVE
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                          {c.trophy.icon && (c.trophy.icon.startsWith('/') || c.trophy.icon.startsWith('http')) ? (
                            <img src={c.trophy.icon} className="w-8 h-8 object-contain" alt="" />
                          ) : (
                            <span>{c.trophy.icon || '🏆'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm leading-tight">{c.trophy.title}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Avatar p={c.trophy.player} size={14} />
                            <span className="text-xs text-zinc-400 font-medium">{c.trophy.player.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10">
                        {isActive ? (
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Time Remaining</span>
                            <span className="font-mono text-red-400 font-bold text-sm tracking-wider">
                              {String(hLeft).padStart(2,'0')}:{String(mLeft).padStart(2,'0')}:{String(sLeft).padStart(2,'0')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            {c.status === 'ended_early' ? 'KILLED' : 'EXPIRED'}
                          </span>
                        )}

                        {isActive && (
                          <button
                            onClick={() => handleEndCelebration(c.id)}
                            className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Kill Switch
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
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

      <EditTrophyDrawer
        key={editTarget?.id || 'edit-drawer-new'}
        open={!!editTarget}
        onOpenChange={open => !open && setEditTarget(null)}
        trophy={editTarget}
        players={players}
        onSave={handleEdit}
      />
    </div>
  );
}

const SegmentBtn = ({ value, label, icon, current, onChange }) => (
  <button
    onClick={() => onChange(value)}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
      current === value
        ? 'bg-amber-500 text-black shadow-sm scale-95'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
);

const SpeedBtn = ({ value, icon, current, onChange }) => (
  <button
    onClick={() => onChange(value)}
    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-lg transition-colors border ${
      current === value
        ? 'bg-amber-500/10 text-amber-500 border-amber-500/50'
        : 'bg-white/5 text-zinc-500 border-transparent hover:bg-white/10'
    }`}
    title={value}
  >
    {icon}
  </button>
);

const ThemeBtn = ({ theme, current, onChange }) => (
  <button
    onClick={() => onChange(theme)}
    className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all border ${
      current === theme 
        ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
        : 'bg-zinc-900 text-zinc-500 border-zinc-700 hover:text-zinc-300 hover:border-zinc-500'
    }`}
  >
    {theme}
  </button>
);

const Toggle = ({ checked, onChange, label, desc }) => (
  <label className="flex items-center justify-between gap-4 cursor-pointer py-2">
    <div className="flex flex-col">
      <span className="text-sm text-foreground/80 font-medium">{label}</span>
      {desc && <span className="text-[11px] text-muted-foreground mt-0.5">{desc}</span>}
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-pitch' : 'bg-secondary border border-border'}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </label>
);

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
      <Card className="p-4 sm:p-6">
        <SectionTitle icon={Megaphone}>Post Announcement</SectionTitle>
        <div className="grid gap-4 mt-4">
          <div><Label>Title</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Season Start!" /></div>
          <div>
            <Label>Message</Label>
            <div className="mt-2 max-w-full overflow-hidden">
              <RichTextEditor 
                value={form.content} 
                onChange={val => setForm({...form, content: val})} 
              />
            </div>
          </div>
        </div>
        <ShinyButton className="mt-6 w-full sm:w-auto" onClick={handlePost} loading={loading}>Publish</ShinyButton>
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
              <Btn variant="danger" className="shrink-0 w-full md:w-auto mt-2 md:mt-0" onClick={() => handleRemove(a.id)} loading={loading}>Delete</Btn>
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
  const [customRules, setCustomRules] = useState({ win: 3, draw: 1, loss: 0, goalsFor: 0, goalsAgainst: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [rename, setRename] = useState("");
  const [loading, setLoading] = useState(false);
  // Delete Season — type-to-confirm state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStart = async () => {
    if (!name.trim()) return showToast("Enter a season name");
    setLoading(true);
    // startSeason now accepts 4 args: name, type, startDate, config
    const res = await startSeason(name, seasonType, startDate, customRules);
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
    const formats = [
      { id: 'League (Single)', title: 'League', icon: '🏆', desc: 'Standard Round-Robin' },
      { id: 'League (Double)', title: 'Double League', icon: '⚔️', desc: 'Home & Away' },
      { id: 'League + Playoffs (Single)', title: 'League + Playoffs', icon: '🔥', desc: 'Top 4 to Knockouts' },
      { id: 'Double Elimination', title: 'Double Elim Bracket', icon: '🛡️', desc: 'Upper & Lower Bracket' },
    ];
    
    return (
      <Card className="flex flex-col md:flex-row overflow-hidden border-pitch-bright/20 shadow-2xl">
        <div className="md:w-1/3 bg-gradient-to-br from-pitch-dark to-pitch p-8 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-border/50">
          <div className="relative">
            <Trophy size={80} className="text-pitch-bright drop-shadow-[0_0_25px_rgba(41,193,121,0.6)]" />
            <div className="absolute inset-0 bg-pitch-bright/20 blur-2xl rounded-full"></div>
          </div>
          <h2 className="text-3xl font-black font-heading mt-6 mb-2 tracking-wide">NO ACTIVE SEASON</h2>
          <p className="text-muted-foreground">Select a format and kick off a brand new tournament.</p>
        </div>
        
        <div className="md:w-2/3 p-8 flex flex-col gap-6 bg-secondary/30">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Season Name</Label>
            <Input className="w-full bg-background border-border h-12 text-lg focus:border-pitch-bright focus:ring-pitch-bright" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Summer Cup 2026" />
          </div>
          
          <div className="space-y-3">
            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Format</Label>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
              {formats.map(f => (
                <div 
                  key={f.id}
                  onClick={() => setSeasonType(f.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 flex flex-col gap-1 ${
                    seasonType === f.id ? 'border-pitch-bright bg-pitch-bright/10 shadow-[0_0_15px_rgba(41,193,121,0.2)]' : 'border-border bg-background hover:border-pitch-bright/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{f.icon}</span>
                    <span className="font-bold text-sm">{f.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-7">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="space-y-1.5 flex-1">
              <Label className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Start Date</Label>
              <Input type="date" className="w-full bg-background border-border" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="flex-1 flex justify-end mt-4">
              <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-pitch-bright hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider">
                ⚙️ {showAdvanced ? 'Hide' : 'Show'} Advanced Rules
              </button>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="p-4 bg-background border border-border rounded-lg space-y-4 animate-in slide-in-from-top-2">
              <h4 className="text-sm font-bold border-b border-border pb-2">Custom Point System</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Win (Pts)</Label>
                  <Input type="number" className="h-8" value={customRules.win} onChange={e => setCustomRules({...customRules, win: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Draw (Pts)</Label>
                  <Input type="number" className="h-8" value={customRules.draw} onChange={e => setCustomRules({...customRules, draw: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Loss (Pts)</Label>
                  <Input type="number" className="h-8" value={customRules.loss} onChange={e => setCustomRules({...customRules, loss: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Goals For (Bonus Pts)</Label>
                  <Input type="number" step="0.1" className="h-8" value={customRules.goalsFor} onChange={e => setCustomRules({...customRules, goalsFor: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Goals Against (Penalty Pts)</Label>
                  <Input type="number" step="0.1" className="h-8" value={customRules.goalsAgainst} onChange={e => setCustomRules({...customRules, goalsAgainst: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
            </div>
          )}
          
          <ShinyButton onClick={handleStart} className="w-full h-14 mt-2 text-lg shadow-[0_0_20px_rgba(41,193,121,0.4)]" loading={loading}>
            ✨ CREATE & GENERATE FIXTURES
          </ShinyButton>
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

            if (!confirm("Are you sure you want to end this season? This will automatically calculate standings and archive the season.")) return;
             
            const championId = standings[0]?.id;
            const runnerUpId = standings[1]?.id;
            const thirdId = standings[2]?.id;
            const mvpId = standings[0]?.id; // Default MVP to Champion
             
            const trophies = [];

            const res = await completeSeason(activeSeason.id, {
                championId, runnerUpId, thirdId, mvpId, championName: standings[0]?.name, trophies
            });
             
            if (res.error) showToast(res.error);
            else { showToast("Season archived!"); setTab("admin-overview"); }
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
               {/* Desktop Table View */}
               <table className="w-full text-sm text-left hidden md:table">
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
               
               {/* Mobile Card View */}
               <div className="block md:hidden mt-4">
                 <MobileStandingsList matches={matches} players={players} activeSeason={activeSeason} />
               </div>
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

// ══════════════════════════════════════════════════════════════
// ADMIN ROLES
// ══════════════════════════════════════════════════════════════

export function AdminRoles({ showToast }) {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/roles')
      .then(res => res.json())
      .then(data => {
        if (data.permissions) setPermissions(data.permissions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(permissions)
      });
      if (res.ok) showToast("✅ Manager roles updated!");
      else showToast("❌ Failed to update roles.");
    } catch (e) {
      showToast("❌ Server error.");
    }
    setSaving(false);
  };

  const update = (key, val) => setPermissions(p => ({ ...p, [key]: val }));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading permissions...</div>;
  if (!permissions) return <div className="p-8 text-center text-red-500">Failed to load permissions.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <SectionTitle icon={Users}>Manager Permissions</SectionTitle>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          Toggle which sections the secondary Manager can access and modify.
        </p>

        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Toggle 
              checked={permissions.canManageMatches} 
              onChange={v => update('canManageMatches', v)} 
              label="Manage Matches" 
              desc="Allow the manager to access the Matches tab to start matches and update scores." 
            />
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Toggle 
              checked={permissions.canManagePlayers} 
              onChange={v => update('canManagePlayers', v)} 
              label="Manage Players" 
              desc="Allow the manager to add, edit, or delete player profiles." 
            />
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Toggle 
              checked={permissions.canManageSeason} 
              onChange={v => update('canManageSeason', v)} 
              label="Manage Season" 
              desc="Allow the manager to start, end, or configure tournaments." 
            />
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Toggle 
              checked={permissions.canEditBroadcast} 
              onChange={v => update('canEditBroadcast', v)} 
              label="Edit Broadcast" 
              desc="Allow the manager to change the live ticker themes and alerts." 
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <ShinyButton onClick={handleSave} disabled={saving} loading={saving}>
            Save Permissions
          </ShinyButton>
        </div>
      </Card>
    </div>
  );
}
