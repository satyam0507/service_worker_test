var ver = '0.1.4';
importScripts('/sw-notify-config.js');
importScripts('/sw-notify.js');


self.addEventListener('push',function(evt){
    console.log('push event fired');
    self.registration.update();
});

self.registration.onupdatefound = (some)=>{
    console.log('new service worker is installing');
    console.log(some);
}