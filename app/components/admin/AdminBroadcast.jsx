'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Megaphone, Radio, Zap, TrendingUp, Flame, Eye, EyeOff, Type, Minus, Maximize2, Minimize2, X, Plus, Search, Star, User, Bold, Italic, CaseSensitive, Pipette, Palette, Edit3, Save, GripVertical, ArrowUpLeft, ArrowUp, ArrowUpRight, ArrowLeft, Circle, ArrowRight, ArrowDownLeft, ArrowDown, ArrowDownRight, ChevronDown } from 'lucide-react';
import { Card, Label, SectionTitle, FadeIn, ShinyButton, Badge } from '@/app/components/shared/UI';
import { AnimatePresence, motion } from 'framer-motion';
import { saveTickerConfig } from '@/app/actions/admin';
import SportsTicker from '@/app/components/shared/SportsTicker';
import { THEMES, SEPARATORS, CyberNeonBadge, GoldStandardBadge, FrostGlassBadge, HolographicBadge, MatrixGreenBadge, LavaFlowBadge, ElectricPurpleBadge, SunriseBurstBadge, LiquidChromeBadge, NeonPopBadge, InfernoBadge, AbsoluteZeroBadge, ToxicFormBadge, RoyalMomentumBadge, VelocityBadge } from '@/app/components/shared/SportsTickerBadges';
import { Slider } from '@/app/components/ui/slider';
import { Toggle as ShadcnToggle } from '@/app/components/ui/toggle';
import { Popover, PopoverTrigger, PopoverContent } from '@/app/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { HexColorPicker } from 'react-colorful';

const COLOR_SWATCHES = [
  '#FFFFFF', '#FFD700', '#FF4444', '#00FF88',
  '#00BFFF', '#FF6B35', '#A855F7', '#F43F5E'
];

const STYLE_PRESETS = [
  { id: 'espn', name: 'ESPN Breaking', color: '#FFFFFF', bold: true, uppercase: true, shadowX: 2, shadowY: 2, shadowBlur: 10, shadowColor: '#FF0000', fontSize: 16, letterSpacing: 0 },
  { id: 'neon', name: 'Neon Glow', color: '#FFFFFF', bold: true, uppercase: false, shadowX: 0, shadowY: 0, shadowBlur: 15, shadowColor: '#00FF88', fontSize: 16, letterSpacing: 1 },
  { id: 'gold', name: 'Gold Rush', color: '#FFD700', bold: true, uppercase: true, shadowX: 0, shadowY: 2, shadowBlur: 8, shadowColor: '#B8860B', fontSize: 18, letterSpacing: 1 },
  { id: 'ice', name: 'Ice Cold', color: '#E0FFFF', bold: true, uppercase: true, shadowX: 0, shadowY: 0, shadowBlur: 12, shadowColor: '#00BFFF', fontSize: 16, letterSpacing: 2 },
  { id: 'dark', name: 'Dark Mode', color: '#333333', bold: true, uppercase: true, shadowX: 1, shadowY: 1, shadowBlur: 3, shadowColor: '#000000', fontSize: 16, letterSpacing: 0 },
];

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
export default function AdminBroadcast({ matches = [], players = [], announcements = [], seasons = [], showToast, onTickerConfigSaved }) {
  const DEFAULT_TICKER = {
    enabled: true, source: 'live_recent', customMatchIds: [], selectedSeasonId: '', speed: 50,
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
  const [newBadgeLabel, setNewBadgeLabel] = useState('');
  
  // Breaking News Style State
  const [newNewsColor, setNewNewsColor] = useState('#ffffff');
  const [newNewsBold, setNewNewsBold] = useState(true);
  const [newNewsItalic, setNewNewsItalic] = useState(false);
  const [newNewsUppercase, setNewNewsUppercase] = useState(true);
  const [newShadowX, setNewShadowX] = useState(0);
  const [newShadowY, setNewShadowY] = useState(0);
  const [newShadowBlur, setNewShadowBlur] = useState(10);
  const [newShadowColor, setNewShadowColor] = useState('#ff0000');
  const [newNewsFontSize, setNewNewsFontSize] = useState(16);
  const [newNewsLetterSpacing, setNewNewsLetterSpacing] = useState(0);
  const [newPriority, setNewPriority] = useState('NORMAL');
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

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

  const applyPreset = (preset) => {
    setNewNewsColor(preset.color);
    setNewNewsBold(preset.bold);
    setNewNewsUppercase(preset.uppercase);
    setNewShadowX(preset.shadowX);
    setNewShadowY(preset.shadowY);
    setNewShadowBlur(preset.shadowBlur);
    setNewShadowColor(preset.shadowColor);
    setNewNewsFontSize(preset.fontSize || 16);
    setNewNewsLetterSpacing(preset.letterSpacing || 0);
  };

  const handleEditAlert = (item) => {
    setEditingAlertId(item.id);
    setNewCustomHighlight(item.text);
    setNewBadgeType(item.badge);
    setNewBadgeLabel(item.badgeLabel === item.badge.toUpperCase() ? '' : item.badgeLabel);
    setNewPriority(item.priority || 'NORMAL');
    if (item.style) {
      setNewNewsColor(item.style.color || '#ffffff');
      setNewNewsBold(item.style.bold !== false);
      setNewNewsItalic(item.style.italic || false);
      setNewNewsUppercase(item.style.uppercase !== false);
      setNewShadowX(item.style.shadowX || 0);
      setNewShadowY(item.style.shadowY || 0);
      setNewShadowBlur(item.style.shadowBlur || 0);
      setNewShadowColor(item.style.shadowColor || '#ff0000');
      setNewNewsFontSize(item.style.fontSize || 16);
      setNewNewsLetterSpacing(item.style.letterSpacing || 0);
    }
    setIsAlertModalOpen(true);
  };

  const handleSaveAlert = () => {
    if (!newCustomHighlight.trim()) return;
    
    const style = {
      color: newNewsColor,
      bold: newNewsBold,
      italic: newNewsItalic,
      uppercase: newNewsUppercase,
      shadowX: newShadowX,
      shadowY: newShadowY,
      shadowBlur: newShadowBlur,
      shadowColor: newShadowColor,
      fontSize: newNewsFontSize,
      letterSpacing: newNewsLetterSpacing
    };
    const badgeLabelFinal = newBadgeLabel || BADGE_OPTIONS.find(b => b.id === newBadgeType)?.name.toUpperCase() || 'HIGHLIGHT';
    
    if (editingAlertId) {
      // Update existing
      update('customHighlights', (draft.customHighlights || []).map(item => 
        item.id === editingAlertId 
          ? { ...item, text: newCustomHighlight.trim(), badge: newBadgeType, badgeLabel: badgeLabelFinal.toUpperCase(), style, priority: newPriority }
          : item
      ));
      setEditingAlertId(null);
    } else {
      // Add new
      const item = { 
        id: Date.now().toString(), 
        text: newCustomHighlight.trim(), 
        badge: newBadgeType, 
        badgeLabel: badgeLabelFinal.toUpperCase(), 
        style,
        priority: newPriority,
        visible: true 
      };
      update('customHighlights', [...(draft.customHighlights || []), item]);
    }
    
    setNewCustomHighlight('');
    setNewBadgeLabel('');
    setNewPriority('NORMAL');
    setIsAlertModalOpen(false);
  };

  const cancelEdit = () => {
    setEditingAlertId(null);
    setNewCustomHighlight('');
    setNewBadgeLabel('');
    setNewPriority('NORMAL');
    setIsAlertModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full rounded-3xl bg-secondary/20 dark:bg-[#0A0A0A] border border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.05)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1)_0%,transparent_70%)]" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center w-20 h-20">
            <div className="absolute inset-0 border-[3px] border-amber-500/20 dark:border-amber-500/20 rounded-full animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-2 border-[3px] border-t-amber-500 border-r-amber-500 border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_ease-in-out_infinite]" />
            <div className="absolute inset-4 bg-amber-500/10 dark:bg-amber-500/20 rounded-full animate-pulse blur-sm" />
            <Radio size={28} className="text-amber-500 animate-pulse relative z-10" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-heading font-black text-lg uppercase tracking-widest text-foreground dark:text-amber-50">
              Initializing Broadcast
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
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

      {/* ── Tabs Container ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-transparent border-b border-border/50 rounded-none pb-0 h-auto">
          <TabsTrigger value="feed" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm"><Radio size={16} className="text-amber-500" /> Feed & Content</TabsTrigger>
          <TabsTrigger value="themes" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm"><Palette size={16} className="text-blue-400" /> Themes & Visuals</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm"><Megaphone size={16} className="text-red-400" /> Alert Studio</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6 mt-0">
          
      {/* ── Tabs Container ──────────────────────────────────────────────────── */}
      <Tabs defaultValue="feed" className="w-full mt-6">
        <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-transparent border-b border-border/50 rounded-none pb-0 h-auto custom-scrollbar">
          <TabsTrigger value="feed" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Radio size={16} className="text-amber-500" /> Feed & Content</TabsTrigger>
          <TabsTrigger value="themes" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Palette size={16} className="text-blue-400" /> Themes & Visuals</TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2 rounded-t-lg rounded-b-none data-[state=active]:bg-secondary/50 data-[state=active]:border-b-amber-500 data-[state=active]:border-b-2 py-3 px-6 text-sm transition-all"><Megaphone size={16} className="text-red-400" /> Alert Studio</TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-6 mt-0">
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

          {draft.source === 'running_season' && (
            <FadeIn>
              <div className="mt-4">
                <Label className="text-muted-foreground mb-2 block">Select Running Season</Label>
                <div className="relative max-w-sm">
                  <select
                    value={draft.selectedSeasonId || ''}
                    onChange={(e) => update('selectedSeasonId', e.target.value)}
                    className="w-full bg-secondary dark:bg-zinc-900 border border-border/50 text-foreground text-sm font-semibold rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Choose a season...</option>
                    {seasons.filter(s => !s.isArchived).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </FadeIn>
          )}
        </Card>
      </FadeIn>

      
      {draft.source === 'running_season' && (
        <div className="border-t border-border/50 pt-6 mt-6">
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

      
      
        </div>
      )}

        </TabsContent>

        <TabsContent value="themes" className="space-y-6 mt-0">

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

          <div className="flex overflow-x-auto snap-x gap-3 pb-4 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {filteredThemes.length ? (
                filteredThemes.map(t => (
                  <div key={t.id} className="snap-start shrink-0 w-[240px]"><ThemeCard theme={t} isSelected={draft.theme === t.id} onSelect={v => update('theme', v)} /></div>
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

      
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6 mt-0">


      {/* ── Alert Studio (Tab 3) ────────────────────────────── */}
      <FadeIn delay={0.1}>
        <Card className="p-5 sm:p-7 border-amber-500/20 dark:bg-gradient-to-br dark:from-zinc-950 dark:to-amber-950/10 overflow-hidden relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <SectionTitle icon={Megaphone} className="text-amber-500 mb-0">Breaking News Alerts</SectionTitle>
              <p className="text-xs text-amber-600 dark:text-amber-500/70 mt-1">Manage your active marquee alerts.</p>
            </div>
            <Dialog open={isAlertModalOpen} onOpenChange={setIsAlertModalOpen}>
              <DialogTrigger asChild>
                <ShinyButton className="shadow-amber-500/20 px-6">
                  <Plus size={16} className="mr-2" /> Create Custom Alert
                </ShinyButton>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar border-amber-500/20 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-amber-500 font-bold flex items-center gap-2">
                    <Megaphone size={18} /> Alert Studio
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4">
                  {/* ── Breaking News / Custom Marquee ────────────────────────────── */}
      
        
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-red-500/[0.03] rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <SectionTitle icon={Megaphone} className="text-amber-500 mb-0">Breaking News Alerts</SectionTitle>
              <p className="text-xs text-amber-600 dark:text-amber-500/70 mt-1">Create fully customized marquee alerts with rich text styling and custom badge labels.</p>
            </div>
            {editingAlertId && (
              <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                EDIT MODE
              </Badge>
            )}
          </div>
          
          {/* ─── SECTION 1: Badge Selection + Custom Label + Priority ─── */}
          <div className="mb-8">
            <Label className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 block">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black">1</span>
              Select Badge & Priority
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
              {BADGE_OPTIONS.map(b => {
                const BadgeComp = BADGE_MAP[b.id];
                const isSelected = newBadgeType === b.id;
                const displayLabel = isSelected && newBadgeLabel ? newBadgeLabel.toUpperCase() : b.name.toUpperCase();
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setNewBadgeType(b.id);
                      if (!isSelected) setNewBadgeLabel('');
                    }}
                    className={`flex items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)] scale-[1.03]'
                        : 'bg-secondary/30 dark:bg-black/20 border-transparent hover:bg-white/5 hover:border-border/60'
                    }`}
                  >
                    {BadgeComp ? <BadgeComp label={displayLabel} /> : <span>{b.name}</span>}
                  </div>
                );
              })}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Badge Label Input */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 dark:bg-zinc-900/50 border border-border/50">
                <Edit3 size={14} className="text-amber-500 shrink-0" />
                <input
                  type="text"
                  placeholder={`Badge label (default: ${BADGE_OPTIONS.find(b => b.id === newBadgeType)?.name.toUpperCase() || 'HIGHLIGHT'})`}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/50 font-medium"
                  value={newBadgeLabel}
                  onChange={e => setNewBadgeLabel(e.target.value)}
                />
                <span className="text-[10px] text-muted-foreground/60 shrink-0">Custom text</span>
              </div>
              
              {/* Priority Selector */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-secondary/40 dark:bg-zinc-900/50 border border-border/50">
                {['NORMAL', 'IMPORTANT', 'URGENT'].map(p => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      newPriority === p 
                        ? (p === 'URGENT' ? 'bg-red-500/20 text-red-500' : p === 'IMPORTANT' ? 'bg-amber-500/20 text-amber-500' : 'bg-zinc-500/20 text-zinc-300')
                        : 'text-muted-foreground hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── SECTION 2: News Content ─── */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your breaking news headline..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-secondary dark:bg-zinc-900/80 border border-border dark:border-zinc-700/80 text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-transparent transition-all font-semibold text-base"
                value={newCustomHighlight}
                onChange={e => setNewCustomHighlight(e.target.value)}
              />
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
            </div>
          </div>

          {/* ─── SECTION 3: Text Styling Studio ─── */}
          <div className="mb-8">
            <Label className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2 block">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black">2</span>
              Text Styling Studio
            </Label>
            
            {/* Style Presets */}
            <div className="mb-4 p-3 rounded-xl bg-secondary/30 dark:bg-card/30 border border-border/40">
              <div className="flex items-center gap-2 mb-2.5">
                <Star size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Style Presets</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {STYLE_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 rounded-lg border border-border/50 text-xs font-medium hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* --- LEFT: Text Color + Font Toggles + Typography Sliders --- */}
              <div className="p-4 rounded-xl bg-secondary/30 dark:bg-card/30 border border-border/40 space-y-5 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Palette size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Color & Font</span>
                </div>
                
                {/* Color Picker in Popover */}
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-10 h-10 rounded-lg border-2 border-border/60 shadow-sm transition-all hover:scale-105 hover:shadow-md shrink-0"
                        style={{ backgroundColor: newNewsColor }}
                        title="Pick text color"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" side="bottom" align="start">
                      <HexColorPicker color={newNewsColor} onChange={setNewNewsColor} />
                      <input 
                        type="text" 
                        value={newNewsColor} 
                        onChange={e => setNewNewsColor(e.target.value)}
                        className="w-full mt-2 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs font-mono text-center text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1">
                    <span className="text-xs font-mono text-muted-foreground block mb-1.5">{newNewsColor}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_SWATCHES.map(c => (
                        <button 
                          key={c} 
                          onClick={() => setNewNewsColor(c)}
                          className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${newNewsColor === c ? 'border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'border-transparent hover:border-border'}`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Style Toggles */}
                <div className="pt-3 border-t border-border/40">
                  <div className="flex gap-2 mb-4">
                    <ShadcnToggle
                      pressed={newNewsBold}
                      onPressedChange={setNewNewsBold}
                      className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-500 border border-border/50 flex-1 gap-1.5"
                      size="sm"
                    >
                      <Bold size={14} /> Bold
                    </ShadcnToggle>
                    <ShadcnToggle
                      pressed={newNewsItalic}
                      onPressedChange={setNewNewsItalic}
                      className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-500 border border-border/50 flex-1 gap-1.5"
                      size="sm"
                    >
                      <Italic size={14} /> Italic
                    </ShadcnToggle>
                    <ShadcnToggle
                      pressed={newNewsUppercase}
                      onPressedChange={setNewNewsUppercase}
                      className="data-[state=on]:bg-amber-500/20 data-[state=on]:text-amber-500 border border-border/50 flex-1 gap-1.5"
                      size="sm"
                    >
                      <CaseSensitive size={14} /> AA
                    </ShadcnToggle>
                  </div>
                  
                  {/* Typography Sliders */}
                  <div className="space-y-3">
                    <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-border/40 shadow-inner">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5"><Type size={12} className="text-amber-500"/> Font Size</Label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono">{newNewsFontSize}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground font-medium">A</span>
                        <Slider value={[newNewsFontSize]} onValueChange={v => setNewNewsFontSize(v[0])} min={12} max={28} step={1} className="flex-1 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-amber-500" />
                        <span className="text-sm text-foreground font-bold">A</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-border/40 shadow-inner">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5"><Maximize2 size={12} className="text-amber-500"/> Letter Spacing</Label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono">{newNewsLetterSpacing}px</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground font-medium tracking-tighter">AB</span>
                        <Slider value={[newNewsLetterSpacing]} onValueChange={v => setNewNewsLetterSpacing(v[0])} min={0} max={10} step={0.5} className="flex-1 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-amber-500" />
                        <span className="text-[10px] text-foreground font-bold tracking-widest">A B</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- RIGHT: Shadow / Glow Controls --- */}
              <div className="p-4 rounded-xl bg-secondary/30 dark:bg-card/30 border border-border/40 space-y-5 flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={14} className="text-red-500" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Glow / Shadow</span>
                </div>

                {/* Shadow Color Picker in Popover */}
                <div className="flex items-center gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-10 h-10 rounded-lg border-2 border-border/60 shadow-sm transition-all hover:scale-105 hover:shadow-md shrink-0"
                        style={{ backgroundColor: newShadowColor }}
                        title="Pick shadow/glow color"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" side="bottom" align="start">
                      <HexColorPicker color={newShadowColor} onChange={setNewShadowColor} />
                      <input 
                        type="text" 
                        value={newShadowColor} 
                        onChange={e => setNewShadowColor(e.target.value)}
                        className="w-full mt-2 px-2 py-1.5 rounded-md bg-secondary border border-border text-xs font-mono text-center text-foreground"
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex-1">
                    <span className="text-xs font-mono text-muted-foreground block mb-1.5">{newShadowColor}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_SWATCHES.map(c => (
                        <button 
                          key={c} 
                          onClick={() => setNewShadowColor(c)}
                          className={`w-6 h-6 rounded-md border-2 transition-all hover:scale-110 ${newShadowColor === c ? 'border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'border-transparent hover:border-border'}`}
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* X / Y / Blur Sliders */}
                <div className="space-y-4 pt-3 border-t border-border/40">
                  <div className="flex justify-between items-center -mb-2">
                    <Label className="text-[10px] text-muted-foreground uppercase font-bold">Directional Pad</Label>
                    <span className="text-[10px] text-amber-500 font-mono">X:{newShadowX} Y:{newShadowY}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-1 w-24 mx-auto mb-2 bg-black/20 p-1.5 rounded-xl border border-border/40 shadow-inner">
                    <button onClick={() => {setNewShadowX(-5); setNewShadowY(-5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowUpLeft size={12} /></button>
                    <button onClick={() => {setNewShadowX(0); setNewShadowY(-5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowUp size={12} /></button>
                    <button onClick={() => {setNewShadowX(5); setNewShadowY(-5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowUpRight size={12} /></button>
                    
                    <button onClick={() => {setNewShadowX(-5); setNewShadowY(0)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowLeft size={12} /></button>
                    <button onClick={() => {setNewShadowX(0); setNewShadowY(0)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><Circle size={8} /></button>
                    <button onClick={() => {setNewShadowX(5); setNewShadowY(0)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowRight size={12} /></button>
                    
                    <button onClick={() => {setNewShadowX(-5); setNewShadowY(5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowDownLeft size={12} /></button>
                    <button onClick={() => {setNewShadowX(0); setNewShadowY(5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowDown size={12} /></button>
                    <button onClick={() => {setNewShadowX(5); setNewShadowY(5)}} className="w-6 h-6 rounded flex items-center justify-center hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors"><ArrowDownRight size={12} /></button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-border/40 shadow-inner">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5"><ArrowRight size={12} className="text-amber-500"/> X Offset</Label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono">{newShadowX}px</span>
                      </div>
                      <Slider value={[newShadowX]} onValueChange={v => setNewShadowX(v[0])} min={-20} max={20} step={1} className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-amber-500" />
                    </div>
                    
                    <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-border/40 shadow-inner">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5"><ArrowDown size={12} className="text-amber-500"/> Y Offset</Label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono">{newShadowY}px</span>
                      </div>
                      <Slider value={[newShadowY]} onValueChange={v => setNewShadowY(v[0])} min={-20} max={20} step={1} className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-amber-500" />
                    </div>
                    
                    <div className="space-y-2 bg-black/20 p-3 rounded-xl border border-border/40 shadow-inner">
                      <div className="flex justify-between items-center">
                        <Label className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5"><Zap size={12} className="text-amber-500"/> Blur Spread</Label>
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-mono">{newShadowBlur}px</span>
                      </div>
                      <Slider value={[newShadowBlur]} onValueChange={v => setNewShadowBlur(v[0])} min={0} max={30} step={1} className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SECTION 4: Live Preview + Add/Update ─── */}
          <div className="mb-8">
            <Label className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 block">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black">4</span>
              Live Preview
            </Label>
            <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-2xl overflow-hidden relative min-h-[70px] flex items-center">
              <div className="absolute inset-0 opacity-[0.08] bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]" />
              
              <div className="relative z-10 flex items-center gap-4 w-full">
                {(() => {
                  const BadgeComp = BADGE_MAP[newBadgeType];
                  const label = newBadgeLabel || BADGE_OPTIONS.find(b => b.id === newBadgeType)?.name.toUpperCase() || 'BADGE';
                  return BadgeComp ? (
                    <div className={newPriority === 'URGENT' ? 'animate-pulse' : ''}>
                      <BadgeComp label={label.toUpperCase()} />
                    </div>
                  ) : null;
                })()}
                <span 
                  className="tracking-wide"
                  style={{
                    color: newNewsColor,
                    fontWeight: newNewsBold ? '900' : 'normal',
                    fontStyle: newNewsItalic ? 'italic' : 'normal',
                    textTransform: newNewsUppercase ? 'uppercase' : 'none',
                    textShadow: `${newShadowX}px ${newShadowY}px ${newShadowBlur}px ${newShadowColor}`,
                    fontSize: `${newNewsFontSize}px`,
                    letterSpacing: `${newNewsLetterSpacing}px`
                  }}
                >
                  {newCustomHighlight || "Your breaking news preview..."}
                </span>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 gap-3">
              {editingAlertId && (
                <ShinyButton
                  className="bg-secondary text-foreground hover:bg-secondary/80 border border-border shadow-none"
                  onClick={cancelEdit}
                >
                  <X size={16} className="mr-2" /> Cancel Edit
                </ShinyButton>
              )}
              <ShinyButton
                className={`shadow-lg px-8 ${editingAlertId ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white border-emerald-500/50' : 'shadow-amber-500/20'}`}
                onClick={handleSaveAlert}
              >
                {editingAlertId ? (
                  <><Save size={16} className="mr-2" /> Update Alert</>
                ) : (
                  <><Plus size={16} className="mr-2" /> Add to Marquee</>
                )}
              </ShinyButton>
            </div>
          </div>

          
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative z-10">
            {/* ─── Active Alerts List ─── */}
          <div className="pt-6 border-t border-border/30">
            <Label className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 block">
              Active Alerts ({(draft.customHighlights || []).length})
            </Label>
            <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar pr-1">
              {(draft.customHighlights || []).map((item, idx) => {
                const AlertBadge = BADGE_MAP[item.badge];
                const isVisible = item.visible !== false;
                
                return (
                  <div 
                    key={item.id || idx} 
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors group ${
                      editingAlertId === item.id 
                        ? 'bg-amber-500/10 border-amber-500/50'
                        : isVisible 
                          ? 'bg-secondary/30 dark:bg-white/[0.03] border-border/40 hover:border-border/70' 
                          : 'bg-secondary/10 opacity-50 border-border/20 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      {item.priority === 'URGENT' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
                      {item.priority === 'IMPORTANT' && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                      
                      <div className={!isVisible ? 'opacity-60' : ''}>
                        {AlertBadge ? <AlertBadge label={item.badgeLabel || item.badge || 'ALERT'} /> : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">{item.badge || 'Highlight'}</span>
                        )}
                      </div>
                      <span 
                        className="truncate"
                        style={{
                          color: item.style?.color || undefined,
                          fontWeight: item.style?.bold !== false ? '900' : 'normal',
                          fontStyle: item.style?.italic ? 'italic' : 'normal',
                          textTransform: item.style?.uppercase !== false ? 'uppercase' : 'none',
                          fontSize: item.style?.fontSize ? `${Math.min(item.style.fontSize, 16)}px` : '14px', // cap preview size
                          letterSpacing: item.style?.letterSpacing ? `${Math.min(item.style.letterSpacing, 2)}px` : '0px'
                        }}
                      >
                        {item.text || item}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          const updated = [...draft.customHighlights];
                          updated[idx] = { ...updated[idx], visible: !isVisible };
                          update('customHighlights', updated);
                        }}
                        className="text-muted-foreground/60 hover:text-foreground p-1.5 rounded hover:bg-secondary transition-colors"
                        title={isVisible ? "Hide from ticker" : "Show on ticker"}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button 
                        onClick={() => handleEditAlert(item)}
                        className="text-muted-foreground/60 hover:text-amber-500 p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Edit alert"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => update('customHighlights', draft.customHighlights.filter((_, i) => i !== idx))}
                        className="text-muted-foreground/60 hover:text-red-400 p-1.5 rounded hover:bg-secondary transition-colors"
                        title="Delete alert"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {(!draft.customHighlights || draft.customHighlights.length === 0) && (
                <div className="text-center py-8">
                  <Megaphone size={24} className="text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[12px] text-muted-foreground/50">No alerts yet. Create your first breaking news alert above.</p>
                </div>
              )}
            </div>
          </div>
        
      

      
          </div>
        </Card>
      </FadeIn>

        </TabsContent>
      </Tabs>

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
