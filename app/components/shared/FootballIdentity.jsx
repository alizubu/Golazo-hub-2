import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, ChevronsUpDown, X, Plus, Shield, Globe } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/app/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover';

import { CLUBS } from '@/lib/data/clubs';
import { NATIONAL_TEAMS } from '@/lib/data/national-teams';
import { CLUB_COLORS } from '@/lib/data/club-colors';
import { WavingFlag, Avatar, OnFireAvatar, Label } from '@/app/components/shared/UI';
import { ClubLogo } from '@/app/components/shared/ClubLogo';

// ─── TEAM COMBOBOX ─────────────────────────────────────────────────────────

function ItemIcon({ item, isClub }) {
  if (isClub) {
    return <ClubLogo club={item} size={24} />;
  }
  return <div className="shrink-0"><WavingFlag code={item.isoCode} size="sm" /></div>;
}

export function TeamCombobox({ type, selectedValue, onSelect }) {
  const [open, setOpen] = React.useState(false);

  const isClub = type === 'club';
  const data = isClub ? CLUBS : NATIONAL_TEAMS;
  const placeholderText = isClub ? "Search clubs..." : "Search national teams...";
  const emptyText = isClub ? "No clubs found." : "No teams found.";
  const addLabel = isClub ? "Add favorite club" : "Add national team";

  const selectedItem = data.find(item => item.name === selectedValue);

  const groups = React.useMemo(() => {
    const map = new Map();
    data.forEach(item => {
      const key = isClub ? item.league : item.confederation;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return Array.from(map.entries());
  }, [data, isClub]);

  const renderPopoverContent = () => (
    <PopoverContent 
      className="w-[300px] sm:w-[350px] p-0 bg-card border border-border shadow-2xl max-md:fixed max-md:inset-0 max-md:w-screen max-md:h-screen max-md:max-w-none max-md:border-none max-md:rounded-none max-md:bg-background max-md:z-[100] max-md:flex max-md:flex-col" 
      align="start" 
      sideOffset={10}
    >
      <Command className="flex-1 flex flex-col">
        <div className="flex items-center border-b border-border max-md:px-2">
          <CommandInput placeholder={placeholderText} className="h-14 md:h-11 flex-1 border-none outline-none" />
          <Button variant="ghost" size="icon" className="md:hidden shrink-0 text-muted-foreground" onClick={() => setOpen(false)}>
            <X size={20} />
          </Button>
        </div>
        <CommandList className="max-h-[300px] max-md:max-h-none max-md:flex-1 overflow-y-auto">
          <CommandEmpty>{emptyText}</CommandEmpty>
          {groups.map(([groupName, items]) => (
            <CommandGroup key={groupName} heading={groupName} className="text-muted-foreground">
              {items.map(item => {
                const clubPrimary = isClub ? (CLUB_COLORS[item.slug]?.primary || 'var(--pitch-bright)') : 'var(--pitch-bright)';
                return (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item.name);
                      setOpen(false);
                    }}
                    style={{ '--club-color': clubPrimary }}
                    className="flex items-center gap-3 py-3 md:py-2.5 cursor-pointer border-l-4 border-transparent hover:border-l-[color:var(--club-color)] hover:bg-[color:color-mix(in_srgb,var(--club-color)_10%,transparent)] data-[selected=true]:border-l-[color:var(--club-color)] data-[selected=true]:bg-[color:color-mix(in_srgb,var(--club-color)_10%,transparent)] transition-colors min-h-[48px]"
                  >
                    <ItemIcon item={item} isClub={isClub} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">{item.name}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        item.name === selectedValue ? "opacity-100 text-[color:var(--club-color)]" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </PopoverContent>
  );

  if (selectedItem) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/30 group hover:bg-secondary/50 hover:shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3 min-w-0">
          <ItemIcon item={selectedItem} isClub={isClub} />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm truncate">{selectedItem.name}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">
              {isClub ? selectedItem.league : selectedItem.confederation}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold px-3">
                Change
              </Button>
            </PopoverTrigger>
            {renderPopoverContent()}
          </Popover>
          <Button variant="ghost" size="icon" onClick={() => onSelect(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <X size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open} 
          className="w-full justify-start h-12 text-muted-foreground border-dashed bg-secondary/20 hover:bg-secondary/40 hover:border-muted-foreground/50 transition-all duration-300"
        >
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </PopoverTrigger>
      {renderPopoverContent()}
    </Popover>
  );
}

// ─── DISPLAY BADGE TOGGLE ──────────────────────────────────────────────────

export function DisplayBadgeToggle({ value, onChange, disabledOption }) {
  return (
    <div className="flex bg-secondary/50 p-1 rounded-xl w-full relative min-h-[44px]">
      {['club', 'nation'].map((opt) => {
        const isActive = value === opt;
        const isDisabled = disabledOption === opt;
        const label = opt === 'club' ? 'Club' : 'National Team';

        return (
          <button
            key={opt}
            onClick={() => !isDisabled && onChange(opt)}
            disabled={isDisabled}
            title={isDisabled ? `Pick a ${label.toLowerCase()} first` : undefined}
            className={cn(
              "flex-1 relative rounded-lg py-2 text-sm font-bold z-10 transition-colors",
              isActive ? "text-white" : "text-muted-foreground hover:text-foreground",
              isDisabled && "opacity-40 cursor-not-allowed hover:text-muted-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="badge-toggle"
                className="absolute inset-0 bg-pitch rounded-lg z-[-1]"
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── AVATAR WITH BADGE ─────────────────────────────────────────────────────

export function AvatarWithBadge({ player, size = 100, isOnFire = false }) {
  const badgePref = player.displayBadgePreference || 'club';
  
  let badgeIcon = null;

  if (badgePref === 'club' && player.favoriteClub) {
    const club = CLUBS.find(c => c.name === player.favoriteClub);
    if (club) {
      badgeIcon = <ClubLogo club={club} size={48} className="scale-[0.8]" />;
    }
  } else if (badgePref === 'nation' && player.flag) {
    const nt = NATIONAL_TEAMS.find(n => n.name === player.flag);
    if (nt) badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={nt.isoCode} size="md" className="!w-full !h-full rounded-full" /></div>;
  }

  // Fallback
  if (!badgeIcon) {
    if (badgePref === 'club' && player.flag) {
        const nt = NATIONAL_TEAMS.find(n => n.name === player.flag);
        if (nt) badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={nt.isoCode} size="md" className="!w-full !h-full rounded-full" /></div>;
    } else if (badgePref === 'nation' && player.favoriteClub) {
        const club = CLUBS.find(c => c.name === player.favoriteClub);
        if (club) {
            badgeIcon = <ClubLogo club={club} size={48} className="scale-[0.8]" />;
        }
    }
  }

  const badgeSize = Math.max(24, Math.floor(size * 0.32));

  return (
    <div className="relative inline-block">
      {isOnFire ? (
        <OnFireAvatar p={player} size={size} isOnFire={true} />
      ) : (
        <Avatar p={player} size={size} />
      )}
      
      {badgeIcon && (
        <div 
          className="absolute -bottom-1 -left-1 flex items-center justify-center z-10"
          style={{ width: badgeSize, height: badgeSize }}
        >
          {badgeIcon}
        </div>
      )}
    </div>
  );
}

// ─── KIT CARD ──────────────────────────────────────────────────────────────

export function KitCard({ form, setForm }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-7, 7]);
  const springRotateX = useSpring(rotateX, { stiffness: 120, damping: 20 });
  const springRotateY = useSpring(rotateY, { stiffness: 120, damping: 20 });

  const selectedClub = CLUBS.find(c => c.name === form.favoriteClub);
  const selectedNation = NATIONAL_TEAMS.find(n => n.name === form.flag);
  const clubColors = selectedClub ? (CLUB_COLORS[selectedClub.slug] || null) : null;
  const primaryColor = clubColors?.primary || '#22c55e';
  const secondaryColor = clubColors?.secondary || '#15803d';

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const previewPlayer = {
    avatar: form.avatar,
    avatarImage: form.avatarImage,
    flag: form.flag,
    favoriteClub: form.favoriteClub,
    displayBadgePreference: form.displayBadgePreference,
  };

  return (
    <div className="space-y-5">
      {/* ── THE HOLOGRAPHIC CARD ── */}
      <div style={{ perspective: '1200px' }}>
        <motion.div
          style={{ rotateX: springRotateX, rotateY: springRotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', damping: 22, stiffness: 180, delay: 0.1 }}
          className="relative rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] border border-white/10 cursor-pointer select-none"
        >
          {/* Dynamic club color top stripe */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1.5 z-30"
            animate={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})` }}
            transition={{ duration: 0.8 }}
          />

          {/* Background gradient */}
          <motion.div
            className="absolute inset-0 z-0"
            animate={{ background: `linear-gradient(135deg, ${primaryColor}22 0%, #0c0c10 45%, ${secondaryColor}10 100%)` }}
            transition={{ duration: 0.8 }}
          />

          {/* Holographic shimmer sweep */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none"
            animate={{ backgroundPositionX: ['200%', '-100%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)',
              backgroundSize: '300% 100%',
            }}
          />

          {/* Card Content */}
          <div className="relative z-20 p-6 sm:p-8 space-y-6">

            {/* Top Row: Club crest + Name (left) | Avatar (right) */}
            <div className="flex items-center justify-between gap-4">
              {/* Club identity */}
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  animate={{ filter: selectedClub ? `drop-shadow(0 0 14px ${primaryColor}90)` : 'none' }}
                  transition={{ duration: 0.8 }}
                  className="shrink-0"
                >
                  {selectedClub ? (
                    <ClubLogo club={selectedClub} size={64} />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/15 flex items-center justify-center bg-white/5">
                      <Shield size={28} className="text-white/25" />
                    </div>
                  )}
                </motion.div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-0.5">Favorite Club</p>
                  <p className="text-xl sm:text-2xl font-black text-white truncate leading-tight">
                    {selectedClub?.name || <span className="text-white/30 font-medium text-base">Not set</span>}
                  </p>
                  {selectedClub && (
                    <p className="text-xs text-white/40 mt-0.5 font-medium">{selectedClub.league}</p>
                  )}
                </div>
              </div>

              {/* Avatar with glowing ring */}
              <div className="shrink-0">
                <motion.div
                  animate={{ boxShadow: `0 0 0 3px ${primaryColor}, 0 0 24px ${primaryColor}70, 0 0 50px ${primaryColor}30` }}
                  transition={{ duration: 0.8 }}
                  className="rounded-full bg-card p-[3px]"
                >
                  <AvatarWithBadge player={previewPlayer} size={80} />
                </motion.div>
              </div>
            </div>

            {/* National Team Flag Strip */}
            <motion.div
              className="relative rounded-xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, scaleX: 0.95 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3 }}
            >
              {/* Blurred flag background */}
              {selectedNation && (
                <div className="absolute inset-0 overflow-hidden opacity-15">
                  <WavingFlag code={selectedNation.isoCode} size="lg" className="!w-full !h-full scale-110" />
                </div>
              )}
              <div className="relative z-10 flex items-center gap-3 bg-white/5 px-4 py-3">
                <div className="shrink-0">
                  {selectedNation ? (
                    <WavingFlag code={selectedNation.isoCode} size="md" />
                  ) : (
                    <div className="w-10 h-[30px] rounded-sm border border-dashed border-white/20 flex items-center justify-center">
                      <Globe size={14} className="text-white/25" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold">National Team</p>
                  <p className="text-base font-black text-white">
                    {selectedNation?.name || <span className="text-white/30 font-medium text-sm">Not set</span>}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Badge Toggle */}
            <div className="space-y-2.5">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold">Display Badge on Avatar</p>
              <DisplayBadgeToggle
                value={form.displayBadgePreference}
                onChange={(val) => setForm({ ...form, displayBadgePreference: val })}
                disabledOption={!form.favoriteClub ? 'club' : !form.flag ? 'nation' : null}
              />
              <p className="text-[11px] text-white/25">Shown on your public profile avatar.</p>
            </div>
          </div>

          {/* Inset shine ring */}
          <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/10 pointer-events-none z-30" />
        </motion.div>
      </div>

      {/* ── SELECTION BUTTONS BELOW CARD ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-bold">Change Club</Label>
          <TeamCombobox
            type="club"
            selectedValue={form.favoriteClub}
            onSelect={(val) => setForm({ ...form, favoriteClub: val })}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-bold">Change National Team</Label>
          <TeamCombobox
            type="nation"
            selectedValue={form.flag}
            onSelect={(val) => setForm({ ...form, flag: val })}
          />
        </div>
      </div>
    </div>
  );
}
