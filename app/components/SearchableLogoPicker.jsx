'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchableLogoPicker({ 
  items = [], 
  value, 
  onChange, 
  placeholder = "Search...", 
  label = "" 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = items.find(item => item.name === value || item.id === value);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && <label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1 block">{label}</label>}
      
      <div 
        className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all cursor-pointer bg-secondary/80 hover:bg-secondary ${isOpen ? 'border-pitch shadow-[0_0_0_2px_rgba(var(--pitch-rgb),0.2)]' : 'border-border'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selectedItem ? (
            <>
              {selectedItem.logo_url && (
                <img src={selectedItem.logo_url} alt={selectedItem.name} className="w-6 h-6 object-contain shrink-0" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate text-foreground leading-tight">{selectedItem.name}</span>
                {selectedItem.subtitle && <span className="text-[10px] text-muted-foreground truncate leading-tight">{selectedItem.subtitle}</span>}
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{placeholder}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {selectedItem && (
            <div 
              className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                setQuery("");
              }}
            >
              <X size={14} className="text-muted-foreground hover:text-foreground" />
            </div>
          )}
          <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden backdrop-blur-xl"
          >
            <div className="p-2 border-b border-border bg-secondary/30 flex items-center gap-2">
              <Search size={16} className="text-muted-foreground ml-1" />
              <input 
                type="text"
                autoFocus
                placeholder="Search..."
                className="w-full bg-transparent border-none focus:outline-none text-sm p-1"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
              {filteredItems.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No matches found.</div>
              ) : (
                filteredItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors group"
                    onClick={() => {
                      onChange(item.name); // Storing name so it matches existing DB format
                      setIsOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.logo_url && (
                        <div className="w-8 h-8 rounded-md bg-white/5 p-1 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-border transition-colors">
                           <img src={item.logo_url} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate group-hover:text-pitch-bright transition-colors">{item.name}</span>
                        {item.subtitle && <span className="text-[10px] text-muted-foreground truncate">{item.subtitle}</span>}
                      </div>
                    </div>
                    {value === item.name && (
                      <Check size={16} className="text-pitch-bright shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
