'use client';

import React, { useState } from 'react';
import { History, Trash2, Edit2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Card, SectionTitle, EmptyState, Btn, Input, Label, Badge, Avatar } from './UI';
import { updateSeasonAwards, adminDeleteSeason } from '@/app/actions/season';
import { updateMatchScore } from '@/app/actions/match';

export default function AdminHistory({ seasons = [], matches = [], players = [], showToast }) {
  const archivedSeasons = seasons.filter(s => s.isArchived);
  const [expandedSeason, setExpandedSeason] = useState(null);
  
  if (archivedSeasons.length === 0) {
    return <EmptyState text="No archived seasons found." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle icon={History}>Tournament History</SectionTitle>
      
      {archivedSeasons.map(season => (
        <AdminHistorySeasonCard 
          key={season.id} 
          season={season} 
          matches={matches.filter(m => m.seasonId === season.id)} 
          players={players} 
          showToast={showToast}
          isExpanded={expandedSeason === season.id}
          onToggle={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
        />
      ))}
    </div>
  );
}

function AdminHistorySeasonCard({ season, matches, players, showToast, isExpanded, onToggle }) {
  const [loading, setLoading] = useState(false);
  
  const [awardsForm, setAwardsForm] = useState({
    championId: season.championId || '',
    runnerUpId: season.runnerUpId || '',
    thirdId: season.thirdId || '',
    mvpId: season.mvpId || '',
  });

  const handleSaveAwards = async () => {
    setLoading(true);
    const res = await updateSeasonAwards(season.id, awardsForm);
    if (res.error) showToast(res.error);
    else showToast("Season awards updated!");
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the season "${season.name}"? This will delete all matches and cannot be undone.`)) return;
    setLoading(true);
    const res = await adminDeleteSeason(season.id);
    if (res.error) showToast(res.error);
    else showToast("Season deleted!");
    setLoading(false);
  };

  const completedMatches = matches.filter(m => m.status === 'completed');

  return (
    <Card className="flex flex-col border border-border/50 overflow-hidden">
      <div 
        className="flex items-center justify-between p-5 cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors"
        onClick={onToggle}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg">{season.name}</span>
            <Badge color="var(--gold)">ARCHIVED</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {season.completedAt ? `Completed on ${new Date(season.completedAt).toLocaleDateString()}` : `Type: ${season.type}`}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Btn variant="danger" className="h-8 text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(); }} loading={loading}>
            <Trash2 size={14} className="mr-1" /> Delete
          </Btn>
          <ChevronDown size={20} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 flex flex-col gap-8 bg-background border-t border-border/50">
          
          {/* Awards Editor */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Edit Awards</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Champion</Label>
                <select 
                  className="w-full bg-secondary border border-border/50 rounded-lg p-2 text-sm"
                  value={awardsForm.championId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, championId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Runner-Up</Label>
                <select 
                  className="w-full bg-secondary border border-border/50 rounded-lg p-2 text-sm"
                  value={awardsForm.runnerUpId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, runnerUpId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <Label>Third Place</Label>
                <select 
                  className="w-full bg-secondary border border-border/50 rounded-lg p-2 text-sm"
                  value={awardsForm.thirdId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, thirdId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <Label>MVP</Label>
                <select 
                  className="w-full bg-secondary border border-border/50 rounded-lg p-2 text-sm"
                  value={awardsForm.mvpId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, mvpId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <Btn onClick={handleSaveAwards} className="mt-4" loading={loading}>Save Awards</Btn>
          </div>

          {/* Match Score Editor */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Edit Match Scores</h4>
            {completedMatches.length === 0 ? (
              <EmptyState text="No completed matches in this season." />
            ) : (
              <div className="flex flex-col gap-3">
                {completedMatches.map(m => (
                  <MatchScoreEditor key={m.id} match={m} players={players} showToast={showToast} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </Card>
  );
}

function MatchScoreEditor({ match, players, showToast }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);
  const [loading, setLoading] = useState(false);

  const h = players.find(p => p.id === match.homeId);
  const a = players.find(p => p.id === match.awayId);

  const handleUpdate = async () => {
    setLoading(true);
    const res = await updateMatchScore(match.id, parseInt(homeScore), parseInt(awayScore));
    if (res.error) showToast(res.error);
    else showToast("Score updated!");
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/30 gap-4">
      <div className="flex flex-1 items-center justify-end gap-2 text-sm font-bold">
        <span>{h?.name}</span>
        <Avatar p={h} size={24} />
      </div>
      <div className="flex items-center gap-2">
        <Input 
          type="number" 
          className="w-16 h-8 text-center text-sm" 
          value={homeScore} 
          onChange={e => setHomeScore(e.target.value)} 
        />
        <span className="text-muted-foreground">-</span>
        <Input 
          type="number" 
          className="w-16 h-8 text-center text-sm" 
          value={awayScore} 
          onChange={e => setAwayScore(e.target.value)} 
        />
      </div>
      <div className="flex flex-1 items-center justify-start gap-2 text-sm font-bold">
        <Avatar p={a} size={24} />
        <span>{a?.name}</span>
      </div>
      <Btn variant="primary" className="h-8 text-xs shrink-0" onClick={handleUpdate} loading={loading}>
        Save
      </Btn>
    </div>
  );
}
