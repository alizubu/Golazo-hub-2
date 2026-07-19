'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2 } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState, MagicCard, FadeIn, ShinyButton } from './UI';
import { startTournament, deleteTournament, renameTournament } from '@/app/actions/tournament';
import { generateFixtures } from '@/app/actions/match';

export default function AdminConsole(props) {
  const { tab } = props;
  if (tab === "admin") return <AdminOverview {...props} />;
  if (tab === "admin-tournament") return <AdminTournament {...props} />;
  return <EmptyState text="Admin feature in progress..." />;
}

function AdminOverview({ players, activeTournament, matches, history }) {
  const tMatches = activeTournament ? matches.filter((m) => m.tournamentId === activeTournament.id) : [];
  const live = tMatches.filter((m) => m.status === "live").length;
  const scheduled = tMatches.filter((m) => m.status === "scheduled").length;
  const completed = tMatches.filter((m) => m.status === "completed").length;
  
  const stats = [
    { label: "Players", value: players.length, icon: Users, color: 'text-pitch-bright' },
    { label: "Live now", value: live, icon: Radio, color: 'text-claret' },
    { label: "Upcoming", value: scheduled, icon: Clock, color: 'text-gold' },
    { label: "Completed", value: completed, icon: Check, color: 'text-muted-foreground' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon; 
          return (
            <FadeIn delay={i * 0.1} key={s.label}>
              <MagicCard className="p-5 flex flex-col items-center justify-center text-center">
                <Icon size={24} className={`mb-3 ${s.color}`} />
                <div className="text-3xl font-bold font-mono tracking-tighter">{s.value}</div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{s.label}</div>
              </MagicCard>
            </FadeIn>
          ); 
        })}
      </div>
      <FadeIn delay={0.4}>
        <Card className="p-6">
          <SectionTitle icon={Trophy}>Current tournament</SectionTitle>
          {activeTournament ? 
            <div className="text-sm text-muted-foreground"><strong className="text-foreground">{activeTournament.name}</strong> — started {new Date(activeTournament.createdAt).toLocaleDateString()}</div> 
            : <EmptyState text="No active tournament. Go to the Tournament tab to start one." />
          }
        </Card>
      </FadeIn>
      <FadeIn delay={0.5}>
        <Card className="p-6">
          <SectionTitle icon={Archive}>Completed seasons</SectionTitle>
          <div className="text-4xl font-bold font-mono text-gold">{history.length}</div>
        </Card>
      </FadeIn>
    </div>
  );
}

function AdminTournament({ tournaments, activeTournament, showToast, players }) {
  const [name, setName] = useState("");
  const [renameVal, setRenameVal] = useState(activeTournament?.name || "");

  const handleStart = async () => {
    const res = await startTournament(name);
    if (res.error) showToast(res.error);
    else { showToast("Tournament started"); setName(""); }
  };

  const handleRename = async () => {
    const res = await renameTournament(activeTournament.id, renameVal);
    if (res.error) showToast(res.error);
    else showToast("Tournament renamed");
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;
    const res = await deleteTournament(activeTournament.id);
    if (res.error) showToast(res.error);
    else showToast("Tournament deleted");
  };

  const handleGenerate = async (double) => {
    const res = await generateFixtures(activeTournament.id, players.map(p => p.id), double);
    if (res.error) showToast(res.error);
    else showToast(`Generated ${res.count} fixtures`);
  };

  return (
    <div className="flex flex-col gap-6">
      {!activeTournament ? (
        <FadeIn delay={0.1}>
          <Card className="p-6">
            <SectionTitle icon={Trophy}>Start a new tournament</SectionTitle>
            <div className="max-w-md">
              <Label>Tournament name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Winter Cup 2026" className="mt-2" />
              <ShinyButton className="mt-4 w-full" onClick={handleStart}>
                <Trophy size={16} /> Start tournament
              </ShinyButton>
            </div>
          </Card>
        </FadeIn>
      ) : (
        <>
          <FadeIn delay={0.1}>
            <Card className="p-6">
              <SectionTitle icon={Trophy}>{activeTournament.name}</SectionTitle>
              <div className="text-sm text-muted-foreground mb-4">League phase — generate fixtures here.</div>
              <div className="flex flex-wrap gap-3">
                <ShinyButton onClick={() => handleGenerate(false)}><Plus size={16} /> Generate single round-robin</ShinyButton>
                <Btn variant="ghost" onClick={() => handleGenerate(true)}><Plus size={16} /> Generate home & away</Btn>
              </div>
            </Card>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <Card className="p-6">
              <SectionTitle icon={Trophy}>Edit tournament</SectionTitle>
              <Label>Tournament name</Label>
              <div className="flex gap-3 mt-2 max-w-md">
                <Input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} />
                <Btn onClick={handleRename}><Check size={16} /> Save</Btn>
              </div>
              
              <div className="mt-8 pt-6 border-t border-border">
                <Btn variant="danger" onClick={handleDelete}>
                  <Trash2 size={16} /> Delete tournament
                </Btn>
              </div>
            </Card>
          </FadeIn>
        </>
      )}
    </div>
  );
}
