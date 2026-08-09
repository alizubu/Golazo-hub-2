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
import { WavingFlag, Avatar, OnFireAvatar } from '@/app/components/shared/UI';

// ─── TEAM COMBOBOX ─────────────────────────────────────────────────────────

function ItemIcon({ item, isClub }) {
  if (isClub) {
    return (
      <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-secondary/50 rounded-md overflow-hidden p-0.5">
        <Image 
          src={item.crestPath} 
          alt={item.name} 
          width={24}
          height={24}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full hidden items-center justify-center bg-pitch font-bold text-[10px] text-white">
          {item.name.charAt(0)}
        </div>
      </div>
    );
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

  if (selectedItem) {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-secondary/30 group hover:bg-secondary/50 transition-colors">
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
            <PopoverContent className="w-[300px] sm:w-[350px] p-0" align="end" sideOffset={10}>
              <Command>
                <CommandInput placeholder={placeholderText} className="h-11" />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  {groups.map(([groupName, items]) => (
                    <CommandGroup key={groupName} heading={groupName} className="text-muted-foreground">
                      {items.map(item => (
                        <CommandItem
                          key={item.id}
                          value={item.name}
                          onSelect={() => {
                            onSelect(isClub ? item.name : item.isoCode);
                            setOpen(false);
                          }}
                          className="flex items-center gap-3 py-2.5 cursor-pointer"
                        >
                          <ItemIcon item={item} isClub={isClub} />
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="font-semibold text-sm truncate">{item.name}</span>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 text-pitch-bright shrink-0",
                              (isClub ? item.name === selectedValue : item.isoCode === selectedValue) ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </PopoverContent>
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
          className="w-full justify-start h-12 text-muted-foreground border-dashed bg-secondary/20 hover:bg-secondary/40"
        >
          <Plus className="mr-2 h-4 w-4" />
          {addLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] sm:w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholderText} className="h-11" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map(([groupName, items]) => (
              <CommandGroup key={groupName} heading={groupName} className="text-muted-foreground">
                {items.map(item => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(isClub ? item.name : item.isoCode);
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 py-2.5 cursor-pointer"
                  >
                    <ItemIcon item={item} isClub={isClub} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm truncate">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── DISPLAY BADGE TOGGLE ──────────────────────────────────────────────────

export function DisplayBadgeToggle({ value, onChange, disabledOption }) {
  // value is 'club' or 'nation'
  // disabledOption is 'club' (if no club selected) or 'nation' (if no nation selected) or null

  return (
    <div className="flex bg-secondary/50 p-1 rounded-xl w-full relative">
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
  // player needs avatar, flag, favoriteClub, displayBadgePreference
  const badgePref = player.displayBadgePreference || 'club';
  
  let badgeIcon = null;

  if (badgePref === 'club' && player.favoriteClub) {
    const club = CLUBS.find(c => c.name === player.favoriteClub);
    if (club) {
      badgeIcon = (
        <Image 
          src={club.crestPath} 
          alt={club.name} 
          width={48}
          height={48}
          className="w-full h-full object-contain scale-[0.8]"
          onError={(e) => e.target.style.display = 'none'}
        />
      );
    }
  } else if (badgePref === 'nation' && player.flag) {
    badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={player.flag} size="md" className="!w-full !h-full rounded-full" /></div>;
  }

  // Fallback to the other if the preferred one is missing
  if (!badgeIcon) {
    if (badgePref === 'club' && player.flag) {
        badgeIcon = <div className="w-[120%] h-[120%]"><WavingFlag code={player.flag} size="md" className="!w-full !h-full rounded-full" /></div>;
    } else if (badgePref === 'nation' && player.favoriteClub) {
        const club = CLUBS.find(c => c.name === player.favoriteClub);
        if (club) {
            badgeIcon = (
                <Image 
                  src={club.crestPath} 
                  alt={club.name} 
                  width={48}
                  height={48}
                  className="w-full h-full object-contain scale-[0.8]"
                  onError={(e) => e.target.style.display = 'none'}
                />
            );
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
      
      <AnimatePresence>
        {badgeIcon && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute z-10 flex items-center justify-center bg-card rounded-full shadow-lg border-[3px] border-card overflow-hidden"
            style={{ 
              width: badgeSize, 
              height: badgeSize,
              bottom: size > 64 ? -4 : -2,
              left: size > 64 ? -4 : -2
            }}
          >
            {badgeIcon}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
