import { set } from 'idb-keyval';

export async function queueOfflineRequest(key, url, method, data) {
  try {
    const requestData = {
      url,
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    
    await set(`offline-match-${key}`, requestData);
    
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('golazo-sync-matches');
    }
    return true;
  } catch (err) {
    console.error('Failed to queue offline request:', err);
    return false;
  }
}
