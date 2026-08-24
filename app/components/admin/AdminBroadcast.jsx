'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Radio, MonitorPlay, Clock, CalendarDays, Trophy,
  SlidersHorizontal, CheckCircle2, Palette, Type,
  Minimize2, Minus, Maximize2, BarChart3, Zap, Flame,
  Save, ChevronDown, Eye, EyeOff,
  Dot, AlignJustify, Diamond, Slash, Ban, Loader2,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, FadeIn } from '@/app/components/shared/UI';
import { saveTickerConfig } from '@/app/actions/admin';
import SportsTicker from '@/app/components/shared/SportsTicker';
import { THEMES } from '@/app/components/shared/SportsTickerBadges';
import { cn } from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_TICKER = {
  enabled: true,
  source: 'live_recent',
  customMatchIds: [],
  selectedSeasonId: '',
  speed: 50,
  showAvatars: true,
  pauseOnHover: true,
  theme: 'classic',
  size: 'normal',
  separator: 'dot',
  breakingNews: '',
  showStats: false,
  showHighlights: false,
  showStreaks: false,
  playerToWatch: { active: false, playerId: '' },
  customHighlights: [],
  epicMoment: { active: false, playerId: '', text: '' },
  replayTrigger: null,
};

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS (top-level, no nesting)
// ─────────────────────────────────────────────────────────────────────────────

// ── Toggle ────────────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, desc, id }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-4 cursor-pointer py-1"
    >
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-foreground/90 leading-snug">{label}</span>
        {desc && (
          <span className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</span>
        )}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch',
          checked ? 'bg-pitch' : 'bg-secondary border border-border',
        )}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 35 }}
          className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white shadow-md',
            checked ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </label>
  );
}

// ── Feed Source Radio Button ───────────────────────────────────────────────────
function FeedSourceButton({ value, label, icon: Icon, current, onChange }) {
  const active = current === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border text-left',
        active
          ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
          : 'border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground hover:border-white/[0.08]',
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-colors',
        active ? 'bg-amber-500/20' : 'bg-white/[0.04]',
      )}>
        <Icon size={16} className={active ? 'text-amber-400' : 'text-muted-foreground'} />
      </div>
      <span>{label}</span>
      {active && (
        <CheckCircle2 size={15} className="ml-auto text-amber-400 shrink-0" />
      )}
    </button>
  );
}

// ── Theme Studio Card ─────────────────────────────────────────────────────────
function ThemeCard({ theme, isSelected, onSelect, onHoverEnter, onHoverLeave, previewEnabled }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(theme.id)}
      onMouseEnter={() => previewEnabled && onHoverEnter(theme.id)}
      onMouseLeave={() => previewEnabled && onHoverLeave()}
      className={cn(
        'relative flex flex-col p-3 rounded-xl border transition-all text-left overflow-hidden cursor-pointer',
        isSelected
          ? 'bg-amber-500/10 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/30'
          : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]',
      )}
    >
      {isSelected && (
        <motion.div
          layoutId="theme-selected-glow"
          className="absolute inset-0 rounded-xl bg-amber-500/5 pointer-events-none"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}

      <div className="flex items-center gap-2 mb-2.5 relative z-10">
        <div className={cn(
          'flex items-center justify-center w-7 h-7 rounded-lg shrink-0 text-base',
          isSelected ? 'bg-amber-500/20' : 'bg-white/[0.05]',
        )}>
          <span>{theme.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-[10px] font-black uppercase tracking-wider truncate leading-none',
            isSelected ? 'text-amber-300' : 'text-foreground/80',
          )}>
            {theme.name}
          </div>
          <div className="text-[9px] text-muted-foreground truncate mt-0.5">{theme.desc}</div>
        </div>
        {isSelected && (
          <CheckCircle2 size={13} className="text-amber-400 shrink-0" />
        )}
      </div>

      {/* Mini Preview Bar */}
      <div
        className="w-full h-8 rounded-md overflow-hidden relative border border-white/[0.08] z-10"
        style={theme.wrap}
      >
        <div className="absolute inset-0 flex items-center px-2">
          <div
            className="flex items-center gap-1.5"
            style={{ ...theme.chip, borderRadius: theme.radius }}
          >
            <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ color: theme.team, fontFamily: theme.font }}>
              RVR
            </span>
            <span
              className="text-[10px] font-extrabold"
              style={{ color: theme.score, fontFamily: theme.mono ? "'JetBrains Mono', monospace" : theme.font }}
            >
              2-1
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5" style={{ color: theme.team, fontFamily: theme.font }}>
              EMB
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Size Picker ───────────────────────────────────────────────────────────────
function SizePicker({ current, onChange }) {
  const sizes = [
    { id: 'compact', label: 'Compact', icon: Minimize2 },
    { id: 'normal',  label: 'Normal',  icon: Minus },
    { id: 'large',   label: 'Large',   icon: Maximize2 },
  ];
  return (
    <div className="flex gap-1 p-1 bg-black/20 rounded-xl border border-white/[0.06]">
      {sizes.map(s => {
        const Icon = s.icon;
        const active = current === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold flex-1 justify-center transition-all duration-200 cursor-pointer',
              active
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.05] border border-transparent',
            )}
          >
            <Icon size={13} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Separator Picker ──────────────────────────────────────────────────────────
function SeparatorPicker({ current, onChange }) {
  const options = [
    { id: 'dot',     label: '·',  name: 'Dot',     Icon: Dot },
    { id: 'pipe',    label: '│',  name: 'Pipe',    Icon: AlignJustify },
    { id: 'diamond', label: '◆',  name: 'Diamond', Icon: Diamond },
    { id: 'slash',   label: '//', name: 'Slash',   Icon: Slash },
    { id: 'none',    label: '—',  name: 'None',    Icon: Ban },
  ];
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt => {
        const active = current === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={opt.name}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-sm transition-all border min-w-[52px] cursor-pointer',
              active
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/35 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
                : 'bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06] hover:text-foreground',
            )}
          >
            <span className="text-base leading-none font-bold">{opt.label}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{opt.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Smart Content Card ────────────────────────────────────────────────────────
function SmartContentCard({ icon: Icon, label, desc, color, checked, onChange, id }) {
  return (
    <motion.div
      animate={checked ? { borderColor: 'rgba(245,158,11,0.3)' } : { borderColor: 'rgba(255,255,255,0.06)' }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border cursor-default flex-1 min-w-0"
    >
      <div className="flex items-start justify-between gap-2">
        <motion.div
          animate={checked ? { backgroundColor: `${color}20`, color } : {}}
          className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.05] shrink-0"
          style={checked ? { backgroundColor: `${color}20`, color } : {}}
        >
          <Icon size={18} />
        </motion.div>
        <button
          id={id}
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pitch',
            checked ? 'bg-pitch' : 'bg-secondary border border-border',
          )}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 700, damping: 35 }}
            className={cn('absolute top-1 w-4 h-4 rounded-full bg-white shadow-md', checked ? 'left-6' : 'left-1')}
          />
        </button>
      </div>
      <div>
        <p className="text-sm font-bold text-foreground/90 leading-snug">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Loading Screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[460px] w-full rounded-3xl bg-black/20 border border-white/[0.06] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06)_0%,transparent_70%)]" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 border-[3px] border-amber-500/15 rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute inset-2 border-[3px] border-t-amber-500 border-r-amber-500/50 border-b-transparent border-l-transparent rounded-full animate-[spin_1.8s_ease-in-out_infinite]" />
          <div className="absolute inset-4 bg-amber-500/10 rounded-full animate-pulse blur-sm" />
          <MonitorPlay size={26} className="text-amber-500 relative z-10" />
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <h3 className="font-heading font-black text-sm uppercase tracking-[0.2em] text-foreground/80">
            Initializing Control Center
          </h3>
          <div className="flex items-center gap-1.5">
            {[0, 150, 300].map(delay => (
              <div
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminBroadcast({
  matches = [],
  players = [],
  announcements = [],
  seasons = [],
  showToast,
  onTickerConfigSaved,
  tickerConfig,
}) {
  const [draft, setDraft]               = useState(DEFAULT_TICKER);
  const [saved, setSaved]               = useState(DEFAULT_TICKER);
  const [saving, setSaving]             = useState(false);
  const [hoverTheme, setHoverTheme]     = useState(null);   // theme id being hovered
  const [hoverPreview, setHoverPreview] = useState(true);   // on/off toggle for preview-on-hover

  // Update local state when tickerConfig is loaded from server
  useEffect(() => {
    if (tickerConfig) {
      const fullConfig = { ...DEFAULT_TICKER, ...tickerConfig };
      setDraft(fullConfig);
      setSaved(fullConfig);
    }
  }, [tickerConfig]);

  const update = useCallback((key, value) => {
    setDraft(prev => ({ ...prev, [key]: value }));
  }, []);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveTickerConfig(draft);
      if (res?.error) {
        showToast?.(res.error);
      } else {
        setSaved(draft);
        onTickerConfigSaved?.(draft);
        showToast?.('Broadcast settings saved!');
      }
    } catch {
      showToast?.('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  // The theme shown in the Command Bar preview (hover overrides draft)
  const previewTheme = hoverPreview && hoverTheme
    ? { ...draft, theme: hoverTheme }
    : draft;



  const feedSources = [
    { value: 'live',           label: 'Live Only',       icon: Radio },
    { value: 'live_recent',    label: 'Recent',          icon: Clock },
    { value: 'live_today',     label: 'Today',           icon: CalendarDays },
    { value: 'running_season', label: 'Running Season',  icon: Trophy },
    { value: 'custom',         label: 'Custom Matches',  icon: SlidersHorizontal },
  ];

  return (
    <div className="space-y-5 pb-28">

      {/* ══════════════════════════════════════════════════════════════════
          ZONE 1 — COMMAND BAR (sticky)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 sm:top-2 z-50 -mx-4 px-4 sm:mx-0 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
          className="rounded-2xl border border-white/[0.07] bg-[#0A0D14]/90 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden"
        >
          {/* Top strip: title + status */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <MonitorPlay size={16} className="text-amber-400" />
              </div>
              <div>
                <h2 className="text-sm font-black font-heading uppercase tracking-widest text-foreground/90 leading-none">
                  Live Control Center
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Configure your ticker, themes & smart content
                </p>
              </div>
            </div>

            {/* ON AIR toggle */}
            <button
              onClick={() => update('enabled', !draft.enabled)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-300 cursor-pointer',
                draft.enabled
                  ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.2)]'
                  : 'bg-secondary/50 text-muted-foreground border-border/50',
              )}
            >
              <motion.div
                animate={draft.enabled ? { scale: [1, 1.3, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className={cn(
                  'w-2 h-2 rounded-full',
                  draft.enabled ? 'bg-red-500' : 'bg-zinc-500',
                )}
              />
              {draft.enabled ? 'On Air' : 'Off Air'}
            </button>
          </div>

          {/* Ticker preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={draft.enabled ? 'on' : 'off'}
              initial={{ opacity: 0, scaleY: 0.95 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0.95 }}
              transition={{ duration: 0.25 }}
              className="origin-top"
            >
              {draft.enabled ? (
                <SportsTicker
                  matches={matches}
                  announcements={announcements}
                  players={players}
                  tickerConfig={previewTheme}
                  previewMode={true}
                  activeSeasonId={seasons?.find(s => !s.isArchived)?.id}
                />
              ) : (
                <div className="flex items-center justify-center h-10 text-[11px] font-semibold text-muted-foreground tracking-widest uppercase bg-black/20">
                  — Ticker Disabled —
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONE 2 — BENTO GRID
      ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* ── Feed Source ────────────────────────────────────────────────── */}
        <FadeIn delay={0.05}>
          <Card className="p-5 h-full">
            <div className="flex items-center gap-2.5 mb-4">
              <Radio size={18} className="text-pitch-bright shrink-0" />
              <h3 className="text-base font-bold font-heading text-foreground">Feed Source</h3>
            </div>

            <div className="flex flex-col gap-1">
              {feedSources.map(src => (
                <FeedSourceButton
                  key={src.value}
                  value={src.value}
                  label={src.label}
                  icon={src.icon}
                  current={draft.source}
                  onChange={v => update('source', v)}
                />
              ))}
            </div>

            {/* Custom match selector */}
            <AnimatePresence>
              {draft.source === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Matches
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {draft.customMatchIds?.length || 0} selected
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                      {matches.map(m => {
                        const h = players.find(p => p.id === m.homeId);
                        const a = players.find(p => p.id === m.awayId);
                        const checked = draft.customMatchIds?.includes(m.id);
                        const isLive = m.status === 'live';
                        return (
                          <label
                            key={m.id}
                            className={cn(
                              'flex items-center p-2.5 rounded-xl cursor-pointer transition-all border text-xs font-semibold',
                              checked
                                ? 'bg-pitch-bright/10 border-pitch-bright/30'
                                : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]',
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                update(
                                  'customMatchIds',
                                  checked
                                    ? draft.customMatchIds.filter(id => id !== m.id)
                                    : [...(draft.customMatchIds || []), m.id],
                                )
                              }
                              className="hidden"
                            />
                            <div
                              className={cn(
                                'w-4 h-4 rounded border flex items-center justify-center mr-3 shrink-0 transition-colors',
                                checked ? 'bg-pitch-bright border-pitch-bright' : 'border-zinc-600',
                              )}
                            >
                              {checked && <CheckCircle2 size={10} className="text-black" />}
                            </div>
                            <span className="flex-1 truncate">
                              {h?.name || 'Unknown'} vs {a?.name || 'Unknown'}
                            </span>
                            {isLive && (
                              <span className="ml-2 text-[9px] font-black text-red-400 uppercase shrink-0">
                                Live
                              </span>
                            )}
                          </label>
                        );
                      })}
                      {matches.length === 0 && (
                        <p className="text-sm text-muted-foreground py-3 text-center">No matches found.</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>


          </Card>
        </FadeIn>

        {/* ── Theme Studio ───────────────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <Card className="p-5 h-full md:col-span-1 xl:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Palette size={18} className="text-pitch-bright shrink-0" />
                <h3 className="text-base font-bold font-heading text-foreground">Theme Studio</h3>
              </div>
              {/* Preview-on-hover toggle */}
              <button
                onClick={() => setHoverPreview(p => !p)}
                title={hoverPreview ? 'Disable preview on hover' : 'Enable preview on hover'}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer',
                  hoverPreview
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-white/[0.03] text-muted-foreground border-white/[0.06] hover:bg-white/[0.06]',
                )}
              >
                {hoverPreview ? <Eye size={12} /> : <EyeOff size={12} />}
                {hoverPreview ? 'Hover Preview On' : 'Hover Preview Off'}
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
              Choose a visual theme for the ticker.
              {hoverPreview && ' Hover a card to preview it live above.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-0.5 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {THEMES.map(t => (
                  <ThemeCard
                    key={t.id}
                    theme={t}
                    isSelected={draft.theme === t.id}
                    onSelect={v => update('theme', v)}
                    onHoverEnter={setHoverTheme}
                    onHoverLeave={() => setHoverTheme(null)}
                    previewEnabled={hoverPreview}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Card>
        </FadeIn>

        {/* ── Visual Tuning ──────────────────────────────────────────────── */}
        <FadeIn delay={0.15}>
          <Card className="p-5 h-full">
            <div className="flex items-center gap-2.5 mb-5">
              <Type size={18} className="text-pitch-bright shrink-0" />
              <h3 className="text-base font-bold font-heading text-foreground">Visual Tuning</h3>
            </div>

            <div className="flex flex-col gap-5">
              {/* Speed Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Scroll Speed
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                    {draft.speed}%
                  </span>
                </div>
                <div className="relative">
                  {/* Track gradient fill */}
                  <div className="relative h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-150"
                      style={{ width: `${draft.speed}%` }}
                    />
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={draft.speed}
                    onChange={e => update('speed', Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
                    style={{ WebkitAppearance: 'none' }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] pointer-events-none transition-all duration-150"
                    style={{ left: `calc(${draft.speed}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>

              {/* Ticker Size */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Ticker Size
                </span>
                <SizePicker current={draft.size} onChange={v => update('size', v)} />
              </div>

              {/* Separator */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                  Item Separator
                </span>
                <SeparatorPicker current={draft.separator} onChange={v => update('separator', v)} />
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col gap-3">
                <ToggleSwitch
                  id="toggle-avatars"
                  checked={draft.showAvatars}
                  onChange={v => update('showAvatars', v)}
                  label="Show Player Avatars"
                  desc="Display profile pictures next to names"
                />
                <div className="h-px bg-white/[0.05]" />
                <ToggleSwitch
                  id="toggle-pausehover"
                  checked={draft.pauseOnHover}
                  onChange={v => update('pauseOnHover', v)}
                  label="Pause on Hover"
                  desc="Stop scrolling when user hovers the ticker"
                />
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ZONE 3 — SMART CONTENT (always visible)
      ══════════════════════════════════════════════════════════════════ */}
      <FadeIn delay={0.2}>
        <Card className="p-5">
          <div className="flex items-center gap-2.5 mb-1">
            <Zap size={18} className="text-pitch-bright shrink-0" />
            <h3 className="text-base font-bold font-heading text-foreground">Smart Content</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4 leading-snug">
            Auto-generated ticker items driven by live match data. These update in real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <SmartContentCard
              id="smart-stats"
              icon={BarChart3}
              label="Stats Ticker Mode"
              desc="Top scorer, league leader, match count"
              color="#22c55e"
              checked={draft.showStats}
              onChange={v => update('showStats', v)}
            />
            <SmartContentCard
              id="smart-highlights"
              icon={Zap}
              label="Highlight Reel"
              desc="Biggest win, total goals from recent matches"
              color="#f59e0b"
              checked={draft.showHighlights}
              onChange={v => update('showHighlights', v)}
            />
            <SmartContentCard
              id="smart-streaks"
              icon={Flame}
              label="Streak Alerts"
              desc="Auto-detect 3+ game win/loss streaks"
              color="#ef4444"
              checked={draft.showStreaks}
              onChange={v => update('showStreaks', v)}
            />
          </div>
        </Card>
      </FadeIn>

      {/* ══════════════════════════════════════════════════════════════════
          ZONE 4 — ACTION FOOTER (dirty-state aware)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] z-40 pointer-events-none">
        <AnimatePresence>
          {(isDirty || saving) && (
            <motion.div
              key="save-bar"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 35 }}
              className="pointer-events-auto"
            >
              <div className="flex items-center justify-between gap-4 mx-4 mb-4 md:mx-6 md:mb-6 px-5 py-3.5 rounded-2xl bg-[#0A0D14]/95 backdrop-blur-xl border border-white/[0.1] shadow-[0_-4px_40px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span className="text-xs font-semibold text-muted-foreground">
                    You have unsaved changes
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setDraft(saved)}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-white/[0.06] border border-white/[0.08] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <motion.button
                    whileHover={saving ? {} : { scale: 1.03, y: -1 }}
                    whileTap={saving ? {} : { scale: 0.96 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-pitch text-white shadow-[0_0_20px_rgba(34,197,94,0.25)] hover:shadow-[0_0_28px_rgba(34,197,94,0.4)] transition-shadow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? 'Saving…' : 'Save Changes'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge shine animation */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}} />
    </div>
  );
}
