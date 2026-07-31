'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star } from 'lucide-react';
import { Card, SectionTitle, Avatar, MagicCard, FadeIn } from './UI';
import { motion } from 'framer-motion';
import { getTrophyTemplates } from '@/app/actions/admin';

export default function HallOfFame({ trophies = [], players = [] }) {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await getTrophyTemplates();
      setTemplates(res);
    }
    load();
  }, []);

  // Group trophies by template title or name
  const groupedTrophies = {};
  
  trophies.forEach(t => {
    if (!groupedTrophies[t.title]) {
      groupedTrophies[t.title] = {
        title: t.title,
        icon: t.icon,
        awards: []
      };
    }
    groupedTrophies[t.title].awards.push(t);
  });

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-12 pb-24">
      <div className="text-center space-y-4 pt-12 pb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4"
        >
          <Trophy size={48} className="text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
        </motion.div>
        <h1 className="text-5xl font-heading font-black tracking-tight uppercase bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-transparent bg-clip-text drop-shadow-sm">
          Hall of Fame
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Honoring the greatest achievements, legendary seasons, and historic moments in Golazo Hub history.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(groupedTrophies).map((group, i) => (
          <FadeIn key={group.title} delay={i * 0.1}>
            <MagicCard gradientColor="rgba(251, 191, 36, 0.1)">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border/50">
                  {group.icon && (group.icon.startsWith('/') || group.icon.startsWith('http')) ? (
                    <img src={group.icon} className="w-12 h-12 object-contain drop-shadow-lg" alt="" />
                  ) : (
                    <span className="text-4xl">{group.icon || '🏆'}</span>
                  )}
                  <div>
                    <h3 className="text-xl font-bold font-heading">{group.title}</h3>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{group.awards.length} Winners</p>
                  </div>
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {group.awards.map(award => (
                    <div key={award.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/30">
                      <div className="flex items-center gap-3">
                        <Avatar p={award.player || players.find(p => p.id === award.playerId)} size={32} />
                        <div>
                          <div className="font-bold text-sm leading-tight text-foreground">{award.player?.name || 'Unknown'}</div>
                          {award.description && (
                            <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[150px]">{award.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold font-score text-amber-500">{award.season}</div>
                        <div className="text-[9px] text-muted-foreground font-score">{new Date(award.createdAt).getFullYear()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </MagicCard>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
