'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { generateRoundRobinFixtures } from '@/lib/fixtures';
import { sendAutoNotification } from '@/lib/notifications';
import { checkSessionPermission } from '@/lib/permissions';

export async function getSeasons() {
  return await prisma.season.findMany({
    orderBy: { createdAt: 'desc' }
  });
}



export async function startSeason(name, type, startDate, config = {}) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  if (!name || !name.trim()) return { error: 'Give the season a name' };
  
  const active = await prisma.season.findFirst({ where: { status: 'Live' } });
  if (active) return { error: 'Finish or close the current season first' };

  try {
    let players = await prisma.player.findMany({ select: { id: true, name: true, elo: true } });
    if (players.length < 2) return { error: 'Need at least 2 players to start a season' };

    let isDoubleElim = type === 'Double Elimination';
    if (isDoubleElim && (players.length < 4 || players.length > 8)) {
      return { error: 'Double Elimination requires 4 to 8 players' };
    }

    let rounds = [];
    let bracketConfig = null;
    let matchCreates = [];

    if (isDoubleElim) {
      // Import the dynamic bracket generator
      const { generateDoubleEliminationBracket } = require('@/lib/brackets');
      
      // Randomize players for seeding, or sort by ELO if we preferred that.
      // User said "Random ok" so we randomize:
      players = players.sort(() => Math.random() - 0.5);
      
      const bracketMatches = generateDoubleEliminationBracket(players);
      bracketConfig = bracketMatches;
      
      // We don't save 'rounds' for DE, just bracket
      bracketMatches.forEach(m => {
        matchCreates.push({
          id: undefined, // Prisma will generate CUID
          seasonId: '', // Will map after season creation
          round: m.round,
          homeId: m.homeId,
          awayId: m.awayId,
          status: 'scheduled',
          label: m.label,
          liveState: { key: m.key } // We store the bracket key here temporarily so we know which match is which
        });
      });
    } else {
      const isDouble = type.includes('(Double)');
      rounds = generateRoundRobinFixtures(players, isDouble);
      rounds.forEach((roundMatches, index) => {
         const roundLabel = `Week ${index + 1}`;
         roundMatches.forEach(m => {
            matchCreates.push({
               seasonId: '',
               round: 'league',
               homeId: m.homeId,
               awayId: m.awayId,
               status: 'scheduled',
               label: roundLabel
            });
         });
      });
    }
    
    const season = await prisma.season.create({
      data: { 
        name: name.trim(), 
        type: type || 'League (Single)',
        startDate: startDate ? new Date(startDate) : new Date(),
        status: 'Live',
        isArchived: false,
        fixtures: rounds,
        bracket: bracketConfig,
        config: config
      }
    });

    if (matchCreates.length > 0) {
       matchCreates = matchCreates.map(m => ({ ...m, seasonId: season.id }));
       await prisma.match.createMany({
         data: matchCreates
       });
    }
    
    await sendAutoNotification(`New season kicked off: "${season.name}"`, 'info');
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { season };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to start season' };
  }
}





export async function renameSeason(id, newName) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
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



export async function completeSeason(id, data) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
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

    await sendAutoNotification(`Season completed! Champion: ${data.championName || 'Unknown'}`, 'info');
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to complete season' };
  }
}

export async function adminResetStandings(seasonId) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.match.updateMany({
      where: { seasonId },
      data: {
        homeScore: null,
        awayScore: null,
        status: 'scheduled',
        completedAt: null,
        stats: null,
        liveState: null
      }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to reset standings' };
  }
}

export async function adminRestartSeason(seasonId) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.match.deleteMany({
      where: { seasonId, round: { not: 'league' } }
    });
    await prisma.match.updateMany({
      where: { seasonId, round: 'league' },
      data: {
        homeScore: null,
        awayScore: null,
        status: 'scheduled',
        completedAt: null,
        stats: null,
        liveState: null
      }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to restart season' };
  }
}

export async function adminForceEndTournament(seasonId) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    const allLeagueMatches = await prisma.match.findMany({
      where: { seasonId, status: 'completed' }
    });
    
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

    const standings = Object.values(table).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf);
    const champion = standings.length > 0 ? standings[0].id : null;

    await prisma.match.deleteMany({
      where: { seasonId, status: { not: 'completed' } }
    });

    await prisma.season.update({
      where: { id: seasonId },
      data: {
        status: 'Archived',
        isArchived: true,
        completedAt: new Date(),
        championId: champion
      }
    });
    
    if (champion) {
      const champ = await prisma.player.findUnique({ where: { id: champion } });
      await sendAutoNotification(`Tournament force ended. Champion: ${champ?.name || 'Unknown'}`, 'info');
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to force end tournament' };
  }
}

export async function adminResetFixtures(seasonId) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    const season = await prisma.season.findUnique({ where: { id: seasonId } });
    if (!season) return { error: 'Season not found' };

    await prisma.match.deleteMany({ where: { seasonId } });

    const players = await prisma.player.findMany({ select: { id: true, name: true } });
    if (players.length < 2) return { error: 'Need at least 2 players' };

    const isDouble = season.type.includes('(Double)');
    const rounds = generateRoundRobinFixtures(players, isDouble);

    await prisma.season.update({
      where: { id: seasonId },
      data: { fixtures: rounds }
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
       await prisma.match.createMany({ data: matchCreates });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to reset fixtures' };
  }
}

export async function adminDeleteSeason(seasonId) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.season.delete({ where: { id: seasonId } });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete season' };
  }
}

export async function updateSeasonAwards(seasonId, data) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    const season = await prisma.season.update({
      where: { id: seasonId },
      data: {
        championId: data.championId || null,
        runnerUpId: data.runnerUpId || null,
        thirdId: data.thirdId || null,
        mvpId: data.mvpId || null
      }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true, season };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to update season awards' };
  }
}
