import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionTitle, MagicCard, Btn, FadeIn } from './UI';
import { RotateCcw, Trophy, Trash2, Shuffle, AlertTriangle, PlayCircle, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import { Input } from './UI';
import {
  renameSeason,
  adminResetStandings,
  adminRestartSeason,
  adminForceEndTournament,
  adminResetFixtures,
  adminDeleteSeason
} from '@/app/actions/season';

export default function TournamentControlPanel({ season, showToast }) {
  const [loading, setLoading] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [newName, setNewName] = useState(season?.name || '');
  const [activeDialog, setActiveDialog] = useState(null);

  useEffect(() => {
    return () => {
      // Radix UI leaves body locked if component unmounts mid-animation
      document.body.style.pointerEvents = '';
      document.body.removeAttribute('data-scroll-locked');
    };
  }, []);

  if (!season) return null;

  const handleRename = async () => {
    if (!newName.trim()) return showToast("Enter a name");
    setLoading(true);
    const res = await renameSeason(season.id, newName);
    if (res.error) {
      showToast(res.error);
    } else {
      showToast("Season renamed!");
      setRenameOpen(false);
    }
    setLoading(false);
  };

  const handleAction = async (actionFn, successMsg, willUnmount = false) => {
    setLoading(true);
    const res = await actionFn(season.id);
    
    if (!willUnmount) {
      setLoading(false);
      setActiveDialog(null);
    }
    
    if (res.error) showToast(res.error);
    else showToast(successMsg);
  };

  const controls = [
    {
      id: 'reset-standings',
      label: 'Reset Standings',
      desc: 'Wipes all match scores to 0-0 but keeps the fixture schedule.',
      icon: RotateCcw,
      action: () => handleAction(adminResetStandings, 'Standings reset!'),
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    {
      id: 'restart-season',
      label: 'Season Restart',
      desc: 'Deletes playoffs and wipes league standings back to Week 1.',
      icon: PlayCircle,
      action: () => handleAction(adminRestartSeason, 'Season restarted!'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      id: 'reset-fixtures',
      label: 'Reset Fixture',
      desc: 'Deletes all matches and regenerates the league schedule with current players.',
      icon: Shuffle,
      action: () => handleAction(adminResetFixtures, 'Fixtures regenerated!'),
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      id: 'force-end',
      label: 'End Tournament',
      desc: 'Forces the season to end. Player with most points wins instantly.',
      icon: Trophy,
      action: () => handleAction(adminForceEndTournament, 'Tournament ended!', true),
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      id: 'delete-season',
      label: 'Delete Season',
      desc: 'Completely deletes this season and all its matches forever.',
      icon: Trash2,
      action: () => handleAction(adminDeleteSeason, 'Season deleted!', true),
      color: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    {
      id: 'rename-season',
      label: 'Rename Season',
      desc: 'Change the display name for this season without affecting matches or stats.',
      icon: Pencil,
      action: () => setRenameOpen(true),
      color: 'text-slate-400',
      bg: 'bg-slate-400/10'
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-8 mb-8 pb-8">
      <div className="flex items-center justify-between">
        <SectionTitle icon={AlertTriangle} className="text-red-400">Tournament Controls</SectionTitle>
      </div>
      {/* Desktop Grid View */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
        {controls.map((ctrl, i) => (
          <FadeIn key={ctrl.id} delay={i * 0.1}>
            <MagicCard className={`p-4 flex flex-col justify-between h-full border transition-colors ${ctrl.id === 'rename-season' ? 'border-border hover:border-slate-500/30' : 'border-red-500/10 hover:border-red-500/30'}`}>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${ctrl.bg}`}>
                    <ctrl.icon className={ctrl.color} size={20} />
                  </div>
                  <h3 className="font-bold">{ctrl.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{ctrl.desc}</p>
              </div>
              
              {ctrl.id === 'rename-season' ? (
                <Btn variant="outline" className="w-full text-xs" onClick={ctrl.action}>
                  {ctrl.label}
                </Btn>
              ) : (
                <Btn 
                  variant={ctrl.id === 'delete-season' ? 'danger' : 'outline'} 
                  className="w-full text-xs" 
                  disabled={loading}
                  onClick={() => setActiveDialog(ctrl.id)}
                >
                  {ctrl.label}
                </Btn>
              )}
            </MagicCard>
          </FadeIn>
        ))}
      </div>

      {/* Mobile iOS-style Action List */}
      <div className="md:hidden flex flex-col bg-secondary/20 border border-border/50 rounded-2xl overflow-hidden divide-y divide-border/40">
        {controls.map((ctrl, i) => (
          <button 
            key={ctrl.id}
            onClick={() => ctrl.id === 'rename-season' ? ctrl.action() : setActiveDialog(ctrl.id)}
            className="flex items-center gap-4 p-4 text-left active:bg-white/5 transition-colors group"
          >
            <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${ctrl.bg} group-active:scale-95`}>
              <ctrl.icon className={ctrl.color} size={18} />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <h3 className="font-bold text-[15px] text-white leading-tight mb-0.5">{ctrl.label}</h3>
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{ctrl.desc}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Raw Custom Modal for Destructive Actions */}
      <AnimatePresence>
        {activeDialog && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => !loading && setActiveDialog(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md p-6 flex flex-col z-10"
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 font-heading tracking-tight">Are you absolutely sure?</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This action will execute <strong>{controls.find(c => c.id === activeDialog)?.label}</strong> for the season <strong>{season.name}</strong>.
                  {activeDialog === 'delete-season' && " This cannot be undone."}
                </p>
              </div>
              <div className="flex justify-end gap-3">
                <Btn 
                  variant="outline" 
                  disabled={loading} 
                  onClick={() => setActiveDialog(null)}
                  className="bg-secondary text-foreground hover:bg-secondary/80 outline-none"
                >
                  Cancel
                </Btn>
                <Btn 
                  variant={activeDialog === 'delete-season' ? 'danger' : 'default'}
                  className={activeDialog !== 'delete-season' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                  loading={loading}
                  onClick={async (e) => {
                    e.preventDefault();
                    await controls.find(c => c.id === activeDialog)?.action();
                  }}
                >
                  Confirm
                </Btn>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Rename Season</DialogTitle>
            <DialogDescription>Change the display name for this season without affecting matches or stats.</DialogDescription>
          </DialogHeader>
          <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Season Name" className="mt-2" />
          <DialogFooter className="mt-4">
            <Btn variant="outline" onClick={() => setRenameOpen(false)} className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</Btn>
            <Btn onClick={handleRename} loading={loading}>Save</Btn>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
