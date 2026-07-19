'use client';

import React, { useState } from 'react';
import { Trophy, Calendar, Users, Radio, Clock, Check, Archive, Plus, Trash2 } from 'lucide-react';
import { Card, Btn, Input, Label, SectionTitle, EmptyState } from './UI';
import { startTournament, deleteTournament, renameTournament } from '@/app/actions/tournament';
import { generateFixtures } from '@/app/actions/match';

export default function AdminConsole(props) {
  const { tab } = props;
  if (tab === "admin") return <AdminOverview {...props} />;
  if (tab === "admin-tournament") return <AdminTournament {...props} />;
  // Fallbacks for other admin tabs
  return <EmptyState text="Admin feature in progress..." />;
}

function AdminOverview({ players, activeTournament, matches, history }) {
  const tMatches = activeTournament ? matches.filter((m) => m.tournamentId === activeTournament.id) : [];
  const live = tMatches.filter((m) => m.status === "live").length;
  const scheduled = tMatches.filter((m) => m.status === "scheduled").length;
  const completed = tMatches.filter((m) => m.status === "completed").length;
  
  const stats = [
    { label: "Players", value: players.length, icon: Users, color: 'var(--pitchBright)' },
    { label: "Live now", value: live, icon: Radio, color: 'var(--claret)' },
    { label: "Upcoming", value: scheduled, icon: Clock, color: 'var(--gold)' },
    { label: "Completed", value: completed, icon: Check, color: 'var(--textDim)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
        {stats.map((s, i) => {
          const Icon = s.icon; 
          return (
            <Card key={s.label} className="fade-up p-4" style={{ animationDelay: `${i * 40}ms`, padding: '1rem' }}>
              <Icon size={16} color={s.color} />
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', fontFamily: 'var(--font-mono)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--textFaint)' }}>{s.label}</div>
            </Card>
          ); 
        })}
      </div>
      <Card className="fade-up p-4" style={{ padding: '1rem' }}>
        <SectionTitle icon={Trophy}>Current tournament</SectionTitle>
        {activeTournament ? 
          <div className="text-sm" style={{ color: 'var(--textDim)' }}><strong style={{ color: 'var(--text)' }}>{activeTournament.name}</strong> — started {new Date(activeTournament.createdAt).toLocaleDateString()}</div> 
          : <EmptyState text="No active tournament. Go to the Tournament tab to start one." />
        }
      </Card>
      <Card className="fade-up p-4" style={{ padding: '1rem' }}>
        <SectionTitle icon={Archive}>Completed seasons</SectionTitle>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--gold)' }}>{history.length}</div>
      </Card>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {!activeTournament ? (
        <Card className="fade-up p-4" style={{ padding: '1rem' }}>
          <SectionTitle icon={Trophy}>Start a new tournament</SectionTitle>
          <Label>Tournament name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Winter Cup 2026" />
          <Btn className="mt-3" style={{ marginTop: '0.75rem' }} onClick={handleStart}>
            <Trophy size={15} /> Start tournament
          </Btn>
        </Card>
      ) : (
        <>
          <Card className="fade-up p-4" style={{ padding: '1rem' }}>
            <SectionTitle icon={Trophy}>{activeTournament.name}</SectionTitle>
            <div className="text-sm mb-3" style={{ color: 'var(--textDim)', marginBottom: '0.75rem' }}>League phase — generate fixtures here.</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Btn onClick={() => handleGenerate(false)}><Plus size={15} /> Generate single round-robin</Btn>
              <Btn variant="ghost" onClick={() => handleGenerate(true)}><Plus size={15} /> Generate home & away</Btn>
            </div>
          </Card>
          
          <Card className="fade-up p-4" style={{ padding: '1rem' }}>
            <SectionTitle icon={Trophy}>Edit tournament</SectionTitle>
            <Label>Tournament name</Label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Input value={renameVal} onChange={(e) => setRenameVal(e.target.value)} />
              <Btn onClick={handleRename}><Check size={14} /> Save</Btn>
            </div>
            
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <Btn variant="danger" onClick={handleDelete}>
                <Trash2 size={14} /> Delete tournament
              </Btn>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
