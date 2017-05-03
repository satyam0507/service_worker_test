console.log('i am worker');

    self.setTimeout(function () {
    console.log('i am callback from web worker');
    new Notification('this is  title',{
        body: `Labore ad exercitation ut quis. Nostrud deserunt veniam amet eu aliquip dolor nostrud deserunt enim ut ad excepteur. Mollit sit dolor mollit veniam laboris amet proident quis veniam Lorem. Ullamco veniam ea occaecat nulla aliqua est amet voluptate deserunt ut cillum. Velit fugiat exercitation laborum dolor nulla aliquip Lorem aute dolor exercitation.`,
        requireInteraction: true,
        icon: 'https://www.w3schools.com/css/img_fjords.jpg',
        tag: 'Unique Tag',
        image: 'https://www.w3schools.com/css/img_fjords.jpg'
      });
  }, 180000)