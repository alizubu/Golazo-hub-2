import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { checkSessionPermission } from '@/lib/permissions';

// New — direct Prisma delete, exact error surfaced to client
// Cascade chain (Prisma schema): Season → Match (onDelete: Cascade)
// Season → Player FK fields (championId etc.) are nullable and won't block deletion
export async function DELETE(request, { params }) {
  const auth = await checkSessionPermission('canManageSeason');
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.season.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete season failed:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete season' },
      { status: 500 }
    );
  }
}
