'use client';

import React, { useState } from 'react';
import { Lock, User, UserPlus, ShieldAlert } from 'lucide-react';
import { Card, Btn, Input, Label, MagicCard, FadeIn, ShinyButton } from './UI';
import { signInPlayer, signUpPlayer } from '@/app/actions/player';
import { motion } from 'framer-motion';

export default function AuthGate({ players, showToast, onPlayerLogin, onAdminLogin }) {
  const [mode, setMode] = useState('signin'); // signin | signup | admin

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-sm z-10">
        <FadeIn delay={0.1} className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-5xl mb-4"
          >
            🏆
          </motion.div>
          <h1 className="font-display text-3xl font-bold tracking-tight mb-2">FRIENDS eLEAGUE</h1>
          <p className="text-sm text-muted-foreground">Matchday central for the crew</p>
        </FadeIn>

        {mode !== 'admin' && (
          <FadeIn delay={0.2}>
            <Card className="p-1.5 flex mb-6 bg-card/60 backdrop-blur">
              <button 
                onClick={() => setMode('signin')} 
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'signin' ? 'bg-pitch text-white shadow-md' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Sign in
              </button>
              <button 
                onClick={() => setMode('signup')} 
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === 'signup' ? 'bg-pitch text-white shadow-md' : 'bg-transparent text-muted-foreground hover:text-foreground'}`}
              >
                Sign up
              </button>
            </Card>
          </FadeIn>
        )}

        <FadeIn delay={0.3}>
          {mode === 'signin' && <SignInForm players={players} onPlayerLogin={onPlayerLogin} />}
          {mode === 'signup' && <SignUpForm showToast={showToast} onPlayerLogin={onPlayerLogin} />}
          {mode === 'admin' && <AdminLoginForm onAdminLogin={onAdminLogin} onBack={() => setMode('signin')} />}
        </FadeIn>

        {mode !== 'admin' && (
          <FadeIn delay={0.4}>
            <button 
              onClick={() => setMode('admin')} 
              className="w-full text-center text-xs mt-6 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Lock size={12} /> Admin login instead
            </button>
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

  const submit = async () => {
    setErr('');
    setBusy(true);
    const res = await signInPlayer({ id, password: pwd });
    setBusy(false);
    if (res.error) return setErr(res.error);
    onPlayerLogin(res.player);
  };

  return (
    <MagicCard className="p-6">
      {players.length === 0 && <div className="text-xs mb-4 text-muted-foreground p-3 bg-secondary rounded-lg border border-border">No accounts yet — create the first one from Sign up.</div>}
      <div className="space-y-4">
        <div>
          <Label>Username or email</Label>
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com" className="mt-1.5" />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Your password" onKeyDown={(e) => e.key === 'Enter' && submit()} className="mt-1.5" />
        </div>
      </div>
      {err && <div className="text-sm mt-4 text-destructive font-medium bg-destructive/10 p-2 rounded-md border border-destructive/20">{err}</div>}
      <ShinyButton className="w-full mt-6" disabled={busy} onClick={submit}>
        <User size={18} /> {busy ? 'Checking…' : 'Sign in'}
      </ShinyButton>
    </MagicCard>
  );
}

function SignUpForm({ showToast, onPlayerLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErr('');
    if (form.password !== form.confirm) return setErr("Passwords don't match.");
    setBusy(true);
    const res = await signUpPlayer(form);
    setBusy(false);
    if (res.error) return setErr(res.error);
    showToast(`Welcome to the league, ${res.player.name}! Set up your avatar and team in Profile.`);
    onPlayerLogin(res.player);
  };

  return (
    <MagicCard className="p-6">
      <div className="grid gap-4">
        <div><Label>Display name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="How others see you" className="mt-1.5" /></div>
        <div><Label>Username</Label><Input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="e.g. shadow_striker" className="mt-1.5" /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className="mt-1.5" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••" className="mt-1.5" /></div>
          <div><Label>Confirm</Label><Input type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••" className="mt-1.5" /></div>
        </div>
      </div>
      <div className="text-xs mt-4 text-muted-foreground">You can pick your avatar, flag and team crest afterwards in Profile.</div>
      {err && <div className="text-sm mt-4 text-destructive font-medium bg-destructive/10 p-2 rounded-md border border-destructive/20">{err}</div>}
      <ShinyButton className="w-full mt-6" disabled={busy} onClick={submit}>
        <UserPlus size={18} /> {busy ? 'Creating…' : 'Create account'}
      </ShinyButton>
    </MagicCard>
  );
}

function AdminLoginForm({ onAdminLogin, onBack }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ password: pwd }) });
    setBusy(false);
    if (res.ok) onAdminLogin();
    else setErr("Incorrect password.");
  };

  return (
    <MagicCard className="p-6 border-gold/30 bg-gradient-to-br from-card to-secondary/30">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert size={20} className="text-gold" />
        <span className="text-base font-semibold tracking-wide">Admin console</span>
      </div>
      <Label>Admin password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter admin password" onKeyDown={(e) => e.key === 'Enter' && submit()} className="mt-1.5 border-gold/20 focus-visible:ring-gold" />
      {err && <div className="text-sm mt-4 text-destructive font-medium bg-destructive/10 p-2 rounded-md border border-destructive/20">{err}</div>}
      <Btn variant="gold" className="w-full mt-6 text-base h-12" onClick={submit} disabled={busy}>
        <Lock size={18} /> {busy ? 'Verifying...' : 'Enter admin console'}
      </Btn>
      <button onClick={onBack} className="w-full text-center text-xs mt-4 text-muted-foreground hover:text-foreground transition-colors">
        ← Back to player sign in
      </button>
    </MagicCard>
  );
}
