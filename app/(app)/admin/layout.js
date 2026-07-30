import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('golazo_session')?.value;
  
  if (sessionCookie !== 'admin') {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
