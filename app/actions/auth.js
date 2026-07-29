'use server';

import { cookies } from 'next/headers';

export async function setAuthCookie(role, id) {
  const cookieStore = await cookies();
  cookieStore.set('golazo_session', role, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  });
  if (id) {
    cookieStore.set('golazo_user_id', id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
  }
  return { success: true };
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('golazo_session');
  cookieStore.delete('golazo_user_id');
  return { success: true };
}
