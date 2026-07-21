'use client';

import React, { useState } from 'react';
import { Camera, KeyRound, Trophy, Calendar, CheckCircle2, Shield, Flame, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn, Card, SectionTitle, Label, Input, Btn, ShinyButton, Avatar } from './UI';
import { NumberTicker } from './ui/number-ticker';
import SearchableLogoPicker from './SearchableLogoPicker';

// Import static asset libraries
import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';
import competitionsData from '@/lib/data/competitions.json';

// Map the static assets to include subtitles for the SearchableLogoPicker
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

  const saveProfile = async () => {
    // Dynamically import to avoid circular dependency issues if any
    const { updatePlayerProfile } = await import('@/app/actions/player');
    const res = await updatePlayerProfile(me.id, form);
    if (res.error) showToast(res.error);
    else showToast("Profile updated");
  };

  const savePassword = async () => {
    if (pwd !== pwd2) return showToast("Passwords don't match");
    const { changePlayerPassword } = await import('@/app/actions/player');
    const res = await changePlayerPassword(me.id, pwd);
    if (res.error) showToast(res.error);
    else { showToast("Password updated"); setPwd(""); setPwd2(""); }
  };

  // Compute Player Statistics based on match history
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
  const elo = 1200 + (won * 15); // Simple mock ELO
  const assists = me.assists || Math.round(goals * 0.4); // Mock assists if not in DB

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-6xl mx-auto">
      
      {/* 1. Hero Profile Card */}
      <FadeIn delay={0.1}>
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-2xl group">
          {/* Cover Banner */}
          <div className="h-48 md:h-64 w-full relative bg-secondary/50 group-hover:bg-secondary transition-colors">
            {form.coverBanner ? (
              <img src={form.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-pitch/80 via-claret/60 to-gold/40 flex items-center justify-center">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                 <span className="text-4xl opacity-20">⚽</span>
              </div>
            )}
            
            {/* Banner Actions Overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Input 
                value={form.coverBanner} 
                onChange={e => setForm({...form, coverBanner: e.target.value})} 
                placeholder="Paste Banner URL..."
                className="w-48 h-8 text-xs bg-black/50 backdrop-blur border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          {/* Profile Info Overlay */}
          <div className="px-6 md:px-10 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 relative z-10">
              {/* Avatar with Status indicator */}
              <div className="relative group/avatar">
                <div className="rounded-full p-1.5 bg-card shrink-0 shadow-xl inline-block relative">
                   <Avatar p={{ ...me, avatar: form.avatar, avatarImage: form.avatarImage }} size={120} ring="var(--gold)" />
                   
                   {/* Online Status Badge */}
                   <div className="absolute bottom-4 right-4 w-5 h-5 bg-green-500 border-4 border-card rounded-full" title="Online"></div>
                </div>
              </div>
              
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
                    <ShinyButton onClick={saveProfile} className="shrink-0">Save Profile</ShinyButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Info & Identity */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* 2. Personal Information */}
          <FadeIn delay={0.2}>
            <Card className="p-6 bg-secondary/20 backdrop-blur-md">
              <SectionTitle icon={CheckCircle2}>Personal Information</SectionTitle>
              <div className="flex flex-col gap-5 mt-4">
                <div>
                  <Label>Display Name</Label>
                  <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="font-semibold" />
                </div>
                <div>
                  <Label>Username</Label>
                  <Input value={me.username} disabled className="opacity-50 cursor-not-allowed font-mono" />
                </div>
                <div>
                  <Label>Bio</Label>
                  <textarea 
                    value={form.bio} 
                    onChange={e => setForm({...form, bio: e.target.value})} 
                    placeholder="Tell us about your playstyle..."
                    className="flex min-h-[100px] w-full rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nationality (Emoji)</Label>
                    <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="e.g. 🇧🇷" className="text-center text-xl" />
                  </div>
                  <div>
                    <Label>Avatar URL</Label>
                    <Input value={form.avatarImage} onChange={e => setForm({...form, avatarImage: e.target.value})} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* 6. Account Settings */}
          <FadeIn delay={0.3}>
            <Card className="p-6 border-red-500/10">
              <SectionTitle icon={KeyRound}>Account Security</SectionTitle>
              <div className="grid gap-4 mt-4">
                <div>
                  <Label>New Password</Label>
                  <Input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <Input type="password" value={pwd2} onChange={e => setPwd2(e.target.value)} />
                </div>
                <Btn variant="ghost" className="w-full mt-2" onClick={savePassword}>Update Password</Btn>
              </div>
            </Card>
          </FadeIn>
        </div>

        {/* Right Column: Identity & Stats */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* 3. Football Identity */}
          <FadeIn delay={0.4}>
            <Card className="p-6 md:p-8 bg-gradient-to-br from-card to-secondary/30 relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-pitch/5 rounded-full blur-3xl pointer-events-none"></div>
               <SectionTitle icon={Shield}>Football Identity</SectionTitle>
               <p className="text-sm text-muted-foreground mb-6">Select your favorite real-world teams and competitions to show them off on your profile.</p>
               
               <div className="grid md:grid-cols-2 gap-6 relative z-10">
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
                      value={form.flag} // Reusing 'flag' field for national team temporarily, or we could add a new field. We'll map flag to National Team.
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
               </div>
            </Card>
          </FadeIn>

          {/* 4. Player Statistics */}
          <FadeIn delay={0.5}>
            <Card className="p-6 md:p-8">
              <SectionTitle icon={Activity}>Player Statistics</SectionTitle>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                
                <div className="p-5 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-gold/50 transition-colors">
                  <div className="absolute inset-0 bg-gold/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <Label>Current Rank</Label>
                  <div className="text-4xl font-black font-mono text-gold mt-1">#1</div>
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-border/80 transition-colors">
                  <Label>ELO Rating</Label>
                  <NumberTicker value={elo} className="text-3xl font-bold font-mono mt-1 text-foreground" />
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-border/80 transition-colors">
                  <Label>Matches</Label>
                  <NumberTicker value={played} className="text-3xl font-bold font-mono mt-1 text-foreground" />
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-border/80 transition-colors">
                  <Label>Win Rate</Label>
                  <div className="text-3xl font-bold font-mono mt-1 text-pitch-bright flex items-baseline gap-1">
                    <NumberTicker value={winRate} />%
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-border/80 transition-colors">
                  <Label>Goals</Label>
                  <NumberTicker value={goals} className="text-3xl font-bold font-mono mt-1 text-foreground" />
                </div>

                <div className="p-5 rounded-2xl bg-secondary/50 border border-border flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-border/80 transition-colors">
                  <Label>Assists</Label>
                  <NumberTicker value={assists} className="text-3xl font-bold font-mono mt-1 text-foreground" />
                </div>

              </div>
            </Card>
          </FadeIn>

          {/* 5. Trophy Cabinet */}
          <FadeIn delay={0.6}>
            <Card className="p-6 md:p-8">
              <SectionTitle icon={Trophy}>Trophy Cabinet</SectionTitle>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {myTrophies.length > 0 ? myTrophies.map((t, i) => (
                  <motion.div 
                    key={t.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.2 + (i * 0.1) }}
                    className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-gold/15 to-transparent border border-gold/30 rounded-2xl text-center shadow-lg group hover:-translate-y-1 transition-transform"
                  >
                    <div className="text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">{t.icon || "🏆"}</div>
                    <div className="font-bold text-sm leading-tight text-foreground">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-semibold">{t.season}</div>
                    {t.description && <div className="text-[10px] opacity-70 mt-1">{t.description}</div>}
                  </motion.div>
                )) : (
                  <>
                    {/* Locked Trophies Placeholders */}
                    {[
                      { title: "League Champion", type: "🏆" },
                      { title: "Golden Boot", type: "👟" },
                      { title: "Golden Glove", type: "🧤" },
                      { title: "MVP", type: "⭐" }
                    ].map((placeholder, i) => (
                      <div key={i} className="flex flex-col items-center justify-center p-5 bg-secondary/20 border border-border/50 rounded-2xl text-center grayscale opacity-50">
                        <div className="text-5xl mb-3 drop-shadow-sm">{placeholder.type}</div>
                        <div className="font-bold text-sm leading-tight text-foreground">{placeholder.title}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-semibold">Locked</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Card>
          </FadeIn>

        </div>
      </div>
    </div>
  );
}
