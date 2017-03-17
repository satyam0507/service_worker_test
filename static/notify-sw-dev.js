//    Copyright 2017 Notifyvisitors.com All Rights Reserved.
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
//
importScripts('sw-toolbox.js');
(function (global, fn) {
    if (typeof module === "object" && typeof module.exports === "object") {

        module.exports = global.self ?
            fn(global, true) :
            function (w) {
                if (!w.self) {
                    throw new Error("Include only with service worker file ServiceWorkerGlobalScope is required to work with");
                }
                return fn(w);
            };
    } else {
        fn(global);
    }

})(typeof self !== 'undefined' ? self : this, function (global, flag) {
    'use strict';
    if (global.importScripts) {

        //        importScripts('/sw-toolbox.js');
        var strundefined = typeof undefined;
        var handlerArray = ['cacheFirst', 'cacheOnly', 'fastest', 'networkFirst', 'networkOnly'];
        var requestTypeArray = ['get', 'post', 'put', 'delete', 'head'];
        var Notify = function () {

            // default option 

            // @ option.cache ::- contain the default configuration about the cache
            // @ option.cache.name ::- default name of the primary cache if not provided then 'notify-1'            
            // @ option.cache.maxAge ::-  time in second after which response is will be consider fresh            
            // @ option.cache.maxLimit ::- max limit of entries in the cache                             
            //              
            this.options = {
                cache: {
                    name: 'notify-1',
                    maxAge: 604800,
                    maxLimit: 1000
                },
                // @ option.preCache ::- Array that contain urlPattern that will be precache at 
                //                       install phase of the service worker
                preCache: [
                    '/' //todo link to our custom offline page   
                ],
                // @ defaultHandler ::- it is the default handler for the Requests 
                defaultHandler: 'fastest',
                // @ navigationFallback ::- fallback page which will be served if both network and cache request fails
                navigationFallback: '/' //todo link to our custom offline page

            };

        }

        Notify.prototype.init = function (option) {

            // chech if option object is avaliable and has keys
            if (typeof option === 'object' && Object.keys(option).length >= 1) {

                //object is valid and has keys

                // extend the option with default option
                var extendedOption = utils.extends(this.options, option);

                if (utils.validateOptions(extendedOption)) {

                    console.log('option is valid');

                    utils.notify_toolbox(extendedOption);

                } else {
                    console.log('option is invalid');
                }
            } else {
                // object is not valid or does not have keys
                //  extend default values

                console.log('initializing with default values');
                option = this.options;
                utils.notify_toolbox(option);
            }

        }

        var utils = {
            extends: function () {

                // Variables
                var extended = {};
                var deep = true;
                var i = 0;
                var length = arguments.length;

                // Check if a deep merge
                if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                    deep = arguments[0];
                    i++;
                }

                // Merge the object into the extended object
                var merge = function (obj) {
                    for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                            // If deep merge and property is an object, merge properties
                            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                                extended[prop] = utils.extends(true, extended[prop], obj[prop]);
                            } else {
                                extended[prop] = obj[prop];
                            }
                        }
                    }
                };

                // Loop through each object and conduct a merge
                for (; i < length; i++) {
                    var obj = arguments[i];
                    merge(obj);
                }

                return extended;

            },
            validateOptions: function (option) {
                var isValidArray = [];
                var isValid = true;
                isValidArray.push(utils.validateHandler(option.defaultHandler));
                isValidArray.push(utils.validatePreCache(option.preCache));


                isValidArray.forEach(function (item) {
                    if (!item) {
                        isValid = false;
                    }
                })
                return isValid;
            },
            validateHandler: function (handler) {

                if (typeof handler === 'string' && handler.length) {
                    // handler is a valid string

                    // check if the value exist the handlerArray
                    if (handlerArray.indexOf(handler) !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }


            },
            validatePreCache: function (preCache) {
                return Array.isArray(preCache);
            },
            validateRequestType: function (requestType) {
                if (typeof requestType === 'string' && requestType.length) {
                    if (requestTypeArray.indexOf(requestType) !== -1) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }

            },
            get: function (regex, handler, maxAge, maxLimit, cacheName, origin) {
                // check if regex is valid or not 
                if (typeof regex === 'string' && regex.length) {
                    if (typeof origin === 'string' && origin.length) {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            {
                                'origin': origin
                            }
                        )
                    } else {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            {
                                'cache':
                                {
                                    'name': cacheName || utils.getDeaultCacheName(),
                                    'maxAgeSeconds': maxAge || utils.getDeaultMaxAge(),
                                    'maxEntries': maxLimit || utils.getDeaultMaxLimit()
                                }

                            }
                        )
                    }
                } else {
                    console.log('not a valid regex');
                    return;
                }

            },
            post: function (regex, handler, maxAge, maxLimit, cacheName, origin) {
                // check if regex is valid or not 
                if (typeof regex === 'string' && regex.length) {
                    if (typeof origin === 'string' && origin.length) {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            {
                                'origin': origin
                            }
                        )
                    } else {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            {
                                'cache':
                                {
                                    'name': cacheName || utils.getDeaultCacheName(),
                                    'maxAgeSeconds': maxAge || utils.getDeaultMaxAge(),
                                    'maxEntries': maxLimit || utils.getDeaultMaxLimit()
                                }

                            }
                        )
                    }
                } else {
                    console.log('not a valid regex');
                    return;
                }
            },
            any: function (regex, handler, maxAge, maxLimit, cacheName, origin) {
                // check if regex is valid or not 
                if (typeof regex === 'string' && regex.length) {
                    if (typeof origin === 'string' && origin.length) {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            // {
                            //     'cache':
                            //             {
                            //                 'name': cacheName || utils.getDeaultCacheName(),
                            //                 'maxAgeSeconds': maxAge || utils.getDeaultMaxAge(),
                            //                 'maxEntries': maxLimit || utils.getDeaultMaxLimit()
                            //             }

                            // }, 
                            {
                                origin: origin
                            }
                        )
                    } else {
                        toolbox.router.any(
                            regex,
                            toolbox[handler] || utils.getDeaultHandler(),
                            {
                                'cache':
                                {
                                    'name': cacheName || utils.getDeaultCacheName(),
                                    'maxAgeSeconds': maxAge || utils.getDeaultMaxAge(),
                                    'maxEntries': maxLimit || utils.getDeaultMaxLimit()
                                }

                            }
                        )
                    }
                } else {
                    console.log('not a valid regex');
                    return;
                }
            },
            getDeaultHandler: function () {
                return self.notify.options.defaultHandler;
            },
            getDeaultCacheName: function () {
                return self.notify.options.cache.cacheName;
            },
            getDeaultMaxAge: function () {
                return self.notify.options.cache.maxAge;
            },
            getDeaultMaxLimit: function () {
                return self.notify.options.cache.maxLimit;
            },
            notify_toolbox: function (configOption) {


                var _defaultRequestType = 'any';
                toolbox.options.debug = true;
                toolbox.options.cache.name = configOption.cache.name;
                toolbox.options.preCacheItems = configOption.preCache;
                toolbox.options.navigationFallback = configOption.navigationFallback;

                // self.addEventListener('fetch', event => {
                //     if (event.request.mode === 'navigate') {
                //         console.log(event.request);
                //     }
                // });

                if (configOption.hasOwnProperty('urls')) {
                    for (var urlPattern in configOption.urls) {
                        // console.log(url);
                        // check if the 'requestType' property is provided by the user for this url/express regex
                        // if not then we will default it to get() requestType
                        var _requestType = configOption.urls[urlPattern].requestType;
                        var _handler = configOption.urls[urlPattern].handler;
                        var _maxAge = configOption.urls[urlPattern].maxAge;
                        var _maxLimit = configOption.urls[urlPattern].maxLimit;
                        var _cacheName = configOption.cache.name;
                        var _origin = configOption.urls[urlPattern].origin;
                        if (_requestType && utils.validateRequestType(_requestType)) {
                            // yes  'requestType' property is present
                            utils[_requestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        } else {
                            // no 'requestType' property is not present
                            //  fallback to default
                            utils[_defaultRequestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);

                        }
                    }
                }
                if (configOption.hasOwnProperty('staticFiles')) {
                    for (var urlPattern in configOption.staticFiles) {
                        var _requestType = configOption.staticFiles[urlPattern].requestType;
                        var _handler = 'cacheFirst';
                        var _maxAge = configOption.staticFiles[urlPattern].maxAge;
                        var _maxLimit = configOption.staticFiles[urlPattern].maxLimit;
                        var _cacheName = utils.getDeaultCacheName();
                        var _origin = configOption.staticFiles[urlPattern].origin;
                        if (_requestType && utils.validateRequestType(_requestType)) {
                            // yes  'requestType' property is present
                            utils[_requestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        } else {
                            // no 'requestType' property is not present
                            //  fallback to default
                            utils[_defaultRequestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);

                        }
                    }
                }
                if (configOption.hasOwnProperty('dynamicFiles')) {
                    for (var urlPattern in configOption.dynamicFiles) {
                        var _requestType = configOption.dynamicFiles[urlPattern].requestType;
                        var _handler = 'networkOnly';
                        var _maxAge = configOption.dynamicFiles[urlPattern].maxAge;
                        var _maxLimit = configOption.dynamicFiles[urlPattern].maxLimit;
                        var _cacheName = utils.getDeaultCacheName();
                        var _origin = cpnfigOption.dynamicFiles[urlPattern].origin;
                        if (_requestType && utils.validateRequestType(_requestType)) {
                            // yes  'requestType' property is present
                            utils[_requestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        } else {
                            // no 'requestType' property is not present
                            //  fallback to default
                            utils[_defaultRequestType](urlPattern, _handler, _maxAge, _maxLimit, _cacheName._origin);
                        }
                    }
                }

                // add default handler if some request does not match
                toolbox.router.default = toolbox[configOption.defaultHandler];

            }
        };

        var attachToSelf = function () {
            return new Notify();
        }

        if (typeof flag === strundefined) {
            self.notify = attachToSelf();
        }

    } else {
        throw new Error('Include only with service worker file ServiceWorkerGlobalScope is required to work with');
    }
});


var config = {
    cache: {
        name: "notify-1", //@ string
        maxAge: 604800, //@ number in sec
        maxLimit: 10000     //@ number in sec
    },
    preCache: [
        '/',
    ],
    defaultHandler: "networkFirst",
    urls: {
        '/': {
            // requestType: 'get',    // @ string
            // maxAge: 604800,   //@ number in sec
            // maxLimit: 10000,  //@ number in sec
            handler: 'fastest', // @ string
            // origin:''
        },
    },
    staticFiles: {
        '/\*\.css': {
            maxAge: 604800, //@ number in sec
            maxLimit: 10000, //@ number in sec
            origin: 'https://maxcdn.bootstrapcdn.com'
        },
        '/\*\.jpg': {
            maxAge: 604800, //@ number in sec
            maxLimit: 10000, //@ number in sec
            // origin: 'https://s3.amazonaws.com'
        }
    },
    dynamicFiles: {
        //        '/^\/\*\.json(?:\/(?=$))?$/i': {
        //            requestType: 'get', // @ string
        //            // maxAge: 604800,  //@ number in sec
        //            // maxLimit: 10000  //@ number in sec
        //            origin:''
        //        }

    },
    navigationFallback: '/'  //todo link to our custom offline page 
}

notify.init(config);


//notify.init();