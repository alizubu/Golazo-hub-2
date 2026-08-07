import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { checkSessionPermission } from '@/lib/permissions';

export async function GET(req) {
  try {
    const auth = await checkSessionPermission();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    let permissions = await prisma.managerPermissions.findUnique({
      where: { id: 'global' },
    });

    if (!permissions) {
      permissions = await prisma.managerPermissions.create({
        data: { id: 'global' },
      });
    }

    return NextResponse.json({ success: true, permissions });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await checkSessionPermission();
    if (!auth.authorized || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden. Master admin access required to modify permissions.' }, { status: 403 });
    }

    const data = await req.json();
    const permissions = await prisma.managerPermissions.upsert({
      where: { id: 'global' },
      update: {
        canManageMatches: data.canManageMatches,
        canManagePlayers: data.canManagePlayers,
        canManageSeason: data.canManageSeason,
        canEditBroadcast: data.canEditBroadcast,
      },
      create: {
        id: 'global',
        canManageMatches: data.canManageMatches ?? true,
        canManagePlayers: data.canManagePlayers ?? false,
        canManageSeason: data.canManageSeason ?? false,
        canEditBroadcast: data.canEditBroadcast ?? false,
      },
    });

    return NextResponse.json({ success: true, permissions });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 });
  }
}

