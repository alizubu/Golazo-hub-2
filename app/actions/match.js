'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getMatches(tournamentId) {
  return await prisma.match.findMany({
    where: tournamentId ? { tournamentId } : undefined,
    orderBy: [
      { status: 'desc' },
      { scheduledAt: 'asc' },
      { completedAt: 'desc' }
    ]
  });
}

export async function generateFixtures(tournamentId, playerIds, doubleRound) {
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
        tournamentId,
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
    }

    revalidatePath('/');
    return { match };
  } catch (error) {
    return { error: 'Failed to update match status' };
  }
}

export async function updateMatchScore(matchId, homeScore, awayScore) {
  try {
    await prisma.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update match score' };
  }
}

export async function generatePlayoffs(tournamentId, top4PlayerIds) {
  if (top4PlayerIds.length < 4) return { error: 'Need 4 players for playoffs' };
  
  try {
    const [r1, r2, r3, r4] = top4PlayerIds;
    
    await prisma.match.createMany({
      data: [
        {
          tournamentId,
          round: 'semiA',
          homeId: r1,
          awayId: r2,
          status: 'scheduled',
          label: 'Top Match (1 vs 2)',
          decisive: true
        },
        {
          tournamentId,
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

export async function createPlayoffMatch(tournamentId, round, homeId, awayId, label) {
  try {
    const match = await prisma.match.create({
      data: {
        tournamentId,
        round,
        homeId,
        awayId,
        status: 'scheduled',
        label,
        decisive: true
      }
    });
    revalidatePath('/');
    return { match };
  } catch (error) {
    return { error: 'Failed to create match' };
  }
}
