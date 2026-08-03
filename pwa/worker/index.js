import { get, del, keys } from 'idb-keyval';

self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Golazo Hub';
  
  const options = {
    body: data.body || 'You have a new notification!',
    icon: '/icons/icon-default.svg',
    badge: '/icons/icon-default.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

self.addEventListener('sync', function (event) {
  if (event.tag === 'golazo-sync-matches') {
    event.waitUntil(syncOfflineMatches());
  }
});

async function syncOfflineMatches() {
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      if (key.startsWith('offline-match-')) {
        const requestData = await get(key);
        if (requestData) {
          const response = await fetch(requestData.url, {
            method: requestData.method,
            headers: requestData.headers,
            body: requestData.body
          });
          
          if (response.ok) {
            await del(key);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error syncing matches:', err);
  }
}
