'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateRoundRobinFixtures } from '@/lib/fixtures';

export async function getSeasons() {
  return await prisma.season.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getActiveSeason() {
  return await prisma.season.findFirst({
    where: { isArchived: false }
  });
}

export async function startSeason(name, type, startDate) {
  if (!name || !name.trim()) return { error: 'Give the season a name' };
  
  const active = await getActiveSeason();
  if (active) return { error: 'Finish or close the current season first' };

  try {
    const players = await prisma.player.findMany({ select: { id: true, name: true } });
    if (players.length < 2) return { error: 'Need at least 2 players to start a season' };

    const isDouble = type.includes('(Double)');
    const rounds = generateRoundRobinFixtures(players, isDouble);
    
    const season = await prisma.season.create({
      data: { 
        name: name.trim(), 
        type: type || 'League (Single)',
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'Live',
        isArchived: false,
        fixtures: rounds
      }
    });

    const matchCreates = [];
    rounds.forEach((roundMatches, index) => {
       const roundLabel = `Week ${index + 1}`;
       roundMatches.forEach(m => {
          matchCreates.push({
             seasonId: season.id,
             round: 'league',
             homeId: m.homeId,
             awayId: m.awayId,
             status: 'scheduled',
             label: roundLabel
          });
       });
    });

    if (matchCreates.length > 0) {
       await prisma.match.createMany({
         data: matchCreates
       });
    }
    
    await prisma.notification.create({
      data: { text: `New season kicked off: "${season.name}"`, type: 'info' }
    });
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { season };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to start season' };
  }
}

export async function closeSeasonEarly(id) {
  try {
    await prisma.season.update({
      where: { id },
      data: { status: 'Archived', isArchived: true, completedAt: new Date() }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to close season' };
  }
}

export async function deleteSeason(id) {
  try {
    await prisma.season.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete season' };
  }
}

export async function renameSeason(id, newName) {
  if (!newName || !newName.trim()) return { error: 'Name cannot be empty' };
  
  try {
    await prisma.season.update({
      where: { id },
      data: { name: newName.trim() }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to rename season' };
  }
}

export async function regenerateFixtures(id, players, isDouble) {
  try {
    // Note: Only to be used before matches are played
    await prisma.match.deleteMany({
      where: { seasonId: id, round: 'league' }
    });

    const rounds = generateRoundRobinFixtures(players, isDouble);
    
    await prisma.season.update({
      where: { id },
      data: { fixtures: rounds }
    });

    const matchCreates = [];
    rounds.forEach((roundMatches, index) => {
       const roundLabel = `Week ${index + 1}`;
       roundMatches.forEach(m => {
          matchCreates.push({
             seasonId: id,
             round: 'league',
             homeId: m.homeId,
             awayId: m.awayId,
             status: 'scheduled',
             label: roundLabel
          });
       });
    });

    if (matchCreates.length > 0) {
       await prisma.match.createMany({ data: matchCreates });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to regenerate fixtures' };
  }
}

export async function completeSeason(id, data) {
  try {
    await prisma.season.update({
      where: { id },
      data: {
        status: 'Archived',
        isArchived: true,
        completedAt: new Date(),
        championId: data.championId || null,
        runnerUpId: data.runnerUpId || null,
        thirdId: data.thirdId || null,
        mvpId: data.mvpId || null
      }
    });
    
    // Automatically issue trophies if passed
    if (data.trophies && data.trophies.length > 0) {
      await prisma.trophy.createMany({
        data: data.trophies.map(t => ({
          playerId: t.playerId,
          title: t.title,
          season: t.season,
          icon: t.icon,
          description: t.description
        }))
      });
    }

    await prisma.notification.create({
      data: { text: `Season completed! Champion: ${data.championName || 'Unknown'}`, type: 'info' }
    });
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to complete season' };
  }
}
