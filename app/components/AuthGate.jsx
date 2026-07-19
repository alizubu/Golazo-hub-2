'use client';

import React, { useState } from 'react';
import { Lock, User, UserPlus, ShieldAlert } from 'lucide-react';
import { Card, Btn, Input, Label } from './UI';
import { signInPlayer, signUpPlayer } from '@/app/actions/player';

export default function AuthGate({ players, showToast, onPlayerLogin, onAdminLogin }) {
  const [mode, setMode] = useState('signin'); // signin | signup | admin

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="w-full max-w-sm fade-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.875rem', letterSpacing: '1px' }}>FRIENDS eLEAGUE</h1>
          <p className="text-sm" style={{ color: 'var(--textDim)' }}>Matchday central for the crew</p>
        </div>

        {mode !== 'admin' && (
          <Card className="p-1.5 flex mb-4" style={{ display: 'flex' }}>
            <button 
              onClick={() => setMode('signin')} 
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all-fast" 
              style={{ background: mode === 'signin' ? 'var(--pitch)' : 'transparent', color: mode === 'signin' ? '#fff' : 'var(--textDim)' }}
            >
              Sign in
            </button>
            <button 
              onClick={() => setMode('signup')} 
              className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all-fast" 
              style={{ background: mode === 'signup' ? 'var(--pitch)' : 'transparent', color: mode === 'signup' ? '#fff' : 'var(--textDim)' }}
            >
              Sign up
            </button>
          </Card>
        )}

        {mode === 'signin' && <SignInForm players={players} onPlayerLogin={onPlayerLogin} />}
        {mode === 'signup' && <SignUpForm showToast={showToast} onPlayerLogin={onPlayerLogin} />}
        {mode === 'admin' && <AdminLoginForm onAdminLogin={onAdminLogin} onBack={() => setMode('signin')} />}

        {mode !== 'admin' && (
          <button 
            onClick={() => setMode('admin')} 
            className="w-full text-center text-xs mt-4 flex items-center justify-center gap-1 btn-hover" 
            style={{ color: 'var(--textFaint)' }}
          >
            <Lock size={11} /> Admin login instead
          </button>
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
    <Card className="p-5" style={{ padding: '1.25rem' }}>
      {players.length === 0 && <div className="text-xs mb-3" style={{ color: 'var(--textFaint)' }}>No accounts yet — create the first one from Sign up.</div>}
      <Label>Username or email</Label>
      <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="you@example.com" />
      <div style={{ height: '0.75rem' }} />
      <Label>Password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Your password" onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {err && <div className="text-xs mt-2" style={{ color: 'var(--claret)' }}>{err}</div>}
      <Btn className="w-full mt-4" disabled={busy} onClick={submit}>
        <User size={16} /> {busy ? 'Checking…' : 'Sign in'}
      </Btn>
    </Card>
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
    <Card className="p-5" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
        <div><Label>Display name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="How others see you" /></div>
        <div><Label>Username</Label><Input value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="e.g. shadow_striker" /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••" /></div>
          <div><Label>Confirm</Label><Input type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••" /></div>
        </div>
      </div>
      <div className="text-xs mt-3" style={{ color: 'var(--textFaint)' }}>You can pick your avatar, flag and team crest afterwards in Profile.</div>
      {err && <div className="text-xs mt-2" style={{ color: 'var(--claret)' }}>{err}</div>}
      <Btn className="w-full mt-4" disabled={busy} onClick={submit}>
        <UserPlus size={16} /> {busy ? 'Creating…' : 'Create account'}
      </Btn>
    </Card>
  );
}

function AdminLoginForm({ onAdminLogin, onBack }) {
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');

  // We fetch a secure route to verify the admin setup password.
  // We can just verify against an API route. 
  // For simplicity, Next.js Server Action:
  const submit = async () => {
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ password: pwd }) });
    if (res.ok) onAdminLogin();
    else setErr("Incorrect password.");
  };

  return (
    <Card className="p-5" style={{ padding: '1.25rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} color="var(--gold)" />
        <span className="text-sm font-semibold">Admin console</span>
      </div>
      <Label>Admin password</Label>
      <Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Enter admin password" onKeyDown={(e) => e.key === 'Enter' && submit()} />
      {err && <div className="text-xs mt-2" style={{ color: 'var(--claret)' }}>{err}</div>}
      <Btn variant="gold" className="w-full mt-4" onClick={submit}>
        <Lock size={16} /> Enter admin console
      </Btn>
      <button onClick={onBack} className="w-full text-center text-xs mt-3 btn-hover" style={{ color: 'var(--textFaint)' }}>
        ← Back to player sign in
      </button>
    </Card>
  );
}
