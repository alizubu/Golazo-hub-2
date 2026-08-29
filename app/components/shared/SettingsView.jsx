'use client';

import Image from 'next/image';

import { PageHeader } from '@/app/components/shared/PageHeader';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Camera, KeyRound, Shield, CheckCircle2, Flame, Eye, EyeOff, Settings, Bell, BellOff, LogOut, Loader2, User, Palette, Lock, ChevronRight, AlertTriangle, Check, X, Undo2, Save, Circle, Smartphone, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label, Btn } from '@/app/components/shared/UI';
import dynamic from 'next/dynamic';

import { TeamCombobox, DisplayBadgeToggle, AvatarWithBadge, KitCard } from '@/app/components/shared/FootballIdentity';
import ProfileIdCard from '@/app/components/shared/ProfileIdCard';
import { ClubLogo } from '@/app/components/shared/ClubLogo';
import { WavingFlag } from '@/app/components/shared/UI';
import { MagicCard } from '@/app/components/magicui/MagicCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { updatePlayerProfile, changePlayerPassword } from '@/app/actions/player';
import { clearAuthCookie } from '@/app/actions/auth';
import { updateAppTheme } from '@/pwa/components/AppThemeProvider';

import clubsData from '@/lib/data/clubs.json';
import nationalTeamsData from '@/lib/data/national_teams.json';
import { CLUB_COLORS } from '@/lib/data/club-colors';

const clubs = clubsData.map(c => ({ ...c, subtitle: `${c.league}, ${c.country}` }));
const nationalTeams = nationalTeamsData.map(nt => ({ ...nt, subtitle: nt.confederation }));

// ─── SIDEBAR TAB CONFIG ────────────────────────────────────────────────────
const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Identity & teams' },
  { id: 'security', label: 'Security', icon: Lock, description: 'Password & access' },
  { id: 'preferences', label: 'Preferences', icon: Palette, description: 'Theme & alerts' },
];

// ─── SECTION HEADER COMPONENT ──────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, description, color = 'text-sky-500', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-start gap-3 pb-4 mb-6 border-b border-border/40"
    >
      <div className={`mt-0.5 p-2 rounded-xl bg-secondary/60 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <h3 className="text-lg font-bold font-heading tracking-tight">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
    </motion.div>
  );
}

// ─── PASSWORD REQUIREMENT ITEM ─────────────────────────────────────────────
function PwdRequirement({ met, label }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-xs"
    >
      <motion.div
        animate={{ scale: met ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.25 }}
      >
        {met ? (
          <Check size={14} className="text-pitch-bright" />
        ) : (
          <Circle size={14} className="text-muted-foreground/40" />
        )}
      </motion.div>
      <span className={met ? 'text-foreground font-medium' : 'text-muted-foreground'}>{label}</span>
    </motion.div>
  );
}

// ─── THEME OPTION CARD ─────────────────────────────────────────────────────
function ThemeOptionCard({ theme, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
        isActive
          ? 'border-pitch-bright bg-pitch-bright/8 shadow-lg shadow-pitch-bright/10 ring-1 ring-pitch-bright/30'
          : 'border-border/40 hover:border-border hover:bg-secondary/30'
      }`}
    >
      {/* Active indicator badge */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pitch-bright flex items-center justify-center shadow-md"
          >
            <Check size={12} className="text-white" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon preview with color tint */}
      <div
        className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md ring-1 ring-black/10"
        style={{ backgroundColor: theme.color }}
      >
        <img src={theme.preview} alt={theme.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Color dot + label */}
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20" style={{ backgroundColor: theme.color }} />
        <span className="text-xs font-bold tracking-wide">{theme.label}</span>
      </div>
    </motion.button>
  );
}

// ─── NOTIFICATION TOGGLE ───────────────────────────────────────────────────
function NotificationToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
        enabled ? 'bg-pitch-bright' : 'bg-secondary'
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
      >
        {enabled ? <Bell size={12} className="text-pitch" /> : <BellOff size={12} className="text-muted-foreground" />}
      </motion.div>
    </button>
  );
}


// ─── MAIN SETTINGS VIEW ────────────────────────────────────────────────────
export default function SettingsView({ me, showToast }) {
  const [activeTab, setActiveTab] = useState('profile');
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pwdError, setPwdError] = useState(false);
  const [appTheme, setAppTheme] = useState('default');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ─── Initial form snapshot for dirty-checking ───
  const initialFormRef = useRef(JSON.stringify(form));
  const isDirty = useMemo(() => {
    return JSON.stringify(form) !== initialFormRef.current;
  }, [form]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('golazo_app_icon');
      if (savedTheme && savedTheme !== 'default') {
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

  const saveProfile = async () => {
    setIsSaving(true);
    const res = await updatePlayerProfile(me.id, form);
    setIsSaving(false);
    if (res.error) {
      showToast(res.error);
    } else {
      showToast("Profile updated \u2713");
      setSaveSuccess(true);
      initialFormRef.current = JSON.stringify(form);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const discardChanges = useCallback(() => {
    const original = JSON.parse(initialFormRef.current);
    setForm(original);
  }, []);

  const savePassword = async () => {
    if (pwd !== pwd2) {
      setPwdError(true);
      setTimeout(() => setPwdError(false), 500);
      return showToast("Passwords don't match");
    }
    const res = await changePlayerPassword(me.id, pwd);
    if (res.error) showToast(res.error);
    else { showToast("Password updated \u2713"); setPwd(""); setPwd2(""); }
  };

  // Password requirements
  const pwdReqs = useMemo(() => [
    { met: pwd.length >= 6, label: 'At least 6 characters' },
    { met: pwd.length >= 9, label: '9+ characters for strong' },
    { met: /[A-Z]/.test(pwd), label: 'One uppercase letter' },
    { met: /[0-9]/.test(pwd), label: 'One number' },
  ], [pwd]);

  const pwdStrength = useMemo(() => {
    if (!pwd) return 0;
    return pwdReqs.filter(r => r.met).length * 25;
  }, [pwd, pwdReqs]);

  const selectedClub = clubs.find(c => c.name === form.favoriteClub);
  const selectedNationalTeam = nationalTeams.find(nt => nt.name === form.flag);

  // ─── TAB ANIMATION VARIANTS ───
  const tabContentVariants = {
    initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, y: -12, filter: 'blur(4px)', transition: { duration: 0.2 } },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="flex flex-col gap-0 pb-10 max-w-6xl mx-auto min-h-screen">

      {/* PREMIUM HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-1 pt-2 pb-5 mb-0"
      >
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pitch-bright/40 to-transparent" />
        
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-2xl bg-secondary/60 border border-border/50">
            <Settings className="text-muted-foreground" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your profile, security & preferences</p>
          </div>
        </div>
      </motion.div>

      {/* LAYOUT: SIDEBAR + CONTENT */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-0">

        {/* SIDEBAR NAV (desktop) / PILL TABS (mobile) */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:w-60 shrink-0"
        >
          {/* Mobile: horizontal pills */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-pitch-bright/15 text-pitch-bright border border-pitch-bright/30'
                      : 'bg-secondary/50 text-muted-foreground border border-transparent hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  <IconComp size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Desktop: vertical sidebar */}
          <div className="hidden md:flex flex-col gap-1 sticky top-24 pr-6 border-r border-border/30">
            {SETTINGS_TABS.map((tab, i) => {
              const isActive = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-secondary/80 text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                  }`}
                >
                  {/* Active left indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="settings-sidebar-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-pitch-bright shadow-[0_0_8px_rgba(41,193,121,0.5)]"
                      />
                    )}
                  </AnimatePresence>

                  <IconComp size={18} className={isActive ? 'text-pitch-bright' : 'group-hover:text-foreground'} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{tab.label}</div>
                    <div className="text-[11px] text-muted-foreground">{tab.description}</div>
                  </div>
                </motion.button>
              );
            })}

            {/* Divider + sidebar decoration */}
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="px-4 py-2 rounded-lg bg-secondary/30 border border-border/30">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Player ID</p>
                <p className="text-xs font-mono text-foreground/70">#{me.id.substring(0,8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0 md:pl-8">
          <AnimatePresence mode="wait">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* Profile ID Card */}
                <motion.div variants={staggerItem} initial="initial" animate="animate" className="[&>div]:max-w-none [&>div]:mx-0">
                  <ProfileIdCard me={me} form={form} setForm={setForm} showToast={showToast} />
                </motion.div>

                {/* Football Identity Section */}
                <motion.div
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.15 }}
                >
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
                </motion.div>

                {/* Inline Save Button */}
                <motion.div
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.25 }}
                  className="flex justify-end max-md:fixed max-md:bottom-0 max-md:inset-x-0 max-md:bg-background/85 max-md:backdrop-blur-xl max-md:border-t max-md:border-border max-md:p-4 max-md:pb-[calc(env(safe-area-inset-bottom)+16px)] max-md:z-50"
                >
                  <Btn variant="primary" onClick={saveProfile} disabled={isSaving} className="px-8 font-semibold shadow-md max-md:w-full h-12">
                    {isSaving ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : saveSuccess ? (
                      <><CheckCircle2 size={16} /> Saved!</>
                    ) : (
                      <><Save size={16} /> Save Profile</>
                    )}
                  </Btn>
                </motion.div>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* Password Section */}
                <motion.div variants={staggerItem} initial="initial" animate="animate">
                  <MagicCard gradientColor="rgba(56, 189, 248, 0.08)">
                    <Card className="bg-transparent border-none shadow-none">
                      <CardHeader className="pb-4 border-b border-border/30">
                        <CardTitle className="text-lg flex items-center gap-2"><KeyRound className="text-sky-500" size={18}/> Change Password</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Set a new password for your account.</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid gap-5 max-w-md">
                          {/* New Password */}
                          <div className="space-y-1.5 relative">
                            <Label>New Password</Label>
                            <div className="relative">
                              <Input type={showPwd ? "text" : "password"} value={pwd} onChange={e => setPwd(e.target.value)} className="pr-10 focus-visible:ring-sky-500 bg-background/50" placeholder="Enter new password" />
                              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            {/* Password Strength Bar */}
                            <div className="h-1.5 w-full bg-secondary rounded-full mt-2 overflow-hidden">
                              <motion.div 
                                className={`h-full rounded-full ${pwdStrength < 50 ? 'bg-red-500' : pwdStrength < 100 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pwdStrength}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>

                            {/* Password Requirements Checklist */}
                            <AnimatePresence>
                              {pwd.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 grid grid-cols-2 gap-2 overflow-hidden"
                                >
                                  {pwdReqs.map((req, i) => (
                                    <PwdRequirement key={i} met={req.met} label={req.label} />
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Confirm Password */}
                          <div className="space-y-1.5 relative">
                            <Label>Confirm Password</Label>
                            <div className="relative">
                              <Input type={showPwd2 ? "text" : "password"} value={pwd2} onChange={e => setPwd2(e.target.value)} className="pr-10 focus-visible:ring-sky-500 bg-background/50" placeholder="Re-enter password" />
                              <button type="button" onClick={() => setShowPwd2(!showPwd2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                                {showPwd2 ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                            {/* Match indicator */}
                            <AnimatePresence>
                              {pwd2.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className={`flex items-center gap-1.5 text-xs mt-1 ${pwd === pwd2 ? 'text-green-500' : 'text-red-400'}`}
                                >
                                  {pwd === pwd2 ? <Check size={12} /> : <X size={12} />}
                                  {pwd === pwd2 ? 'Passwords match' : 'Passwords do not match'}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <motion.div animate={pwdError ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.3 }} className="pt-2">
                            <Btn 
                              variant="primary" 
                              className="w-full" 
                              onClick={savePassword}
                              disabled={!pwd || !pwd2 || pwd !== pwd2 || pwdStrength < 50}
                            >
                              <KeyRound size={16} />
                              Update Password
                            </Btn>
                          </motion.div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                </motion.div>

                {/* DANGER ZONE */}
                <motion.div
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.15 }}
                >
                  <div className="relative rounded-xl border-2 border-dashed border-destructive/30 p-[2px]">
                    <MagicCard gradientColor="rgba(239, 68, 68, 0.08)">
                      <Card className="bg-transparent border-none shadow-none">
                        <CardHeader className="pb-4 border-b border-destructive/20">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-destructive" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-destructive">Danger Zone</span>
                          </div>
                          <CardTitle className="text-lg flex items-center gap-2 text-destructive mt-2"><LogOut size={18}/> Sign Out</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">Log out of your Golazo Hub account on this device.</p>
                        </CardHeader>
                        <CardContent className="pt-6 max-w-md">
                          <Btn variant="danger" className="w-full flex items-center justify-center gap-2" onClick={handleLogout} disabled={isLoggingOut}>
                            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                            {isLoggingOut ? "Logging out..." : "Log Out"}
                          </Btn>
                        </CardContent>
                      </Card>
                    </MagicCard>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* PREFERENCES TAB */}
            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                variants={tabContentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* App Theme Section */}
                <motion.div variants={staggerItem} initial="initial" animate="animate">
                  <MagicCard>
                    <Card className="bg-transparent border-none shadow-none">
                      <CardHeader className="pb-4 border-b border-border/30">
                        <CardTitle className="text-lg flex items-center gap-2"><Palette className="text-purple-400" size={18}/> App Icon & Theme</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Customize how Golazo Hub looks on your device.</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { id: 'default', label: 'Default', color: '#09090b', preview: '/icons/golazohub.png' },
                              { id: 'red', label: 'Crimson', color: '#7f1d1d', preview: '/icons/golazohub.png' },
                              { id: 'blue', label: 'Ocean', color: '#1e3a8a', preview: '/icons/golazohub.png' },
                              { id: 'green', label: 'Pitch', color: '#14532d', preview: '/icons/golazohub.png' },
                            ].map(theme => (
                              <ThemeOptionCard
                                key={theme.id}
                                theme={theme}
                                isActive={appTheme === theme.id}
                                onClick={() => handleThemeChange(theme.id, theme.color)}
                              />
                            ))}
                          </div>

                          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
                            <Smartphone size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Changing the icon updates the browser theme and shortcut immediately. If you have installed the app to your home screen, you may need to reinstall it for the new icon to appear.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                </motion.div>

                {/* Push Notifications Section */}
                <motion.div
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.1 }}
                >
                  <MagicCard>
                    <Card className="bg-transparent border-none shadow-none">
                      <CardHeader className="pb-0 border-none">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-secondary/60">
                              <Bell size={18} className="text-amber-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Push Notifications</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">Receive real-time alerts for goals and matches.</p>
                            </div>
                          </div>
                          <NotificationToggle enabled={pushEnabled} onToggle={togglePushNotifications} />
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          pushEnabled ? 'bg-pitch-bright/10 text-pitch-bright' : 'bg-secondary/30 text-muted-foreground'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${pushEnabled ? 'bg-pitch-bright animate-pulse' : 'bg-muted-foreground/40'}`} />
                          {pushEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                </motion.div>

                {/* Install App Section */}
                <motion.div
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: 0.15 }}
                >
                  <MagicCard>
                    <Card className="bg-transparent border-none shadow-none">
                      <CardHeader className="pb-0 border-none">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-secondary/60">
                              <Smartphone size={18} className="text-sky-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Install App</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">Add Golazo Hub to your home screen for full-screen access.</p>
                            </div>
                          </div>
                          <Btn variant="primary" onClick={() => window.dispatchEvent(new Event('trigger-install-prompt'))} className="px-4 py-2 text-xs font-bold whitespace-nowrap shadow-md">
                            <Download size={14} className="mr-1.5 inline" /> Install App
                          </Btn>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-secondary/30 text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                          Recommended for the best experience on mobile and desktop
                        </div>
                      </CardContent>
                    </Card>
                  </MagicCard>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FLOATING UNSAVED CHANGES BAR */}
      <AnimatePresence>
        {isDirty && activeTab === 'profile' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-0 md:bottom-6 inset-x-0 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-50 px-0 md:px-0"
          >
            <div className="mx-auto max-w-lg w-full md:rounded-2xl rounded-none bg-card/90 backdrop-blur-xl border border-border/60 md:border shadow-2xl shadow-black/20 px-5 py-3.5 md:py-3 flex items-center justify-between gap-4 pb-[calc(env(safe-area-inset-bottom)+14px)] md:pb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                </span>
                <span className="text-sm font-semibold text-foreground truncate">Unsaved changes</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Btn variant="ghost" onClick={discardChanges} className="px-3 h-9 text-xs">
                  <Undo2 size={14} />
                  <span className="hidden sm:inline">Discard</span>
                </Btn>
                <Btn variant="primary" onClick={saveProfile} disabled={isSaving} className="px-5 h-9 text-xs font-bold shadow-md">
                  {isSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : saveSuccess ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Save size={14} />
                  )}
                  {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save'}
                </Btn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
