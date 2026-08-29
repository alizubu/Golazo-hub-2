self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = JSON.parse(event.data.text());
      const title = data.title || 'Golazo Hub';
      const options = {
        body: data.message || 'You have a new notification!',
        icon: '/icons/golazohub.png',
        badge: '/icons/golazohub.png',
        data: {
          url: data.url || '/'
        }
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    } catch (e) {
      console.error('Error parsing push event data:', e);
    }
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        if (client.url !== urlToOpen) {
          return client.navigate(urlToOpen).then(c => c.focus());
        }
        return client.focus();
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
