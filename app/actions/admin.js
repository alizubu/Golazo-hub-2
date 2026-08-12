'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { checkSessionPermission } from '@/lib/permissions';

export async function createAnnouncement(data) {
  const auth = await checkSessionPermission('canEditBroadcast');
  if (!auth.authorized) return { error: auth.error };
  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
      },
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { announcement };
  } catch (error) {
    return { error: 'Failed to create announcement.' };
  }
}

export async function deleteAnnouncement(id) {
  const auth = await checkSessionPermission('canEditBroadcast');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.announcement.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete announcement.' };
  }
}


export async function awardTrophy(data) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    const trophy = await prisma.trophy.create({
      data: {
        playerId: data.playerId,
        title: data.title,
        season: data.season,
        description: data.description,
        icon: data.icon,
      },
    });

    // Auto-create 24h celebration banner
    await prisma.trophyCelebration.create({
      data: {
        trophyAwardId: trophy.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active'
      }
    });

    // Update Ranking Points based on Trophy
    let pointsToAdd = 0;
    if (data.title.includes('Golden Boot')) pointsToAdd = 2;
    else if (data.title.includes('BB Championship')) pointsToAdd = 6;
    else if (data.title.includes("Ballon d'Or")) pointsToAdd = 10;

    if (pointsToAdd > 0) {
      await prisma.player.update({
        where: { id: data.playerId },
        data: { rankingPoints: { increment: pointsToAdd } }
      });
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { trophy };
  } catch (error) {
    return { error: 'Failed to award trophy.' };
  }
}

export async function updateTrophy(id, data) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    const trophy = await prisma.trophy.update({
      where: { id },
      data: {
        title: data.title,
        season: data.season,
        description: data.description,
        icon: data.icon,
      },
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { trophy };
  } catch (error) {
    return { error: 'Failed to update trophy.' };
  }
}

export async function removeTrophy(id) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.trophy.delete({ where: { id } });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove trophy.' };
  }
}

export async function getCelebrations() {
  try {
    const celebrations = await prisma.trophyCelebration.findMany({
      include: {
        trophy: {
          include: {
            player: true
          }
        }
      },
      orderBy: {
        startedAt: 'desc'
      }
    });
    return { celebrations };
  } catch (error) {
    return { error: 'Failed to fetch celebrations.' };
  }
}

export async function endCelebration(id) {
  try {
    await prisma.trophyCelebration.update({
      where: { id },
      data: { status: 'ended_early' }
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to end celebration.' };
  }
}

export async function retriggerCelebration(trophyId) {
  try {
    await prisma.trophyCelebration.create({
      data: {
        trophyAwardId: trophyId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'active'
      }
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to retrigger celebration.' };
  }
}




export async function saveTickerConfig(data) {
  const auth = await checkSessionPermission('canEditBroadcast');
  if (!auth.authorized) return { error: auth.error };
  try {
    const existing = await prisma.tickerConfig.findFirst();
    let config;
    const payload = {
      enabled: data.enabled,
      source: data.source,
      customMatchIds: data.customMatchIds || [],
      speed: data.speed ?? 50,
      size: data.size || 'normal',
      separator: data.separator || 'dot',
      showAvatars: data.showAvatars,
      pauseOnHover: data.pauseOnHover,
      theme: data.theme,
      breakingNews: data.breakingNews || '',
      showStats: data.showStats ?? false,
      showHighlights: data.showHighlights ?? false,
      showStreaks: data.showStreaks ?? false,
      customHighlights: data.customHighlights || [],
      playerToWatch: data.playerToWatch || { active: false, playerId: '' },
      epicMoment: data.epicMoment || { active: false, playerId: '', text: '' },
      replayTrigger: data.replayTrigger || null,
    };
    if (existing) {
      config = await prisma.tickerConfig.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      config = await prisma.tickerConfig.create({ data: payload });
    }
    revalidatePath('/');
    return { config };
  } catch (error) {
    console.error("Failed to save ticker config:", error);
    return { error: 'Failed to save ticker config.' };
  }
}


export async function getSystemSettings() {
  try {
    let settings = await prisma.systemSettings.findUnique({ where: { id: 'global' } });
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: { id: 'global' } });
    }
    return { settings };
  } catch (error) {
    return { error: 'Failed to fetch system settings' };
  }
}

export async function updateSystemSettings(data) {
  try {
    const settings = await prisma.systemSettings.upsert({
      where: { id: 'global' },
      update: { autoNotificationsEnabled: data.autoNotificationsEnabled },
      create: { id: 'global', autoNotificationsEnabled: data.autoNotificationsEnabled }
    });
    revalidatePath('/');
    return { settings };
  } catch (error) {
    return { error: 'Failed to update system settings' };
  }
}

export async function adminUpdateRankingPoints(playerId, points) {
  const auth = await checkSessionPermission('canManagePlayers');
  if (!auth.authorized) return { error: auth.error };
  try {
    const player = await prisma.player.update({
      where: { id: playerId },
      data: { rankingPoints: points }
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true, player };
  } catch (error) {
    return { error: 'Failed to update ranking points.' };
  }
}

export async function adminBulkUpdateRankingPoints(playerIds, pointsAdjustment) {
  const auth = await checkSessionPermission('canManagePlayers');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.player.updateMany({
      where: { id: { in: playerIds } },
      data: {
        rankingPoints: {
          increment: pointsAdjustment
        }
      }
    });
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Bulk update error:", error);
    return { error: 'Failed to bulk update ranking points.' };
  }
}

export async function createCustomNotification(text, type = 'info') {
  try {
    const notification = await prisma.notification.create({
      data: { text, type }
    });
    revalidatePath('/');
    return { notification };
  } catch (error) {
    return { error: 'Failed to create notification' };
  }
}

export async function deleteCustomNotification(id) {
  try {
    await prisma.notification.delete({ where: { id } });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete notification' };
  }
}

export async function clearAllNotifications() {
  try {
    await prisma.notification.deleteMany({});
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to clear notifications' };
  }
}
