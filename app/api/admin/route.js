import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    // Check Admin credentials
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json({ success: true, role: 'admin' });
    }

    // Check Manager credentials
    if (
      username === process.env.MANAGER_USERNAME &&
      password === process.env.MANAGER_PASSWORD
    ) {
      return NextResponse.json({ success: true, role: 'manager' });
    }

    // Fallback for older .env files that might still use ADMIN_SETUP_PASSWORD
    if (password === process.env.ADMIN_SETUP_PASSWORD && !username) {
      return NextResponse.json({ success: true, role: 'admin' });
    }

    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
