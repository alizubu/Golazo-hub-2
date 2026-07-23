import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Edit2, AlertCircle } from 'lucide-react';
import { Btn, Badge, Avatar } from './UI';
import StatStepperInput from './StatStepperInput';
import confetti from 'canvas-confetti';

const STATS_MAP = [
  { key: 'possession', label: 'Ball Possession (%)' },
  { key: 'shots', label: 'Total Shots' },
  { key: 'shotsOnTarget', label: 'Shots on Target' },
  { key: 'passes', label: 'Passes' },
  { key: 'accuratePasses', label: 'Accurate Passes' },
  { key: 'crosses', label: 'Crosses' },
  { key: 'interceptions', label: 'Interceptions' },
  { key: 'tackles', label: 'Tackles' },
  { key: 'saves', label: 'Saves' },
  { key: 'cornerKicks', label: 'Corner Kicks' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'freeKicks', label: 'Free Kicks' }
];

export default function MatchDetailsModal({ match, homePlayer, awayPlayer, onSave, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(() => {
    const init = {};
    STATS_MAP.forEach(s => { init[s.key] = { a: 0, b: 0 }; });
    return init;
  });

  const [scoreOverride, setScoreOverride] = useState(false);
  const [homeScore, setHomeScore] = useState(match.homeScore || 0);
  const [awayScore, setAwayScore] = useState(match.awayScore || 0);

  const handleStatChange = (key, player, val) => {
    setStats(prev => ({ ...prev, [key]: { ...prev[key], [player]: val } }));
  };

  const possessionTotal = stats.possession.a + stats.possession.b;
  const possessionWarning = possessionTotal !== 100 && possessionTotal > 0;

  const handleSave = async () => {
    setLoading(true);
    // Package stats and score
    const finalData = {
      homeScore,
      awayScore,
      stats
    };
    
    const success = await onSave(finalData);
    if (success) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-y-auto bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-[#0f1117] rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 border-b border-border/50 bg-secondary/20 shrink-0 gap-6">
            
            <div className="flex items-center gap-4 text-center sm:text-left">
              <Avatar p={homePlayer} size={64} className="ring-2 ring-pitch" />
              <div className="hidden sm:block">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Home</div>
                <div className="text-xl font-bold font-display text-white">{homePlayer?.name}</div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4">
                {scoreOverride ? (
                  <>
                    <input type="number" value={homeScore} onChange={e => setHomeScore(parseInt(e.target.value)||0)} className="w-16 bg-background border border-border rounded-lg text-center text-3xl font-mono font-bold text-pitch-bright" />
                    <span className="text-muted-foreground text-2xl">-</span>
                    <input type="number" value={awayScore} onChange={e => setAwayScore(parseInt(e.target.value)||0)} className="w-16 bg-background border border-border rounded-lg text-center text-3xl font-mono font-bold text-white" />
                  </>
                ) : (
                  <>
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-pitch-bright">{homeScore}</span>
                    <span className="text-muted-foreground/50 text-3xl font-mono">-</span>
                    <span className="text-4xl sm:text-5xl font-mono font-bold text-white">{awayScore}</span>
                  </>
                )}
              </div>
              <button 
                onClick={() => setScoreOverride(!scoreOverride)}
                className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-muted-foreground hover:text-white transition-colors"
              >
                <Edit2 size={12} /> {scoreOverride ? 'Lock Score' : 'Edit Score'}
              </button>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right flex-row-reverse sm:flex-row">
              <div className="hidden sm:block">
                <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Away</div>
                <div className="text-xl font-bold font-display text-white">{awayPlayer?.name}</div>
              </div>
              <Avatar p={awayPlayer} size={64} className="ring-2 ring-claret" />
            </div>

          </div>

          {/* Body: Stat Entry */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8 bg-gradient-to-b from-secondary/5 to-transparent">
            {possessionWarning && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-sm font-medium">
                <AlertCircle size={16} /> Ball Possession does not add up to 100%. Please check values.
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STATS_MAP.map(stat => (
                <StatStepperInput 
                  key={stat.key}
                  label={stat.label}
                  statKey={stat.key}
                  values={stats[stat.key]}
                  onChange={handleStatChange}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border/50 bg-background flex flex-col sm:flex-row gap-4 shrink-0">
            <button 
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-4 rounded-xl border border-border text-white font-bold hover:bg-secondary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-[2] py-4 rounded-xl bg-pitch text-pitch-foreground font-bold hover:bg-pitch-bright transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <><Check size={20} /> Save Match & Finish</>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
