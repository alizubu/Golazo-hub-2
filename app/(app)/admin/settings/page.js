import AdminSettingsClient from './AdminSettingsClient';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsRoute() {
  return (
    <AdminSettingsClient />
  );
}
