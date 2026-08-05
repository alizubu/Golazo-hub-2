'use server';

import prisma from '@/lib/db';
import { broadcastEvent } from '@/lib/broadcast';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { sendAutoNotification } from '@/lib/notifications';

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
  if ((await cookies()).get('golazo_session')?.value !== 'admin') return { error: 'Unauthorized' };
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

    await sendAutoNotification(
      `${legs.length} league fixtures generated`,
      'fixtures'
    );

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
      await sendAutoNotification(
        `Result: ${home?.name} ${match.homeScore}-${match.awayScore} ${away?.name}${pens}`,
        'result'
      );

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

                await sendAutoNotification(
                  `🏆 Playoff bracket auto-generated for "${season.name}"! Top 4 seeded.`,
                  'info'
                );
              }
            }
          }
        }
      }
      // ─────────────────────────────────────────────────────────────────────
      
      // ─────────────────────────────────────────────────────────────────────
      
      if (match.seasonId) {
        const season = await prisma.season.findUnique({ where: { id: match.seasonId } });
        if (season && season.type === 'Double Elimination') {
          await progressDoubleElimination(matchId);
        } else {
          // Check and progress playoff bracket if applicable
          await progressPlayoffBracket(matchId);
        }
      }
    }

    broadcastEvent('match_update', match);
    return { match };
  } catch (error) {
    return { error: 'Failed to update match status' };
  }
}

const matchWinnerId = (m) => {
  if (!m || m.status !== 'completed') return null;
  if (m.homeScore > m.awayScore) return m.homeId;
  if (m.awayScore > m.homeScore) return m.awayId;
  if (m.penaltyWinner) return m.penaltyWinner === 'home' ? m.homeId : m.awayId;
  return null;
};

const matchLoserId = (m) => {
  const w = matchWinnerId(m);
  if (!w) return null;
  return w === m.homeId ? m.awayId : m.homeId;
};

export async function progressDoubleElimination(matchId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId }, include: { season: true } });
    if (!match || match.status !== 'completed' || match.season?.type !== 'Double Elimination') return;

    const winnerId = matchWinnerId(match);
    const loserId = matchLoserId(match);
    if (!winnerId || !loserId) return;

    const bracket = match.season.bracket;
    if (!bracket) return;

    const matchKey = match.liveState?.key;
    if (!matchKey) return;

    // If this match was the Grand Final, check if we need to trigger or cancel the reset
    if (match.round === 'GF') {
      const gfResetMatch = await prisma.match.findFirst({
        where: { seasonId: match.seasonId, round: 'GF_RESET' }
      });
      if (gfResetMatch) {
        // In our bracket config, home is from WF (Winners Bracket), away is from LF (Losers Bracket)
        if (winnerId === match.homeId) {
          // Winners bracket champion won the GF -> Tournament is over, cancel GF_RESET
          await prisma.match.delete({ where: { id: gfResetMatch.id } });
        }
      }
    }

    // Find all pending matches in this season
    const pendingMatches = await prisma.match.findMany({
      where: { seasonId: match.seasonId, status: 'scheduled' }
    });

    for (const pending of pendingMatches) {
      if (!pending.liveState?.key) continue;
      const bracketNode = bracket.find(b => b.key === pending.liveState.key);
      if (!bracketNode || !bracketNode.dependsOn) continue;

      let updated = false;
      let updateData = {};

      if (bracketNode.dependsOn.home?.match === matchKey) {
        updateData.homeId = bracketNode.dependsOn.home.type === 'winner' ? winnerId : loserId;
        updated = true;
      }
      if (bracketNode.dependsOn.away?.match === matchKey) {
        updateData.awayId = bracketNode.dependsOn.away.type === 'winner' ? winnerId : loserId;
        updated = true;
      }

      if (updated) {
        await prisma.match.update({
          where: { id: pending.id },
          data: updateData
        });
        
        await sendAutoNotification(`Bracket updated: A player advanced in the tournament!`, 'info');
      }
    }
  } catch (error) {
    console.error('Failed to progress double elimination bracket:', error);
  }
}

export async function updateMatchScore(matchId, homeScore, awayScore) {
  try {
    const match = await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore }
    });
    broadcastEvent('match_update', match);
    return { success: true, match };
  } catch (error) {
    return { error: 'Failed to update match score' };
  }
}



export async function generatePlayoffs(seasonId, top4PlayerIds) {
  if ((await cookies()).get('golazo_session')?.value !== 'admin') return { error: 'Unauthorized' };
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

export async function progressPlayoffBracket(matchId) {
  try {
    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || !match.seasonId || match.status !== 'completed') return;



    if (match.round === 'semiA' || match.round === 'semiB') {
      const semis = await prisma.match.findMany({
        where: { seasonId: match.seasonId, round: { in: ['semiA', 'semiB'] } }
      });
      // Find the most relevant matches (completed ones take priority, otherwise newest)
      const getRelevantMatch = (roundMatches) => {
        const completed = roundMatches.filter(m => m.status === 'completed');
        if (completed.length > 0) return completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return roundMatches.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      };

      const semiA = getRelevantMatch(semis.filter(m => m.round === 'semiA'));
      const semiB = getRelevantMatch(semis.filter(m => m.round === 'semiB'));

      if (semiA?.status === 'completed' && semiB?.status === 'completed') {
        const existingChallenger = await prisma.match.findFirst({
          where: { seasonId: match.seasonId, round: 'challenger' }
        });
        if (!existingChallenger) {
          const semiALoser = matchLoserId(semiA);
          const semiBWinner = matchWinnerId(semiB);
          
          if (semiALoser && semiBWinner) {
            const challenger = await prisma.match.create({
              data: {
                seasonId: match.seasonId,
                round: 'challenger',
                homeId: semiALoser,
                awayId: semiBWinner,
                status: 'scheduled',
                label: 'Challenger',
                decisive: true
              },
              include: { home: true, away: true }
            });
            await sendAutoNotification(`Challenger match auto-created: ${challenger.home.name} vs ${challenger.away.name}`, 'info');
            broadcastEvent('match_update', challenger);
          }
        }
      }
    } else if (match.round === 'challenger') {
      const existingFinal = await prisma.match.findFirst({
        where: { seasonId: match.seasonId, round: 'final' }
      });
      if (!existingFinal) {
        const semiA = await prisma.match.findFirst({
          where: { seasonId: match.seasonId, round: 'semiA' }
        });
        const semiAWinner = matchWinnerId(semiA);
        const challengerWinner = matchWinnerId(match);
        
        if (semiAWinner && challengerWinner) {
          const finalMatch = await prisma.match.create({
            data: {
              seasonId: match.seasonId,
              round: 'final',
              homeId: semiAWinner,
              awayId: challengerWinner,
              status: 'scheduled',
              label: 'Grand Final',
              decisive: true
            },
            include: { home: true, away: true }
          });
          await sendAutoNotification(`Grand Final auto-created: ${finalMatch.home.name} vs ${finalMatch.away.name}`, 'info');
          broadcastEvent('match_update', finalMatch);
        }
      }
    }
  } catch (error) {
    console.error('Failed to progress playoff bracket:', error);
  }
}

export async function adminTriggerBracketProgress(seasonId) {
  if ((await cookies()).get('golazo_session')?.value !== 'admin') return { error: 'Unauthorized' };
  try {
    // Find any completed semi matches that haven't triggered the challenger
    const matches = await prisma.match.findMany({
      where: { seasonId, round: { in: ['semiA', 'semiB', 'challenger'] }, status: 'completed' }
    });
    for (const match of matches) {
      await progressPlayoffBracket(match.id);
    }
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to trigger bracket progress' };
  }
}
