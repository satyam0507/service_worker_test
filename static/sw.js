self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('push', function (event) {
  console.log('Push message received', event);
  event.waitUntil(
    self.registration.pushManager.getSubscription()
      .then(function (subscription) {
        var title = 'Title';

        self.registration.showNotification(title, {
          body: `Labore ad exercitation ut quis. Nostrud deserunt veniam amet eu aliquip dolor nostrud deserunt enim ut ad excepteur. Mollit sit dolor mollit veniam laboris amet proident quis veniam Lorem. Ullamco veniam ea occaecat nulla aliqua est amet voluptate deserunt ut cillum. Velit fugiat exercitation laborum dolor nulla aliquip Lorem aute dolor exercitation.`,
          requireInteraction: true,
          icon: 'https://www.w3schools.com/css/img_fjords.jpg',
          tag: 'Unique Tag',
          image:'https://www.w3schools.com/css/img_fjords.jpg',
          badge: '/image/dev_chrome.png',
          sound: 'https://www.youtube.com/watch?v=6Tv6gQgj0VQ',
          // lang:'hi'
          actions: [{ title: 'action2', icon: 'https://s3.amazonaws.com/notifyvisitors/site/webapp/app.jpg', action: 'actionOne' },
          { title: 'action1', icon: 'https://s3.amazonaws.com/notifyvisitors/site/webapp/linkgrey.jpg', action: 'actionTwo' }],
          // actions: action,
          data: {
           
          }
        })

      })
  );
});
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click: tag ', event.notification.tag);
  event.notification.close();
  var url = 'https://satyamsingh.herokuapp.com/';
  event.waitUntil(
    clients.matchAll({
      type: 'window'
    })
      .then(function (windowClients) {
        for (var i = 0; i < windowClients.length; i++) {
          var client = windowClients[i];
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

