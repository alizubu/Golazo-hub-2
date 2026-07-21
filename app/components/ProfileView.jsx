'use client';

import React, { useState, useEffect } from 'react';
import { Camera, KeyRound, Trophy, Calendar, CheckCircle2, Shield, Flame, Activity, Eye, EyeOff, Lock } from 'lucide-react';
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
import competitionsData from '@/lib/data/competitions.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));
const competitions = competitionsData.map(comp => ({ ...comp, subtitle: comp.type }));

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
    favoriteCompetition: me.favoriteCompetition || ""
  });
  
  const [pwd, setPwd] = useState(""); 
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pwdError, setPwdError] = useState(false);

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

  return (
    <div className="relative flex flex-col gap-8 pb-10 max-w-6xl mx-auto min-h-screen">
      {/* Background Particles */}
      <Particles className="absolute inset-0 -z-10 opacity-30" quantity={80} color="#29C179" />

      {/* 1. Hero Profile Card */}
      <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{duration:0.4}}>
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl group">
          {/* Cover Banner */}
          <div className="h-48 md:h-64 w-full relative bg-secondary/50 group-hover:bg-secondary transition-colors overflow-hidden">
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
            
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Input 
                value={form.coverBanner} 
                onChange={e => setForm({...form, coverBanner: e.target.value})} 
                placeholder="Paste Banner URL..."
                className="w-56 h-9 text-xs bg-black/60 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus-visible:ring-pitch-bright"
              />
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 relative z-10">
              
              <AvatarUpload me={me} form={form} setForm={setForm} />
              
              <div className="flex-1 pb-2">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-black font-display tracking-tight flex items-center gap-3">
                      {form.name} 
                      {form.nationality && <span className="text-2xl" title="Nationality">{form.nationality}</span>}
                    </h1>
                    <div className="text-muted-foreground font-mono mt-1 flex items-center gap-2">
                      @{me.username} 
                      <span className="text-xs opacity-50">•</span>
                      <span className="text-xs uppercase tracking-wider font-semibold">Member since {new Date(me.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Last Active</div>
                      <div className="text-sm font-semibold flex items-center gap-1.5 justify-end">
                        <Activity size={14} className="text-green-500" /> Just now
                      </div>
                    </div>
                    <ShimmerButton onClick={saveProfile} disabled={isSaving} className="shrink-0 font-semibold" shimmerColor="#29C179" background="var(--card)">
                      {isSaving ? "Saving..." : "Save Profile"}
                    </ShimmerButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Info & Identity */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1, duration:0.4}}>
            <Card className="bg-secondary/20 backdrop-blur-md border-border/50 shadow-lg">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="text-pitch-bright" size={18}/> Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-5">
                <div className="space-y-1.5">
                  <Label>Display Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-semibold focus-visible:ring-pitch-bright" />
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
                    className="min-h-[100px] resize-none focus-visible:ring-pitch-bright bg-secondary/50 transition-colors focus:bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nationality (Emoji)</Label>
                  <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="e.g. 🇧🇷" className="text-xl focus-visible:ring-pitch-bright" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2, duration:0.4}}>
            <Card className="border-red-500/20 shadow-lg bg-card/80">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><KeyRound className="text-claret" size={18}/> Account Security</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 grid gap-5">
                <div className="space-y-1.5 relative">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} className="pr-10 focus-visible:ring-claret" />
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
                    <Input type={showPwd2 ? "text" : "password"} value={pwd2} onChange={e => setPwd2(e.target.value)} className="pr-10 focus-visible:ring-claret" />
                    <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                
                <motion.div animate={pwdError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }}>
                  <Btn variant="outline" className="w-full border-border/50 hover:bg-secondary/50" onClick={savePassword}>Update Password</Btn>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Identity & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.15, duration:0.4}}>
            <Card className="bg-gradient-to-br from-card to-secondary/30 relative overflow-hidden border-border/50 shadow-lg">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-pitch/5 rounded-full blur-3xl pointer-events-none"></div>
               <CardHeader className="pb-4">
                 <CardTitle className="text-xl flex items-center gap-2"><Shield className="text-pitch-bright" size={20}/> Football Identity</CardTitle>
                 <p className="text-sm text-muted-foreground">Select your favorite real-world teams and competitions to show them off on your profile.</p>
               </CardHeader>
               
               <CardContent className="grid md:grid-cols-2 gap-6 relative z-10">
                 <div>
                   <SearchableLogoPicker 
                      label="Favorite Club"
                      items={clubs} 
                      value={form.favoriteClub} 
                      onChange={(val) => setForm({...form, favoriteClub: val})}
                      placeholder="Search Club..."
                   />
                 </div>
                 
                 <div>
                    <SearchableLogoPicker 
                      label="Favorite National Team"
                      items={nationalTeams} 
                      value={form.flag}
                      onChange={(val) => setForm({...form, flag: val})}
                      placeholder="Search National Team..."
                   />
                 </div>

                 <div className="md:col-span-2">
                    <SearchableLogoPicker 
                      label="Favorite Competition"
                      items={competitions} 
                      value={form.favoriteCompetition} 
                      onChange={(val) => setForm({...form, favoriteCompetition: val})}
                      placeholder="Search Competition..."
                   />
                 </div>
               </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.25, duration:0.4}}>
            <Card className="shadow-lg border-border/50 bg-card/80 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2"><Activity className="text-pitch-bright" size={20}/> Player Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                  
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
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.35, duration:0.4}}>
            <Card className="shadow-lg border-border/50 bg-card/80">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2"><Trophy className="text-gold" size={20}/> Trophy Cabinet</CardTitle>
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
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
                  {myTrophies.length > 0 ? myTrophies.map((t) => (
                    <TrophyCard key={t.id} trophy={t} unlocked />
                  )) : null}
                  
                  {/* Locked Trophies Placeholders */}
                  {[
                    { title: "League Champion", type: "🏆", desc: "Win the top flight division." },
                    { title: "Golden Boot", type: "👟", desc: "Score the most goals in a season." },
                    { title: "Golden Glove", type: "🧤", desc: "Keep the most clean sheets." },
                    { title: "MVP", type: "⭐", desc: "Awarded to the best overall player." }
                  ].map((placeholder, i) => (
                    <TrophyCard key={i} trophy={placeholder} unlocked={false} />
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
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
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <motion.div 
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0 }
          }}
          className={`relative flex flex-col items-center justify-center p-5 border rounded-2xl text-center cursor-help transition-all ${
            unlocked 
              ? 'bg-gradient-to-b from-gold/15 to-transparent border-gold/30 shadow-lg shadow-gold/5 group hover:-translate-y-1 hover:border-gold/60' 
              : 'bg-secondary/20 border-border/50 grayscale opacity-50 hover:opacity-80'
          }`}
        >
          {unlocked && (
            <Badge className="absolute -top-2 -right-2 bg-pitch-bright hover:bg-pitch-bright text-white shadow-md animate-bounce px-1.5 py-0 text-[9px]">NEW</Badge>
          )}
          {!unlocked && (
            <Lock className="absolute top-2 right-2 text-muted-foreground/50" size={12} />
          )}
          <div className="text-5xl mb-3 drop-shadow-md transition-transform group-hover:scale-110">{trophy.icon || trophy.type}</div>
          <div className="font-bold text-sm leading-tight text-foreground">{trophy.title}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-semibold">
            {unlocked ? trophy.season || "Unlocked" : "Locked"}
          </div>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="center" className="w-64 bg-card/95 backdrop-blur shadow-xl border-border">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold">{trophy.title}</h4>
          <p className="text-xs text-muted-foreground">
            {trophy.description || trophy.desc}
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
