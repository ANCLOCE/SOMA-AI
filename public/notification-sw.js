self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'SOMA Notification';
  const options = {
    body: data.body || 'You have a new notification from SOMA!',
    icon: '/placeholder-logo.png',
    badge: '/placeholder-logo.png',
    data: data.url || '/',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
}); 