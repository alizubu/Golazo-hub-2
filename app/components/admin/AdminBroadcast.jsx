'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Megaphone, Radio, Zap, TrendingUp, Flame, Eye, Type, Minus, Maximize2, Minimize2, X, Plus, Search, Star, User } from 'lucide-react';
import { Card, Label, SectionTitle, FadeIn, ShinyButton, Badge } from '@/app/components/shared/UI';
import { AnimatePresence, motion } from 'framer-motion';
import { saveTickerConfig } from '@/app/actions/admin';
import SportsTicker from '@/app/components/shared/SportsTicker';
import { THEMES, SEPARATORS, CyberNeonBadge, GoldStandardBadge, FrostGlassBadge, HolographicBadge, MatrixGreenBadge, LavaFlowBadge, ElectricPurpleBadge, SunriseBurstBadge, LiquidChromeBadge, NeonPopBadge, InfernoBadge, AbsoluteZeroBadge, ToxicFormBadge, RoyalMomentumBadge, VelocityBadge } from '@/app/components/shared/SportsTickerBadges';


const BADGE_MAP = {
  CyberNeon: CyberNeonBadge,
  GoldStandard: GoldStandardBadge,
  FrostGlass: FrostGlassBadge,
  Holographic: HolographicBadge,
  MatrixGreen: MatrixGreenBadge,
  LavaFlow: LavaFlowBadge,
  ElectricPurple: ElectricPurpleBadge,
  SunriseBurst: SunriseBurstBadge,
  LiquidChrome: LiquidChromeBadge,
  NeonPop: NeonPopBadge,
  Inferno: InfernoBadge,
  AbsoluteZero: AbsoluteZeroBadge,
  ToxicForm: ToxicFormBadge,
  RoyalMomentum: RoyalMomentumBadge,
  Velocity: VelocityBadge
};

const BADGE_OPTIONS = [
  { id: 'CyberNeon', name: 'Cyber Neon', type: 'STATS' },
  { id: 'GoldStandard', name: 'Gold Standard', type: 'STATS' },
  { id: 'FrostGlass', name: 'Frost Glass', type: 'STATS' },
  { id: 'Holographic', name: 'Holographic', type: 'STATS' },
  { id: 'MatrixGreen', name: 'Matrix Green', type: 'STATS' },
  { id: 'LavaFlow', name: 'Lava Flow', type: 'HIGHLIGHT' },
  { id: 'ElectricPurple', name: 'Electric Purple', type: 'HIGHLIGHT' },
  { id: 'SunriseBurst', name: 'Sunrise Burst', type: 'HIGHLIGHT' },
  { id: 'LiquidChrome', name: 'Liquid Chrome', type: 'HIGHLIGHT' },
  { id: 'NeonPop', name: 'Neon Pop', type: 'HIGHLIGHT' },
  { id: 'Inferno', name: 'Inferno', type: 'STREAK' },
  { id: 'AbsoluteZero', name: 'Absolute Zero', type: 'STREAK' },
  { id: 'ToxicForm', name: 'Toxic Form', type: 'STREAK' },
  { id: 'RoyalMomentum', name: 'Royal Momentum', type: 'STREAK' },
  { id: 'Velocity', name: 'Velocity', type: 'STREAK' }
];

// ── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-2">
      <div className="flex flex-col">
        <span className="text-sm text-foreground/80 font-medium">{label}</span>
        {desc && <span className="text-[11px] text-muted-foreground mt-0.5">{desc}</span>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-pitch' : 'bg-secondary border border-border'}`}
      >
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

// ── Segment Button ───────────────────────────────────────────────────────────
function SegmentBtn({ value, label, icon, current, onChange }) {
  return (
    <button
      onClick={() => onChange(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
        current === value
          ? 'bg-amber-500 text-black shadow-sm scale-95'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

// ── Theme Card ───────────────────────────────────────────────────────────────
function ThemeCard({ theme, isSelected, onSelect }) {
  return (
    <motion.button
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(theme.id)}
      className={`relative flex flex-col p-3 rounded-xl border transition-all text-left overflow-hidden h-full ${
        isSelected
          ? 'bg-amber-500/15 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
          : 'bg-white/[0.02] border-border hover:bg-white/[0.05] hover:border-border dark:border-white/20'
      }`}
    >
      <div className="flex items-center gap-3 mb-3 w-full">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${isSelected ? 'bg-amber-500/20' : 'bg-white/5'}`}>
          <span className="text-lg">{theme.emoji}</span>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${isSelected ? 'text-amber-300' : 'text-foreground'}`}>
              {theme.name}
            </span>
            {isSelected && <CheckCircle2 size={12} className="text-amber-400 shrink-0" />}
          </div>
          <span className="text-[9px] text-muted-foreground leading-tight truncate">{theme.desc}</span>
        </div>
      </div>
      
      {/* Mini Preview Bar */}
      <div className="mt-auto w-full h-10 rounded-md overflow-hidden relative border border-white/10" style={theme.wrap}>
        <div className="absolute inset-0 flex items-center px-2">
          <div className="flex items-center gap-2 whitespace-nowrap" style={{ ...theme.chip, borderRadius: theme.radius }}>
            <span className="text-[10px] font-bold px-2 py-0.5" style={{ color: theme.team, fontFamily: theme.font }}>RVR</span>
            <span className="text-[11px] font-extrabold" style={{ color: theme.score, fontFamily: theme.mono ? "'JetBrains Mono', monospace" : theme.font }}>2-1</span>
            <span className="text-[10px] font-bold px-2 py-0.5" style={{ color: theme.team, fontFamily: theme.font }}>EMB</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Separator Picker ─────────────────────────────────────────────────────────
function SeparatorPicker({ current, onChange }) {
  const options = [
    { id: 'dot', label: '·', name: 'Dot' },
    { id: 'ball', label: '⚽', name: 'Ball' },
    { id: 'pipe', label: '│', name: 'Pipe' },
    { id: 'diamond', label: '◆', name: 'Diamond' },
    { id: 'slash', label: '//', name: 'Slash' },
    { id: 'none', label: '—', name: 'None' },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-lg transition-all border min-w-[52px] ${
            current === opt.id
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 shadow-sm'
              : 'bg-white/5 text-muted-foreground border-transparent hover:bg-white/10 hover:text-muted-foreground'
          }`}
          title={opt.name}
        >
          <span className="text-base leading-none">{opt.label}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">{opt.name}</span>
        </button>
      ))}
    </div>
  );
}

// ── Size Picker ──────────────────────────────────────────────────────────────
function SizePicker({ current, onChange }) {
  const sizes = [
    { id: 'compact', label: 'Compact', icon: Minimize2 },
    { id: 'normal', label: 'Normal', icon: Minus },
    { id: 'large', label: 'Large', icon: Maximize2 },
  ];
  return (
    <div className="flex gap-2">
      {sizes.map(s => {
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            onClick={() => onChange(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border flex-1 justify-center ${
              current === s.id
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                : 'bg-white/5 text-muted-foreground border-transparent hover:bg-white/10'
            }`}
          >
            <Icon size={14} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminBroadcast({ matches = [], players = [], announcements = [], showToast, onTickerConfigSaved }) {
  const DEFAULT_TICKER = {
    enabled: true, source: 'live_recent', customMatchIds: [], speed: 50,
    showAvatars: true, pauseOnHover: true, theme: 'classic',
    size: 'normal', separator: 'dot', breakingNews: '',
    showStats: false, showHighlights: false, showStreaks: false,
    playerToWatch: { active: false, playerId: '' }, customHighlights: [],
    epicMoment: { active: false, playerId: '', text: '' }, replayTrigger: null
  };

  const [draft, setDraft] = useState(DEFAULT_TICKER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCustomHighlight, setNewCustomHighlight] = useState('');
  const [newBadgeType, setNewBadgeType] = useState('LavaFlow');
  
  // Theme Gallery state
  const [themeQuery, setThemeQuery] = useState('');
  const [activeThemeTag, setActiveThemeTag] = useState(null);
  const allTags = [...new Set(THEMES.flatMap(t => t.tags || []))].sort();
  const filteredThemes = THEMES.filter(t => 
    (!activeThemeTag || (t.tags && t.tags.includes(activeThemeTag))) &&
    t.name.toLowerCase().includes(themeQuery.toLowerCase())
  );
  
  const selectedThemeObj = THEMES.find(t => t.id === draft.theme) || THEMES[0];
  const isLightMode = selectedThemeObj?.page === 'light';

  useEffect(() => {
    fetch('/api/admin/ticker-config')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.config) {
          setDraft(prev => ({ ...prev, ...data.config }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await saveTickerConfig(draft);
    if (res.error) showToast(res.error);
    else {
      showToast("✅ Broadcast settings saved!");
      if (onTickerConfigSaved) onTickerConfigSaved(res.config);
    }
    setSaving(false);
  };

  const update = (key, val) => setDraft(d => ({ ...d, [key]: val }));

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground text-sm py-16 justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-pitch-bright animate-spin" />
        Initializing broadcast systems…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Radio size={20} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-bold text-foreground">Broadcast Control Room</h2>
            <p className="text-xs text-muted-foreground">Configure your live ticker, themes, and smart content</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
          draft.enabled
            ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
            : 'bg-secondary dark:bg-zinc-900 text-muted-foreground border-border dark:border-zinc-800'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${draft.enabled ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
          {draft.enabled ? 'ON AIR' : 'OFF AIR'}
        </div>
      </div>

      {/* ── On-Air Preview (Sticky) ─────────────────────────────────────────── */}
      <div className="sticky top-0 sm:top-4 z-50 -mx-4 px-4 sm:mx-0 sm:px-0">
        <Card className={`p-4 sm:p-5 shadow-2xl transition-colors duration-500 ${isLightMode ? 'bg-[#f4f6fb] border-[#e2e8f0]' : 'bg-background/80 border-border'}`}>
          <div className="flex items-center justify-between mb-3">
            <Label className={`font-bold uppercase tracking-widest text-[10px] ${isLightMode ? 'text-[#059669]' : 'text-pitch-bright'}`}>On-Air Preview</Label>
            <Badge className={`text-[9px] ${isLightMode ? 'bg-[#e2e8f0] text-gray-700 border-transparent' : 'bg-secondary dark:bg-zinc-900 text-muted-foreground border-border dark:border-zinc-800'}`}>
              {draft.theme?.toUpperCase() || 'CLASSIC'} ({isLightMode ? 'LIGHT' : 'DARK'})
            </Badge>
          </div>
          <div className="rounded-lg overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
            <SportsTicker
              matches={matches}
              announcements={announcements}
              players={players}
              tickerConfig={draft}
              previewMode={true}
            />
          </div>
        </Card>
      </div>

      {/* ── Master Controls ─────────────────────────────────────────────────── */}
      <FadeIn delay={0.05}>
        <Card className="p-4 sm:p-6">
          <SectionTitle icon={Activity}>Master Controls</SectionTitle>
          <div className="mt-4 flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-white/5 border border-border/50">
              <Toggle
                checked={draft.enabled}
                onChange={v => update('enabled', v)}
                label="Enable site-wide broadcast"
                desc="When enabled, the ticker appears at the top of every page"
              />
            </div>

            {/* Speed Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-muted-foreground">Scroll Speed</Label>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">{draft.speed}%</span>
              </div>
              <div className="relative px-1">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={draft.speed}
                  onChange={e => update('speed', Number(e.target.value))}
                  className="w-full h-2 bg-secondary dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(245,158,11,0.5)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-amber-300 [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>🐢 Slow</span>
                  <span>⚡ Fast</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* ── Breaking News ───────────────────────────────────────────────────── */}
      <FadeIn delay={0.1}>
        <Card className="p-4 sm:p-6 border-red-500/10">
          <SectionTitle icon={Megaphone}>Breaking News Banner</SectionTitle>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Type a message to display as a red &quot;BREAKING&quot; alert in the ticker. Leave empty to disable.</p>
          <div className="relative">
            <input
              type="text"
              value={draft.breakingNews}
              onChange={e => update('breakingNews', e.target.value)}
              placeholder="e.g. Ali Zubu breaks the all-time goal record!"
              className="w-full px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/20 text-sm"
            />
            {draft.breakingNews && (
              <button
                onClick={() => update('breakingNews', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* ── Content Feed Source ──────────────────────────────────────────────── */}
      <FadeIn delay={0.15}>
        <Card className="p-4 sm:p-6">
          <SectionTitle icon={Eye}>Content Feed Source</SectionTitle>
          <div className="mt-4">
            <div className="flex flex-wrap p-1 bg-secondary dark:bg-zinc-900 rounded-lg w-fit border border-border/50">
              <SegmentBtn icon="📺" value="live" label="Live Only" current={draft.source} onChange={v => update('source', v)} />
              <SegmentBtn icon="🕒" value="live_recent" label="Recent" current={draft.source} onChange={v => update('source', v)} />
              <SegmentBtn icon="📅" value="live_today" label="Today" current={draft.source} onChange={v => update('source', v)} />
              <SegmentBtn icon="🏆" value="running_season" label="Running Season" current={draft.source} onChange={v => update('source', v)} />
              <SegmentBtn icon="⚙️" value="custom" label="Custom" current={draft.source} onChange={v => update('source', v)} />
            </div>
          </div>

          {draft.source === 'custom' && (
            <FadeIn>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-muted-foreground">Select Matches</Label>
                  <span className="text-xs text-muted-foreground">{draft.customMatchIds?.length || 0} selected</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 rounded-xl bg-black/50 border border-border/50 custom-scrollbar">
                  {matches.map(m => {
                    const h = players.find(p => p.id === m.homeId);
                    const a = players.find(p => p.id === m.awayId);
                    const checked = draft.customMatchIds?.includes(m.id);
                    const isLive = m.status === 'live';
                    return (
                      <label key={m.id} className={`flex items-center p-2 rounded-lg cursor-pointer transition-all border ${checked ? 'bg-pitch-bright/10 border-pitch-bright/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => update('customMatchIds', checked ? draft.customMatchIds.filter(id => id !== m.id) : [...(draft.customMatchIds || []), m.id])}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${checked ? 'bg-pitch-bright border-pitch-bright' : 'border-zinc-600'}`}>
                          {checked && <CheckCircle2 size={12} className="text-black" />}
                        </div>
                        <div className="flex-1 min-w-0 flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-2 truncate">
                            <span className="truncate">{h?.name || 'Unknown'}</span>
                            <span className="text-muted-foreground shrink-0">vs</span>
                            <span className="truncate">{a?.name || 'Unknown'}</span>
                          </div>
                          {isLive && <span className="text-[9px] text-red-400 uppercase ml-2">Live</span>}
                        </div>
                      </label>
                    );
                  })}
                  {matches.length === 0 && <p className="text-sm text-muted-foreground p-2 col-span-2">No matches found.</p>}
                </div>
              </div>
            </FadeIn>
          )}
        </Card>
      </FadeIn>

      {/* ── Theme Gallery ───────────────────────────────────────────────────── */}
      <FadeIn delay={0.2}>
        <Card className="p-4 sm:p-6">
          <SectionTitle icon={Eye}>Theme Gallery</SectionTitle>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Choose a visual theme for your broadcast ticker. Each theme has unique badge animations.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={themeQuery}
                onChange={(e) => setThemeQuery(e.target.value)}
                placeholder="Search styles… e.g. glass, neon, retro"
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none bg-secondary dark:bg-zinc-900 border border-border dark:border-zinc-800 text-foreground focus:border-amber-500/50"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveThemeTag(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide transition-colors ${activeThemeTag === null ? 'bg-amber-500 text-black' : 'bg-secondary dark:bg-zinc-900 text-muted-foreground hover:bg-white/10'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveThemeTag(activeThemeTag === tag ? null : tag)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold tracking-wide capitalize transition-colors ${activeThemeTag === tag ? 'bg-amber-500 text-black' : 'bg-secondary dark:bg-zinc-900 text-muted-foreground hover:bg-white/10'}`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence mode="popLayout">
              {filteredThemes.length ? (
                filteredThemes.map(t => (
                  <ThemeCard key={t.id} theme={t} isSelected={draft.theme === t.id} onSelect={v => update('theme', v)} />
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full py-8 text-center text-muted-foreground text-sm">
                  No themes match your search.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </FadeIn>

      {/* ── Visual Settings ─────────────────────────────────────────────────── */}
      <FadeIn delay={0.25}>
        <Card className="p-4 sm:p-6">
          <SectionTitle icon={Type}>Visual Settings</SectionTitle>
          <div className="mt-4 flex flex-col gap-6">
            {/* Size */}
            <div>
              <Label className="mb-3 block text-muted-foreground">Ticker Size</Label>
              <SizePicker current={draft.size} onChange={v => update('size', v)} />
            </div>

            {/* Separator */}
            <div>
              <Label className="mb-3 block text-muted-foreground">Item Separator</Label>
              <SeparatorPicker current={draft.separator} onChange={v => update('separator', v)} />
            </div>

            {/* Toggles */}
            <div className="p-4 rounded-xl bg-white/5 border border-border/50 space-y-2">
              <Toggle
                checked={draft.showAvatars}
                onChange={v => update('showAvatars', v)}
                label="Show player avatars"
                desc="Display player profile pictures next to names"
              />
              <Toggle
                checked={draft.pauseOnHover}
                onChange={v => update('pauseOnHover', v)}
                label="Pause on hover"
                desc="Stop scrolling when the user hovers over the ticker"
              />
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* ── Smart Content ───────────────────────────────────────────────────── */}
      <FadeIn delay={0.3}>
        <Card className="p-4 sm:p-6 border-pitch-bright/10">
          <SectionTitle icon={Zap}>Smart Content</SectionTitle>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Auto-generated ticker items based on match data. These update in real-time.</p>
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-xl bg-white/5 border border-border/50">
              <Toggle
                checked={draft.showStats}
                onChange={v => update('showStats', v)}
                label="📊 Stats Ticker Mode"
                desc="Show top scorer, league leader, and match count"
              />
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border/50">
              <Toggle
                checked={draft.showHighlights}
                onChange={v => update('showHighlights', v)}
                label="⚡ Highlight Reel"
                desc="Biggest win margin, total goals from recent matches"
              />
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border/50">
              <Toggle
                checked={draft.showStreaks}
                onChange={v => update('showStreaks', v)}
                label="🔥 Player Streak Alerts"
                desc="Auto-detect 3+ game win/loss streaks and alert viewers"
              />
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* ── Custom Marquee Badges ────────────────────────────────────────── */}
      <FadeIn delay={0.35}>
        <Card className="p-4 sm:p-6 border-amber-500/20 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-amber-950/10 bg-white dark:bg-transparent">
          <SectionTitle icon={Star} className="text-amber-500">Custom Marquee Badges</SectionTitle>
          <p className="text-xs text-amber-600 dark:text-amber-500/70 mt-1 mb-4">Add custom alerts and dynamic badges directly into the broadcast marquee.</p>
          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-xl bg-secondary/50 dark:bg-card/40 border border-amber-500/10 shadow-inner">
              <div className="mb-4">
                <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-2">
                  <span>Select a badge and type directly on it. Press</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[9px] font-mono text-amber-500">ENTER</kbd>
                  <span>to add.</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1">
                  {BADGE_OPTIONS.map(b => {
                    const BadgeComp = BADGE_MAP[b.id];
                    const isSelected = newBadgeType === b.id;
                    return (
                      <div
                        key={b.id}
                        onClick={() => setNewBadgeType(b.id)}
                        className={`flex items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                          isSelected ? 'bg-amber-500/20 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-black/20 border-border hover:bg-white/5'
                        }`}
                      >
                        {BadgeComp ? (
                          isSelected ? (
                            <BadgeComp label={
                              <input 
                                type="text" 
                                autoFocus
                                className="bg-transparent border-none outline-none text-center w-full min-w-[60px] text-inherit font-inherit p-0 m-0 placeholder:text-inherit placeholder:opacity-50"
                                value={newCustomHighlight}
                                onChange={e => setNewCustomHighlight(e.target.value)}
                                placeholder={b.name.toUpperCase()}
                                onClick={e => e.stopPropagation()}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && newCustomHighlight.trim()) {
                                    const item = { id: Date.now().toString(), text: newCustomHighlight.trim(), badge: b.id };
                                    update('customHighlights', [...(draft.customHighlights || []), item]);
                                    setNewCustomHighlight('');
                                    setNewBadgeType(''); // Deselect after adding
                                  }
                                }}
                              />
                            } />
                          ) : (
                            <BadgeComp label={b.name.toUpperCase()} />
                          )
                        ) : <span>{b.name}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {(draft.customHighlights || []).map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-2 rounded-md bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">{item.badge || 'Highlight'}</span>
                      <span className="text-sm font-semibold truncate text-foreground">{item.text || item}</span>
                    </div>
                    <button 
                      onClick={() => update('customHighlights', draft.customHighlights.filter((_, i) => i !== idx))}
                      className="text-muted-foreground hover:text-red-400 p-1 shrink-0 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {(!draft.customHighlights || draft.customHighlights.length === 0) && (
                  <p className="text-[11px] text-muted-foreground text-center py-2">No custom badges added.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* ── Save Button ─────────────────────────────────────────────────────── */}
      <div className="sticky bottom-0 -mx-4 md:mx-0 p-4 md:p-0 md:pt-2 md:pb-4 bg-background/90 backdrop-blur-md md:bg-transparent border-t border-border/50 md:border-t-0 z-40 flex justify-end mt-4">
        <ShinyButton className="w-full sm:w-auto shadow-lg md:shadow-none" onClick={handleSave} loading={saving} disabled={saving}>
          💾 Save Broadcast Settings
        </ShinyButton>
      </div>

      {/* Badge shine animation style */}
      <style dangerouslySetInnerHTML={{__html: `
        .ticker-badge-shine {
          position: relative;
          overflow: hidden;
        }
        .ticker-badge-shine::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: ticker-shine-sweep 3s ease-in-out infinite;
        }
        @keyframes ticker-shine-sweep {
          0% { left: -100%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
      `}} />
    </div>
  );
}
