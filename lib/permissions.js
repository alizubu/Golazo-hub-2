import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function checkSessionPermission(requiredPermission) {
  const cookieStore = await cookies();
  const session = cookieStore.get('golazo_session')?.value;

  if (!session || (session !== 'admin' && session !== 'manager')) {
    return { authorized: false, role: null, error: 'Unauthorized' };
  }

  if (session === 'admin') {
    return { authorized: true, role: 'admin' };
  }

  // session === 'manager'
  if (!requiredPermission) {
    return { authorized: true, role: 'manager' };
  }

  const permissions = await prisma.managerPermissions.findUnique({
    where: { id: 'global' },
  });

  const isAllowed = permissions ? !!permissions[requiredPermission] : false;

  if (!isAllowed) {
    return { authorized: false, role: 'manager', error: `Permission denied: Manager lacks '${requiredPermission}'` };
  }

  return { authorized: true, role: 'manager' };
}
