'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(data) {
  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
      },
    });
    return { announcement };
  } catch (error) {
    return { error: 'Failed to create announcement.' };
  }
}

export async function deleteAnnouncement(id) {
  try {
    await prisma.announcement.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete announcement.' };
  }
}


export async function awardTrophy(data) {
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

    revalidatePath('/admin');
    revalidatePath('/');
    return { trophy };
  } catch (error) {
    return { error: 'Failed to award trophy.' };
  }
}

export async function updateTrophy(id, data) {
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
