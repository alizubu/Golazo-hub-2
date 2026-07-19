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

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return announcements;
  } catch (error) {
    return [];
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

export async function removeTrophy(id) {
  try {
    await prisma.trophy.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to remove trophy.' };
  }
}

export async function getTrophies(playerId) {
  try {
    const trophies = await prisma.trophy.findMany({
      where: { playerId },
      orderBy: { createdAt: 'desc' },
    });
    return trophies;
  } catch (error) {
    return [];
  }
}
