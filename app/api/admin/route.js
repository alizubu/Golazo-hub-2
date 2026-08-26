import { NextResponse } from 'next/server';
import { createSession } from '@/app/actions/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Check Admin credentials
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD &&
      username && password
    ) {
      await createSession({ role: 'admin' });
      return NextResponse.json({ success: true, role: 'admin' });
    }

    // Check Manager credentials
    if (
      username === process.env.MANAGER_USERNAME &&
      password === process.env.MANAGER_PASSWORD &&
      username && password
    ) {
      await createSession({ role: 'manager' });
      return NextResponse.json({ success: true, role: 'manager' });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
