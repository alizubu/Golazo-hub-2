import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { broadcastEvent } from '@/lib/broadcast';
import { progressPlayoffBracket, updateMatchStatus } from '@/app/actions/match';
import { checkSessionPermission } from '@/lib/permissions';

export async function POST(req, { params }) {
  const auth = await checkSessionPermission('canManageMatches');
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

  try {
    const paramsAwaited = await params;
    const id = paramsAwaited.id;
    const data = await req.json();

    const result = await updateMatchStatus(id, { status: 'completed', ...data });
    if (result.error) throw new Error(result.error);
    
    // We get the updated match if needed, but the client can just rely on broadcast events.
    return NextResponse.json({ success: true, match: result.match });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to complete match' }, { status: 500 });
  }
}

