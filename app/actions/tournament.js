'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTournaments() {
  return await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function getActiveTournament() {
  return await prisma.tournament.findFirst({
    where: { status: 'active' }
  });
}

export async function startTournament(name) {
  if (!name || !name.trim()) return { error: 'Give the tournament a name' };
  
  const active = await getActiveTournament();
  if (active) return { error: 'Finish or close the current tournament first' };

  try {
    const tournament = await prisma.tournament.create({
      data: { name: name.trim(), status: 'active' }
    });
    
    await prisma.notification.create({
      data: { text: `New season kicked off: "${tournament.name}"`, type: 'tournament' }
    });
    
    revalidatePath('/');
    revalidatePath('/admin');
    return { tournament };
  } catch (error) {
    return { error: 'Failed to start tournament' };
  }
}

export async function closeTournamentEarly(id) {
  try {
    await prisma.tournament.update({
      where: { id },
      data: { status: 'archived_incomplete', completedAt: new Date() }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to close tournament' };
  }
}

export async function deleteTournament(id) {
  try {
    // Cascade delete is on matches, so they will be deleted automatically
    await prisma.tournament.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete tournament' };
  }
}

export async function renameTournament(id, newName) {
  if (!newName || !newName.trim()) return { error: 'Name cannot be empty' };
  
  try {
    await prisma.tournament.update({
      where: { id },
      data: { name: newName.trim() }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to rename tournament' };
  }
}

export async function updateTournamentHistory(id, data) {
  try {
    await prisma.tournament.update({
      where: { id },
      data: {
        name: data.name,
        championId: data.championId || null,
        runnerUpId: data.runnerUpId || null,
        thirdId: data.thirdId || null,
        mvpId: data.mvpId || null
      }
    });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update tournament history' };
  }
}
