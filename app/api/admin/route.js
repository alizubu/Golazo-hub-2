import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { password } = await req.json();
    if (password === process.env.ADMIN_SETUP_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
