import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import MatchCard from './MatchCard';
import StandingsTable from './StandingsTable';
import PlayoffBracket from './PlayoffBracket';
import { Calendar, ListOrdered, Swords } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function MatchesPage({ activeSeason, matches: initialMatches, players, me, onMatchClick }) {
  const [view, setView] = useState("list");
  const [matches, setMatches] = useState(initialMatches);

  useEffect(() => {
    // eslint-disable-next-line
    setMatches(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    if (!activeSeason) return;

    const channel = supabase.channel('matches-page')
      .on('broadcast', { event: 'match_update' }, (payload) => {
        const updated = payload.payload;
        setMatches(prev => prev.map(m => m.id === updated.id ? { ...m, ...updated } : m));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSeason]);

  if (!activeSeason) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-secondary/20 rounded-2xl border border-dashed border-border/50">
        <div className="text-muted-foreground font-medium">No active season yet.</div>
      </div>
    );
  }

  const leagueMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round === "league");
  const playoffMatches = matches.filter((m) => m.seasonId === activeSeason.id && m.round !== "league");

  // Sort live to top, then upcoming, then completed
  const sortedLeagueMatches = [...leagueMatches].sort((a, b) => {
    const statusOrder = { 'live': 0, 'scheduled': 1, 'completed': 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    // Secondary sort by date
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt) - new Date(b.scheduledAt);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold font-display flex items-center gap-2">
          <Calendar className="text-pitch-bright" /> All Matches
        </h2>

        <Tabs value={view} onValueChange={setView} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Calendar size={14} /> List
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <ListOrdered size={14} /> Table
            </TabsTrigger>
            <TabsTrigger 
              value="bracket" 
              disabled={activeSeason.type === "League"} 
              className="flex items-center gap-2"
              title={activeSeason.type === "League" ? "Available after league stage / Playoffs enabled" : ""}
            >
              <Swords size={14} /> Bracket
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {view === "list" && (
            <div className="flex flex-col gap-3">
              {sortedLeagueMatches.map((m, i) => (
                <motion.div 
                  key={m.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                >
                  <MatchCard m={m} players={players} onClick={onMatchClick} />
                </motion.div>
              ))}
              {sortedLeagueMatches.length === 0 && (
                <div className="p-8 text-center text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border/50">
                  No matches generated yet.
                </div>
              )}
            </div>
          )}

          {view === "table" && (
            <div className="bg-card p-2 sm:p-5 rounded-2xl border border-border shadow-sm">
              <StandingsTable matches={matches} players={players} seasonId={activeSeason.id} me={me} />
            </div>
          )}

          {view === "bracket" && (
            <div className="bg-card p-2 sm:p-5 rounded-2xl border border-border shadow-sm">
              <PlayoffBracket matches={playoffMatches} players={players} onMatchClick={onMatchClick} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
