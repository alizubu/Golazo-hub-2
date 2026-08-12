'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Search, Plus, Minus, CheckSquare, Square, 
  Save, X, ShieldAlert, ArrowUpRight, ArrowDownRight, Zap 
} from 'lucide-react';
import { Btn, SectionTitle, Avatar, MagicCard } from '@/app/components/shared/UI';
import { adminUpdateRankingPoints, adminBulkUpdateRankingPoints } from '@/app/actions/admin';

export default function AdminRankings({ players = [], showToast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMassEditMode, setIsMassEditMode] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set());
  const [bulkAdjustment, setBulkAdjustment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingPlayerId, setEditingPlayerId] = useState(null);
  const [editAdjustment, setEditAdjustment] = useState('');

  // Sort players by points descending
  const sortedPlayers = useMemo(() => {
    let sorted = [...players].sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      sorted = sorted.filter(p => p.name.toLowerCase().includes(q) || p.username.toLowerCase().includes(q));
    }
    return sorted;
  }, [players, searchQuery]);

  const toggleMassEditMode = () => {
    setIsMassEditMode(!isMassEditMode);
    setSelectedPlayerIds(new Set());
    setBulkAdjustment('');
  };

  const togglePlayerSelection = (id) => {
    const newSet = new Set(selectedPlayerIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPlayerIds(newSet);
  };

  const handleBulkSubmit = async () => {
    const adjustment = parseInt(bulkAdjustment, 10);
    if (selectedPlayerIds.size === 0) return showToast("Select at least one player.");
    if (isNaN(adjustment) || adjustment === 0) return showToast("Enter a valid adjustment amount.");

    setIsSubmitting(true);
    const result = await adminBulkUpdateRankingPoints(Array.from(selectedPlayerIds), adjustment);
    setIsSubmitting(false);

    if (result.error) {
      showToast(result.error);
    } else {
      showToast(`Successfully adjusted points for ${selectedPlayerIds.size} players!`);
      toggleMassEditMode();
    }
  };

  const handleSingleSubmit = async (player) => {
    const adjustment = parseInt(editAdjustment, 10);
    if (isNaN(adjustment) || adjustment === 0) {
      setEditingPlayerId(null);
      return;
    }
    
    const newPoints = (player.rankingPoints || 0) + adjustment;
    
    setIsSubmitting(true);
    const result = await adminUpdateRankingPoints(player.id, newPoints);
    setIsSubmitting(false);

    if (result.error) {
      showToast(result.error);
    } else {
      showToast(`${player.name}'s points updated by ${adjustment > 0 ? '+' : ''}${adjustment}`);
      setEditingPlayerId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1306] border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] pointer-events-none rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div>
          <SectionTitle icon={TrendingUp} className="!mb-1 text-amber-500">Ranking War Room</SectionTitle>
          <p className="text-sm text-muted-foreground">Manage global player standings and distribute points.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto z-10">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-muted-foreground/40 text-foreground"
            />
          </div>
          <Btn 
            variant={isMassEditMode ? "primary" : "ghost"} 
            className={isMassEditMode ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]" : "border border-white/10"}
            onClick={toggleMassEditMode}
          >
            {isMassEditMode ? <><X size={16} className="mr-2" /> Cancel Mass Edit</> : <><CheckSquare size={16} className="mr-2" /> Mass Edit</>}
          </Btn>
        </div>
      </div>

      {/* Mass Edit Control Panel */}
      <AnimatePresence>
        {isMassEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <MagicCard className="bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-amber-500">
                <Zap size={20} />
                <span className="font-bold">{selectedPlayerIds.size} Players Selected</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="number"
                  placeholder="+/- Points"
                  value={bulkAdjustment}
                  onChange={(e) => setBulkAdjustment(e.target.value)}
                  className="w-full sm:w-32 bg-black/60 border border-amber-500/30 rounded-lg px-3 py-2 text-sm font-bold text-center focus:outline-none focus:border-amber-500 text-foreground placeholder:text-muted-foreground/40 font-score"
                />
                <Btn 
                  variant="primary"
                  className="bg-amber-500 text-black shrink-0"
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting || selectedPlayerIds.size === 0 || !bulkAdjustment}
                >
                  {isSubmitting ? 'Updating...' : 'Apply Points'}
                </Btn>
              </div>
            </MagicCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Ticker / Leaderboard */}
      <MagicCard className="p-0 border border-white/5 bg-[#0A0A0C]/80 overflow-hidden rounded-3xl shadow-2xl">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
            <thead>
              <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] bg-black/60 border-b border-white/[0.05]">
                {isMassEditMode && <th className="py-4 px-4 text-center w-12">Select</th>}
                <th className="py-4 px-6 font-bold w-16 text-center">Rank</th>
                <th className="py-4 px-4 font-bold">Player</th>
                <th className="py-4 px-6 font-bold text-right">Points</th>
                <th className="py-4 px-6 font-bold text-right">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {sortedPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    No players found.
                  </td>
                </tr>
              ) : (
                sortedPlayers.map((player, index) => {
                  const rank = index + 1;
                  const isSelected = selectedPlayerIds.has(player.id);
                  const isEditing = editingPlayerId === player.id;

                  return (
                    <motion.tr 
                      key={player.id} 
                      className={`group transition-colors ${isSelected ? 'bg-amber-500/5' : 'hover:bg-white/[0.02]'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.02, 0.5) }}
                    >
                      {/* Checkbox (Mass Edit Mode) */}
                      {isMassEditMode && (
                        <td className="py-3 px-4 text-center cursor-pointer" onClick={() => togglePlayerSelection(player.id)}>
                          <div className={`w-5 h-5 mx-auto rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-amber-500 border-amber-500 text-black' : 'border-white/20 group-hover:border-amber-500/50'}`}>
                            {isSelected && <CheckSquare size={14} className="stroke-[3]" />}
                          </div>
                        </td>
                      )}

                      {/* Rank */}
                      <td className="py-3 px-6 text-center">
                        <span className={`font-score font-black text-lg ${rank === 1 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]' : rank === 2 ? 'text-zinc-300' : rank === 3 ? 'text-orange-400' : 'text-muted-foreground/60'}`}>
                          #{rank}
                        </span>
                      </td>

                      {/* Player Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar p={player} size={32} />
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{player.name}</span>
                            <span className="text-xs text-muted-foreground/60">@{player.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Points */}
                      <td className="py-3 px-6 text-right">
                        <span className="font-score font-black text-xl tracking-tight text-amber-500">
                          {player.rankingPoints?.toLocaleString() || 0}
                        </span>
                      </td>

                      {/* Adjust Actions */}
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-1">
                              <input 
                                autoFocus
                                type="number" 
                                placeholder="+/-" 
                                className="w-16 bg-transparent text-center font-bold font-score text-sm focus:outline-none" 
                                value={editAdjustment}
                                onChange={e => setEditAdjustment(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSingleSubmit(player);
                                  if (e.key === 'Escape') setEditingPlayerId(null);
                                }}
                              />
                              <button 
                                onClick={() => handleSingleSubmit(player)}
                                disabled={isSubmitting}
                                className="p-1.5 rounded-md bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                              >
                                <Save size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => { setEditingPlayerId(player.id); setEditAdjustment(''); }}
                              disabled={isMassEditMode}
                              className="px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold hover:bg-white/5 hover:border-white/20 transition-all text-muted-foreground hover:text-foreground disabled:opacity-20 flex items-center gap-1"
                            >
                              <Plus size={12} /> <Minus size={12} /> Adjust
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </MagicCard>
    </div>
  );
}
