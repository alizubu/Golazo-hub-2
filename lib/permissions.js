import prisma from '@/lib/db';
import { getSession } from '@/app/actions/auth';

export async function checkSessionPermission(requiredPermission) {
  const session = await getSession();

  if (!session) {
    return { authorized: false, role: null, error: 'Unauthorized' };
  }

  const { role } = session;

  if (role === 'admin') {
    return { authorized: true, role: 'admin', user: session };
  }

  if (role === 'manager') {
    if (!requiredPermission) {
      return { authorized: true, role: 'manager', user: session };
    }

    const permissions = await prisma.managerPermissions.findUnique({
      where: { id: 'global' },
    });

    const isAllowed = permissions ? !!permissions[requiredPermission] : false;

    if (!isAllowed) {
      return { authorized: false, role: 'manager', error: `Permission denied: Manager lacks '${requiredPermission}'`, user: session };
    }

    return { authorized: true, role: 'manager', user: session };
  }

  if (role === 'player') {
    // If a specific admin permission is required, players are rejected by default.
    // However, if we just want to know if they are logged in, we can return authorized: true?
    // The previous implementation rejected anything not 'admin' or 'manager'.
    // We will preserve that: this function is primarily for checking admin/manager privileges.
    return { authorized: false, role: 'player', error: 'Unauthorized: Player lacks required privileges', user: session };
  }

  return { authorized: false, role: null, error: 'Unauthorized' };
}
