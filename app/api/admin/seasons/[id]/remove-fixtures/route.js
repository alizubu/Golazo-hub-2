import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // Only delete fixtures that haven't been played yet
    await prisma.match.deleteMany({
      where: { 
        seasonId: id,
        status: 'scheduled'
      }
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove fixtures error:', error);
    return NextResponse.json({ error: 'Failed to remove fixtures' }, { status: 500 });
  }
}
