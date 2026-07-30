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


// ─── Trophy Templates ─────────────────────────────────────────────────────────

export async function getTrophyTemplates() {
  try {
    const templates = await prisma.trophyTemplate.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return templates;
  } catch (error) {
    return [];
  }
}

export async function createTrophyTemplate(data) {
  try {
    const template = await prisma.trophyTemplate.create({
      data: {
        name: data.name,
        icon: data.icon,
        description: data.description,
      },
    });
    return { template };
  } catch (error) {
    return { error: 'Failed to create trophy template.' };
  }
}

export async function deleteTrophyTemplate(id) {
  try {
    await prisma.trophyTemplate.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete trophy template.' };
  }
}
