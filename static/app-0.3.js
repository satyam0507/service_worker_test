if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw1.js', { scope: '/' }).then(function () {
        console.log('service worker registered successfully');
    }).catch(function (err) {
        console.log('not able to register service worker :: ' + err);
    })
}

window.addEventListener('offline', offline);
window.addEventListener('online', reload);

function reload() {
    location.reload();
}

if (!navigator.onLine) {
    offline();
}

function getList() {
    return caches.open('sw-test').then(function (cache) {
        return cache.keys().then(function (keys) {
           return keys;
        })
    }).catch(function (err) {
        console.log(err);
    })

}

function getLinks() {
    return new Promise(function (resolve, reject) {
        resolve(document.querySelectorAll('a'));
    })
}

function offline() {
    Promise.all([getList(), getLinks()]).then(function (values) {
        console.log(values);
        getElement(values).then(function(){

        }).catch(function(err){

        })
     })
}

function getElement(values){
    var requestArray = values[0];
    var elAarray = values[1];
    if(array1.length<array2.length){

    }
}