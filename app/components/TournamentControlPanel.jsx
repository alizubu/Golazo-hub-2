import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SectionTitle, MagicCard, Btn, FadeIn } from './UI';
import { RotateCcw, Trophy, Trash2, Shuffle, AlertTriangle, PlayCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/app/components/ui/alert-dialog';
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
    }
    setRenameOpen(false);
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
    }
  ];

  return (
    <div className="flex flex-col gap-4 mt-8 mb-8 pb-8">
      <div className="flex items-center justify-between">
        <SectionTitle icon={AlertTriangle} className="text-red-400">Tournament Controls</SectionTitle>
        <AlertDialog open={renameOpen} onOpenChange={setRenameOpen}>
          <AlertDialogTrigger asChild>
            <Btn variant="outline" className="text-xs">Rename Season</Btn>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Rename Season</AlertDialogTitle>
              <AlertDialogDescription>Enter a new name for this season.</AlertDialogDescription>
            </AlertDialogHeader>
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Season Name" className="mt-2" />
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
              <Btn onClick={handleRename} loading={loading}>Save</Btn>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {controls.map((ctrl, i) => (
          <FadeIn key={ctrl.id} delay={i * 0.1}>
            <MagicCard className="p-4 flex flex-col justify-between h-full border border-red-500/10 hover:border-red-500/30 transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${ctrl.bg}`}>
                    <ctrl.icon className={ctrl.color} size={20} />
                  </div>
                  <h3 className="font-bold">{ctrl.label}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{ctrl.desc}</p>
              </div>
              
              <AlertDialog 
                open={activeDialog === ctrl.id} 
                onOpenChange={(open) => {
                  if (open) setActiveDialog(ctrl.id);
                  else if (!loading) setActiveDialog(null);
                }}
              >
                <AlertDialogTrigger asChild>
                  <Btn variant={ctrl.id === 'delete-season' ? 'danger' : 'outline'} className="w-full text-xs" disabled={loading}>
                    {ctrl.label}
                  </Btn>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will execute <strong>{ctrl.label}</strong> for the season <strong>{season.name}</strong>. 
                      {ctrl.id === 'delete-season' && " This cannot be undone."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading} className="bg-secondary text-foreground hover:bg-secondary/80">Cancel</AlertDialogCancel>
                    <Btn 
                      variant={ctrl.id === 'delete-season' ? 'danger' : 'default'}
                      className={ctrl.id !== 'delete-season' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                      loading={loading}
                      onClick={async (e) => {
                        e.preventDefault();
                        await ctrl.action();
                      }}
                    >
                      Confirm
                    </Btn>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
