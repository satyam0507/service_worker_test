//    Copyright 2017 Satyam Singh (satyam0507@gmail.com) All Rights Reserved.
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

console.log('app.js');

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('sw.js', { scope: '/' }).then(function () {
        console.log('service worker registered successfully 1');
        Notification.requestPermission(function (result) {
            if (result === 'granted') {
                console.log('premission granted');
            }
        })
        // sendMessage('this is your client')
        //     .then(e => {
        //         console.log(e);
        //     })
        //     .catch(err => {
        //         console.log(err);
        //     })
    }).catch(function (err) {
        console.log('not able to register service worker :: ' + err);
    })
    //   navigator.serviceWorker.register('sw1.js', { scope: '/home' }).then(function () {
    //     console.log('service worker registered successfully 2');
    //     Notification.requestPermission(function (result) {
    //         if (result === 'granted') {
    //             console.log('premission granted');
    //         }
    //     })
    // }).catch(function (err) {
    //     console.log('not able to register service worker :: ' + err);
    // })
}

if (window.Worker) {

  var myWorker = new Worker('worker.js');

}


function sendMessage(message) {
    return new Promise(function (resolve, reject) {
        // note that this is the ServiceWorker.postMessage version
        navigator.serviceWorker.controller.postMessage(message);
        navigator.serviceWorker.onMessage = function (e) {
            resolve(e);
        };
    });
}
// (function () {
//     var btn = document.getElementById('btn');
//     btn.addEventListener('click', function (evt) {
//         // evt.preventDefault();
//         // var data={
//         //     name:'satyam singh',
//         //     data:'haha'
//         // }
//         fetch('/data', {
//             method: "POST",
//             headers: new Headers({
//                 'Content-Type': 'application/json'
//             })
//             // ,
//             // body: JSON.stringify(data)
//         }).then(function (data) {
//             console.log(data);
//         }).catch(function (err) {
//             console.log(err);
//         })
//     })
// })()
