'use client';

import React, { useState } from 'react';
import { Lock, User, UserPlus, ShieldAlert, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, Input, Label, FadeIn } from './UI';
import { signInPlayer, signUpPlayer } from '@/app/actions/player';
import { setAuthCookie } from '@/app/actions/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Meteors } from './magicui/Meteors';
import { AnimatedGradientText } from './magicui/AnimatedGradientText';
import { ShimmerButton } from './magicui/ShimmerButton';
import { BorderBeam } from './magicui/BorderBeam';

export default function AuthGate({ players, showToast, onPlayerLogin, onAdminLogin }) {
  const [mode, setMode] = useState('signin'); // signin | signup | admin

  return (
    <div className="min-h-[100dvh] flex items-center justify-center px-4 md:px-6 py-8 bg-stadium-base text-foreground relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-stadium-base z-0">
        <Meteors number={15} className="opacity-40 hidden md:block" />
        <Meteors number={8} className="opacity-30 md:hidden" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stadium-base pointer-events-none opacity-80" />
      </div>
      
      <div className="w-full max-w-[380px] z-10 relative flex flex-col pt-8 pb-12">
        <FadeIn delay={0.1} className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: [0, -6, 0] }}
            transition={{ 
              scale: { type: "spring", stiffness: 260, damping: 20 },
              y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }
            }}
            className="text-5xl mb-4"
          >
            🏆
          </motion.div>
          <AnimatedGradientText className="mb-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight px-2 text-white">Golazo Hub</h1>
          </AnimatedGradientText>
          <p className="text-sm text-muted-foreground mt-2 font-medium">Matchday central for the crew</p>
        </FadeIn>

        {mode !== 'admin' && (
          <FadeIn delay={0.2} className="relative z-20">
            <div className="flex p-1 bg-card/60 backdrop-blur-md rounded-2xl mb-6 relative border border-border/50 shadow-inner">
              <button 
                onClick={() => setMode('signin')} 
                className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 ${mode === 'signin' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign in
                {mode === 'signin' && (
                  <motion.div layoutId="auth-tab-pill" className="absolute inset-0 bg-pitch rounded-xl -z-10 shadow-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
              <button 
                onClick={() => setMode('signup')} 
                className={`relative flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors z-10 ${mode === 'signup' ? 'text-white' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Sign up
                {mode === 'signup' && (
                  <motion.div layoutId="auth-tab-pill" className="absolute inset-0 bg-pitch rounded-xl -z-10 shadow-md" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
              </button>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.3} className="relative z-20 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'signin' && <SignInForm players={players} onPlayerLogin={onPlayerLogin} />}
              {mode === 'signup' && <SignUpForm showToast={showToast} onPlayerLogin={onPlayerLogin} />}
              {mode === 'admin' && <AdminLoginForm onAdminLogin={onAdminLogin} onBack={() => setMode('signin')} />}
            </motion.div>
          </AnimatePresence>
        </FadeIn>

        {mode !== 'admin' && (
          <FadeIn delay={0.4} className="relative z-20">
            <motion.button 
              whileHover={{ x: 2 }}
              onClick={() => setMode('admin')} 
              className="w-full text-center text-xs mt-6 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline transition-all min-h-[44px]"
            >
              <Lock size={12} /> Admin login instead
            </motion.button>
          </FadeIn>
        )}
      </div>
    </div>
  );
}

function SignInForm({ players, onPlayerLogin }) {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    setErr('');
    setBusy(true);
    const res = await signInPlayer({ id, password: pwd });
    setBusy(false);
    if (res.error) return setErr(res.error);
    await setAuthCookie('player', res.player.id);
    onPlayerLogin(res.player);
  };

  return (
    <motion.div animate={err ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden p-6 bg-card border border-border shadow-2xl rounded-2xl">
        <BorderBeam size={150} duration={12} delay={2} colorFrom="#1F8A5C" colorTo="#3DDC84" />
        
        {players.length === 0 && (
          <div className="text-xs mb-5 text-muted-foreground p-3 bg-secondary/50 rounded-lg border border-border/50 text-center">
            No accounts yet — create the first one via Sign up.
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Username or email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                value={id} 
                onChange={(e) => setId(e.target.value)} 
                placeholder="you@example.com" 
                className="pl-9 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                type={showPwd ? "text" : "password"} 
                value={pwd} 
                onChange={(e) => setPwd(e.target.value)} 
                placeholder="••••••" 
                onKeyDown={(e) => e.key === 'Enter' && submit()} 
                className="pl-9 pr-10 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50" 
              />
              <button 
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {err && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-2 text-red-400 font-medium pt-1">
                {err}
              </motion.div>
            )}
          </div>
        
        <div className="mt-7">
          <ShimmerButton 
            type="submit"
            className="w-full font-bold shadow-lg h-12" 
            disabled={busy || !id || !pwd}
            shimmerColor="#ffffff80"
            background="#1F8A5C"
          >
            {busy ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Signing in...</span>
            ) : (
              <span className="flex items-center gap-2"><User size={16} /> Sign In</span>
            )}
          </ShimmerButton>
        </div>
        </form>
      </Card>
    </motion.div>
  );
}

function SignUpForm({ showToast, onPlayerLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    setErr('');
    if (form.password !== form.confirm) return setErr("Passwords don't match.");
    setBusy(true);
    const res = await signUpPlayer(form);
    setBusy(false);
    if (res.error) return setErr(res.error);
    await setAuthCookie('player', res.player.id);
    showToast(`Welcome to the league, ${res.player.name}! Set up your avatar and team in Profile.`);
    onPlayerLogin(res.player);
  };

  return (
    <motion.div animate={err ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden p-6 bg-card border border-border shadow-2xl rounded-2xl">
        <BorderBeam size={150} duration={12} delay={2} colorFrom="#1F8A5C" colorTo="#3DDC84" />
        
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="How others see you" className="pl-9 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-score text-sm">@</span>
              <Input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="shadow_striker" className="pl-9 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className="pl-9 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input type={showPwd ? "text" : "password"} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••" className="pl-7 pr-7 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider">Confirm</Label>
              <div className="relative">
                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input type={showPwd ? "text" : "password"} value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••" className="pl-7 h-11 bg-secondary/30 focus-visible:ring-pitch-bright border-border/50 text-sm" />
                <button 
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        

        {err && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-3 text-red-400 font-medium">
            {err}
          </motion.div>
        )}
        
        <div className="text-[10px] mt-4 text-muted-foreground text-center">
          You can pick your avatar, flag, and crest in Profile.
        </div>
        
        <div className="mt-4">
          <ShimmerButton 
            type="submit"
            className="w-full font-bold shadow-lg h-12" 
            disabled={busy || !form.username || !form.password}
            shimmerColor="#ffffff80"
            background="#1F8A5C"
          >
            {busy ? (
              <span className="flex items-center gap-2"><Loader2 size={16} className="animate-spin" /> Creating...</span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus size={16} /> Create Account</span>
            )}
          </ShimmerButton>
        </div>
        </form>
      </Card>
    </motion.div>
  );
}

function AdminLoginForm({ onAdminLogin, onBack }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    setErr('');
    setBusy(true);
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ password: pwd }) });
    setBusy(false);
    if (res.ok) {
      await setAuthCookie('admin');
      onAdminLogin();
    }
    else setErr("Incorrect password.");
  };

  return (
    <motion.div animate={err ? { x: [-5, 5, -5, 5, 0] } : {}} transition={{ duration: 0.4 }}>
      <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-card to-secondary/30 border border-gold/30 shadow-2xl rounded-2xl">
        <BorderBeam size={150} duration={12} delay={2} colorFrom="#D9A93B" colorTo="#E8B34C" />
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-3 relative">
            <span className="absolute inset-0 rounded-full animate-ping bg-gold/20" />
            <ShieldAlert size={24} className="text-gold relative z-10" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">Admin Console</h2>
          <p className="text-xs text-muted-foreground mt-1 text-center font-medium">Restricted access — authorized administrators only</p>
        </div>
        
        <form onSubmit={submit}>
        <div className="space-y-1.5">
          <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Admin Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              type={showPwd ? "text" : "password"} 
              value={pwd} 
              onChange={(e) => setPwd(e.target.value)} 
              placeholder="Enter master password" 
              onKeyDown={(e) => e.key === 'Enter' && submit()} 
              className="pl-9 pr-10 h-11 bg-background/50 focus-visible:ring-gold border-gold/20" 
            />
            <button 
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {err && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-xs mt-2 text-red-400 font-medium pt-1 text-center">
              {err}
            </motion.div>
          )}
        </div>
        
        <div className="mt-7">
          <ShimmerButton 
            type="submit"
            className="w-full font-bold shadow-lg h-12" 
            disabled={busy || !pwd}
            shimmerColor="#ffffff80"
            background="#D9A93B"
          >
            {busy ? (
              <span className="flex items-center gap-2 text-black"><Loader2 size={16} className="animate-spin" /> Verifying...</span>
            ) : (
              <span className="flex items-center gap-2 text-black"><Lock size={16} /> Enter Console</span>
            )}
          </ShimmerButton>
        </div>
        </form>
        
        <motion.button 
          whileHover={{ x: -2 }}
          onClick={onBack} 
          className="w-full text-center text-xs mt-6 text-muted-foreground hover:text-foreground hover:underline transition-colors min-h-[44px]"
        >
          ← Back to player sign in
        </motion.button>
      </Card>
    </motion.div>
  );
}
