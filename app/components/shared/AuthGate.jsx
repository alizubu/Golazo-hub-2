'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Lock, User, UserPlus, ShieldAlert, Eye, EyeOff, Loader2, X, ChevronRight, Trophy, Mail } from 'lucide-react';
import { Avatar } from '@/app/components/shared/UI';
import { signInPlayer, signUpPlayer } from '@/app/actions/player';
import { setAuthCookie } from '@/app/actions/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { BorderBeam } from '@/app/components/magicui/BorderBeam';
import { AnimatedGradientText } from '@/app/components/magicui/AnimatedGradientText';
import { ShimmerButton } from '@/app/components/magicui/ShimmerButton';
import ThemeToggle from '@/app/components/shared/ThemeToggle';

// ══════════════════════════════════════════════════════════════
// PITCH SVG — top-down animated football pitch
// ══════════════════════════════════════════════════════════════
function PitchSVG({ className = '' }) {
  return (
    <svg
      viewBox="0 0 500 320"
      className={`absolute inset-0 w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <filter id="pitch-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="turf-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F8A5C" stopOpacity="0.14" />
          <stop offset="50%" stopColor="#0B1E12" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#1F8A5C" stopOpacity="0.11" />
        </linearGradient>
      </defs>
      {/* Turf fill */}
      <rect width="500" height="320" fill="url(#turf-base)" />
      {/* Outer boundary */}
      <rect x="12" y="12" width="476" height="296" fill="none" stroke="#29C179" strokeWidth="1.5" opacity="0.28" filter="url(#pitch-glow)" />
      {/* Center line */}
      <line x1="250" y1="12" x2="250" y2="308" stroke="#29C179" strokeWidth="1" opacity="0.22" />
      {/* Center circle */}
      <circle cx="250" cy="160" r="52" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.22" />
      {/* Center spot */}
      <circle cx="250" cy="160" r="3" fill="#29C179" opacity="0.8">
        <animate attributeName="opacity" values="0.8; 0.2; 0.8" dur="4s" repeatCount="indefinite" />
        <animate attributeName="r" values="3; 7; 3" dur="4s" repeatCount="indefinite" />
      </circle>
      {/* Left penalty area */}
      <rect x="12" y="95" width="80" height="130" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.22" />
      {/* Left 6-yard box */}
      <rect x="12" y="123" width="28" height="74" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      {/* Left penalty spot */}
      <circle cx="75" cy="160" r="2.5" fill="#29C179" opacity="0.38" />
      {/* Left penalty arc */}
      <path d="M92,118 A52,52 0 0,1 92,202" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      {/* Right penalty area */}
      <rect x="408" y="95" width="80" height="130" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.22" />
      {/* Right 6-yard box */}
      <rect x="460" y="123" width="28" height="74" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      {/* Right penalty spot */}
      <circle cx="425" cy="160" r="2.5" fill="#29C179" opacity="0.38" />
      {/* Right penalty arc */}
      <path d="M408,118 A52,52 0 0,0 408,202" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      {/* Corner arcs */}
      <path d="M12,24 A12,12 0 0,1 24,12" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      <path d="M476,12 A12,12 0 0,1 488,24" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      <path d="M12,296 A12,12 0 0,0 24,308" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
      <path d="M476,308 A12,12 0 0,0 488,296" fill="none" stroke="#29C179" strokeWidth="1" opacity="0.18" />
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════
// FLOATING PLAYER CARD — drifting avatar on left panel
// ══════════════════════════════════════════════════════════════
const FLOAT_POSITIONS = [
  { top: '15%', right: '12%' },
  { top: '35%', right: '5%' },
  { top: '55%', right: '25%' },
  { top: '75%', right: '10%' },
  { top: '85%', right: '35%' },
];

function FloatingPlayerCard({ player, posStyle, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.65, type: 'spring', bounce: 0.3 }}
      style={posStyle}
      className="absolute flex items-center gap-2.5 bg-black/5 dark:bg-white/5 backdrop-blur-md border border-border rounded-2xl px-3 py-2.5 shadow-xl select-none pointer-events-none"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 3.5 + delay, ease: 'easeInOut', delay: delay * 0.5 }}
      >
        <Avatar p={player} size={30} />
      </motion.div>
      <div className="min-w-0">
        <div className="text-foreground text-xs font-bold leading-tight truncate max-w-[84px]">
          {(player.name || player.username || '?').split(' ')[0]}
        </div>
        {player.teamName && (
          <div className="text-foreground/40 text-[10px] truncate max-w-[84px] mt-0.5">{player.teamName}</div>
        )}
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// HOLD-TO-REVEAL — 3-second press to expose admin panel
// ══════════════════════════════════════════════════════════════
function HoldToReveal({ onReveal }) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const HOLD_MS = 3000;
  const R = 9;
  const CIRC = 2 * Math.PI * R;

  const start = useCallback(() => {
    startRef.current = Date.now();
    setHolding(true);
    const tick = () => {
      const p = Math.min((Date.now() - startRef.current) / HOLD_MS, 1);
      setProgress(p);
      if (p >= 1) { setHolding(false); setProgress(0); onReveal(); }
      else { rafRef.current = requestAnimationFrame(tick); }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [onReveal]);

  const cancel = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setHolding(false);
    setProgress(0);
  }, []);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  return (
    <button
      onMouseDown={start} onMouseUp={cancel} onMouseLeave={cancel}
      onTouchStart={(e) => { e.preventDefault(); start(); }}
      onTouchEnd={cancel} onTouchCancel={cancel}
      className="flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors select-none cursor-pointer group py-2 px-3 rounded-full hover:bg-black/5 dark:bg-white/5 font-medium tracking-wide"
    >
      <div className="relative w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r={R} fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
          {progress > 0 && (
            <circle cx="11" cy="11" r={R} fill="none" stroke="#D9A93B" strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              style={{ transition: 'none' }}
            />
          )}
        </svg>
        <Lock size={8} className="relative z-10 opacity-60 group-hover:opacity-90 transition-opacity" />
      </div>
      {holding ? `Keep holding… ${Math.ceil((1 - progress) * 3)}s` : 'Admin access'}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════
// FLOATING LABEL INPUT
// ══════════════════════════════════════════════════════════════
function FloatingLabelInput({ label, id, type = 'text', value, onChange, onKeyDown, leftElement, rightElement, autoComplete, disabled }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || (typeof value === 'string' && value.length > 0);

  return (
    <div className="relative">
      <label
        htmlFor={id}
        style={{
          position: 'absolute', left: leftElement ? '40px' : '12px', zIndex: 10, pointerEvents: 'none',
          top: floated ? '7px' : '19px',
          fontSize: floated ? '10px' : '13px',
          fontWeight: floated ? '700' : '400',
          letterSpacing: floated ? '0.07em' : '0',
          textTransform: floated ? 'uppercase' : 'none',
          color: focused ? '#29C179' : 'rgba(138,147,163,0.75)',
          transition: 'all 0.15s ease',
          lineHeight: 1,
        }}
      >
        {label}
      </label>
      {leftElement && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors pointer-events-none ${focused ? 'text-pitch-bright' : 'text-muted-foreground'}`}>
          {leftElement}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        disabled={disabled}
        placeholder=" "
        style={{ 
          paddingRight: rightElement ? '44px' : '12px',
          paddingLeft: leftElement ? '40px' : '12px'
        }}
        className={`
          w-full h-14 px-3 pt-6 pb-2 text-sm text-foreground rounded-xl border bg-black/5 dark:bg-white/5
          focus:outline-none focus:ring-1 focus:ring-pitch-bright/50 transition-all placeholder-transparent disabled:opacity-50
          ${focused ? 'border-pitch-bright/60 bg-black/10 dark:bg-white/[0.07] shadow-[0_0_15px_rgba(41,193,121,0.12)]' : 'border-border'}
        `}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightElement}</div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIGN IN FORM
// ══════════════════════════════════════════════════════════════
function SignInForm({ players, onPlayerLogin }) {
  const [id, setId] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    if (!id || !pwd) return setErr('Please enter both fields.');
    setErr(''); setBusy(true);
    const res = await signInPlayer({ id, password: pwd });
    if (res.error) { setBusy(false); return setErr(res.error); }
    await setAuthCookie('player', res.player.id);
    onPlayerLogin(res.player);
  };

  return (
    <motion.div animate={err ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
      <form onSubmit={submit} className="space-y-4">
        {players.length === 0 && (
          <div className="text-xs text-muted-foreground/60 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-border dark:border-white/10 text-center">
            No accounts yet — be the first to sign up!
          </div>
        )}
        <FloatingLabelInput id="si-email" label="Username or email" value={id}
          onChange={(e) => setId(e.target.value)} autoComplete="username" disabled={busy}
          leftElement={<User size={18} />} />
        <FloatingLabelInput id="si-pwd" label="Password"
          type={showPwd ? 'text' : 'password'} value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoComplete="current-password" disabled={busy}
          leftElement={<Lock size={18} />}
          rightElement={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <AnimatePresence>
          {err && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 font-medium px-1">
              {err}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="pt-1">
          <ShimmerButton type="submit" disabled={busy}
            className="w-full h-12 font-bold shadow-lg shadow-pitch/25 disabled:opacity-60"
            shimmerColor="#ffffff40" background="#1F8A5C">
            {busy
              ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Signing in…</span>
              : <span className="flex items-center gap-2"><User size={15} /> Sign In</span>}
          </ShimmerButton>
        </div>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// SIGN UP FORM
// ══════════════════════════════════════════════════════════════
function SignUpForm({ showToast, onPlayerLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', name: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    setErr('');
    if (!form.name || !form.username || !form.email || !form.password) return setErr('All fields are required.');
    if (form.password !== form.confirm) return setErr("Passwords don't match.");
    setBusy(true);
    const res = await signUpPlayer(form);
    if (res.error) { setBusy(false); return setErr(res.error); }
    await setAuthCookie('player', res.player.id);
    showToast?.(`Welcome to the league, ${res.player.name}! Set up your avatar in Profile.`);
    onPlayerLogin(res.player);
  };

  const eyeBtn = (
    <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground hover:text-foreground transition-colors">
      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <motion.div animate={err ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
      <form onSubmit={submit} className="space-y-3">
        <FloatingLabelInput id="su-name" label="Display Name" value={form.name}
          onChange={(e) => set('name', e.target.value)} autoComplete="name" disabled={busy}
          leftElement={<User size={18} />} />
        <FloatingLabelInput id="su-user" label="@Username" value={form.username}
          onChange={(e) => set('username', e.target.value)} autoComplete="username" disabled={busy}
          leftElement={<User size={18} />} />
        <FloatingLabelInput id="su-email" label="Email address" type="email" value={form.email}
          onChange={(e) => set('email', e.target.value)} autoComplete="email" disabled={busy}
          leftElement={<Mail size={18} />} />
        <div className="grid grid-cols-2 gap-3">
          <FloatingLabelInput id="su-pwd" label="Password"
            type={showPwd ? 'text' : 'password'} value={form.password}
            onChange={(e) => set('password', e.target.value)} autoComplete="new-password" disabled={busy}
            leftElement={<Lock size={18} />} />
          <FloatingLabelInput id="su-confirm" label="Confirm"
            type={showPwd ? 'text' : 'password'} value={form.confirm}
            onChange={(e) => set('confirm', e.target.value)}
            leftElement={<Lock size={18} />}
            rightElement={eyeBtn} autoComplete="new-password" disabled={busy} />
        </div>
        <AnimatePresence>
          {err && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 font-medium px-1">
              {err}
            </motion.p>
          )}
        </AnimatePresence>
        <p className="text-[10px] text-muted-foreground/50 text-center px-2">
          Avatar, flag & club crest can be set after sign-up in your Profile.
        </p>
        <div className="pt-1">
          <ShimmerButton type="submit" disabled={busy}
            className="w-full h-12 font-bold shadow-lg disabled:opacity-60"
            shimmerColor="#ffffff40" background="#1F8A5C">
            {busy
              ? <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Creating account…</span>
              : <span className="flex items-center gap-2"><UserPlus size={15} /> Create Account</span>}
          </ShimmerButton>
        </div>
      </form>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADMIN LOGIN FORM
// ══════════════════════════════════════════════════════════════
function AdminLoginForm({ onAdminLogin, onBack }) {
  const [username, setUsername] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (busy) return;
    if (!username || !pwd) return setErr('Enter both username and password.');
    setErr(''); setBusy(true);
    const res = await fetch('/api/admin', { method: 'POST', body: JSON.stringify({ username, password: pwd }) });
    if (res.ok) { 
      const data = await res.json();
      await setAuthCookie(data.role || 'admin'); 
      onAdminLogin(); 
    }
    else { setBusy(false); setErr('Incorrect credentials.'); }
  };

  return (
    <motion.div animate={err ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
      {/* Admin badge header */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(217,169,59,0.1)', border: '1px solid rgba(217,169,59,0.22)' }}>
          <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: 'rgba(217,169,59,0.08)', animationDuration: '2s' }} />
          <ShieldAlert size={24} className="text-gold relative z-10" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground tracking-tight">Admin Console</h3>
        <p className="text-xs text-muted-foreground/55 mt-0.5 text-center">Restricted — authorized personnel only</p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <FloatingLabelInput id="admin-user" label="Username"
          type="text" value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoComplete="username" disabled={busy}
          leftElement={<User size={18} />}
        />
        <FloatingLabelInput id="admin-pwd" label="Master Password"
          type={showPwd ? 'text' : 'password'} value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          autoComplete="current-password" disabled={busy}
          leftElement={<Lock size={18} />}
          rightElement={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <AnimatePresence>
          {err && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 font-medium px-1 text-center">
              {err}
            </motion.p>
          )}
        </AnimatePresence>
        <ShimmerButton type="submit" disabled={busy}
          className="w-full h-12 font-bold shadow-lg disabled:opacity-60"
          shimmerColor="#ffffff40" background="#D9A93B">
          {busy
            ? <span className="flex items-center gap-2 text-black"><Loader2 size={15} className="animate-spin" /> Verifying…</span>
            : <span className="flex items-center gap-2 text-black"><Lock size={15} /> Enter Console</span>}
        </ShimmerButton>
      </form>
      <motion.button
        whileHover={{ x: -2 }}
        onClick={onBack}
        className="w-full text-center text-xs mt-5 text-muted-foreground/45 hover:text-muted-foreground transition-colors py-2"
      >
        ← Back to player sign in
      </motion.button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHARED TAB TOGGLE
// ══════════════════════════════════════════════════════════════
function TabToggle({ mode, setMode, layoutId }) {
  return (
    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-border/50 dark:border-white/[0.08]">
      {['signin', 'signup'].map((key) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`relative flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors z-10 ${mode === key ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'}`}
        >
          {key === 'signin' ? 'Sign In' : 'Sign Up'}
          {mode === key && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 bg-pitch rounded-lg -z-10"
              transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN AUTHGATE COMPONENT
// ══════════════════════════════════════════════════════════════
export default function AuthGate({ players = [], showToast }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'admin'

  const handlePlayerLogin = () => { window.location.href = '/dashboard'; };
  const handleAdminLogin = () => { window.location.href = '/admin'; };

  const visibleCards = players.slice(0, 5);

  return (
    <div className="min-h-[100dvh] bg-background dark:bg-[#0B0E14] text-foreground overflow-hidden">

      {/* ╔══════════════════════════════════════════╗
          ║  DESKTOP — Split-Screen Stadium Layout   ║
          ╚══════════════════════════════════════════╝ */}
      <div className="hidden md:grid grid-cols-[3fr_2fr] xl:grid-cols-[7fr_5fr] min-h-[100dvh]">

        {/* ─── LEFT PANEL: Dynamic Pitch (Daytime Light / Nighttime Dark) ─── */}
        <div
          className="relative flex flex-col overflow-hidden bg-emerald-950/5 dark:bg-[#0A0D14] text-foreground transition-colors duration-300"
        >
          {/* Pitch SVG */}
          <PitchSVG />

          {/* Radial glow / Daytime pitch gradient layers */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/60 via-slate-100/40 to-background dark:from-transparent dark:to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_50%,rgba(31,138,92,0.18)_0%,transparent_70%)] hidden dark:block" />
            <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-background dark:from-[#0B0E14] to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background/50 dark:from-[#0B0E14]/50 to-transparent" />
          </div>

          {/* Floating player cards */}
          {visibleCards.map((p, i) => (
            <FloatingPlayerCard
              key={p.id}
              player={p}
              delay={0.35 + i * 0.15}
              posStyle={FLOAT_POSITIONS[i]}
            />
          ))}

          {/* Brand + description */}
          <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-10 xl:px-16 py-12">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="max-w-md"
            >
              <div className="mb-5 flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 shadow-[0_0_20px_rgba(217,169,59,0.15)]">
                <Trophy size={32} className="text-gold" />
              </div>
              <h1
                className="font-heading font-black tracking-tight text-foreground leading-none mb-4"
                style={{ fontSize: 'clamp(2.6rem,5vw,4rem)' }}
              >
                GOLAZO
                <br />
                <span style={{ color: '#29C179', textShadow: '0 0 45px rgba(41,193,121,0.45)' }}>
                  HUB
                </span>
              </h1>
              <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-sm mb-8">
                Your crew&apos;s matchday headquarters. Track seasons, score live goals, and own the pitch.
              </p>

              {/* Player avatars stack */}
              {players.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex -space-x-2.5">
                    {players.slice(0, 5).map((p, i) => (
                      <div key={p.id} style={{ zIndex: 5 - i, position: 'relative' }}>
                        <Avatar p={p} size={34} ring="rgba(41,193,121,0.35)" />
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-pitch-bright font-bold">{players.length}</span>{' '}
                    player{players.length !== 1 ? 's' : ''} in the league
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Soft gradient seam connecting to right panel */}
          <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-background dark:from-[#0D1118] to-transparent pointer-events-none z-20" />
        </div>

        {/* ─── RIGHT PANEL: Auth form ─── */}
        <div className="relative flex flex-col items-center justify-center bg-background dark:bg-[#0D1118] px-8 lg:px-10 xl:px-14 py-12 overflow-auto">
          {/* Top glow */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-[radial-gradient(ellipse_at_50%_0%,rgba(31,138,92,0.08)_0%,transparent_70%)] pointer-events-none hidden dark:block" />

          {/* Theme Toggle */}
          <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[380px] relative z-10 bg-card dark:bg-transparent backdrop-blur-sm border border-border dark:border-none shadow-2xl dark:shadow-none rounded-3xl p-6 sm:p-8">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <AnimatedGradientText>
                <span className="font-heading text-xl font-black tracking-wide text-foreground">Golazo Hub</span>
              </AnimatedGradientText>
              <p className="text-xs text-muted-foreground/55 mt-1.5 font-medium">
                {mode === 'admin' ? 'Admin console access' : 'Welcome back, player'}
              </p>
            </motion.div>

            {/* Tab toggle */}
            <AnimatePresence>
              {mode !== 'admin' && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mb-5"
                >
                  <TabToggle mode={mode} setMode={setMode} layoutId="desktop-tab-pill" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form area (no card wrapper on desktop — clean panel) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.99 }}
                transition={{ duration: 0.18 }}
              >
                {mode === 'signin' && <SignInForm players={players} onPlayerLogin={handlePlayerLogin} />}
                {mode === 'signup' && <SignUpForm showToast={showToast} onPlayerLogin={handlePlayerLogin} />}
                {mode === 'admin' && <AdminLoginForm onAdminLogin={handleAdminLogin} onBack={() => setMode('signin')} />}
              </motion.div>
            </AnimatePresence>

            {/* Admin hold-to-reveal */}
            {mode !== 'admin' && (
              <div className="mt-6 flex justify-center">
                <HoldToReveal onReveal={() => setMode('admin')} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ╔══════════════════════════════════════════╗
          ║  MOBILE — Stacked Layout                 ║
          ╚══════════════════════════════════════════╝ */}
      <div className="md:hidden flex flex-col min-h-[100dvh] bg-background dark:bg-[#0D1118]">
        {/* Top Header: Pitch Visualization */}
        <div className="relative w-full h-[35dvh] min-h-[260px] flex flex-col items-center justify-center overflow-hidden shrink-0 bg-emerald-950/5 dark:bg-[#0A0D14]">
          <PitchSVG className="opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/40 via-transparent to-background dark:from-transparent dark:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(31,138,92,0.15)_0%,transparent_70%)] hidden dark:block" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background dark:from-[#0D1118] to-transparent z-10" />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-20 flex flex-col items-center text-center px-4"
          >
            <div className="mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 shadow-[0_0_20px_rgba(217,169,59,0.15)]">
              <Trophy size={28} className="text-gold" />
            </div>
            <AnimatedGradientText>
              <h1 className="font-heading text-3xl font-black text-foreground tracking-tight">Golazo Hub</h1>
            </AnimatedGradientText>
            <p className="text-sm text-muted-foreground/80 mt-2 font-medium max-w-[280px]">
              Matchday central for the crew
            </p>
          </motion.div>
        </div>

        {/* Bottom Area: Auth Form */}
        <div className="relative flex-1 flex flex-col items-center px-5 pt-4 pb-10 z-20 bg-background dark:bg-[#0D1118]">
          {/* Theme Toggle for Mobile */}
          <div className="absolute top-4 right-4 z-50 md:hidden">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-[360px] flex flex-col gap-6 bg-card dark:bg-transparent border border-border dark:border-none shadow-xl dark:shadow-none rounded-3xl p-5 mt-4">
            {/* Tab toggle */}
            {mode !== 'admin' && (
              <TabToggle mode={mode} setMode={setMode} layoutId="mobile-tab-pill" />
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="w-full"
              >
                {mode === 'signin' && <SignInForm players={players} onPlayerLogin={handlePlayerLogin} />}
                {mode === 'signup' && <SignUpForm showToast={showToast} onPlayerLogin={handlePlayerLogin} />}
                {mode === 'admin' && <AdminLoginForm onAdminLogin={handleAdminLogin} onBack={() => setMode('signin')} />}
              </motion.div>
            </AnimatePresence>

            {/* Admin hold-to-reveal */}
            {mode !== 'admin' && (
              <div className="flex justify-center mt-2">
                <HoldToReveal onReveal={() => setMode('admin')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
