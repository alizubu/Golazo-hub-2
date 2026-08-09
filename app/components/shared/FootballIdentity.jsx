import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react';

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
import { WavingFlag, Avatar, OnFireAvatar } from '@/app/components/shared/UI';
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

  const selectedItem = data.find(item => 
    isClub ? item.name === selectedValue : item.isoCode === selectedValue
  );

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
      className="w-[300px] sm:w-[350px] p-0 max-md:fixed max-md:inset-0 max-md:w-screen max-md:h-screen max-md:max-w-none max-md:border-none max-md:rounded-none max-md:bg-background max-md:z-[100] max-md:flex max-md:flex-col shadow-2xl" 
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
                      onSelect(isClub ? item.name : item.isoCode);
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
                        (isClub ? item.name === selectedValue : item.isoCode === selectedValue) ? "opacity-100 text-[color:var(--club-color)]" : "opacity-0"
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
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="h-8 text-xs font-semibold px-3">
            Change
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onSelect(null)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <X size={14} />
          </Button>
        </div>

        {open && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
               <div className="hidden"></div>
            </PopoverTrigger>
            {renderPopoverContent()}
          </Popover>
        )}
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
    badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={player.flag} size="md" className="!w-full !h-full rounded-full" /></div>;
  }

  // Fallback
  if (!badgeIcon) {
    if (badgePref === 'club' && player.flag) {
        badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={player.flag} size="md" className="!w-full !h-full rounded-full" /></div>;
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
