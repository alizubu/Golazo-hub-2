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
      data
    });
    
    if (data.status === 'completed') {
      const home = await prisma.player.findUnique({ where: { id: match.homeId }});
      const away = await prisma.player.findUnique({ where: { id: match.awayId }});
      
      const pens = match.penaltyWinner ? ` (${match.penaltyHome}-${match.penaltyAway} pens)` : '';
      await prisma.notification.create({
        data: {
          text: `Result: ${home?.name} ${match.homeScore}-${match.awayScore} ${away?.name}${pens}`
        }
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
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
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update match score' };
  }
}
