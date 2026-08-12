'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes';
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

const AppContext = createContext();

export function AppProvider({ children, initialMatches = [] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [toast, setToast] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const [prevInitial, setPrevInitial] = useState(initialMatches);
  if (initialMatches !== prevInitial) {
    setPrevInitial(initialMatches);
    setMatches(initialMatches);
  }

  // SWR Fallback Polling (Every 5 seconds)
  const { data: liveData } = useSWR('/api/live', fetcher, { 
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (liveData?.matches) {
      setMatches(prev => {
        let updated = [...prev];
        let hasChanges = false;
        
        liveData.matches.forEach(liveMatch => {
          const idx = updated.findIndex(m => m.id === liveMatch.id);
          if (idx !== -1) {
            // Simple stringify comparison to avoid unnecessary re-renders
            if (JSON.stringify(updated[idx]) !== JSON.stringify(liveMatch)) {
              updated[idx] = { ...updated[idx], ...liveMatch };
              hasChanges = true;
            }
          } else {
            updated.push(liveMatch);
            hasChanges = true;
          }
        });
        
        return hasChanges ? updated : prev;
      });
    }
  }, [liveData]);

  useEffect(() => {
    const channel = supabase.channel('league-events')
      .on('broadcast', { event: 'match_update' }, (payload) => {
        const updated = payload.payload;
        setMatches(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const openProfile = (id) => setSelectedProfileId(id);
  const closeProfile = () => setSelectedProfileId(null);

  return (
    <AppContext.Provider value={{ matches, showToast, selectedProfileId, openProfile, closeProfile }}>
      {children}
      {/* Toast Render */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl shadow-2xl bg-pitch text-foreground font-semibold flex items-center gap-2 border border-pitch-bright/50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
