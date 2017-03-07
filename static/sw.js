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


importScripts('notify-sw.js');
// var jsonData = {};
// fetch('/data.json').then(function (res) {
//     // console.log(res);
//     res.json().then(function (json) {
//         // console.log(json);
//         // console.log(notify);

//     })
// }).catch(function (err) {
//     console.log(err);
// })

var ver = '0.0.6';
var config = {
    cache: {
        name: "notify-abc",
        maxAge: 604800,
        maxLimit: 10000
    },
    preCache: [
        '/',
        'app.css',
        'app.js'
    ],
    handler: "fastest",
    urls: {
        '/': {
            method: 'get',
            maxAge: 604800,
            maxLimit: 10000,
            handler: 'cacheOnly'
        }
    },

}

notify.init(config);