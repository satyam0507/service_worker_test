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

var ver = '0.0.8';


importScripts('notify-sw.js');


var config = {
    cache: {
        name: "notify-abc", //@ string
        maxAge: 604800,     //@ number in sec
        maxLimit: 10000     //@ number in sec
    },
    preCache: [
        '/',
        'app.css',
        'app.js',
        '/offline'
    ],
    defaultHandler: "networkFirst",
    urls: {
        '/': {
            // requestType: 'get',    // @ string
            // maxAge: 604800,   //@ number in sec
            // maxLimit: 10000,  //@ number in sec
            handler: 'fastest' // @ string
        },
        '/view4': {
            // requestType: 'get',    // @ string
            // maxAge: 604800,   //@ number in sec
            // maxLimit: 10000,  //@ number in sec
            handler: 'fastest' // @ string
        }
    },
    staticFiles: {
        '/\*\.jpg': {
            requestType: 'get',       // @ string
            maxAge: 604800,   //@ number in sec
            maxLimit: 10000   //@ number in sec
        }
    },
    dynamicFiles: {
        '/\*\.json': {
            requestType: 'get',      // @ string
            maxAge: 604800,  //@ number in sec
            maxLimit: 10000  //@ number in sec
        }
    },
    navigationFallback: '/offline'
}

notify.init(config);