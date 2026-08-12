'use client';

import Image from 'next/image';

import { PageHeader } from '@/app/components/shared/PageHeader';
import React, { useState, useRef } from 'react';
import { Camera, KeyRound, Shield, CheckCircle2, Flame, Eye, EyeOff, Settings, Bell, BellOff, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label, Btn } from '@/app/components/shared/UI';
import dynamic from 'next/dynamic';

import { TeamCombobox, DisplayBadgeToggle, AvatarWithBadge, KitCard } from '@/app/components/shared/FootballIdentity';
import ProfileIdCard from '@/app/components/shared/ProfileIdCard';
import { ClubLogo } from '@/app/components/shared/ClubLogo';
import { WavingFlag } from '@/app/components/shared/UI';
import { MagicCard } from '@/app/components/magicui/MagicCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';
import { clearAuthCookie } from '@/app/actions/auth';
import { updateAppTheme } from '@/pwa/components/AppThemeProvider';

import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { CLUB_COLORS } from '@/lib/data/club-colors';

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

        <TabsContent value="profile" className="space-y-8">
          <ProfileIdCard me={me} form={form} setForm={setForm} showToast={showToast} />


          <MagicCard gradientColor={`${(CLUB_COLORS && form.favoriteClub ? (CLUB_COLORS[clubsData.find(c => c.name === form.favoriteClub)?.slug]?.primary || 'rgba(56, 189, 248, 0.15)') : 'rgba(56, 189, 248, 0.1)')}`}>
            <Card className="bg-transparent border-none shadow-none">
               <CardHeader className="pb-4 border-b border-border/30">
                 <CardTitle className="text-xl flex items-center gap-2"><Shield className="text-sky-500" size={20}/> Football Identity</CardTitle>
                 <p className="text-sm text-muted-foreground mt-1">Select your favorite real-world teams to show them off on your profile.</p>
               </CardHeader>
               <CardContent className="pt-6">
                 <KitCard form={form} setForm={setForm} />
               </CardContent>
            </Card>
          </MagicCard>

          <div className="flex justify-end pt-8 pb-12 max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:bg-background/85 max-md:backdrop-blur-xl max-md:border-t max-md:border-border max-md:p-4 max-md:pb-[calc(env(safe-area-inset-bottom)+16px)] max-md:z-50">
            <Btn variant="primary" onClick={saveProfile} disabled={isSaving} className="px-8 font-semibold shadow-md max-md:w-full h-12">
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
