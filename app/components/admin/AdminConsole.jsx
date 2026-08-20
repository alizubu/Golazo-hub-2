'use client';

import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2, Settings, Swords, Edit2, ListOrdered, BarChart2, AlertTriangle, ArrowRight, Megaphone, ChevronDown, Package, MoreVertical, History, CheckCircle2, X, Camera, Copy, Download, RefreshCw, Eye, Pencil } from 'lucide-react';
import { BorderBeam } from '@/app/components/magicui/BorderBeam';
import { FlickeringGrid } from '@/app/components/magicui/FlickeringGrid';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton, Badge, Avatar, toTitleCase } from '@/app/components/shared/UI';
import { TeamCombobox, DisplayBadgeToggle } from '@/app/components/shared/FootballIdentity';

import { motion, AnimatePresence, Reorder } from 'framer-motion';

import { generateFixtures, generatePlayoffs, updateMatchStatus, updateMatchScore, adminTriggerBracketProgress } from '@/app/actions/match';
import { awardTrophy, removeTrophy, updateTrophy, createAnnouncement, deleteAnnouncement, updateAnnouncement, endCelebration, retriggerCelebration, getCelebrations, getSystemSettings, updateSystemSettings, createCustomNotification, deleteCustomNotification, clearAllNotifications, adminUpdateRankingPoints } from '@/app/actions/admin';

import { startSeason, updateSeason, completeSeason, updateSeasonAwards } from '@/app/actions/season';
import { signUpPlayer, adminUpdatePlayer, adminDeletePlayer } from '@/app/actions/player';
import { uploadImage } from '@/app/actions/upload';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

import Cropper from 'react-easy-crop';
import { getCroppedImgBase64 } from '@/app/utils/cropUtils';
import { PlayStyleBadge } from '@/app/components/shared/UI';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { CLUBS } from '@/lib/data/clubs';
import { getPlayerIdentityBadgeUrl } from '@/lib/identityUtils';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
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

// Trophy template data — the 5 official premium trophies
const TROPHY_TEMPLATES = [
  { id: 'bb-championship', name: 'BB Championship', image: '/assets/trophies/BB-Champion.png', icon: '/assets/trophies/BB-Champion.png', defaultDesc: 'The ultimate prize. Crowned Champion of the BB League.', colorTheme: 'from-amber-400 to-yellow-600' },
  { id: 'ballon-dor', name: "Ballon d'Or", image: '/assets/trophies/BalanDor.png', icon: '/assets/trophies/BalanDor.png', defaultDesc: 'Awarded to the absolute best player in the world.', colorTheme: 'from-yellow-300 to-amber-500' },
  { id: 'golden-boot', name: 'Golden Boot', image: '/assets/trophies/Golden-boot.png', icon: '/assets/trophies/Golden-boot.png', defaultDesc: 'Awarded for scoring the most goals in the season.', colorTheme: 'from-yellow-500 to-orange-500' },
  { id: 'most-successful-pass', name: 'Pass Master', image: '/assets/trophies/MostPasses.png', icon: '/assets/trophies/MostPasses.png', defaultDesc: 'Awarded to the ultimate playmaker with the highest pass accuracy.', colorTheme: 'from-blue-400 to-cyan-600' },
  { id: 'mvp', name: 'Tournament MVP', image: '/assets/trophies/MVP.png', icon: '/assets/trophies/MVP.png', defaultDesc: 'Most Valuable Player. Voted for dominating the pitch.', colorTheme: 'from-purple-400 to-pink-600' }
];
import AdminHistory from '@/app/components/admin/AdminHistory';
import AdminNotifications from '@/app/components/admin/AdminNotifications';
import { MobileStandingsList } from '@/app/components/admin/AdminOverviewDashboard';
import StandingsTable from '@/app/components/shared/StandingsTable';

import dynamic from 'next/dynamic';
import RichTextEditor from '@/app/components/shared/RichTextEditor';



export function AdminPlayers({ players, showToast, session, managerPermissions }) {
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [cropDataUrl, setCropDataUrl] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  
  const blank = { name: "", username: "", email: "", avatar: null, avatarImage: null, flag: null, favoriteClub: null, displayBadgePreference: "club", teamName: "", teamLogo: null, password: "", playStyle: "", badges: [], rankingPoints: 1000 };
  const [form, setForm] = useState(blank);
  const startNew = () => { setForm(blank); setEditing("new"); };
  const startEdit = (p) => { 
    setForm({ 
      ...blank, 
      ...p, 
      password: "",
      badges: p.badges || [] 
    }); 
    setEditing(p.id); 
  };

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
  
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast("Image must be less than 5MB");
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCropDataUrl(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleCropComplete = async () => {
    if (!cropDataUrl || !croppedAreaPixels) return;
    setUploading(true);
    try {
      const croppedBase64 = await getCroppedImgBase64(cropDataUrl, croppedAreaPixels);
      if (!croppedBase64) throw new Error("Failed to crop");
      
      const res = await uploadImage(croppedBase64);
      if (res.error) showToast(res.error);
      else {
        setForm(prev => ({ ...prev, avatarImage: res.url }));
        showToast("Image cropped and uploaded successfully!");
        setCropDataUrl(null);
        setZoom(1);
      }
    } catch (e) {
      showToast("Error processing crop.");
    }
    setUploading(false);
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
        {(session?.role === 'admin' || managerPermissions?.canManagePlayers) && (
          <ShinyButton onClick={startNew}><Plus size={15} /> Add player</ShinyButton>
        )}
      </div>
      
      {cropDataUrl && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg h-[50vh] bg-black rounded-xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
            <Cropper
              image={cropDataUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
            />
          </div>
          <div className="flex gap-4 w-full max-w-lg mb-8 items-center bg-secondary/50 p-4 rounded-xl border border-white/5">
            <span className="text-muted-foreground text-sm font-bold">Zoom</span>
            <input 
              type="range" 
              value={zoom} 
              min={1} 
              max={3} 
              step={0.05} 
              onChange={(e) => setZoom(e.target.value)} 
              className="w-full accent-gold"
            />
          </div>
          <div className="flex gap-4">
            <Btn variant="ghost" onClick={() => { setCropDataUrl(null); setZoom(1); }} className="text-white hover:bg-white/20">Cancel</Btn>
            <ShinyButton onClick={handleCropComplete} loading={uploading}>Confirm Crop</ShinyButton>
          </div>
        </div>
      )}
      
      {editing && (
        <FadeIn>
          <Card className="p-6 sm:p-8 border-border/30 bg-secondary/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
              <div className="text-2xl font-black font-heading tracking-tight mb-8 text-foreground relative z-10 flex items-center gap-2">
              {editing === "new" ? "New player account" : "Edit player"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
              
              <div className="flex flex-col items-center justify-center gap-4 w-full md:w-64 mt-2">
                <label className={`group relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-secondary/50 hover:border-gold cursor-pointer transition-all shadow-2xl flex items-center justify-center bg-secondary/30 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {form.avatarImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={form.avatarImage} alt="Avatar" className="w-full h-full object-cover" />
                  ) : form.avatar ? (
                    <span className="font-heading font-black text-6xl md:text-7xl text-muted-foreground">{form.avatar}</span>
                  ) : (
                    <Camera size={64} className="text-muted-foreground/30" />
                  )}
                  
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={32} className="text-white mb-2" />
                    <span className="text-white text-sm font-bold tracking-wide uppercase">Tap to Change</span>
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Auto-Cropped Profile Picture</p>
                </div>
              </div>
              
              <div className="w-full min-w-0">
                
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Display name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Player name" className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Username</Label>
                        <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="username" className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5 mt-2">
                        <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Email</Label>
                        <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email" className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5 mt-2">
                        <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">{editing === "new" ? "Temporary password" : "Reset password (leave blank to keep)"}</Label>
                        <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="4+ characters" className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                      </div>
                      {editing !== "new" && (
                        <>
                          <div className="space-y-1.5 mt-2">
                            <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Short Initials</Label>
                            <Input value={form.avatar || ""} onChange={(e) => setForm({ ...form, avatar: e.target.value.toUpperCase() })} placeholder="e.g. MES" maxLength={3} className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                          </div>
                          <div className="space-y-1.5 mt-2">
                            <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Ranking Points</Label>
                            <Input type="number" value={form.rankingPoints !== undefined ? form.rankingPoints : 1000} onChange={(e) => setForm({ ...form, rankingPoints: e.target.value })} placeholder="1000" className="bg-background/40 focus-visible:ring-gold/50 border-border/40 transition-colors h-11" />
                          </div>
                          
                          {/* Identity Setup */}
                          <div className="sm:col-span-2 space-y-1.5 mt-4 pt-4 border-t border-border/30">
                            <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">National Team (Flag)</Label>
                            <TeamCombobox type="national" selectedValue={form.flag} onSelect={(val) => setForm({ ...form, flag: val })} />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5 mt-2">
                            <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Favorite Club</Label>
                            <TeamCombobox type="club" selectedValue={form.favoriteClub} onSelect={(val) => setForm({ ...form, favoriteClub: val })} />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5 mt-2">
                            <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-widest pl-1">Badge Display Preference</Label>
                            <DisplayBadgeToggle value={form.displayBadgePreference || 'club'} onChange={(val) => setForm({ ...form, displayBadgePreference: val })} disabledOption={!form.flag ? 'national' : (!form.favoriteClub ? 'club' : null)} />
                          </div>
                        </>
                      )}
                    </div>

              </div>
            </div>
            <div className="flex justify-end gap-3 pt-6 mt-8 border-t border-border/30 relative z-10 w-full col-span-full md:-ml-8 md:pl-8">
              <ShinyButton onClick={save} loading={loading} className="px-8 py-2.5 shadow-lg shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 font-bold"><Check size={16} className="mr-2" /> Save Profile</ShinyButton>
              <Btn variant="outline" onClick={() => setEditing(null)} disabled={loading} className="px-6 py-2.5 border-border/50 hover:bg-white/5 font-semibold">Cancel</Btn>
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
                <div className="font-bold text-[15px] text-foreground truncate leading-snug">{toTitleCase(p.name)}</div>
                <div className="text-[11px] text-muted-foreground truncate leading-relaxed">
                  {p.teamName ? `${p.teamLogo || ''} ${p.teamName} · ` : ''}@{p.username}
                </div>
              </div>
              
              
                <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                  <button 
                    onClick={() => startEdit(p)}
                    disabled={loading}
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/50 hover:bg-gold/20 text-muted-foreground hover:text-gold transition-all active:scale-95 disabled:opacity-50"
                    title="Edit Player"
                  >
                    <Edit2 size={16} />
                  </button>
                  
                  {(session?.role === 'admin' || managerPermissions?.canManagePlayers) && (
                    <button 
                      onClick={() => remove(p.id)}
                      disabled={loading}
                      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary/50 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
                      title="Remove Player"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

export function AdminMatches({ matches, activeSeason, players, showToast, setTab }) {
  const isMobile = useIsMobile();
  const [isExporting, setIsExporting] = React.useState(false);
  const captureRef = React.useRef(null);
  const [orderedMatches, setOrderedMatches] = React.useState(() => {
    return activeSeason ? matches.filter(m => m.seasonId === activeSeason.id) : [];
  });
  const [prevMatches, setPrevMatches] = React.useState(matches);
  const [prevSeasonId, setPrevSeasonId] = React.useState(activeSeason?.id);

  // Sync external matches prop into local reorderable state during render (avoids cascading effect renders)
  if (matches !== prevMatches || activeSeason?.id !== prevSeasonId) {
    setPrevMatches(matches);
    setPrevSeasonId(activeSeason?.id);
    if (activeSeason) {
      const tMatches = matches.filter((m) => m.seasonId === activeSeason.id);
      if (orderedMatches.length === 0 || orderedMatches.length !== tMatches.length) {
        setOrderedMatches(tMatches);
      } else {
        const byId = Object.fromEntries(tMatches.map(m => [m.id, m]));
        setOrderedMatches(orderedMatches.map(m => byId[m.id]).filter(Boolean));
      }
    } else {
      setOrderedMatches([]);
    }
  }

  if (!activeSeason) return <EmptyState text="Start a season first." />;
  const unplayedMatches = orderedMatches.filter(m => m.status === 'scheduled');
  const tMatches = orderedMatches;
  
  const handleExport = async () => {
    if (!captureRef.current) return;
    setIsExporting(true);
    try {
      const htmlToImage = await import('html-to-image');
      const download = (await import('downloadjs')).default;
      const filter = (node) => !node.classList?.contains('hide-in-export');
      
      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        quality: 1,
        backgroundColor: '#0a0c10',
        filter: filter,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      download(dataUrl, 'golazo-full-fixtures.png');
      showToast("Fixtures graphic downloaded!");
    } catch (err) {
      console.error('Failed to export image', err);
      showToast("Failed to generate image.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={captureRef} className="flex-1 flex flex-col w-full bg-background rounded-3xl">
      <Card className="p-0 overflow-hidden flex-1 flex flex-col w-full border-border/50 bg-background shadow-2xl rounded-3xl relative">
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-secondary/50 via-background to-background border-b border-white/5">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
            <div>
              <SectionTitle icon={Radio} className="mb-0 text-xl sm:text-2xl font-black tracking-tight">Full Fixtures Control</SectionTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium">Manage and review all matches for the current season.</p>
            </div>
            <div className="flex flex-row flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto shrink-0 hide-in-export">
              {unplayedMatches.length > 0 && (
                <Btn 
                  onClick={() => {
                    const text = unplayedMatches.map(m => {
                      const h = players.find(p => p.id === m.homeId);
                      const a = players.find(p => p.id === m.awayId);
                      return `${h?.name || 'TBD'} vs ${a?.name || 'TBD'}`;
                    }).join('\n');
                    navigator.clipboard.writeText(text);
                    showToast("Unplayed fixtures copied!");
                  }}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-secondary/80 hover:bg-secondary text-foreground text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-white/5 shadow-sm active:scale-95 transition-all whitespace-nowrap"
                >
                  <Copy size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="truncate">Unplayed</span>
                </Btn>
              )}
              <Btn 
                  onClick={() => {
                    const text = tMatches.map(m => {
                      const h = players.find(p => p.id === m.homeId);
                      const a = players.find(p => p.id === m.awayId);
                      return `${h?.name || 'TBD'} vs ${a?.name || 'TBD'}`;
                    }).join('\n');
                    navigator.clipboard.writeText(text);
                    showToast("All fixtures copied!");
                  }}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-primary/20 shadow-sm active:scale-95 transition-all whitespace-nowrap"
                >
                  <Copy size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="truncate">Copy All</span>
              </Btn>
              <Btn 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-[10px] sm:text-xs font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border border-amber-500/20 shadow-sm active:scale-95 transition-all whitespace-nowrap disabled:opacity-50"
              >
                {isExporting ? <Radio size={12} className="animate-spin sm:w-[14px] sm:h-[14px]" /> : <Download size={12} className="sm:w-[14px] sm:h-[14px]" />}
                <span className="truncate">Graphic</span>
              </Btn>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col px-0 py-2 sm:p-6 bg-secondary/10">
          <Reorder.Group axis="y" values={orderedMatches} onReorder={setOrderedMatches} className="grid gap-2 sm:gap-4 px-0 sm:px-0">
            {orderedMatches.map((m, i) => (
              <Reorder.Item key={m.id} value={m} dragListener={!isMobile} className={`relative ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                <FadeIn delay={Math.min(i * 0.05, 0.5)}>
                  <AdminMatchControl m={m} players={players} showToast={showToast} setTab={setTab} isPlayoff={false} />
                </FadeIn>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </Card>
    </div>
  );
}

function AdminMatchControl({ m, players, showToast, setTab, isPlayoff = false }) {
  const isMobile = useIsMobile();
  const byId = Object.fromEntries(players.map((p) => [p.id, p]));
  const h = byId[m.homeId], a = byId[m.awayId];
  const [optHome, setOptHome] = useState(m.homeScore || 0);
  const [optAway, setOptAway] = useState(m.awayScore || 0);
  const [optStatus, setOptStatus] = useState(m.status);
  const [loading, setLoading] = useState(false);

  const [prevScores, setPrevScores] = useState({ home: m.homeScore, away: m.awayScore, status: m.status });
  if (m.homeScore !== prevScores.home || m.awayScore !== prevScores.away || m.status !== prevScores.status) {
    setPrevScores({ home: m.homeScore, away: m.awayScore, status: m.status });
    setOptHome(m.homeScore || 0);
    setOptAway(m.awayScore || 0);
    setOptStatus(m.status);
  }

  const update = async (data) => {
    setLoading(true);
    if (data.status) setOptStatus(data.status);
    if (data.homeScore !== undefined) setOptHome(data.homeScore);
    if (data.awayScore !== undefined) setOptAway(data.awayScore);
    
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
      setOptStatus(m.status);
      setOptHome(m.homeScore || 0);
      setOptAway(m.awayScore || 0);
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

  if (optStatus === "completed") {
    return <CompletedMatchCard m={m} h={h} a={a} players={players} showToast={showToast} isPlayoff={isPlayoff} />;
  }

  if (optStatus === "scheduled") {
    const hFlagUrl = getPlayerIdentityBadgeUrl(h);
    const aFlagUrl = getPlayerIdentityBadgeUrl(a);

    return (
      <div className={`relative flex flex-col px-1.5 py-3 sm:p-6 rounded-none sm:rounded-3xl bg-[#0a0b10] border-y sm:border ${m.round === 'final' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5 shadow-2xl'} overflow-hidden group transition-all duration-500 hover:scale-[1.01]`}>
        
        {m.round === 'final' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 sm:px-8 py-0.5 sm:py-1 rounded-b-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] z-30">
            Grand Final
          </div>
        )}

        {/* Layer 1: Tactical Auroras */}
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-85 transition-opacity duration-700 blur-2xl" />
        <div className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-l from-emerald-500/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-85 transition-opacity duration-700 blur-2xl" />
        
        {/* Layer 2: Flickering Grid */}
        <FlickeringGrid className="z-0 absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent_80%)]" color="#ef4444" colorTo="#10b981" maxOpacity={0.12} flickerSpeed={0.5} gridSize={12} />

        {/* Layer 3: Glassmorphic Sweep */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />

        <div className="flex flex-row items-center justify-between gap-1 sm:gap-4 w-full relative z-10">
          
          {/* Home Team */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-5 flex-1 min-w-0 justify-center sm:justify-start order-1">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 bg-gradient-to-br from-red-600 to-rose-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative rounded-full ring-2 ring-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                <div className="relative rounded-full overflow-hidden bg-background">
                  <Avatar p={h} className="!w-12 !h-12 sm:!w-20 sm:!h-20 rounded-full !border-0" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
              </div>
              {/* Club Flag */}
              {hFlagUrl && (
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-transparent rounded-full p-0.5">
                  <img src={hFlagUrl} alt="badge" className="w-5 h-5 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
                </div>
              )}
            </div>
            <div className="flex flex-col items-center sm:items-start min-w-0 w-full text-center sm:text-left">
              <span className="font-black text-[11px] sm:text-2xl truncate w-full tracking-tight animate-gradient bg-gradient-to-r from-red-200 via-white to-red-200 bg-[length:200%_auto] text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]" style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(h?.name) || 'TBD'}
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-3 mt-0.5 sm:mt-1.5 text-slate-300 w-full justify-center sm:justify-start">
                <span className="text-[9px] sm:text-base font-bold truncate w-full opacity-70 sm:opacity-100">{h?.favoriteClub || 'TBD'}</span>
              </div>
            </div>
          </div>
          
          {/* VS Badge / Start Button */}
          <div className="flex flex-col items-center justify-center shrink-0 px-1 sm:px-6 relative order-2 z-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent hidden sm:block z-0" />
            
            <div className="relative z-10 flex flex-col items-center justify-center w-10 h-10 sm:w-24 sm:h-24">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg sm:blur-xl animate-pulse" />
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] sm:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="rgba(245,158,11,0.1)" stroke="rgba(245,158,11,0.5)" strokeWidth="2" />
              </svg>
              <span className="text-[10px] sm:text-3xl font-black text-amber-400 relative z-20 font-score tracking-widest drop-shadow-[0_0_10px_rgba(245,158,11,1)]" style={{ fontFamily: "'Chakra Petch', sans-serif" }}>VS</span>
            </div>

            <ShinyButton onClick={startMatch} loading={loading} className="relative z-20 mt-1.5 sm:mt-0 px-3 sm:px-6 py-1 sm:py-2.5 text-[9px] sm:text-xs font-black shadow-[0_0_15px_rgba(16,185,129,0.4)] sm:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] rounded-full border border-emerald-400/60 bg-gradient-to-b from-emerald-500/20 to-emerald-900/40 text-emerald-300 backdrop-blur-xl uppercase tracking-widest hover:scale-[1.05] transition-all duration-300">
              Start
            </ShinyButton>
          </div>
          
          {/* Away Team */}
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-5 flex-1 min-w-0 justify-center sm:justify-end order-3">
            <div className="flex flex-col items-center sm:items-end min-w-0 w-full text-center sm:text-right order-2 sm:order-1">
              <span className="font-black text-[11px] sm:text-2xl truncate w-full tracking-tight animate-gradient bg-gradient-to-r from-emerald-200 via-white to-emerald-200 bg-[length:200%_auto] text-transparent bg-clip-text drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(a?.name) || 'TBD'}
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-3 mt-0.5 sm:mt-1.5 text-slate-300 w-full justify-center sm:justify-end">
                <span className="text-[9px] sm:text-base font-bold truncate w-full opacity-70 sm:opacity-100 order-2 sm:order-1">{a?.favoriteClub || 'TBD'}</span>
              </div>
            </div>
            <div className="relative shrink-0 order-1 sm:order-2">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative rounded-full ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                <div className="relative rounded-full overflow-hidden bg-background">
                  <Avatar p={a} className="!w-12 !h-12 sm:!w-20 sm:!h-20 rounded-full !border-0" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>
              </div>
              {/* Club Flag */}
              {aFlagUrl && (
                <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 bg-transparent rounded-full p-0.5">
                  <img src={aFlagUrl} alt="badge" className="w-5 h-5 sm:w-8 sm:h-8 object-contain drop-shadow-md" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
  
  const hFlagUrl = getPlayerIdentityBadgeUrl(h);
  const aFlagUrl = getPlayerIdentityBadgeUrl(a);

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
      {/* Compact summary row — click to toggle edit */}
      <div
        onClick={() => setIsEditingStats(!isEditingStats)}
        className={`group relative flex flex-col p-4 sm:p-5 rounded-3xl bg-[#0a0b10] border shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.005] ${isEditingStats ? 'border-violet-500/40 rounded-b-none' : m.round === 'final' ? 'border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-white/5'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-50 pointer-events-none" />

        {m.round === 'final' && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-black text-[10px] sm:text-xs tracking-widest uppercase px-4 sm:px-8 py-0.5 sm:py-1 rounded-b-xl shadow-[0_0_20px_rgba(245,158,11,0.6)] z-30">
            Grand Final
          </div>
        )}

        {/* FINISHED pill */}
        <div className="flex justify-center mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30">
            <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">FINISHED</span>
          </div>
        </div>

        {/* Player header */}
        <div className="flex items-center justify-between gap-2 px-1">
          {/* Home player */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 bg-rose-500/40 rounded-full blur-[8px]" />
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-rose-500/70 overflow-hidden">
                <Avatar p={h} size={56} className="w-full h-full object-cover" />
              </div>
            </div>
            {hFlagUrl && <img src={hFlagUrl} alt="" className="w-6 h-6 object-contain shrink-0 hidden sm:block" />}
            <div className="flex flex-col min-w-0">
              <span className={`text-xs sm:text-sm font-black truncate ${hWon ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(h?.name)}
              </span>
              <span className="text-[9px] text-slate-500 truncate">{h?.favoriteClub || ''}</span>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <span className={`text-3xl sm:text-4xl font-score font-black tabular-nums ${hWon ? 'text-white' : 'text-slate-500'}`}>{hScore}</span>
            <span className="text-slate-600 font-score text-xl">-</span>
            <span className={`text-3xl sm:text-4xl font-score font-black tabular-nums ${aWon ? 'text-rose-400' : 'text-slate-500'}`}>{aScore}</span>
          </div>

          {/* Away player */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 justify-end">
            <div className="flex flex-col min-w-0 items-end">
              <span className={`text-xs sm:text-sm font-black truncate text-right ${aWon ? 'text-white' : 'text-slate-400'}`} style={{ fontFamily: "'Sora', sans-serif" }}>
                {toTitleCase(a?.name)}
              </span>
              <span className="text-[9px] text-slate-500 truncate">{a?.favoriteClub || ''}</span>
            </div>
            {aFlagUrl && <img src={aFlagUrl} alt="" className="w-6 h-6 object-contain shrink-0 hidden sm:block" />}
            <div className="relative shrink-0">
              <div className="absolute -inset-1.5 bg-rose-500/40 rounded-full blur-[8px]" />
              <div className="relative w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 border-rose-500/70 overflow-hidden">
                <Avatar p={a} size={56} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        {/* Dropdown menu */}
        <div className="absolute right-3 top-3 z-10" onClick={e => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="opacity-100 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <MoreVertical size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border/50 shadow-2xl rounded-xl w-40">
              {isPlayoff ? (
                <>
                  <DropdownMenuItem className="cursor-pointer rounded-lg py-2" onSelect={() => setIsEditingStats(!isEditingStats)}>
                    <BarChart2 size={14} className="mr-2 text-rose-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
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
                    <BarChart2 size={14} className="mr-2 text-rose-400" /> {isEditingStats ? 'Close Stats' : 'Edit Stats'}
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

      {/* Expandable stats edit panel */}
      <AnimatePresence>
        {isEditingStats && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-[#0c0d12] border border-rose-500/20 border-t-0 rounded-b-3xl shadow-2xl"
          >
            {/* Stats header divider */}
            <div className="px-4 sm:px-6 pt-4 pb-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MATCH STATS</span>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
              </div>
            </div>

            {/* Stat rows */}
            <div className="px-4 sm:px-6 pb-4">
              {statDefinitions.map(def => {
                const valA = Number(statsForm[def.key]?.a) || 0;
                const valB = Number(statsForm[def.key]?.b) || 0;
                
                // Sync icons with LiveMatchControl
                const icon = {
                  possession: '⚽', shots: '🥅', shotsOnTarget: '🎯', fouls: '🚩',
                  offsides: '🏳️', corners: '🏁', freeKicks: '👥', passes: '🔗',
                  successfulPasses: '✅', crosses: '↪️', interceptions: '✋', tackles: '🛡', saves: '🧤'
                }[def.key] || '📊';
                
                const displayLabel = def.key === 'successfulPasses' ? 'ACCURATE PASSES' : (def.key === 'corners' ? 'CORNERS' : def.label);

                const total = valA + valB;
                const homePercent = total > 0 ? (valA / total) * 100 : 50;
                const awayPercent = total > 0 ? (valB / total) * 100 : 50;
              
                const isAccuratePasses = def.key === "successfulPasses";
                const isPercent = def.format === "percent";
              
                let homeAccuracyStr = "";
                let awayAccuracyStr = "";
                if (isAccuratePasses) {
                  const homeTotalPasses = Number(statsForm.passes?.a) || 0;
                  const awayTotalPasses = Number(statsForm.passes?.b) || 0;
                  const hAcc = homeTotalPasses > 0 ? Math.round((valA / homeTotalPasses) * 100) : 0;
                  const aAcc = awayTotalPasses > 0 ? Math.round((valB / awayTotalPasses) * 100) : 0;
                  homeAccuracyStr = ` (${hAcc}%)`;
                  awayAccuracyStr = ` (${aAcc}%)`;
                }
              
                const boxWidthClasses = isAccuratePasses ? "w-20 sm:w-[96px]" : "w-14 sm:w-[72px]";

                return (
                  <div key={def.key} className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-white/[0.04] last:border-0 group">
                    {/* Home value */}
                    <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-emerald-500/40 shadow-[0_0_10px_rgba(34,197,94,0.05)] focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={statsForm[def.key]?.a === undefined ? "" : statsForm[def.key]?.a}
                        onChange={e => handleStatChange(def.key, 'a', e.target.value)}
                        className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-emerald-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
                      />
                      {(isAccuratePasses || isPercent) && (
                        <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-emerald-400 pr-2 whitespace-nowrap">
                          {isPercent ? '%' : homeAccuracyStr}
                        </span>
                      )}
                    </div>
              
                    {/* Center Area */}
                    <div className="flex-1 flex flex-col gap-2 sm:gap-2.5 min-w-0">
                      {/* Icons and Label */}
                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{icon}</span>
                        <span className="flex-1 text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.1em] text-slate-300 truncate px-2 font-sans">{displayLabel}</span>
                        <span className="text-slate-400 text-sm sm:text-base shrink-0 opacity-70">{icon}</span>
                      </div>
                      
                      {/* Dual-color Progress Bar */}
                      <div className="flex items-center h-1.5 sm:h-2 w-full gap-1 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500 ease-out rounded-l-full" style={{ width: `${homePercent}%` }} />
                        <div className="h-full bg-rose-600 transition-all duration-500 ease-out rounded-r-full" style={{ width: `${awayPercent}%` }} />
                      </div>
                    </div>
              
                    {/* Away value */}
                    <div className={`relative shrink-0 flex items-center justify-center rounded-[10px] bg-[#0a0c14]/50 border border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.05)] focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-400/40 transition-all ${boxWidthClasses} h-10 sm:h-12`}>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={statsForm[def.key]?.b === undefined ? "" : statsForm[def.key]?.b}
                        onChange={e => handleStatChange(def.key, 'b', e.target.value)}
                        className={`w-full h-full bg-transparent outline-none font-score font-bold text-sm sm:text-base tabular-nums text-rose-400 ${isAccuratePasses || isPercent ? 'text-right pr-1' : 'text-center'}`}
                      />
                      {(isAccuratePasses || isPercent) && (
                        <span className="font-score font-bold text-[9px] sm:text-[11px] tabular-nums text-rose-400 pr-2 whitespace-nowrap">
                          {isPercent ? '%' : awayAccuracyStr}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action bar */}
            <div className="px-4 sm:px-6 pb-4 pt-2 flex gap-3 border-t border-white/[0.04]">
              <Btn variant="ghost" onClick={() => setIsEditingStats(false)} disabled={saving} className="flex-1 h-11 rounded-xl border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5">
                Cancel
              </Btn>
              <ShinyButton onClick={saveStats} loading={saving} className="flex-[2] h-11 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm shadow-[0_0_20px_rgba(244,63,94,0.3)]">
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
          aria-controls="player-listbox"
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
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'png' ? 'bg-pitch text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
        >
          Trophy PNGs
        </button>
        <button
          onClick={() => setMode('custom')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${mode === 'custom' ? 'bg-pitch text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
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
                  <Check size={9} className="text-foreground" strokeWidth={3} />
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
      className="relative group rounded-2xl border border-white/[0.05] bg-background dark:bg-[#12151b] overflow-hidden shadow-xl aspect-[3/4] flex flex-col"
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

      <div className="p-3 bg-card/40 backdrop-blur-sm border-t border-white/[0.05] flex items-center justify-between relative z-20 mt-auto">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">Awarded</span>
          <span className="text-xs font-score text-foreground/80">{trophy.season}</span>
        </div>
        {trophy.player && (
          <div className="flex items-center gap-1.5 bg-white/5 rounded-full pl-1.5 pr-2.5 py-1 border border-border shadow-sm">
            <Avatar p={trophy.player} size={16} />
            <span className="text-[10px] font-bold truncate max-w-[70px]">{trophy.player.name}</span>
          </div>
        )}
      </div>

      {/* Overlay Actions */}
      {!hideActions && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 z-30 pointer-events-none group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0">
          <Btn variant="outline" className="w-32 bg-white/10 hover:bg-white/20 border-border dark:border-white/20 text-foreground rounded-xl gap-2 shadow-lg h-9 text-xs" onClick={(e) => { e.stopPropagation(); onEdit(trophy); }}>
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
            className="fixed inset-0 bg-secondary/70 dark:bg-black/60 backdrop-blur-sm z-[100]"
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

  const handleRetrigger = async (id) => {
    const res = await retriggerCelebration(id);
    if (res.error) showToast(res.error);
    else showToast("✨ Sparkles triggered!");
  };

  return (
    <div className="flex flex-col gap-6">
      <Tabs defaultValue="award" className="w-full">
        <TabsList className="mb-6 w-full md:w-auto mx-auto flex md:inline-flex bg-[#0f1115]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[inset_0_2px_15px_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.5)] overflow-x-auto hide-scrollbar">
          <TabsTrigger 
            value="award" 
            className="flex-1 md:flex-none transition-all duration-300 rounded-xl px-5 py-3 text-[11px] sm:text-sm font-bold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600/30 data-[state=active]:to-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-[0_0_20px_rgba(245,158,11,0.2)] data-[state=active]:border data-[state=active]:border-amber-500/50 text-muted-foreground hover:text-foreground"
          >
            🛠️ The Forge
          </TabsTrigger>
          <TabsTrigger 
            value="celebrations" 
            className="flex-1 md:flex-none transition-all duration-300 rounded-xl px-5 py-3 text-[11px] sm:text-sm font-bold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600/30 data-[state=active]:to-red-500/10 data-[state=active]:text-red-400 data-[state=active]:shadow-[0_0_20px_rgba(239,68,68,0.2)] data-[state=active]:border data-[state=active]:border-red-500/50 text-muted-foreground hover:text-foreground"
          >
            🔴 Live Control
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex-1 md:flex-none transition-all duration-300 rounded-xl px-5 py-3 text-[11px] sm:text-sm font-bold whitespace-nowrap data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600/30 data-[state=active]:to-amber-500/10 data-[state=active]:text-amber-400 data-[state=active]:shadow-[0_0_20px_rgba(245,158,11,0.2)] data-[state=active]:border data-[state=active]:border-amber-500/50 text-muted-foreground hover:text-foreground"
          >
            📜 Legacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="award" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative bg-background p-6 rounded-3xl border border-border/50 shadow-2xl">
            {/* Form Section */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Trophy size={20} className="text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-foreground">Mint Trophy</h2>
                  <p className="text-xs text-muted-foreground font-medium">Create and issue permanent awards to players.</p>
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block text-muted-foreground text-xs font-bold uppercase tracking-widest">Iconic Awards</Label>
                <div className="flex flex-wrap gap-3">
                  {TROPHY_TEMPLATES.map(a => (
                    <button
                      key={a.id}
                      onClick={() => applyTemplate(a)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border hover:border-amber-500/50 hover:bg-amber-500/10 transition-all group"
                    >
                      <span className="w-6 h-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                        {a.icon && (a.icon.startsWith('/') || a.icon.startsWith('http')) ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={a.icon} alt={a.name} className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-xl">{a.icon}</span>
                        )}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-amber-400">{a.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Recipient</Label>
                  <PlayerCombobox players={players} value={form.playerId} onChange={v => setForm({...form, playerId: v})} />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Title</Label>
                  <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="bg-black/50 border-border text-foreground font-bold" placeholder="e.g. Golden Boot" />
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Season</Label>
                  <Input value={form.season} onChange={e => setForm({...form, season: e.target.value})} className="bg-black/50 border-border text-foreground font-bold" placeholder="e.g. Season 1" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Icon Emoji / URL</Label>
                  <TrophyIconPicker value={form.icon} onChange={v => setForm({...form, icon: v})} />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-2 block">Description</Label>
                  <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-black/50 border-border text-foreground" placeholder="e.g. Top goalscorer with 25 goals." />
                </div>
              </div>

              <button
                onClick={handleAward}
                disabled={isAwarding || isCelebrating}
                className={`mt-4 w-full py-6 rounded-xl font-black uppercase tracking-[0.2em] text-lg sm:text-xl transition-all relative overflow-hidden group ${
                  isAwarding || isCelebrating ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black hover:scale-[1.02] shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)]'
                }`}
              >
                {!(isAwarding || isCelebrating) && (
                  <div className="absolute inset-0 w-full h-full bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}
                {isAwarding ? 'INITIALIZING...' : isCelebrating ? 'TRANSMITTING!' : '🚀 LAUNCH BROADCAST'}
              </button>
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center sticky lg:top-24 h-max min-h-[350px] sm:min-h-[450px] bg-black/40 rounded-2xl border border-white/5 p-6 overflow-hidden relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Broadcast Preview</span>
              </div>
              
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15),transparent_70%)] rounded-2xl pointer-events-none" />
              
              {/* Fake particles for broadcast vibe */}
              <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                 {[...Array(6)].map((_, i) => (
                    <div key={i} className={`absolute w-1.5 h-1.5 bg-amber-400 rounded-full animate-float-${(i%3)+1}`} style={{ left: `${(i * 37 + 15) % 100}%`, top: `${(i * 73 + 25) % 100}%`, animationDelay: `${i*0.5}s` }} />
                 ))}
              </div>

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
                className="relative z-10 w-full max-w-[320px] perspective-1000 mt-6"
                animate={isCelebrating ? { 
                  scale: [1, 1.15, 1], 
                  rotateY: [0, 15, -15, 0],
                  rotateX: [0, 10, -10, 0]
                } : {
                  rotateY: [-5, 5, -5],
                  rotateX: [2, -2, 2],
                  y: [-5, 5, -5]
                }}
                transition={isCelebrating ? { duration: 1.5, ease: "easeInOut" } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <BorderBeam size={150} duration={8} delay={0} colorFrom="#f59e0b" colorTo="transparent" className="rounded-2xl z-40 opacity-70 pointer-events-none" />
                <div className="shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl">
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
                </div>
              </motion.div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="bg-[#0f1115]/80 p-6 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            {/* Museum lighting effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-500/10 blur-[100px] pointer-events-none" />
            
            <SectionTitle icon={History}>Legacy Vault</SectionTitle>
            <p className="text-sm text-muted-foreground mb-8">
              A museum of all permanent trophies awarded throughout history.
            </p>
            {trophies.length === 0 ? (
              <EmptyState text="No trophies awarded yet." />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {trophies.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring', damping: 20 }}
                    whileHover={{ y: -10, scale: 1.05 }}
                    className="relative group cursor-pointer perspective-1000"
                  >
                    {/* Pedestal shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/50 blur-xl rounded-[100%] transition-opacity group-hover:opacity-100 opacity-50" />
                    
                    {/* Glass case border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-white/5 group-hover:border-amber-500/50 transition-colors z-20 pointer-events-none mix-blend-overlay" />
                    
                    <div className="shadow-2xl rounded-2xl overflow-hidden bg-black/50 backdrop-blur-sm">
                      <TrophyTradingCard
                        trophy={{ ...t, player: t.player || players.find(p => p.id === t.playerId) }}
                        onEdit={(trophyData) => setEditTarget(trophyData)}
                        onRevoke={(trophyData) => setRevokeTarget(trophyData)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="celebrations" className="space-y-6">
          <div className="bg-[#0f1115]/90 rounded-3xl p-6 border border-red-500/20 shadow-[0_20px_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
            {/* Control Room Red Scanner Effect */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,1)] animate-scan pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-red-500/20">
              <SectionTitle icon={Megaphone} className="text-red-100">Live Broadcast Control</SectionTitle>
              <div className="flex items-center gap-2 px-4 py-1.5 mt-4 sm:mt-0 rounded-full text-xs font-black tracking-widest bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                SYSTEM ACTIVE
              </div>
            </div>
            
            <p className="text-sm text-red-200/60 mb-6 font-mono">
              Monitor and override active 24-hour celebration banners appearing on player dashboards.
            </p>

            {celebrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-red-500/20 rounded-2xl bg-black/40">
                <span className="text-4xl mb-3 opacity-30 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">📡</span>
                <p className="text-red-400/50 font-black tracking-widest uppercase">No Active Transmissions</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`relative p-5 rounded-2xl border-2 transition-all overflow-hidden ${
                        isActive ? 'bg-black/80 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' : 'bg-black/40 border-white/5 opacity-50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-600 text-white text-[10px] font-black tracking-widest rounded-bl-2xl shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                          TRANSMITTING
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-5 mt-2">
                        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-3xl border border-white/10 shadow-inner">
                          {c.trophy.icon && (c.trophy.icon.startsWith('/') || c.trophy.icon.startsWith('http')) ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={c.trophy.icon} className="w-9 h-9 object-contain filter drop-shadow-md" alt="" />
                          ) : (
                            <span>{c.trophy.icon || '🏆'}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-red-50 text-base leading-tight tracking-wide">{c.trophy.title}</h4>
                          <div className="flex items-center gap-2 mt-1.5 bg-white/5 px-2 py-1 rounded-md w-max">
                            <Avatar p={c.trophy.player} size={16} />
                            <span className="text-xs text-red-200/80 font-bold uppercase tracking-wider">{c.trophy.player.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 mt-6 pt-5 border-t border-red-500/20">
                        {isActive ? (
                          <div className="flex items-center justify-between bg-red-950/30 px-3 py-2 rounded-lg border border-red-500/10">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Time Remaining</span>
                            <span className="font-mono text-red-400 font-bold text-sm tracking-widest drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
                              {String(hLeft).padStart(2,'0')}:{String(mLeft).padStart(2,'0')}:{String(sLeft).padStart(2,'0')}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-white/5 px-3 py-2 rounded-lg text-center">
                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">
                              {c.status === 'ended_early' ? 'TERMINATED' : 'EXPIRED'}
                            </span>
                          </div>
                        )}

                        {isActive && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEndCelebration(c.id)}
                              className="flex-1 py-2.5 bg-red-950 hover:bg-red-600 border border-red-800 hover:border-red-500 text-red-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] group"
                            >
                              <div className="w-2 h-2 bg-red-500 group-hover:bg-white rounded-full shadow-[0_0_8px_rgba(239,68,68,1)]" />
                              Kill Switch
                            </button>
                            <button
                              onClick={() => handleRetrigger(c.id)}
                              className="flex-1 py-2.5 bg-amber-950/50 hover:bg-amber-600 border border-amber-800/50 hover:border-amber-500 text-amber-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              ✨ Trigger Sparkles
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
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
        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
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
        : 'bg-white/5 text-muted-foreground border-transparent hover:bg-white/10'
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
        : 'bg-secondary dark:bg-zinc-900 text-muted-foreground border-border dark:border-zinc-700 hover:text-muted-foreground hover:border-zinc-500'
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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  const handlePost = async () => {
    if (!form.title || !form.content) return showToast("Title and Content required.");
    setLoading(true);
    const res = await createAnnouncement(form);
    if (res.error) showToast(res.error);
    else { showToast("Announcement posted!"); setForm({ title: "", content: "" }); }
    setLoading(false);
  };

  const handleUpdate = async () => {
    if (!editForm.title || !editForm.content) return showToast("Title and Content required.");
    setLoading(true);
    const res = await updateAnnouncement(editingId, editForm);
    if (res.error) showToast(res.error);
    else { showToast("Announcement updated!"); setEditingId(null); }
    setLoading(false);
  };

  const handleRemove = async (id) => {
    setLoading(true);
    const res = await deleteAnnouncement(id);
    if (res.error) showToast(res.error);
    else showToast("Announcement removed.");
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4 sm:p-6 border-white/[0.05] shadow-lg">
        <SectionTitle icon={Megaphone}>Post Announcement</SectionTitle>
        <div className="grid gap-4 mt-6">
          <div>
            <Label className="text-muted-foreground mb-1.5 block">Title</Label>
            <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. BB FREE SQUAD TOURNAMENT" className="bg-background/50" />
          </div>
          <div>
            <Label className="text-muted-foreground mb-1.5 block">Message</Label>
            <div className="max-w-full overflow-hidden">
              <RichTextEditor 
                value={form.content} 
                onChange={val => setForm({...form, content: val})} 
              />
            </div>
          </div>
        </div>
        <ShinyButton 
          className={cn(
            "mt-6 w-full sm:w-auto transition-all duration-300", 
            (!form.title || !form.content) ? "opacity-50 cursor-not-allowed saturate-0" : "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          )} 
          onClick={handlePost} 
          loading={loading}
          disabled={!form.title || !form.content}
        >
          Publish
        </ShinyButton>
      </Card>

      <div className="flex flex-col gap-4">
        <AnimatePresence>
          {announcements?.map((a, i) => {
            const isEditing = editingId === a.id;

            return (
              <motion.div 
                key={a.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: isEditing ? 0 : i * 0.05 }}
              >
                <div className={cn(
                  "p-5 md:p-6 flex flex-col gap-4 rounded-2xl border transition-all duration-300", 
                  isEditing ? "bg-card border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] ring-1 ring-amber-500/20" : "bg-black/20 border-white/[0.05] hover:border-white/10"
                )}>
                  {isEditing ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                        <div className="flex items-center gap-2 text-amber-500 text-sm font-bold tracking-wider uppercase">
                          <Pencil size={16} />
                          <span>Editing Announcement</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-muted-foreground mb-1.5 block">Title</Label>
                        <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" className="bg-background/50" />
                      </div>
                      <div>
                        <Label className="text-muted-foreground mb-1.5 block">Message</Label>
                        <div className="max-w-full overflow-hidden">
                          <RichTextEditor 
                            value={editForm.content} 
                            onChange={val => setEditForm({...editForm, content: val})} 
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-3 mt-2">
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <Btn variant="outline" className="border-white/10 text-gray-400 hover:text-white" disabled={loading}>Cancel</Btn>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content className="z-50 p-4 bg-popover border border-border rounded-xl shadow-2xl w-64" sideOffset={8}>
                              <p className="text-sm text-foreground mb-4">Discard unsaved changes?</p>
                              <div className="flex gap-2 justify-end">
                                <Popover.Close asChild>
                                  <Btn variant="outline" size="sm">No</Btn>
                                </Popover.Close>
                                <Popover.Close asChild>
                                  <Btn variant="danger" size="sm" onClick={() => setEditingId(null)}>Discard</Btn>
                                </Popover.Close>
                              </div>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                        <ShinyButton 
                          onClick={handleUpdate} 
                          loading={loading} 
                          disabled={!editForm.title || !editForm.content}
                          className={(!editForm.title || !editForm.content) ? "opacity-50 cursor-not-allowed saturate-0" : ""}
                        >
                          Save Changes
                        </ShinyButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-5">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/10 gap-1.5 py-0.5 shadow-[0_0_10px_rgba(245,158,11,0.1)] rounded-full">
                            <Eye size={12} />
                            Preview
                          </Badge>
                          <span className="text-xs text-muted-foreground">Published</span>
                        </div>
                        <div className="font-black text-lg md:text-xl text-white tracking-wide uppercase mb-3">{a.title}</div>
                        <div 
                          className="text-sm md:text-[15px] text-gray-300 leading-relaxed max-w-none 
                            [&_p]:mb-3 last:[&_p]:mb-0 
                            [&_ul]:list-none [&_ul]:mb-3 [&_ul]:pl-1 
                            [&_li]:relative [&_li]:pl-5 [&_li]:mb-1.5 
                            [&_li::before]:content-[''] [&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[8px] [&_li::before]:w-1.5 [&_li::before]:h-1.5 [&_li::before]:bg-amber-500 [&_li::before]:rounded-full [&_li::before]:shadow-[0_0_5px_rgba(245,158,11,0.5)]
                            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol_li::before]:hidden [&_ol_li]:pl-1
                            [&_strong]:text-white [&_strong]:font-[700]
                            [&_h1]:text-2xl [&_h1]:font-black [&_h1]:mb-4 [&_h1]:text-white
                            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-white
                            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-white
                            [&_a]:text-amber-500 [&_a]:hover:underline" 
                          dangerouslySetInnerHTML={{ __html: a.content }}
                        />
                      </div>
                      <div className="flex items-start gap-2 shrink-0 md:border-l md:border-white/[0.05] md:pl-5">
                        <Btn 
                          variant="outline" 
                          className="border-white/10 text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/5 h-10 w-10 p-0 rounded-lg flex items-center justify-center transition-all" 
                          onClick={() => { setEditingId(a.id); setEditForm({ title: a.title, content: a.content }); }}
                          title="Edit Announcement"
                        >
                          <Pencil size={18} />
                        </Btn>
                        <Popover.Root>
                          <Popover.Trigger asChild>
                            <Btn 
                              variant="outline" 
                              className="border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all h-10 w-10 p-0 rounded-lg flex items-center justify-center"
                              title="Delete Announcement"
                            >
                              <Trash2 size={18} />
                            </Btn>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content className="z-50 p-4 bg-popover border border-border rounded-xl shadow-2xl w-64" sideOffset={8} align="end">
                              <p className="text-sm text-foreground mb-4">Delete this announcement permanently?</p>
                              <div className="flex gap-2 justify-end">
                                <Popover.Close asChild>
                                  <Btn variant="outline" size="sm">Cancel</Btn>
                                </Popover.Close>
                                <Popover.Close asChild>
                                  <Btn variant="danger" size="sm" onClick={() => handleRemove(a.id)}>Delete</Btn>
                                </Popover.Close>
                              </div>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}



export function AdminSeason({ activeSeason, seasons = [], matches = [], players = [], showToast, setTab }) {
  const [name, setName] = useState("");
  const [seasonType, setSeasonType] = useState("League (Single)");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [customRules, setCustomRules] = useState({ win: 3, draw: 1, loss: 0, goalsFor: 0, goalsAgainst: 0, squadType: 'None' });
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

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState("");

  const [showAwardsCeremony, setShowAwardsCeremony] = useState(false);
  const [awardSelections, setAwardSelections] = useState({});

  const handleIssueAwardsAndEndSeason = async () => {
    // 1. Validate all trophies have a player selected
    for (const t of TROPHY_TEMPLATES) {
      if (!awardSelections[t.id]) {
        return showToast(`Please select a player for ${t.name}`);
      }
    }

    if (!confirm("Are you sure you want to issue these awards and archive the season?")) return;
    setLoading(true);

    try {
      const trophiesToCreate = TROPHY_TEMPLATES.map(t => ({
        playerId: awardSelections[t.id],
        title: t.name,
        season: activeSeason.name,
        description: t.defaultDesc,
        icon: t.image
      }));

      for (const trophyData of trophiesToCreate) {
        await awardTrophy(trophyData);
      }

      const championId = standings[0]?.id;
      const runnerUpId = standings[1]?.id;
      const thirdId = standings[2]?.id;
      const mvpId = awardSelections['mvp']; 

      const res = await completeSeason(activeSeason.id, {
          championId, runnerUpId, thirdId, mvpId, championName: standings[0]?.name, trophies: []
      });

      if (res.error) showToast(res.error);
      else { 
        showToast("Awards Issued & Season Archived!"); 
        setTab("admin-overview"); 
        setShowAwardsCeremony(false);
      }
    } catch (err) {
      showToast("Error ending season.");
    }
    setLoading(false);
  };

  const handleUpdateSeason = async () => {
    if (!editName.trim()) return showToast("Enter a season name");
    setLoading(true);
    const res = await updateSeason(activeSeason.id, { name: editName, type: editType });
    if (res.error) showToast(res.error);
    else { 
      showToast("Season updated!"); 
      setShowEditDialog(false); 
    }
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
      { id: 'Single Elimination', title: 'Single Elim Bracket', icon: '⚡', desc: 'Straight Knockout' },
      { id: 'Double Elimination', title: 'Double Elim Bracket', icon: '🛡️', desc: 'Upper & Lower Bracket' },
    ];
    
    const squadTypes = [
      { id: 'None', title: 'Standard', desc: 'Any squad allowed' },
      { id: 'MAX Squad', title: 'MAX Squad', desc: 'No restrictions, ultimate teams' },
      { id: 'FREE EPIC Squad', title: 'FREE EPIC', desc: 'Only free epic players' },
      { id: 'AUTHENTIC Squad', title: 'AUTHENTIC', desc: 'Real-life default teams' },
      { id: 'NATIONAL Squad', title: 'NATIONAL', desc: 'Single nation teams' },
      { id: 'LIMIT Squad', title: 'LIMIT Squad', desc: 'Rating capped teams' },
    ];
    
    return (
      <div className="flex flex-col w-full h-full">
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
          
          <div className="space-y-3">
            <Label className="text-muted-foreground uppercase text-xs font-bold tracking-widest">Squad Requirement</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {squadTypes.map(st => (
                <div 
                  key={st.id}
                  onClick={() => setCustomRules({...customRules, squadType: st.id})}
                  className={`p-2 rounded-lg border cursor-pointer transition-all flex flex-col justify-center items-center text-center gap-1 ${
                    customRules.squadType === st.id ? 'border-pitch-bright bg-pitch-bright/10 shadow-sm' : 'border-border/50 bg-secondary/20 hover:border-border'
                  }`}
                >
                  <span className="font-bold text-xs">{st.title}</span>
                  <span className="text-[9px] text-muted-foreground leading-tight">{st.desc}</span>
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
      </div>
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
  players.forEach(p => table[p.id] = { id: p.id, name: p.name, player: p, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  
  completedMatches.forEach(m => {
    const h = table[m.homeId];
    const a = table[m.awayId];
    if (!h || !a) return;
    
    h.p++; a.p++;
    h.gf += m.homeScore; a.gf += m.awayScore;
    h.ga += m.awayScore; a.ga += m.homeScore;
    
    const isPlayoff = m.round !== 'league' && m.round !== 'friendly';
    
    if (isPlayoff) {
      if (m.homeScore > m.awayScore || m.penaltyWinner === 'home') {
        h.w++; h.pts += 3; a.l++;
      } else if (m.homeScore < m.awayScore || m.penaltyWinner === 'away') {
        a.w++; a.pts += 3; h.l++;
      } else {
        h.d++; a.d++; h.pts++; a.pts++;
      }
    } else {
      if (m.homeScore > m.awayScore) { h.w++; h.pts += 3; a.l++; }
      else if (m.homeScore < m.awayScore) { a.w++; a.pts += 3; h.l++; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
    }
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
    <div className="flex flex-col w-full h-full gap-6">
      {/* Quick Actions Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-secondary/10 p-2 rounded-2xl border border-white/5 w-full">
        <button 
          onClick={!hasFixtures ? handleGenerateFixtures : () => showToast("Fixtures already exist")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border ${!hasFixtures ? 'bg-gold/10 hover:bg-gold/20 text-foreground border-transparent hover:border-gold/20' : 'bg-gold/5 text-gold/60 border-gold/5 cursor-not-allowed hover:bg-gold/10'}`}
        >
          <Calendar size={16} className={!hasFixtures ? 'text-gold' : 'text-gold/60'} />
          <span className="text-xs sm:text-sm font-bold tracking-wide">Generate Fixtures</span>
        </button>
        
        <button 
          onClick={() => {
            setEditName(activeSeason.name);
            setEditType(activeSeason.type || "League (Single)");
            setShowEditDialog(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pitch-bright/10 hover:bg-pitch-bright/20 border border-transparent hover:border-pitch-bright/20 text-foreground transition-all"
        >
          <Edit2 size={16} className="text-pitch-bright" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">Edit Season</span>
        </button>
        
        <button 
          onClick={() => setTab && setTab("admin/matches")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-claret/10 hover:bg-claret/20 border border-transparent hover:border-claret/20 text-foreground transition-all"
        >
          <Swords size={16} className="text-claret" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">Manage Playoffs</span>
        </button>

        <button 
          onClick={async () => {
            const res = await adminTriggerBracketProgress(activeSeason.id);
            if (res.error) showToast(res.error);
            else showToast("✅ Bracket Synced Successfully!");
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-transparent hover:border-emerald-500/20 text-foreground transition-all"
        >
          <RefreshCw size={16} className="text-emerald-500" />
          <span className="text-xs sm:text-sm font-bold tracking-wide text-emerald-500">Force Sync Bracket</span>
        </button>

        {activeSeason.type?.includes("Playoffs") && isCompleted && (
          <button 
            onClick={async () => {
               const tMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league" && m.status === "completed");
               const top4 = standings.slice(0, 4).map(s => s.id);
               if (top4.length < 4) return showToast("Not enough players for playoffs (need 4)");
               
               const res = await generatePlayoffs(activeSeason.id, top4);
               if (res.error) showToast(res.error);
               else { showToast("Playoff bracket generated!"); setTab("admin/matches"); }
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 border border-transparent hover:border-gold/20 text-foreground transition-all"
          >
            <Swords size={16} className="text-gold" />
            <span className="text-xs sm:text-sm font-bold tracking-wide">Start Playoffs</span>
          </button>
        )}
        
        <button 
          onClick={async () => {
              if (!isCompleted && !confirm("League phase is not 100% complete. End and archive anyway?")) return;
              if (activeSeason.type?.includes("Playoffs")) {
                const playoffMatches = matches.filter(m => m.seasonId === activeSeason.id && m.round !== "league");
                const incompletePlayoffs = playoffMatches.filter(m => m.status !== "completed");
                if (playoffMatches.length === 0) return showToast("Please start and finish playoffs first.");
                if (incompletePlayoffs.length > 0) return showToast("Finish all playoff matches first.");
              }

              if (!confirm("Are you ready to begin the Awards Ceremony?")) return;
              
              // Pre-fill selections
              const prefilled = {};
              if (standings.length > 0) prefilled['bb-championship'] = standings[0].id;
              
              // Calculate Golden Boot based on goals (rough estimate from standings)
              const topScorer = [...standings].sort((a,b) => b.gf - a.gf)[0];
              if (topScorer) prefilled['golden-boot'] = topScorer.id;

              setAwardSelections(prefilled);
              setShowAwardsCeremony(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted-foreground/10 hover:bg-muted-foreground/20 border border-transparent hover:border-white/10 text-foreground transition-all ml-auto"
        >
          <Archive size={16} className="text-muted-foreground" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">End Season</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
           <Card className="p-6 flex-1 w-full">
             <div className="overflow-x-auto">
               <div className="hidden md:block">
                 <StandingsTable 
                   matches={matches} 
                   players={players} 
                   seasonId={activeSeason.id} 
                   config={activeSeason.config} 
                   headerLeft={
                     <div className="flex flex-col gap-1 px-2">
                       <SectionTitle icon={ListOrdered} className="mb-0">League Standings</SectionTitle>
                       <div className="text-[11px] font-score text-muted-foreground flex items-center gap-2 uppercase tracking-widest font-bold">
                          <div className="w-1.5 h-1.5 rounded-full bg-success"></div> Top 4 Qualify
                       </div>
                     </div>
                   }
                 />
               </div>
               
               {/* Mobile Card View */}
               <div className="block md:hidden mt-4">
                 <MobileStandingsList matches={matches} players={players} activeSeason={activeSeason} />
               </div>
             </div>
           </Card>

          <Card className="p-0 overflow-hidden flex-1 flex flex-col w-full border-border/50 bg-background shadow-2xl rounded-3xl relative">
            {/* Header Area */}
            <div className="relative p-6 sm:p-8 bg-gradient-to-br from-secondary/50 via-background to-background border-b border-white/5">
              <div className="absolute top-0 right-0 p-32 bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
                <div>
                  <SectionTitle icon={Calendar} className="mb-0 text-xl sm:text-2xl font-black tracking-tight">Upcoming Fixtures</SectionTitle>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 font-medium">Manage and review the next scheduled matches.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                  {upcoming.length > 0 && (
                    <Btn 
                      onClick={() => {
                        const text = upcoming.map(m => {
                          const h = players.find(p => p.id === m.homeId);
                          const a = players.find(p => p.id === m.awayId);
                          return `${h?.name || 'TBD'} vs ${a?.name || 'TBD'}`;
                        }).join('\n');
                        navigator.clipboard.writeText(text);
                        showToast("Fixtures copied to clipboard!");
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary/80 hover:bg-secondary text-foreground text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-white/5 shadow-sm active:scale-95 transition-all"
                    >
                      <Copy size={16} /> Copy Fixtures
                    </Btn>
                  )}
                  <Btn variant="ghost" className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider p-2.5 bg-background hover:bg-secondary/50 rounded-xl border border-white/5 transition-colors" onClick={() => setTab && setTab("admin-matches")}>
                    View all <ArrowRight size={14} className="opacity-70"/>
                  </Btn>
                </div>
              </div>
            </div>
            
            {/* Fixtures List */}
            <div className="flex-1 flex flex-col p-4 sm:p-6 bg-secondary/10">
               {upcoming.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                   {upcoming.map((m, i) => {
                     const h = players.find(p => p.id === m.homeId);
                     const a = players.find(p => p.id === m.awayId);
                     
                     return (
                       <motion.div 
                         initial={{ opacity: 0, y: 15 }} 
                         animate={{ opacity: 1, y: 0 }} 
                         transition={{ delay: Math.min(i * 0.05, 0.5) }} 
                         key={m.id} 
                         className="group relative flex flex-col p-4 sm:p-5 rounded-2xl bg-background border border-white/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden"
                       >
                          {/* Live Indicator Accent */}
                          {m.status === 'live' && <div className="absolute top-0 left-0 w-full h-1 bg-claret/80"></div>}
                          
                          <div className="flex justify-between items-center w-full gap-2 relative z-10">
                            {/* Home Team */}
                            <div className="flex flex-col items-center flex-1 min-w-0 gap-2">
                               <Avatar p={h} size={48} className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-secondary shadow-sm" />
                               <span className="font-bold text-xs sm:text-sm text-center truncate w-full px-1">{h?.name || 'TBD'}</span>
                            </div>
                            
                            {/* VS Badge */}
                            <div className="flex flex-col items-center justify-center px-1 shrink-0">
                               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-secondary/80 flex items-center justify-center border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                                 <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">VS</span>
                               </div>
                               {m.status === 'live' && (
                                 <div className="mt-2 text-[9px] text-claret font-black tracking-widest uppercase flex items-center justify-center gap-1.5 bg-claret/10 px-2 py-0.5 rounded-full border border-claret/20 animate-pulse">
                                   <span className="w-1.5 h-1.5 rounded-full bg-claret"></span> Live
                                 </div>
                               )}
                            </div>
                            
                            {/* Away Team */}
                            <div className="flex flex-col items-center flex-1 min-w-0 gap-2">
                               <Avatar p={a} size={48} className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-secondary shadow-sm" />
                               <span className="font-bold text-xs sm:text-sm text-center truncate w-full px-1">{a?.name || 'TBD'}</span>
                            </div>
                          </div>
                       </motion.div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                      <Calendar size={32} className="text-muted-foreground opacity-50" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{hasFixtures ? "All Matches Completed" : "No Fixtures"}</h3>
                    <p className="text-sm text-muted-foreground max-w-[250px]">{hasFixtures ? "The league has been fully played out." : "Generate fixtures to populate the match schedule."}</p>
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


      {showEditDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
            onClick={() => !loading && setShowEditDialog(false)}
          />
          {/* Modal Content */}
          <div className="relative bg-background border border-border shadow-2xl rounded-xl w-full max-w-[425px] p-6 z-10 flex flex-col gap-2">
            <button 
              className="absolute right-4 top-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity hover:bg-secondary/50 text-muted-foreground"
              onClick={() => setShowEditDialog(false)}
              disabled={loading}
            >
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
            <div className="flex flex-col space-y-1.5 mb-2">
              <h2 className="text-xl font-bold font-heading tracking-tight leading-none">Edit Season</h2>
              <p className="text-sm text-muted-foreground mt-1.5">Update the season name and format.</p>
            </div>
            <div className="grid gap-4 py-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-name">Season Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Summer Cup 2026"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-type">Season Format</Label>
                <select 
                  id="edit-type"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pitch-bright"
                >
                  <option value="League (Single)">League (Single)</option>
                  <option value="League (Double)">Double League</option>
                  <option value="League + Playoffs (Single)">League + Playoffs (Single)</option>
                  <option value="Single Elimination">Single Elimination</option>
                  <option value="Double Elimination">Double Elimination</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-4">
              <Btn variant="outline" onClick={() => setShowEditDialog(false)} disabled={loading} className="mt-2 sm:mt-0">Cancel</Btn>
              <ShinyButton onClick={handleUpdateSeason} loading={loading}>Save Changes</ShinyButton>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showAwardsCeremony} onOpenChange={setShowAwardsCeremony}>
        <DialogContent className="sm:max-w-2xl bg-secondary/95 border border-border/50 backdrop-blur-md">
          <DialogHeader className="text-center pb-4 border-b border-border/30">
            <div className="mx-auto w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mb-4">
              <Trophy size={32} className="text-gold" />
            </div>
            <DialogTitle className="font-heading text-3xl text-gold font-black tracking-widest uppercase">
              The Awards Ceremony
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select the winners for this season&apos;s official premium trophies.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 space-y-6 max-h-[60vh] overflow-y-auto px-2">
            {TROPHY_TEMPLATES.map(t => (
              <div key={t.id} className="flex flex-col sm:flex-row gap-4 items-center bg-background/50 p-4 rounded-xl border border-border/30 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${t.colorTheme}`}></div>
                <div className="w-16 h-16 shrink-0 relative">
                   <div className={`absolute inset-0 bg-gradient-to-br ${t.colorTheme} blur-lg opacity-20 rounded-full`}></div>
                   <Image src={t.image} alt={t.name} fill sizes="64px" className="object-contain relative z-10 drop-shadow-md" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                   <h4 className="font-heading font-bold text-lg">{t.name}</h4>
                   <p className="text-xs text-muted-foreground">{t.defaultDesc}</p>
                </div>
                <div className="w-full sm:w-48 shrink-0">
                   <select 
                     className="w-full h-10 px-3 bg-background border border-border rounded-md text-sm focus:border-pitch-bright focus:outline-none"
                     value={awardSelections[t.id] || ""}
                     onChange={(e) => setAwardSelections({...awardSelections, [t.id]: e.target.value})}
                   >
                     <option value="" disabled>Select Winner...</option>
                     {players.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                     ))}
                   </select>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter className="pt-4 border-t border-border/30">
            <DialogClose asChild><Btn variant="outline" disabled={loading}>Cancel</Btn></DialogClose>
            <ShinyButton 
              onClick={handleIssueAwardsAndEndSeason} 
              className="px-8 shadow-[0_0_15px_rgba(255,215,0,0.3)] bg-gradient-to-r from-gold to-yellow-500 text-black border-0"
              loading={loading}
            >
              Issue Awards & Archive Season
            </ShinyButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
              label="Create / Delete Players" 
              desc="Allow the manager to add new players or delete them." 
            />
          </div>
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
            <Toggle 
              checked={permissions.canManageProfiles} 
              onChange={v => update('canManageProfiles', v)} 
              label="Edit Player Profiles" 
              desc="Allow the manager to update player avatars, names, and bio stats." 
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


