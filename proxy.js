import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'super_secret_fallback_key_for_dev_only'
);

export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('golazo_session')?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    try {
      const { payload } = await jwtVerify(sessionCookie, SECRET_KEY, {
        algorithms: ['HS256'],
      });
      if (payload.role !== 'admin' && payload.role !== 'manager') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (err) {
      // Invalid JWT
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
