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



(function () {
    'use strict';

    // console.log(this);
    var handlerArray = ['cacheFirst', 'cacheOnly', 'fastest', 'networkFirst', 'networkOnly'];
    var Notify = function () {
        this.options = {
            cache: {
                name: 'notify-1',
                maxAge: 604800,
                maxLimit: 1000
            },
            preCache: [
                '/'
            ],
            handler: 'fastest' // we have to check it with the default values;

        };

    }

    Notify.prototype.init = function (option) {
        // chech if option object is avaliable and has keys

        if (typeof option === 'object' && Object.keys(option).length >= 1) {
            //object is valid and has keys
            // extend the option with default option
            var extendedOption = utils.extends(this.options, option);
            console.log(extendedOption);

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
            isValidArray.push(utils.validateHandler(option.handler));
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
        get: function (regex, handler, maxAge, maxLimit, cacheName) {
            toolbox.router.get(regex, toolbox[handler], { 'cache': { 'name': cacheName, 'maxAgeSeconds': maxAge, 'maxEntries': maxLimit } });
        },
        post: function (regex, handler, maxAge, maxLimit, cacheName) {
            toolbox.router.post(regex, toolbox[handler], { 'cache': { 'name': cacheName, 'maxAgeSeconds': maxAge, 'maxEntries': maxLimit } })
        },
        notify_toolbox: function (configOption) {
            // console.log(configOption);
            importScripts('/sw-toolbox.js');
            // toolbox.options.debug = true;
            toolbox.options.cache.name = configOption.cache.name;
            toolbox.options.preCacheItems = configOption.preCache;
           
            toolbox.router.default = toolbox[configOption.handler];

            if (configOption.hasOwnProperty('urls')) {
                for (var url in configOption.urls) {
                    // console.log(url);
                    utils[configOption.urls[url].method](url, configOption.urls[url].handler, configOption.urls[url].maxAge, configOption.urls[url].maxLimit, configOption.cache.name);
                }
            }

        }
    };


    function attachToSelf() {
        return new Notify()
    }
    self.notify = attachToSelf();
}).call(typeof self !== 'undefined' ? self : console.log('include notify-sw only in service worker file'));