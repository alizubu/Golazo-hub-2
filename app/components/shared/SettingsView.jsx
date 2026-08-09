'use client';

import Image from 'next/image';

import { PageHeader } from '@/app/components/shared/PageHeader';
import React, { useState, useRef } from 'react';
import { Camera, KeyRound, Shield, CheckCircle2, Flame, Eye, EyeOff, Settings, Bell, BellOff, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label, Btn } from '@/app/components/shared/UI';
import dynamic from 'next/dynamic';

import { TeamCombobox, DisplayBadgeToggle, AvatarWithBadge } from '@/app/components/shared/FootballIdentity';
import AvatarUpload from '@/app/components/shared/AvatarUpload';
import { MagicCard } from '@/app/components/magicui/MagicCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';
import { clearAuthCookie } from '@/app/actions/auth';
import { updateAppTheme } from '@/pwa/components/AppThemeProvider';

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
    displayBadgePreference: me.displayBadgePreference || "club",
  });
  
  const [pwd, setPwd] = useState(""); 
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [coverFailedUrl, setCoverFailedUrl] = useState(null);
  const [appTheme, setAppTheme] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('golazo_app_icon');
      if (savedTheme && savedTheme !== 'default') {
        // Resolve asynchronously to avoid synchronous setState inside useEffect warning
        Promise.resolve().then(() => setAppTheme(savedTheme));
      }
      
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(reg => {
          reg.pushManager.getSubscription().then(sub => {
            if (sub) setPushEnabled(true);
          });
        });
      }
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const togglePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return showToast('Push notifications not supported by browser.');
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (pushEnabled) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe();
        setPushEnabled(false);
        showToast('Push notifications disabled.');
      } else {
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) return showToast('VAPID key not configured.');
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        
        await fetch('/api/web-push', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'subscribe',
            playerId: me.id,
            subscription
          })
        });
        
        setPushEnabled(true);
        showToast('Push notifications enabled!');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to enable push notifications.');
    }
  };

  const handleThemeChange = (themeName, color) => {
    setAppTheme(themeName);
    updateAppTheme(themeName, color);
    showToast(`App icon updated to ${themeName}`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await clearAuthCookie();
    window.location.href = '/login';
  };

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
      }, 100);

      try {
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const MAX_WIDTH = 1200;
              const MAX_HEIGHT = 400;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > MAX_WIDTH) { height = Math.round((height *= MAX_WIDTH / width)); width = MAX_WIDTH; }
              } else {
                if (height > MAX_HEIGHT) { width = Math.round((width *= MAX_HEIGHT / height)); height = MAX_HEIGHT; }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });

        clearInterval(interval);
        setCoverProgress(100);
        
        const updateRes = await updatePlayerProfile(me.id, { coverBanner: base64String });
        if (updateRes.error) throw new Error(updateRes.error);
        
        setForm({ ...form, coverBanner: base64String });
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
        <h1 className="text-3xl font-black font-heading tracking-tight">Settings</h1>
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
                          <Image src={form.coverBanner} alt="Cover Banner" fill className="object-cover" onError={() => setCoverFailedUrl(form.coverBanner)} />
                        ) : (
                          <div className="text-xs text-muted-foreground">No cover photo set</div>
                        )}
                        
                        <div className="absolute inset-0 bg-secondary/70 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                          {coverUploading ? (
                            <div className="w-3/4 flex flex-col items-center gap-2">
                              <Progress value={coverProgress} className="h-2 w-full bg-secondary" />
                              <span className="text-[10px] text-foreground font-bold">{coverProgress}%</span>
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
                    <Input value={me.username} disabled className="opacity-50 cursor-not-allowed font-score bg-secondary/30" />
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
               <CardContent className="pt-6">
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="space-y-6 flex-1 w-full">
                     <div className="space-y-2">
                       <Label>Favorite Club</Label>
                       <TeamCombobox 
                         type="club" 
                         selectedValue={form.favoriteClub} 
                         onSelect={(val) => setForm({...form, favoriteClub: val})} 
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>Favorite National Team</Label>
                       <TeamCombobox 
                         type="nation" 
                         selectedValue={form.flag} 
                         onSelect={(val) => setForm({...form, flag: val})} 
                       />
                     </div>
                     <div className="space-y-2 pt-2 border-t border-border/30">
                       <Label>Display Badge</Label>
                       <DisplayBadgeToggle 
                         value={form.displayBadgePreference} 
                         onChange={(val) => setForm({...form, displayBadgePreference: val})} 
                         disabledOption={!form.favoriteClub ? 'club' : !form.flag ? 'nation' : null} 
                       />
                       <p className="text-xs text-muted-foreground mt-1">Choose which badge displays on your public profile avatar.</p>
                     </div>
                   </div>
                   <div className="shrink-0 flex flex-col items-center gap-3 bg-secondary/20 p-6 rounded-2xl border border-border/50 self-center md:self-start md:mt-2">
                     <Label className="text-center w-full">Live Preview</Label>
                     <AvatarWithBadge 
                       player={{ 
                         avatar: form.avatar, 
                         avatarImage: form.avatarImage, 
                         flag: form.flag, 
                         favoriteClub: form.favoriteClub, 
                         displayBadgePreference: form.displayBadgePreference 
                       }} 
                       size={96} 
                     />
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

          <MagicCard gradientColor="rgba(239, 68, 68, 0.1)">
            <Card className="bg-transparent border-none shadow-none max-w-md">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2 text-destructive"><LogOut size={18}/> Sign Out</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">Log out of your Golazo Hub account on this device.</p>
                <Btn variant="outline" className="w-full border-destructive/50 hover:bg-destructive/10 text-destructive bg-background/50 flex items-center justify-center gap-2" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </Btn>
              </CardContent>
            </Card>
          </MagicCard>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <MagicCard>
            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="pb-4 border-b border-border/30">
                <CardTitle className="text-lg flex items-center gap-2"><Settings className="text-muted-foreground" size={18}/> App Personalization</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Change how Golazo Hub looks on your device.</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Label className="text-base font-semibold block mb-3">App Icon & Theme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'default', label: 'Default', color: '#09090b', preview: '/icons/golazohub.png' },
                      { id: 'red', label: 'Crimson', color: '#7f1d1d', preview: '/icons/golazohub.png' },
                      { id: 'blue', label: 'Ocean', color: '#1e3a8a', preview: '/icons/golazohub.png' },
                      { id: 'green', label: 'Pitch', color: '#14532d', preview: '/icons/golazohub.png' },
                    ].map(theme => (
                      <button 
                        key={theme.id}
                        onClick={() => handleThemeChange(theme.id, theme.color)}
                        className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${appTheme === theme.id ? 'border-pitch-bright bg-secondary/50 shadow-md ring-1 ring-pitch-bright/50' : 'border-border/50 hover:bg-secondary/30'}`}
                      >
                        <img src={theme.preview} alt={theme.label} className="w-16 h-16 rounded-2xl shadow-sm" />
                        <span className="text-xs font-semibold">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: Changing the icon updates the browser theme and shortcut immediately. If you have already installed the app to your home screen, you may need to reinstall it for the new icon to appear fully on some devices (iOS/Android limitation).
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-semibold block mb-1">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive real-time alerts for goals and matches.</p>
                    </div>
                    <Btn 
                      variant={pushEnabled ? "outline" : "primary"}
                      onClick={togglePushNotifications}
                      className="flex items-center gap-2"
                    >
                      {pushEnabled ? <><BellOff size={16} /> Disable</> : <><Bell size={16} /> Enable</>}
                    </Btn>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MagicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
