'use server';

import prisma from '@/lib/db';
import { broadcastEvent } from '@/lib/broadcast';
import { revalidatePath } from 'next/cache';

export async function getMatches(seasonId) {
  return await prisma.match.findMany({
    where: seasonId ? { seasonId } : undefined,
    orderBy: [
      { status: 'desc' },
      { scheduledAt: 'asc' },
      { completedAt: 'desc' }
    ]
  });
}

export async function generateFixtures(seasonId, playerIds, doubleRound) {
  if (playerIds.length < 2) return { error: 'Need at least 2 players' };

  const legs = [];
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      legs.push({ homeId: playerIds[i], awayId: playerIds[j] });
      if (doubleRound) {
        legs.push({ homeId: playerIds[j], awayId: playerIds[i] });
      }
    }
  }

  try {
    await prisma.match.createMany({
      data: legs.map(leg => ({
        seasonId,
        round: 'league',
        homeId: leg.homeId,
        awayId: leg.awayId,
        status: 'scheduled',
        decisive: false
      }))
    });

    await prisma.notification.create({
      data: {
        text: `${legs.length} league fixtures generated`,
        type: 'fixtures'
      }
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, count: legs.length };
  } catch (error) {
    return { error: 'Failed to generate fixtures' };
  }
}

export async function updateMatchStatus(matchId, data) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: data.status,
        liveState: data.liveState,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        wentToExtra: data.wentToExtra,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        penaltyHome: data.penaltyResult?.home,
        penaltyAway: data.penaltyResult?.away,
        penaltyWinner: data.penaltyResult?.winner,
      }
    });
    
    if (data.status === 'completed') {
      const home = await prisma.player.findUnique({ where: { id: match.homeId }});
      const away = await prisma.player.findUnique({ where: { id: match.awayId }});
      
      const pens = match.penaltyWinner ? ` (${match.penaltyHome}-${match.penaltyAway} pens)` : '';
      await prisma.notification.create({
        data: {
          text: `Result: ${home?.name} ${match.homeScore}-${match.awayScore} ${away?.name}${pens}`,
          type: 'result'
        }
      });

      // ── Auto-playoff trigger ──────────────────────────────────────────────
      // When a league match completes, check if ALL league matches for this
      // season are now done. If yes, and the season type includes Playoffs,
      // and no playoff bracket has been created yet → auto-generate it.
      if (match.seasonId) {
        const season = await prisma.season.findUnique({ where: { id: match.seasonId } });
        if (season && season.type && season.type.includes('Playoffs')) {
          const allLeagueMatches = await prisma.match.findMany({
            where: { seasonId: match.seasonId, round: 'league' }
          });
          const allCompleted = allLeagueMatches.length > 0 &&
            allLeagueMatches.every(m => m.status === 'completed');

          if (allCompleted) {
            // Check no playoff bracket exists yet
            const existingPlayoffs = await prisma.match.findFirst({
              where: { seasonId: match.seasonId, round: { not: 'league' } }
            });

            if (!existingPlayoffs) {
              // Compute standings from completed league matches
              const table = {};
              const players = await prisma.player.findMany({ select: { id: true } });
              players.forEach(p => { table[p.id] = { id: p.id, pts: 0, gd: 0, gf: 0 }; });

              allLeagueMatches.forEach(m => {
                const h = table[m.homeId], a = table[m.awayId];
                if (!h || !a) return;
                h.gf += (m.homeScore || 0); a.gf += (m.awayScore || 0);
                h.gd += ((m.homeScore || 0) - (m.awayScore || 0));
                a.gd += ((m.awayScore || 0) - (m.homeScore || 0));
                if (m.homeScore > m.awayScore) { h.pts += 3; }
                else if (m.awayScore > m.homeScore) { a.pts += 3; }
                else { h.pts++; a.pts++; }
              });

              const standings = Object.values(table)
                .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
              const top4 = standings.slice(0, 4).map(s => s.id);

              if (top4.length >= 4) {
                const [r1, r2, r3, r4] = top4;
                await prisma.match.createMany({
                  data: [
                    {
                      seasonId: match.seasonId,
                      round: 'semiA',
                      homeId: r1,
                      awayId: r2,
                      status: 'scheduled',
                      label: 'Top Match (1 vs 2)',
                      decisive: true
                    },
                    {
                      seasonId: match.seasonId,
                      round: 'semiB',
                      homeId: r3,
                      awayId: r4,
                      status: 'scheduled',
                      label: 'Bottom Match (3 vs 4)',
                      decisive: true
                    }
                  ]
                });

                await prisma.notification.create({
                  data: {
                    text: `🏆 Playoff bracket auto-generated for "${season.name}"! Top 4 seeded.`,
                    type: 'info'
                  }
                });
              }
            }
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────
    }

    revalidatePath('/');
    return { match };
  } catch (error) {
    return { error: 'Failed to update match status' };
  }
}

export async function updateMatchScore(matchId, homeScore, awayScore) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore }
    });
    revalidatePath('/');
    return { success: true, match };
  } catch (error) {
    return { error: 'Failed to update match score' };
  }
}

export async function editMatchScoreAdmin(matchId, homeScore, awayScore, adminId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) return { error: 'Match not found' };
    
    const existingStats = (typeof match.stats === 'object' && match.stats !== null) ? match.stats : {};
    const stats = {
      ...existingStats,
      audit: {
        editedAt: new Date().toISOString(),
        editedBy: adminId || 'admin'
      }
    };

    const updated = await prisma.match.update({
      where: { id: matchId },
      data: { 
        homeScore, 
        awayScore,
        stats
      }
    });
    
    // Also log this as an announcement/notification for transparency
    await prisma.notification.create({
      data: {
        text: `Admin updated match score: ${homeScore} - ${awayScore}`,
        type: 'info'
      }
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, match: updated };
  } catch (error) {
    return { error: 'Failed to edit match score' };
  }
}

export async function createRematch(homeId, awayId, seasonId) {
  try {
    const match = await prisma.match.create({
      data: {
        seasonId,
        round: 'friendly', // or 'league' if it counts for standings. Prompt says "friendly/bonus match bucket"
        homeId,
        awayId,
        status: 'scheduled',
        decisive: false,
        label: 'Rematch',
        homeScore: null,
        awayScore: null,
        completedAt: null,
        stats: null
      }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, match };
  } catch (error) {
    return { error: 'Failed to create rematch' };
  }
}

export async function generatePlayoffs(seasonId, top4PlayerIds) {
  if (top4PlayerIds.length < 4) return { error: 'Need 4 players for playoffs' };
  
  try {
    const [r1, r2, r3, r4] = top4PlayerIds;
    
    await prisma.match.createMany({
      data: [
        {
          seasonId,
          round: 'semiA',
          homeId: r1,
          awayId: r2,
          status: 'scheduled',
          label: 'Top Match (1 vs 2)',
          decisive: true
        },
        {
          seasonId,
          round: 'semiB',
          homeId: r3,
          awayId: r4,
          status: 'scheduled',
          label: 'Bottom Match (3 vs 4)',
          decisive: true
        }
      ]
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to generate playoffs' };
  }
}

