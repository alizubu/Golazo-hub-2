'use server';

import prisma from '@/lib/db';

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
    return { trophy };
  } catch (error) {
    return { error: 'Failed to update trophy.' };
  }
}

export async function removeTrophy(id) {
  try {
    await prisma.trophy.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove trophy.' };
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
