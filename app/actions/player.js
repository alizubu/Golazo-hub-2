'use server';

import prisma from '@/lib/db';
import crypto from 'crypto';
import { checkSessionPermission } from '@/lib/permissions';
import { createSession, getSession } from '@/app/actions/auth';
import { uploadImage } from '@/app/actions/upload';

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

export async function signUpPlayer(data) {
  const { username, email, password, name } = data;
  
  if (!username || !email || !password || !name) {
    return { error: 'All fields are required.' };
  }
  if (username.length < 3) return { error: 'Username needs at least 3 characters.' };
  if (password.length < 4) return { error: 'Password needs at least 4 characters.' };

  const existingUser = await prisma.player.findFirst({
    where: {
      OR: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() }
      ]
    }
  });

  if (existingUser) {
    return { error: 'Username or email is already registered.' };
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = sha256(salt + ':' + password);

  try {
    const player = await prisma.player.create({
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        passwordHash,
        salt,
        name,
        teamName: `${name}'s XI`
      }
    });
    
    // We omit password details before sending to client
    const { passwordHash: _ph, salt: _s, ...safePlayer } = player;
    await createSession({ role: 'player', id: player.id });
    return { player: safePlayer };
  } catch (error) {
    return { error: 'Failed to create account.' };
  }
}

export async function signInPlayer(data) {
  const { id, password } = data;
  
  if (!id || !password) {
    return { error: 'Enter your username/email and password.' };
  }
  
  const key = id.trim().toLowerCase();
  
  const player = await prisma.player.findFirst({
    where: {
      OR: [
        { username: key },
        { email: key }
      ]
    }
  });

  if (!player) {
    return { error: 'No account found with that username or email.' };
  }

  const hash = sha256(player.salt + ':' + password);
  
  if (hash !== player.passwordHash) {
    return { error: 'Incorrect password.' };
  }
  
  const { passwordHash: _ph, salt: _s, ...safePlayer } = player;
  await createSession({ role: 'player', id: player.id });
  return { player: safePlayer };
}

export async function getPlayers() {
  const players = await prisma.player.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      teamName: true,
      avatar: true,
      avatarImage: true,
      coverBanner: true,
      flag: true,
      teamLogo: true,
      bio: true,
      nationality: true,
      favoriteClub: true,
      favoriteCompetition: true,
      displayBadgePreference: true,
      playStyle: true,
      badges: true,
      elo: true,
      rankingPoints: true,
      careerMatches: true,
      careerGoals: true,
      careerWins: true,
      careerDraws: true,
      careerLosses: true,
      lastActive: true,
      lastReadNotificationAt: true,
      createdAt: true
    },
    orderBy: { name: 'asc' }
  });
  
  return players;
}

export async function updatePlayerProfile(id, data) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };
  if (session.role === 'player' && session.id !== id) return { error: 'Unauthorized to edit this profile.' };
  
  try {
    let finalAvatarImage = data.avatarImage;
    let finalCoverBanner = data.coverBanner;

    if (finalAvatarImage && finalAvatarImage.startsWith('data:image')) {
      const uploadResult = await uploadImage(finalAvatarImage);
      if (!uploadResult.error) {
        finalAvatarImage = uploadResult.url;
      }
    }
    
    if (finalCoverBanner && finalCoverBanner.startsWith('data:image')) {
      const uploadResult = await uploadImage(finalCoverBanner);
      if (!uploadResult.error) {
        finalCoverBanner = uploadResult.url;
      }
    }

    const player = await prisma.player.update({
      where: { id },
      data: {
        name: data.name,
        teamName: data.teamName,
        avatar: data.avatar,
        avatarImage: finalAvatarImage,
        flag: data.flag,
        teamLogo: data.teamLogo,
        bio: data.bio,
        nationality: data.nationality,
        favoriteClub: data.favoriteClub,
        favoriteCompetition: data.favoriteCompetition,
        displayBadgePreference: data.displayBadgePreference,
        playStyle: data.playStyle,
        badges: data.badges,
        coverBanner: finalCoverBanner,
      }
    });
    const { passwordHash: _ph, salt: _s, ...safePlayer } = player;
    return { player: safePlayer };
  } catch (error) {
    return { error: 'Failed to update profile.' };
  }
}

export async function changePlayerPassword(id, password) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };
  if (session.role === 'player' && session.id !== id) return { error: 'Unauthorized to change this password.' };
  
  if (password.length < 4) return { error: 'Password needs at least 4 characters.' };
  
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = sha256(salt + ':' + password);
  
  try {
    await prisma.player.update({
      where: { id },
      data: { salt, passwordHash }
    });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update password.' };
  }
}

export async function adminDeletePlayer(id) {
  const auth = await checkSessionPermission('canManagePlayers');
  if (!auth.authorized) return { error: auth.error };
  try {
    await prisma.player.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete player.' };
  }
}

export async function adminUpdatePlayer(id, data) {
  const auth = await checkSessionPermission();
  if (!auth.authorized) return { error: auth.error };
  if (auth.role === 'manager') {
    const perms = await prisma.managerPermissions.findUnique({ where: { id: 'global' } });
    if (!perms?.canManagePlayers && !perms?.canManageProfiles) {
      return { error: 'Permission denied: Manager lacks canManagePlayers or canManageProfiles' };
    }
  }
  try {
    const updateData = {
      name: data.name,
      username: data.username,
      email: data.email,
      teamName: data.teamName,
      avatar: data.avatar,
      avatarImage: data.avatarImage,
      flag: data.flag,
      teamLogo: data.teamLogo,
      bio: data.bio,
      nationality: data.nationality,
      favoriteClub: data.favoriteClub,
      favoriteCompetition: data.favoriteCompetition,
      displayBadgePreference: data.displayBadgePreference,
      playStyle: data.playStyle,
      badges: data.badges,
      rankingPoints: data.rankingPoints !== undefined ? Number(data.rankingPoints) : undefined,
    };

    if (data.password && data.password.length >= 4) {
      updateData.salt = crypto.randomBytes(16).toString('hex');
      updateData.passwordHash = sha256(updateData.salt + ':' + data.password);
    }

    const player = await prisma.player.update({
      where: { id },
      data: updateData
    });

    const { passwordHash: _ph, salt: _s, ...safePlayer } = player;
    return { player: safePlayer };
  } catch (error) {
    return { error: 'Failed to update player.' };
  }
}

export async function markNotificationsRead(id) {
  const session = await getSession();
  if (!session || (session.role === 'player' && session.id !== id)) {
    return { error: 'Unauthorized' };
  }
  
  try {
    const updated = await prisma.player.update({
      where: { id },
      data: { lastReadNotificationAt: new Date() }
    });
    return { success: true, lastReadNotificationAt: updated.lastReadNotificationAt };
  } catch (error) {
    console.error("markNotificationsRead error:", error);
    return { error: 'Failed to mark notifications read' };
  }
}
