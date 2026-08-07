'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes';

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
    </ThemeProvider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
