'use server';

import prisma from '@/lib/db';
import crypto from 'crypto';
import { checkSessionPermission } from '@/lib/permissions';

/**
 * Generates a single 128-bit (16 bytes) hexadecimal invite code and stores it.
 * 16 bytes = 32 hex characters.
 */
export async function generateInviteKey() {
  const perm = await checkSessionPermission('canManagePlayers'); // or some admin permission
  if (!perm) return { error: 'Unauthorized' };

  // Generate 16 bytes (128 bits) -> 32 char hex string
  const hexCode = crypto.randomBytes(16).toString('hex');

  try {
    const invite = await prisma.inviteCode.create({
      data: {
        code: hexCode,
      }
    });
    return { success: true, invite };
  } catch (error) {
    console.error('Failed to generate invite code:', error);
    return { error: 'Failed to generate invite code.' };
  }
}

/**
 * Generates multiple invite codes at once.
 */
export async function generateMultipleInviteKeys(count = 5) {
  const perm = await checkSessionPermission('canManagePlayers');
  if (!perm) return { error: 'Unauthorized' };

  const invites = [];
  for (let i = 0; i < count; i++) {
    const hexCode = crypto.randomBytes(16).toString('hex');
    invites.push({ code: hexCode });
  }

  try {
    await prisma.inviteCode.createMany({
      data: invites
    });
    return { success: true, count };
  } catch (error) {
    console.error('Failed to generate invite codes:', error);
    return { error: 'Failed to generate invite codes.' };
  }
}

export async function getInviteKeys() {
  const perm = await checkSessionPermission('canManagePlayers');
  if (!perm) return { error: 'Unauthorized' };

  try {
    const codes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { codes };
  } catch (error) {
    console.error('Failed to fetch invite codes:', error);
    return { error: 'Failed to fetch invite codes.' };
  }
}

export async function toggleInviteKey(id, isActive) {
  const perm = await checkSessionPermission('canManagePlayers');
  if (!perm) return { error: 'Unauthorized' };

  try {
    await prisma.inviteCode.update({
      where: { id },
      data: { isActive }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to toggle invite code:', error);
    return { error: 'Failed to toggle invite code.' };
  }
}
