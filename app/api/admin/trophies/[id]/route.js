import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    // Backend validation: check if trophy exists
    const existing = await prisma.trophy.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Trophy not found.' }, { status: 404 });
    }

    await prisma.trophy.delete({
      where: { id }
    });

    // Revalidate paths that might display trophies
    revalidatePath('/');
    revalidatePath('/admin');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Error revoking trophy:', error);
    return NextResponse.json({ success: false, error: 'Failed to revoke trophy.' }, { status: 500 });
  }
}
