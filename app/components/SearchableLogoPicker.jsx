'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { Badge } from '@/app/components/ui/badge';

export default function SearchableLogoPicker({ 
  items = [], 
  value, 
  onChange, 
  placeholder = "Search...", 
  label = "" 
}) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((item) => item.name === value || item.id === value);

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold block">{label}</label>}
      
      {selectedItem ? (
        <div className="flex items-center w-full">
          <div className="flex items-center gap-3 bg-secondary/30 border border-border shadow-sm rounded-lg px-4 py-2.5 w-full">
            {selectedItem.logo_url ? (
              <img src={selectedItem.logo_url} alt={selectedItem.name} className="w-6 h-6 object-contain" />
            ) : selectedItem.flag_url ? (
              <img src={selectedItem.flag_url} alt={selectedItem.name} className="w-6 h-6 object-contain" />
            ) : null}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold truncate">{selectedItem.name}</span>
              {selectedItem.subtitle && <span className="text-[10px] text-muted-foreground truncate">{selectedItem.subtitle}</span>}
            </div>
            <button
              type="button"
              className="ml-auto hover:bg-black/20 dark:hover:bg-white/20 rounded-full p-1 transition-colors text-muted-foreground hover:text-foreground"
              onClick={() => onChange("")}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-secondary/50 border-border hover:bg-secondary/80 hover:text-foreground h-auto py-3 px-4"
            >
              <span className="text-muted-foreground">
                {placeholder}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-card border-border shadow-xl">
            <Command className="bg-transparent">
              <CommandInput placeholder={placeholder} className="h-11" />
              <CommandList className="max-h-60">
                <CommandEmpty>No matches found.</CommandEmpty>
                <CommandGroup>
                  {items.map((item) => {
                    const imgUrl = item.logo_url || item.flag_url;
                    return (
                      <CommandItem
                        key={item.id || item.name}
                        value={item.name}
                        onSelect={(currentValue) => {
                          onChange(currentValue === value ? "" : item.name);
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 py-2 px-3 aria-selected:bg-secondary cursor-pointer"
                      >
                        {imgUrl ? (
                          <div className="w-8 h-8 rounded-md bg-white/5 p-1 flex items-center justify-center shrink-0 border border-border/50">
                            <img src={imgUrl} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-white/5 shrink-0" />
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold truncate">{item.name}</span>
                          {item.subtitle && <span className="text-[10px] text-muted-foreground truncate">{item.subtitle}</span>}
                        </div>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 text-pitch-bright",
                            value === item.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
