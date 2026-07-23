'use client';

import React, { useState, useRef } from 'react';
import { Camera, KeyRound, Shield, CheckCircle2, Flame, Eye, EyeOff, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label, Btn } from './UI';
import SearchableLogoPicker from './SearchableLogoPicker';
import AvatarUpload from './AvatarUpload';
import { MagicCard } from './magicui/MagicCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';

import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

export default function SettingsView({ me, showToast }) {
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
  const [coverFailedUrl, setCoverFailedUrl] = useState(null);

  // Cover photo upload states
  const fileInputRef = useRef(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  const saveProfile = async () => {
    setIsSaving(true);
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
    const res = await changePlayerPassword(me.id, pwd);
    if (res.error) showToast(res.error);
    else { showToast("Password updated ✓"); setPwd(""); setPwd2(""); }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverUploading(true);
      setCoverProgress(0);
      
      const interval = setInterval(() => {
        setCoverProgress(prev => (prev >= 90 ? 90 : prev + 15));
      }, 200);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/user/cover', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Upload failed');
        
        clearInterval(interval);
        setCoverProgress(100);
        
        await updatePlayerProfile(me.id, { coverBanner: data.url });
        
        setForm({ ...form, coverBanner: data.url });
      } catch (err) {
        clearInterval(interval);
        showToast(err.message || 'Cover upload failed');
      } finally {
        setTimeout(() => setCoverUploading(false), 500);
      }
    }
  };

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

  const selectedClub = clubs.find(c => c.name === form.favoriteClub);
  const selectedNationalTeam = nationalTeams.find(nt => nt.name === form.flag);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-4xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 px-1">
        <Settings className="text-muted-foreground" size={28} />
        <h1 className="text-3xl font-black font-display tracking-tight">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <MagicCard>
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="text-pitch-bright" size={18}/> Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col gap-8">
                
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <Label className="mb-1 text-xs opacity-70">Avatar</Label>
                    <AvatarUpload me={me} form={form} setForm={setForm} showToast={showToast} />
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs opacity-70">Cover Photo</Label>
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-secondary/50 border border-dashed border-border/50 group flex items-center justify-center">
                        {form.coverBanner && coverFailedUrl !== form.coverBanner ? (
                          <img src={form.coverBanner} alt="Cover Banner" className="w-full h-full object-cover" onError={() => setCoverFailedUrl(form.coverBanner)} />
                        ) : (
                          <div className="text-xs text-muted-foreground">No cover photo set</div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                          {coverUploading ? (
                            <div className="w-3/4 flex flex-col items-center gap-2">
                              <Progress value={coverProgress} className="h-2 w-full bg-secondary" />
                              <span className="text-[10px] text-white font-bold">{coverProgress}%</span>
                            </div>
                          ) : (
                            <Btn variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 font-semibold">
                              <Camera size={16} /> {form.coverBanner ? 'Change Cover' : 'Upload Cover'}
                            </Btn>
                          )}
                        </div>
                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label>Display Name</Label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="focus-visible:ring-pitch-bright bg-background/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Username</Label>
                    <Input value={me.username} disabled className="opacity-50 cursor-not-allowed font-mono bg-secondary/30" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <Label>Bio</Label>
                      <span className="text-[10px] text-muted-foreground">{form.bio.length}/150</span>
                    </div>
                    <Textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value.substring(0, 150)})} placeholder="Tell us about your playstyle..." className="min-h-[100px] resize-none focus-visible:ring-pitch-bright bg-background/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nationality (Emoji)</Label>
                    <Input value={form.nationality} onChange={e => setForm({...form, nationality: e.target.value})} placeholder="e.g. 🇧🇷" className="text-xl focus-visible:ring-pitch-bright bg-background/50" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </MagicCard>

          <MagicCard gradientColor="rgba(56, 189, 248, 0.1)">
            <Card className="bg-transparent border-none shadow-none">
               <CardHeader className="pb-4 border-b border-border/30">
                 <CardTitle className="text-xl flex items-center gap-2"><Shield className="text-sky-500" size={20}/> Football Identity</CardTitle>
                 <p className="text-sm text-muted-foreground mt-1">Select your favorite real-world teams to show them off on your profile.</p>
               </CardHeader>
               <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-6">
                   <SearchableLogoPicker label="Favorite Club" items={clubs} value={form.favoriteClub} onChange={(val) => setForm({...form, favoriteClub: val})} placeholder="Search Club..." />
                   <SearchableLogoPicker label="Favorite National Team" items={nationalTeams} value={form.flag} onChange={(val) => setForm({...form, flag: val})} placeholder="Search National Team..." />
                 </div>
                 
                 <div className="flex flex-col">
                    <Label className="mb-3 block text-xs opacity-70">Preview</Label>
                    <div className="flex-1 flex items-center justify-center gap-4 bg-secondary/20 rounded-xl p-4 border border-border/50 h-full">
                      {selectedClub ? (
                        <div className="flex flex-col items-center gap-2 w-24 text-center">
                          {selectedClub.logo_url && <img src={selectedClub.logo_url} alt={selectedClub.name} className="w-12 h-12 object-contain drop-shadow-md" />}
                          <span className="text-xs font-bold leading-tight">{selectedClub.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-24 text-center opacity-30">
                          <div className="w-12 h-12 rounded-full bg-secondary border border-border border-dashed flex items-center justify-center"><Shield size={20}/></div>
                          <span className="text-xs font-bold">No Club</span>
                        </div>
                      )}
                      <div className="text-xs font-black italic opacity-30 px-2">VS</div>
                      {selectedNationalTeam ? (
                        <div className="flex flex-col items-center gap-2 w-24 text-center">
                          {selectedNationalTeam.flag_url && <img src={selectedNationalTeam.flag_url} alt={selectedNationalTeam.name} className="w-12 h-12 object-contain drop-shadow-md" />}
                          <span className="text-xs font-bold leading-tight">{selectedNationalTeam.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 w-24 text-center opacity-30">
                          <div className="w-12 h-12 rounded-full bg-secondary border border-border border-dashed flex items-center justify-center"><Shield size={20}/></div>
                          <span className="text-xs font-bold">No Nation</span>
                        </div>
                      )}
                    </div>
                 </div>
               </CardContent>
            </Card>
          </MagicCard>

          <div className="flex justify-end pt-4 pb-12">
            <Btn variant="primary" onClick={saveProfile} disabled={isSaving} className="px-8 font-semibold shadow-md">
              {isSaving ? "Saving..." : "Save Profile"}
            </Btn>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <MagicCard gradientColor="rgba(239, 68, 68, 0.1)">
            <Card className="bg-transparent border-none shadow-none max-w-md">
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
                
                <motion.div animate={pwdError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} className="pt-2">
                  <Btn variant="outline" className="w-full border-border/50 hover:bg-secondary/50 bg-background/50" onClick={savePassword}>Update Password</Btn>
                </motion.div>
              </CardContent>
            </Card>
          </MagicCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <MagicCard>
            <Card className="bg-transparent border-none shadow-none text-center py-12">
              <Settings className="mx-auto mb-4 text-muted-foreground opacity-50" size={48} />
              <h3 className="text-lg font-semibold mb-2">Preferences</h3>
              <p className="text-muted-foreground text-sm">Theme and notification settings coming soon.</p>
            </Card>
          </MagicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
