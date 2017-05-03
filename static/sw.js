// self.addEventListener('fetch', fetchListener);

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('push', function (event) {
  console.log('Push message received', event);
  event.waitUntil(
    self.registration.pushManager.getSubscription()
    .then(function (subscription) {
      console.log('subscription found :: going to display notification');
      var title = 'Title';
      var obj = {
        body: `Labore ad exercitation ut quis. Nostrud deserunt veniam amet eu aliquip dolor nostrud deserunt enim ut ad excepteur. Mollit sit dolor mollit veniam laboris amet proident quis veniam Lorem. Ullamco veniam ea occaecat nulla aliqua est amet voluptate deserunt ut cillum. Velit fugiat exercitation laborum dolor nulla aliquip Lorem aute dolor exercitation.`,
        requireInteraction: true,
        icon: 'https://www.w3schools.com/css/img_fjords.jpg',
        tag: 'Unique Tag',
        image: 'https://www.w3schools.com/css/img_fjords.jpg'
      };
      setTime();

      // self.registration.showNotification(title, {
      //   body: `Labore ad exercitation ut quis. Nostrud deserunt veniam amet eu aliquip dolor nostrud deserunt enim ut ad excepteur. Mollit sit dolor mollit veniam laboris amet proident quis veniam Lorem. Ullamco veniam ea occaecat nulla aliqua est amet voluptate deserunt ut cillum. Velit fugiat exercitation laborum dolor nulla aliquip Lorem aute dolor exercitation.`,
      //   requireInteraction: true,
      //   icon: 'https://www.w3schools.com/css/img_fjords.jpg',
      //   tag: 'Unique Tag',
      //   image: 'https://www.w3schools.com/css/img_fjords.jpg'
      // })
    }));
});


function setTime() {
  var date = new Date();
  console.log('i am setTime and the Time is '+ date.getHours()+':'+date.getMinutes()+':'+date.getSeconds());
  self.setTimeout(function () {
    console.log('i am callback');
    self.registration.showNotification('this is  title',{
        body: `Labore ad exercitation ut quis. Nostrud deserunt veniam amet eu aliquip dolor nostrud deserunt enim ut ad excepteur. Mollit sit dolor mollit veniam laboris amet proident quis veniam Lorem. Ullamco veniam ea occaecat nulla aliqua est amet voluptate deserunt ut cillum. Velit fugiat exercitation laborum dolor nulla aliquip Lorem aute dolor exercitation.`,
        requireInteraction: true,
        icon: 'https://www.w3schools.com/css/img_fjords.jpg',
        tag: 'Unique Tag',
        image: 'https://www.w3schools.com/css/img_fjords.jpg'
      });
  }, 180000)

}



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


self.addEventListener("message", function (e) {
  // e.source is a client object
  console.log(e);
  e.source.postMessage("Hello! Your message was: " + e.data);
});


// function fetchListener(event) {
//   fetch(event.request)
//     .then(function (response) {
//       if (response && response.status === 200) {
//         return response;
//       } else {
//         console.log('not a valid response');
//       }
//     }).catch(function (err) {
//       console.log(event.request);
//       if (event.request.method === 'POST') {
//         console.log('fallback to IDB');
//         fallbackIDB().then(function (IDBres) {
//           if (IDBres) {
//             return IDBres;
//           } else {
//             console.log('fallback also fail :: no res found');
//           }
//         }).catch(function(err){
//           console.log('fallback also fail :: '+err);
//         })
//       }

//     })
// }

// function fallbackIDB(){
//    return new Promise(function(resolve,reject){

//    })
// }