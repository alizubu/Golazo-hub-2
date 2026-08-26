'use client';

import React, { useState } from 'react';
import { History, Trash2, Edit2, ChevronDown, Trophy, Star, Crown } from 'lucide-react';
import { Card, SectionTitle, EmptyState, Btn, Input, Label, Badge, Avatar, MagicCard } from '@/app/components/shared/UI';
import { updateSeasonAwards, adminDeleteSeason } from '@/app/actions/season';
import { updateMatchScore } from '@/app/actions/match';

export default function AdminHistory({ seasons = [], matches = [], players = [], showToast, session }) {
  const archivedSeasons = seasons.filter(s => s.isArchived);
  const [expandedSeason, setExpandedSeason] = useState(null);
  
  if (archivedSeasons.length === 0) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500">
        <EmptyState text="No archived seasons found. Complete a season to archive it." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {archivedSeasons.map((season, index) => (
        <AdminHistorySeasonCard 
          key={season.id} 
          season={season} 
          matches={matches.filter(m => m.seasonId === season.id)} 
          players={players} 
          showToast={showToast}
          isExpanded={expandedSeason === season.id}
          onToggle={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
          delay={index * 0.1}
          session={session}
        />
      ))}
    </div>
  );
}

function AdminHistorySeasonCard({ season, matches, players, showToast, isExpanded, onToggle, delay = 0, session }) {
  const [loading, setLoading] = useState(false);
  const byId = Object.fromEntries(players.map(p => [p.id, p]));
  
  const champion = byId[season.championId];
  const mvp = byId[season.mvpId];
  const finalMatch = matches.find(m => m.round === 'final');

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

  return (
    <Card className={`flex flex-col border overflow-hidden transition-all duration-500 ${isExpanded ? 'border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)]' : 'border-border/50 hover:border-amber-500/30 shadow-lg'}`} style={{ animationDelay: `${delay}s` }}>
      
      {/* ── HALL OF CHAMPIONS BANNER (Closed State) ── */}
      <div 
        className="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 cursor-pointer bg-gradient-to-br from-background via-secondary/20 to-background group overflow-hidden"
        onClick={onToggle}
      >
        {/* Subtle background glow if expanded */}
        <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none transition-opacity duration-500 ${isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
        
        {/* Season Info */}
        <div className="flex flex-col items-center md:items-start gap-2 z-10 w-full md:w-auto text-center md:text-left mb-8 md:mb-0">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full">
            <span className="font-black font-heading text-3xl tracking-wide group-hover:text-amber-500 transition-colors duration-300">{season.name}</span>
            <Badge color="var(--gold)" className="mt-2 md:mt-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]">ARCHIVED</Badge>
          </div>
          <span className="text-sm text-muted-foreground font-semibold">
            {season.completedAt ? `Concluded: ${new Date(season.completedAt).toLocaleDateString()}` : `Format: ${season.type}`}
          </span>
        </div>

        {/* The Heroes (Champion & MVP) */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 z-10 pr-0 md:pr-12">
          {champion && (
            <div className="flex flex-col items-center gap-3 group-hover:-translate-y-2 transition-transform duration-500">
              <div className="relative">
                <div className="absolute -inset-4 bg-amber-500/30 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-5 -right-4 z-20 animate-bounce" style={{ animationDuration: '2s' }}>
                  <Crown size={32} className="text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                </div>
                <Avatar p={champion} size={80} className="border-[3px] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.6)] relative z-10 bg-background" />
              </div>
              <div className="text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em] mb-1">Champion</span>
                <span className="text-base font-black text-foreground drop-shadow-md">{champion.name}</span>
              </div>
            </div>
          )}

          {mvp && (
            <div className="flex flex-col items-center gap-3 group-hover:-translate-y-2 transition-transform duration-500 delay-100">
              <div className="relative">
                <div className="absolute -inset-3 bg-blue-500/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -top-3 -right-3 z-20">
                  <Star size={24} className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.9)] fill-blue-400" />
                </div>
                <Avatar p={mvp} size={64} className="border-2 border-blue-400/80 shadow-[0_0_20px_rgba(96,165,250,0.4)] relative z-10 bg-background" />
              </div>
              <div className="text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em] mb-1">Season MVP</span>
                <span className="text-sm font-bold text-foreground drop-shadow-md">{mvp.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions Dropdown Icon */}
        <div className="absolute bottom-4 right-4 md:static md:bottom-auto md:right-auto md:flex items-center z-10">
          <div className={`p-2 rounded-full transition-colors duration-300 ${isExpanded ? 'bg-amber-500/20 text-amber-500' : 'bg-secondary text-muted-foreground group-hover:bg-secondary/80 group-hover:text-foreground'}`}>
            <ChevronDown size={24} className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* ── EXPANDED DETAILS ── */}
      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 md:p-10 flex flex-col gap-12 bg-black/20 dark:bg-black/40 border-t border-border/50">
          
          {/* Grand Final Flashback */}
          {finalMatch ? (
            <div className="w-full max-w-3xl mx-auto animate-in zoom-in-95 duration-700 delay-100 fill-mode-both">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-amber-500/50" />
                <Trophy size={20} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <span className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 drop-shadow-md">Grand Final Flashback</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-500/50 to-amber-500/50" />
              </div>
              
              <MagicCard className="p-8 bg-gradient-to-br from-background via-secondary/10 to-background border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden">
                {/* Decorative background glow for final card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-32 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex items-center justify-between gap-4 relative z-10">
                  
                  {/* Finalist 1 (Home) */}
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <Avatar 
                      p={byId[finalMatch.homeId]} 
                      size={96} 
                      className={`border-4 transition-all duration-700 ${finalMatch.homeScore > finalMatch.awayScore ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-110' : 'border-border/50 opacity-80 grayscale'}`} 
                    />
                    <span className={`font-black text-xl text-center truncate w-full ${finalMatch.homeScore > finalMatch.awayScore ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {byId[finalMatch.homeId]?.name}
                    </span>
                  </div>
                  
                  {/* Score */}
                  <div className="flex flex-col items-center justify-center gap-2 shrink-0 px-2 md:px-8">
                    <div className="text-6xl md:text-7xl font-black font-score tracking-tighter drop-shadow-xl flex items-center gap-3">
                      <span className={finalMatch.homeScore > finalMatch.awayScore ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-foreground/80'}>{finalMatch.homeScore}</span>
                      <span className="text-muted-foreground/30 text-5xl">-</span>
                      <span className={finalMatch.awayScore > finalMatch.homeScore ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-foreground/80'}>{finalMatch.awayScore}</span>
                    </div>
                    {finalMatch.penaltyWinner && (
                      <Badge color="var(--primary)" className="mt-3 text-xs shadow-lg animate-pulse">
                        PENS: {finalMatch.penaltyHome} - {finalMatch.penaltyAway} ({finalMatch.penaltyWinner.toUpperCase()})
                      </Badge>
                    )}
                  </div>

                  {/* Finalist 2 (Away) */}
                  <div className="flex flex-col items-center gap-4 flex-1">
                    <Avatar 
                      p={byId[finalMatch.awayId]} 
                      size={96} 
                      className={`border-4 transition-all duration-700 ${finalMatch.awayScore > finalMatch.homeScore ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-110' : 'border-border/50 opacity-80 grayscale'}`} 
                    />
                    <span className={`font-black text-xl text-center truncate w-full ${finalMatch.awayScore > finalMatch.homeScore ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {byId[finalMatch.awayId]?.name}
                    </span>
                  </div>

                </div>
              </MagicCard>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <div className="px-6 py-4 rounded-xl border border-border/50 bg-secondary/10 flex items-center gap-3 text-muted-foreground text-sm font-semibold">
                <History size={16} />
                No Final Match Data Available
              </div>
            </div>
          )}
          
          {/* Awards Editor */}
          <div className="bg-background/80 backdrop-blur-md p-8 rounded-3xl border border-border shadow-2xl animate-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex flex-col gap-1">
                <h4 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                  <Edit2 size={20} className="text-pitch-bright" /> 
                  Official Season Records
                </h4>
                <p className="text-xs text-muted-foreground">Modify the official awards recorded in the Hall of Fame.</p>
              </div>
              {session?.role === 'admin' && (
                <Btn variant="danger" className="h-10 text-xs shrink-0 font-bold" onClick={handleDelete} loading={loading}>
                  <Trash2 size={16} className="mr-2" /> Delete Season
                </Btn>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                <Label className="text-amber-500 font-bold text-sm tracking-widest uppercase flex items-center gap-2 mb-3">
                  <Crown size={14}/> Champion
                </Label>
                <select 
                  className="w-full bg-background border border-border/80 focus:border-amber-500 rounded-lg p-3 text-sm font-bold text-foreground transition-colors"
                  value={awardsForm.championId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, championId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                <Label className="text-slate-300 font-bold text-sm tracking-widest uppercase flex items-center gap-2 mb-3">
                  🥈 Runner-Up
                </Label>
                <select 
                  className="w-full bg-background border border-border/80 focus:border-slate-300 rounded-lg p-3 text-sm font-bold text-foreground transition-colors"
                  value={awardsForm.runnerUpId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, runnerUpId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="bg-secondary/20 p-4 rounded-xl border border-border/50">
                <Label className="text-amber-700 font-bold text-sm tracking-widest uppercase flex items-center gap-2 mb-3">
                  🥉 Third Place
                </Label>
                <select 
                  className="w-full bg-background border border-border/80 focus:border-amber-700 rounded-lg p-3 text-sm font-bold text-foreground transition-colors"
                  value={awardsForm.thirdId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, thirdId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="bg-secondary/20 p-4 rounded-xl border border-border/50 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
                <Label className="text-blue-400 font-bold text-sm tracking-widest uppercase flex items-center gap-2 mb-3">
                  <Star size={14} className="fill-blue-400"/> Season MVP
                </Label>
                <select 
                  className="w-full bg-background border border-border/80 focus:border-blue-400 rounded-lg p-3 text-sm font-bold text-foreground transition-colors relative z-10"
                  value={awardsForm.mvpId}
                  onChange={(e) => setAwardsForm({ ...awardsForm, mvpId: e.target.value })}
                >
                  <option value="">None</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Btn onClick={handleSaveAwards} loading={loading} className="px-10 h-12 text-sm shadow-[0_0_20px_rgba(41,193,121,0.2)] hover:shadow-[0_0_30px_rgba(41,193,121,0.4)]">
                Save Official Records
              </Btn>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
}
