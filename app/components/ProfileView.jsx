'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, KeyRound, Trophy, Calendar, CheckCircle2, Shield, Flame, Activity, Eye, EyeOff, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SectionTitle, Label, Btn } from './UI';
import { NumberTicker } from './ui/number-ticker';
import SearchableLogoPicker from './SearchableLogoPicker';
import AvatarUpload from './AvatarUpload';

// Magic UI
import { ShimmerButton } from './magicui/ShimmerButton';
import { Meteors } from './magicui/Meteors';
import { BorderBeam } from './magicui/BorderBeam';
import { Particles } from './magicui/Particles';
import { MagicCard } from './magicui/MagicCard';

// Shadcn UI
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Badge } from '@/app/components/ui/badge';
import { Skeleton } from '@/app/components/ui/skeleton';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/app/components/ui/hover-card';

// Static Data
import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

export default function ProfileView({ me, showToast, trophies = [], matches = [], players = [] }) {
  const [form, setForm] = useState({ 
    name: me.name || "", 
    teamName: me.teamName || "", 
    avatar: me.avatar || "", 
    avatarImage: me.avatarImage || "", 
    coverBanner: me.coverBanner || "",
    flag: me.flag || "", 
    teamLogo: me.teamLogo || "",
    bio: me.bio || "",
    nationality: me.nationality || "",
    favoriteClub: me.favoriteClub || "",
  });
  
  const [pwd, setPwd] = useState(""); 
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const fileInputRef = useRef(null);

  const saveProfile = async () => {
    setIsSaving(true);
    const { updatePlayerProfile } = await import('@/app/actions/player');
    const res = await updatePlayerProfile(me.id, form);
    setIsSaving(false);
    if (res.error) showToast(res.error);
    else showToast("Profile updated ✓");
  };

  const savePassword = async () => {
    if (pwd !== pwd2) {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 500);
      return showToast("Passwords don't match");
    }
    const { changePlayerPassword } = await import('@/app/actions/player');
    const res = await changePlayerPassword(me.id, pwd);
    if (res.error) showToast(res.error);
    else { showToast("Password updated ✓"); setPwd(""); setPwd2(""); }
  };

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm({ ...form, coverBanner: url });
    }
  };

  const handleCoverDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm({ ...form, coverBanner: url });
    }
  };

  // Compute Player Statistics
  const myMatches = matches.filter(m => m.status === 'completed' && (m.homeId === me.id || m.awayId === me.id));
  const played = myMatches.length;
  let won = 0;
  let goals = 0;
  
  myMatches.forEach(m => {
    const isHome = m.homeId === me.id;
    const myScore = isHome ? m.homeScore : m.awayScore;
    const oppScore = isHome ? m.awayScore : m.homeScore;
    goals += (myScore || 0);
    
    if (myScore > oppScore) won++;
    else if (myScore === oppScore && m.penaltyWinner) {
      if ((isHome && m.penaltyWinner === "home") || (!isHome && m.penaltyWinner === "away")) {
        won++;
      }
    }
  });

  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;
  const myTrophies = trophies.filter(t => t.playerId === me.id);
  const elo = 1200 + (won * 15);
  const assists = me.assists || Math.round(goals * 0.4);

  // Password Strength
  const getPwdStrength = () => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length > 5) s += 25;
    if (pwd.length > 8) s += 25;
    if (/[A-Z]/.test(pwd)) s += 25;
    if (/[0-9]/.test(pwd)) s += 25;
    return s;
  };
  const pwdStrength = getPwdStrength();
  
  // Fake loading state for stats to show Skeleton
  const [statsLoaded, setStatsLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setStatsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const selectedClub = clubs.find(c => c.name === form.favoriteClub);
  const selectedNationalTeam = nationalTeams.find(nt => nt.name === form.flag);

  return (
    <div className="relative flex flex-col gap-8 pb-10 max-w-6xl mx-auto min-h-screen">
      {/* Background Particles */}
      <Particles className="absolute inset-0 -z-10 opacity-30" quantity={80} color="#29C179" />

      {/* 1. Hero Profile Card */}
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl group flex flex-col">
          {/* Cover Banner */}
          <div 
            className="h-48 md:h-64 w-full relative bg-secondary/50 transition-colors overflow-hidden flex-shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCoverDrop}
          >
            {form.coverBanner ? (
              <img src={form.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pitch/80 via-claret/60 to-gold/40 flex items-center justify-center relative">
                 <Meteors number={15} />
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                 <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                 >
                   <span className="text-6xl drop-shadow-2xl">⚽</span>
                 </motion.div>
              </div>
            )}
            
            {/* Hover Overlay for Upload */}
            <motion.div 
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm z-10"
              initial={false}
            >
              <Btn variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 font-semibold">
                <Camera size={18} /> Change Cover
              </Btn>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleCoverUpload}
              />
            </motion.div>

            {form.coverBanner && (
              <button 
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-md transition-colors opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setForm({...form, coverBanner: ""});
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Profile Info Overlay - Bottom Bar */}
          <div className="px-6 md:px-10 pb-8 pt-4 relative bg-card flex-1">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start relative z-20">
              
              <div className="-mt-20 md:-mt-24 relative z-30">
                <AvatarUpload me={me} form={form} setForm={setForm} />
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full pt-2">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-black font-display tracking-tight flex items-center justify-center md:justify-start gap-3">
                    {form.name} 
                    {form.nationality && <span className="text-2xl" title="Nationality">{form.nationality}</span>}
                    <Badge className="bg-gold hover:bg-gold/90 text-gold-foreground font-bold shadow-sm px-1.5 py-0.5 text-xs"><Flame size={12} className="mr-1"/> #1</Badge>
                  </h1>
                  <div className="text-muted-foreground font-mono mt-2 flex flex-wrap items-center justify-center md:justify-start gap-2">
                    @{me.username} 
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                      Member since {new Date(me.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-center justify-center md:justify-end gap-3 md:items-end">
                  <div className="text-right flex flex-col items-center md:items-end">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Last Active</div>
                    <div className="text-sm font-semibold flex items-center gap-2 justify-end">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      Just now
                    </div>
                  </div>
                  <ShimmerButton onClick={saveProfile} disabled={isSaving} className="shrink-0 font-semibold shadow-md overflow-hidden relative group" shimmerColor="#29C179" background="var(--card)">
                    <span className="relative z-10 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg outline-none group-focus-visible:ring-0">
                      {isSaving ? "Saving..." : "Save Profile"}
                    </span>
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bento Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
        initial="hidden"
        animate="show"
      >
        
        {/* Row 1: Personal Info */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-1 md:col-span-2">
          <MagicCard>
            <Card className="h-full bg-transparent border-none shadow-none">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="text-pitch-bright" size={18}/> Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-5">
                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-semibold focus-visible:ring-pitch-bright bg-background/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Username</Label>
                  <Input value={me.username} disabled className="opacity-50 cursor-not-allowed font-mono bg-secondary/30" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label>Bio</Label>
                    <span className="text-[10px] text-muted-foreground">{form.bio.length}/150</span>
                  </div>
                  <Textarea 
                    value={form.bio} 
                    onChange={e => setForm({...form, bio: e.target.value.substring(0, 150)})} 
                    placeholder="Tell us about your playstyle..."
                    className="min-h-[100px] resize-none focus-visible:ring-pitch-bright bg-background/50 transition-colors focus:bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nationality (Emoji)</Label>
                  <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="e.g. 🇧🇷" className="text-xl focus-visible:ring-pitch-bright bg-background/50" />
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        </motion.div>

        {/* Row 1: Football Identity */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-1 md:col-span-2">
          <MagicCard gradientColor="rgba(56, 189, 248, 0.1)">
            <Card className="h-full bg-transparent border-none shadow-none relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
               <CardHeader className="pb-4">
                 <CardTitle className="text-xl flex items-center gap-2"><Shield className="text-sky-500" size={20}/> Football Identity</CardTitle>
                 <p className="text-sm text-muted-foreground">Select your favorite real-world teams to show them off on your profile.</p>
               </CardHeader>
               
               <CardContent className="flex flex-col gap-6 relative z-10 pt-2">
                 <SearchableLogoPicker 
                    label="Favorite Club"
                    items={clubs} 
                    value={form.favoriteClub} 
                    onChange={(val) => setForm({...form, favoriteClub: val})}
                    placeholder="Search Club..."
                 />
                 
                 <SearchableLogoPicker 
                    label="Favorite National Team"
                    items={nationalTeams} 
                    value={form.flag}
                    onChange={(val) => setForm({...form, flag: val})}
                    placeholder="Search National Team..."
                 />

                 {/* Live Preview Strip */}
                 <div className="mt-2 pt-4 border-t border-border/30">
                    <Label className="mb-3 block text-center text-xs opacity-70">Your Identity</Label>
                    <div className="flex items-center justify-center gap-4 bg-secondary/20 rounded-xl p-4 border border-border/50">
                      {selectedClub ? (
                        <div className="flex flex-col items-center gap-2 w-24 text-center">
                          {selectedClub.logo_url && <img src={selectedClub.logo_url} alt={selectedClub.name} className="w-10 h-10 object-contain drop-shadow-md" />}
                          <span className="text-[10px] font-bold leading-tight">{selectedClub.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-24 text-center opacity-30">
                          <div className="w-10 h-10 rounded-full bg-secondary border border-border border-dashed flex items-center justify-center"><Shield size={16}/></div>
                          <span className="text-[10px] font-bold">No Club</span>
                        </div>
                      )}
                      
                      <div className="text-xs font-black italic opacity-30 px-2">VS</div>
                      
                      {selectedNationalTeam ? (
                        <div className="flex flex-col items-center gap-2 w-24 text-center">
                          {selectedNationalTeam.flag_url && <img src={selectedNationalTeam.flag_url} alt={selectedNationalTeam.name} className="w-10 h-10 object-contain drop-shadow-md" />}
                          <span className="text-[10px] font-bold leading-tight">{selectedNationalTeam.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-24 text-center opacity-30">
                          <div className="w-10 h-10 rounded-full bg-secondary border border-border border-dashed flex items-center justify-center"><Shield size={16}/></div>
                          <span className="text-[10px] font-bold">No Nation</span>
                        </div>
                      )}
                    </div>
                 </div>
               </CardContent>
            </Card>
          </MagicCard>
        </motion.div>

        {/* Row 2: Account Security */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-1">
          <MagicCard gradientColor="rgba(239, 68, 68, 0.1)">
            <Card className="h-full bg-transparent border-none shadow-none">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><KeyRound className="text-claret" size={18}/> Account Security</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid gap-5">
                <div className="space-y-1.5 relative">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} className="pr-10 focus-visible:ring-claret bg-background/50" />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength Indicator */}
                  <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      className={`h-full ${pwdStrength < 50 ? 'bg-red-500' : pwdStrength < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pwdStrength}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 relative">
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Input type={showPwd2 ? "text" : "password"} value={pwd2} onChange={e => setPwd2(e.target.value)} className="pr-10 focus-visible:ring-claret bg-background/50" />
                    <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <motion.div animate={pwdError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} className="mt-auto pt-4">
                  <Btn variant="outline" className="w-full border-border/50 hover:bg-secondary/50 bg-background/50" onClick={savePassword}>Update Password</Btn>
                </motion.div>
              </CardContent>
            </Card>
          </MagicCard>
        </motion.div>

        {/* Row 2: Player Stats */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-1 md:col-span-1 lg:col-span-3">
          <MagicCard gradientColor="rgba(250, 204, 21, 0.1)">
            <Card className="h-full bg-transparent border-none shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2"><Activity className="text-pitch-bright" size={20}/> Player Statistics</CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2 h-[calc(100%-2rem)]">
                  
                  {/* Highlighted Stat */}
                  <Card className="relative overflow-hidden bg-gradient-to-br from-gold/10 to-transparent border-gold/20 flex flex-col items-center justify-center text-center p-6 group hover:border-gold/50 transition-colors shadow-none">
                    <BorderBeam size={150} duration={8} delay={1} colorFrom="var(--gold)" colorTo="transparent" />
                    <Label className="text-gold/80 mb-1 z-10">Current Rank</Label>
                    <div className="text-4xl font-black font-mono text-gold z-10 drop-shadow-md">#1</div>
                  </Card>

                  <StatCard label="ELO Rating" value={elo} loaded={statsLoaded} />
                  <StatCard label="Matches" value={played} loaded={statsLoaded} />
                  
                  <Card className="relative overflow-hidden bg-secondary/30 border-border/50 flex flex-col items-center justify-center text-center p-6 group hover:border-border transition-colors shadow-none">
                    <Label className="mb-2">Win Rate</Label>
                    {statsLoaded ? (
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-secondary-foreground/10 stroke-current"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <motion.path
                            className="text-pitch-bright stroke-current"
                            strokeWidth="3"
                            strokeDasharray={`${winRate}, 100`}
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            initial={{ strokeDasharray: "0, 100" }}
                            animate={{ strokeDasharray: `${winRate}, 100` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
                          <NumberTicker value={winRate} />%
                        </div>
                      </div>
                    ) : (
                      <Skeleton className="w-16 h-16 rounded-full" />
                    )}
                  </Card>

                  <StatCard label="Goals" value={goals} loaded={statsLoaded} />
                  <StatCard label="Assists" value={assists} loaded={statsLoaded} />

                </div>
              </CardContent>
            </Card>
          </MagicCard>
        </motion.div>

        {/* Row 3: Trophy Cabinet */}
        <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="col-span-full">
          <MagicCard gradientColor="rgba(251, 191, 36, 0.15)">
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="pb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground"><Trophy className="text-gold" size={20}/> Trophy Cabinet</h3>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
                  }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                >
                  {[
                    { id: "bb-champion", name: "BB Champion", image: "/assets/trophies/BB-Champion.png", locked: true },
                    { id: "world-cup", name: "World Cup Winner", image: "/assets/trophies/World-Cup-Winner-Trophy.png", locked: true },
                    { id: "golden-boot", name: "Golden Boot", image: "/assets/trophies/Golden-boot.png", locked: true },
                    { id: "mvp", name: "MVP", image: "/assets/trophies/MVP.png", locked: true },
                    { id: "la-liga", name: "La Liga Champion", image: "/assets/trophies/La-Liga-trophy.png", locked: true },
                    { id: "premier-league", name: "Premier League Champion", image: "/assets/trophies/Premier-League.png", locked: true },
                  ].map((tr) => {
                    const isUnlocked = myTrophies.some(t => t.title === tr.name || t.id === tr.id) || !tr.locked;
                    return <TrophyCard key={tr.id} trophy={tr} unlocked={isUnlocked} />;
                  })}
                </motion.div>
              </CardContent>
            </Card>
          </MagicCard>
        </motion.div>

      </motion.div>
    </div>
  );
}

function StatCard({ label, value, loaded }) {
  return (
    <Card className="bg-secondary/30 border-border/50 flex flex-col items-center justify-center text-center p-6 shadow-none group hover:border-border transition-colors">
      <Label className="mb-2">{label}</Label>
      {loaded ? (
        <NumberTicker value={value} className="text-3xl font-bold font-mono text-foreground" />
      ) : (
        <Skeleton className="h-9 w-20" />
      )}
    </Card>
  );
}

function TrophyCard({ trophy, unlocked }) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.div 
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
          className={`relative flex flex-col items-center p-5 border rounded-2xl text-center cursor-help transition-all group overflow-hidden h-full ${
            unlocked 
              ? 'bg-gradient-to-b from-gold/15 to-transparent border-gold/30 shadow-lg shadow-gold/5 hover:-translate-y-1 hover:border-gold/60' 
              : 'bg-secondary/20 border-border/50 hover:bg-secondary/30'
          }`}
        >
          {unlocked && (
            <>
              <BorderBeam size={100} duration={8} delay={0} colorFrom="var(--gold)" colorTo="transparent" />
              <Badge className="absolute -top-2 -right-2 bg-pitch-bright hover:bg-pitch-bright text-white shadow-md animate-bounce px-1.5 py-0 text-[9px] z-10">NEW</Badge>
            </>
          )}
          
          <div className="mb-3 relative w-20 h-20 flex items-center justify-center shrink-0">
            {!imgLoaded && <Skeleton className="absolute inset-0 rounded-xl" />}
            
            <motion.img 
              src={trophy.image} 
              alt={trophy.name}
              className={`w-full h-full object-contain drop-shadow-md z-10 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${!unlocked ? 'grayscale opacity-[0.45]' : ''}`}
              whileHover={{ scale: 1.08, rotate: [-2, 2, -2, 2, 0] }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => {
                e.target.style.display = 'none';
                setImgLoaded(true); // Hide skeleton
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
            
            {/* Fallback if image fails */}
            <div className="hidden absolute inset-0 items-center justify-center text-5xl transition-transform group-hover:scale-110 opacity-30 grayscale">
              🏆
            </div>

            {/* Dark overlay & Lock for locked state */}
            {!unlocked && imgLoaded && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <Lock className="text-foreground/80 drop-shadow-md bg-background/50 p-1.5 rounded-full backdrop-blur-sm" size={28} />
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col justify-between items-center w-full">
            <div className="font-bold text-sm leading-tight text-foreground relative z-10 mb-2">{trophy.name}</div>
            
            <div className="mt-auto">
              {!unlocked ? (
                <Badge variant="outline" className="bg-background text-[9px] font-bold px-1.5 py-0 border-border shadow-sm z-10">LOCKED</Badge>
              ) : (
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold relative z-10">
                  Unlocked
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-64 bg-card/95 backdrop-blur shadow-xl border-border z-50">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{trophy.name}</h4>
          <p className="text-xs text-muted-foreground">
            {trophy.desc || `Win the ${trophy.name} to unlock this achievement.`}
          </p>
          {!unlocked && (
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-pitch-bright font-bold mt-2 pt-2 border-t border-border/50">
              <Lock size={10} /> Keep playing to unlock
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
