(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function (e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function (require, module, exports) {
        /**
         * promiseLogger
         *
         * @param   Object{ enabled: Boolean, title: String }
         * @param   Promise
         * @returns Promise
         *
         * Logs resolve or reject state changes on a promise. Can be dynamically
         * enabled and disabled using the enabled key in config -- it defaults to
         * disabled to prevent accidental logging in production. A title can be added to
         * each log line using the title key specified in config.
         *
         */
        function promiseLogger(config, promise) {
            config = config || {
                enabled: false,
                title: null
            };
            if (!config.enabled) {
                return promise;
            } else {
                var resolveLogger = logHandler(config.title, 'resolved', 'info');
                var rejectLogger = logHandler(config.title, 'rejected', 'warn');
                return promise.then(resolveLogger, function (err) {
                    throw rejectLogger(err);
                });
            }
        }

        function logHandler(title, state, level) {
            return function (value) {
                var message = ('[' + state + '] ' + (title || '')).trim();
                console[level || 'log'](message, Array.prototype.slice.call(arguments));
                return value;
            };
        }

        module.exports = promiseLogger;

    }, {}],
    2: [function (require, module, exports) {
        var promiseLogger = require('app/utils/promise_logger');

        // Use self instead of window for supporting worker contexts
        var IndexedDB = self.indexedDB || self.mozIndexedDB || self.webkitIndexedDB || self.msIndexedDB;
        var KeyRange = self.IDBKeyRange || self.webkitIDBKeyRange || self.msIDBKeyRange;
        var Transaction = {
            readwrite: (self.IDBTransaction || self.webkitIDBTransaction || self.msIDBTransaction || {}).READ_WRITE || 'readwrite',
            readonly: (self.IDBTransaction || self.webkitIDBTransaction || self.msIDBTransaction || {}).READ_ONLY || 'readonly'
        };

        module.exports = IndexedDBClient;

        function IndexedDBClient() {
            var args = Array.prototype.slice.call(arguments);
            if (this instanceof IndexedDBClient) {
                var database = args[0];
                this.database = database;
                this.name = database.name;
                this.version = database.version;
                this.stores = getObjectStoreNames(database);

                database.onversionchange = function () {
                    database.close();
                    self.location && self.location.reload(true);
                };
            } else {
                return IndexedDBClient.open.apply(null, args);
            }
        }

        /*****************************
           _____ __        __  _
          / ___// /_____ _/ /_(_)____
          \__ \/ __/ __ `/ __/ / ___/
         ___/ / /_/ /_/ / /_/ / /__
        /____/\__/\__,_/\__/_/\___/

        *****************************/

        IndexedDBClient.KeyRange = KeyRange;

        IndexedDBClient.deleteDatabase = function (name) {
            return new Promise(function (resolve) {
                var request = IndexedDB.deleteDatabase(name);
                request.onsuccess = request.onerror = resolve;
            });
        };

        IndexedDBClient.isSupported = function () {
            return !!IndexedDB;
        };

        IndexedDBClient.open = function (name, version, schema, isIncrementalSchemaUpdate) {
            var loggingOptions = {
                title: 'IndexedDB "' + name + '" version ' + version,
                enabled: self.DEBUG && self.DEBUG.enabled
            };

            // Log resolve or failure of open when debug is enabled
            return promiseLogger(loggingOptions, new Promise(function (openResolve, openReject) {
                if (!IndexedDBClient.isSupported()) {
                    return openReject('not supported');
                }

                var request = version ? IndexedDB.open(name, version) : IndexedDB.open(name);
                var migration;

                request.onupgradeneeded = function (e) {
                    var database = e.target.result;
                    var migrationLoggingOptions = {
                        title: 'IndexedDB "' + name + '" migration from version ' + e.oldVersion + ' to ' + e.newVersion,
                        enabled: self.DEBUG && self.DEBUG.enabled
                    };

                    // Log resolve, progress and failure of the migration when debug is enabled
                    promiseLogger(migrationLoggingOptions, new Promise(function (migrationResolve, migrationReject) {
                        if (!isIncrementalSchemaUpdate) {
                            // Delete previous schema
                            getObjectStoreNames(database).forEach(function (store) {
                                database.deleteObjectStore(store);
                            });
                        }

                        // Create new schema
                        var existingObjectStores = getObjectStoreNames(database);
                        var promises = (schema || []).map(function (config) {
                            return new Promise(function (resolve, reject) {
                                var name = config.name;
                                var keyPath = config.keyPath;
                                var indexes = config.indexes || [];

                                if (existingObjectStores.indexOf(name) < 0) {
                                    var store = database.createObjectStore(name, {
                                        keyPath: keyPath
                                    });
                                    indexes.forEach(function (index) {
                                        store.createIndex(index.name, index.keyPath, index);
                                    });
                                    return store;
                                }
                            });
                        });

                        return Promise.all(promises).then(migrationResolve, migrationReject);
                    }));
                };

                request.onsuccess = function (e) {
                    (migration || Promise.resolve()).then(function () {
                        var database = new IndexedDBClient(e.target.result);
                        return openResolve(database);
                    }).catch(openReject);
                };

                request.onblocked = function (e) {
                    openReject('open blocked', e.target.error);
                };
                request.onerror = function (e) {
                    openReject('open error', e.target.error);
                };
            }));
        };

        /********************************************
            ____           __
           /  _/___  _____/ /_____ _____  ________
           / // __ \/ ___/ __/ __ `/ __ \/ ___/ _ \
         _/ // / / (__  ) /_/ /_/ / / / / /__/  __/
        /___/_/ /_/____/\__/\__,_/_/ /_/\___/\___/

        ********************************************/

        /**
         * This is an insert only function. See #put for an update or insert function.
         */
        IndexedDBClient.prototype.add = function (data) {
            return this.insert('add', data);
        };

        IndexedDBClient.prototype.clear = function () {
            var stores = arguments.length ? Array.prototype.slice.call(arguments) : this.stores;

            // Using multiple transactions due to Safari bug: https://bugs.webkit.org/show_bug.cgi?id=136937
            var promises = stores.map(function (store) {
                return this.transaction(store, Transaction.readwrite, function (transaction) {
                    transaction.objectStore(store).clear();
                });
            }, this);

            return Promise.all(promises);
        };

        IndexedDBClient.prototype.close = function () {
            return new Promise(function (resolve) {
                this.database.close();
                return resolve();
            }.bind(this));
        };

        /**
         * This function naming deviates slightly from the IndexedDB specification because
         * `delete` is a JS keyword that can cause issues in pre-ES5 browsers.
         */
        IndexedDBClient.prototype.destroy = function (store, key) {
            return this.transaction(store, Transaction.readwrite, function (transaction) {
                transaction.objectStore(store)['delete'](key); // Using bracket notation to appease pre-ES5 browsers.
            });
        };

        IndexedDBClient.prototype.get = function (store, key) {
            return this.transaction(store, Transaction.readonly, function (transaction) {
                return transaction.objectStore(store).get(key);
            }).then(function (e) {
                return e.target.result;
            });
        };

        IndexedDBClient.prototype.getAll = function ( /* store, [index], [keyRange] */ ) {
            var args = Array.prototype.slice.call(arguments).filter(function (item) {
                return item != null;
            });

            var len = args.length;
            var store = args[0];
            var index = (typeof args[1] === 'string') ? args[1] : null;
            var keyRange = (typeof args[len - 1] !== 'string') ? args[len - 1] : null;
            var db = this.database;

            return new Promise(function (resolve, reject) {
                var transaction = db.transaction(store, Transaction.readonly);
                var source = index ? transaction.objectStore(store).index(index) : transaction.objectStore(store);

                var items = [];
                var request = source.openCursor(keyRange);
                request.onerror = reject;
                request.onsuccess = function (e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        items.push(cursor.value);
                        cursor['continue'](); // Using bracket notation to appease pre-ES5 browsers.
                    } else {
                        resolve(items);
                    }
                };
            });
        };

        IndexedDBClient.prototype.getByPrefix = function ( /* store, [index], prefix */ ) {
            var args = Array.prototype.slice.call(arguments).filter(function (item) {
                return item != null;
            });

            var store = args[0];
            var index = args.length === 3 ? args[1] : null;
            var prefix = args[args.length - 1];

            return this.getAll(store, index, KeyRange.bound(prefix, prefix + '\uffff', false, false));
        };

        /**
         * This is an update or insert function. See #add for an insert only function.
         */
        IndexedDBClient.prototype.put = function (data) {
            return this.insert('put', data);
        };

        /************************************
            ____       _             __
           / __ \_____(_)   ______ _/ /____
          / /_/ / ___/ / | / / __ `/ __/ _ \
         / ____/ /  / /| |/ / /_/ / /_/  __/
        /_/   /_/  /_/ |___/\__,_/\__/\___/

        ************************************/

        IndexedDBClient.prototype.insert = function (method, data) {
            var stores = Object.keys(data);

            // Using multiple transactions due to Safari bug: https://bugs.webkit.org/show_bug.cgi?id=136937
            var promises = stores.map(function (store) {
                return this.transaction(store, Transaction.readwrite, function (transaction) {
                    var objectStore = transaction.objectStore(store);
                    data[store].forEach(function (item) {
                        objectStore[method](item);
                    });
                });
            }, this);

            return Promise.all(promises);
        };

        IndexedDBClient.prototype.transaction = function (store, type, fn) {
            return new Promise(function (resolve, reject) {
                var transaction = this.database.transaction(store, type);
                var returnValue = fn(transaction);

                if (returnValue) {
                    returnValue.onsuccess = resolve;
                    returnValue.onerror = reject;
                } else {
                    transaction.oncomplete = resolve;
                    transaction.onerror = reject;
                }
            }.bind(this));
        };

        function getObjectStoreNames(database) {
            var stores = [];
            var domStringList = database.objectStoreNames;
            for (var i = 0; i < domStringList.length; i++) {
                stores.push(domStringList[i]);
            }
            return stores;
        }

    }, {
        "app/utils/promise_logger": 1
    }],
    3: [function (require, module, exports) {
        // no_unit_test
        module.exports = {
            visible: function (client) {
                return client.visibilityState === 'visible';
            },
            topLevel: function (client) {
                return client.frameType === 'top-level';
            },
            focused: function (client) {
                return client.focused;
            },
            urlEndsWith: function (endsWith) {
                return function (client) {
                    return client.url.endsWith(endsWith);
                };
            }
        };

    }, {}],
    4: [function (require, module, exports) {
        var clientFilters = require('app/workers/client_filters');
        var utils = require('app/workers/utils');

        // Focus and trigger an event on client if available
        // Otherwise, open the URL provided by the notification
        var dmNotificationClickHandler = function (data) {
            return utils.getClients().then(function (clientList) {
                var activeClient = clientList[0];
                if (activeClient && activeClient.focus) {
                    activeClient.focus();
                    utils.triggerOnClient(activeClient, 'uiDMNotificationClicked', data.notificationData);
                    return Promise.resolve();
                } else {
                    return utils.openURL(data.url || '/');
                }
            });
        };

        var defaultNotificationClickHandler = function (data) {
            var endsWithFilter = clientFilters.urlEndsWith(data.url);
            return utils.getClients([endsWithFilter]).then(function (clientList) {
                var client = clientList[0];
                return Promise.resolve(client && client.focus ? client.focus() : utils.openURL(data.url));
            });
        };

        var notificationClickHandlers = {
            'dm': dmNotificationClickHandler,
            'default': defaultNotificationClickHandler
        };

        module.exports = notificationClickHandlers;

    }, {
        "app/workers/client_filters": 3,
        "app/workers/utils": 9
    }],
    5: [function (require, module, exports) {
        var utils = require('app/workers/utils');

        var dmNotificationDisplayHandler = function (notification, visibleClient) {
            utils.triggerOnClient(visibleClient, 'dataDMPushReceived', notification.data.notificationData);
        };

        // Suppress error notification if there's a visible client
        var errorNotificationHandler = function () {
            return;
        };

        var notificationDisplayHandlers = {
            'dm': dmNotificationDisplayHandler,
            'error': errorNotificationHandler,
            'default': utils.displayNotification
        };

        module.exports = notificationDisplayHandlers;

    }, {
        "app/workers/utils": 9
    }],
    6: [function (require, module, exports) {
        /*
         * To bundle service worker file, run `npm run build:service-worker` in `web-resources` directory
         */

        var utils = require('app/workers/utils');
        var clientFilters = require('app/workers/client_filters');
        var notificationClickHandlers = require('app/workers/notification_click_handlers');
        var notificationDisplayHandlers = require('app/workers/notification_display_handlers');
        var scribeHelper = require('app/workers/scribe');
        var IndexedDB = require('app/utils/storage/indexed_db');

        var NOTIFICATIONS_ENDPOINT = '/i/push_notifications';
        var WORKER_API_VERSION = 1;

        function PushServiceWorker() {
            this.scribe = scribeHelper;

            /*
             *
             * Logic for fetching the JSON notifications from the endpoint
             * dealing with the response and displaying the notifications
             *
             */
            this.displayNotifications = function (notifications) {
                if (!notifications) {
                    return Promise.resolve();
                }
                return Promise.all(notifications.map(function (notification) {
                    this.scribe({
                        element: notification.data && notification.data.scribeElementName ? notification.data.scribeElementName : 'other',
                        action: 'impression'
                    }, {
                        event_value: notification.data.pushId
                    });

                    // Chrome requires that a notification be shown before the push event is completed
                    // unless theres's a visible client window so we only delegate display handling in that case
                    return utils.getClients([clientFilters.visible]).then(function (clientList) {
                        var visibleClient = clientList[0];
                        var notificationType = notification.data.notificationType;
                        var displayHandler = (visibleClient && notificationDisplayHandlers[notificationType]) || notificationDisplayHandlers['default'];
                        return displayHandler(notification, visibleClient);
                    });
                }.bind(this)));
            };

            this.fetchNotifications = function (cursors, pushId) {
                var params = [
                    'apiv=' + WORKER_API_VERSION,
                    cursors.dm && 'dm_cursor=' + encodeURIComponent(cursors.dm),
                    cursors.interactions && 'min_position=' + encodeURIComponent(cursors.interactions)
                ].filter(function (param) {
                    return !!param;
                });

                return self.fetch(NOTIFICATIONS_ENDPOINT + '?' + params.join('&'), {
                        credentials: 'include'
                    })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (data) {
                        return (data.error || !data.notifications) ? Promise.reject('Invalid API response') : data;
                    })
                    .then(function (data) {
                        return this.storeCursorsFromResponse(data);
                    }.bind(this))
                    .then(function (data) {
                        data.notifications.forEach(function (notification) {
                            notification.data.pushId = pushId;
                        });
                        return data.notifications;
                    })
                    .catch(function (err) {
                        // Unable to fetch data for some reason, most likely they are logged out
                        this.scribe({
                            action: 'fetch_failure'
                        }, {
                            event_value: pushId,
                            message: err.message
                        });
                    }.bind(this));
            };

            this.pushHandler = function (pushEvent) {
                var pushId = utils.generatePushId();
                this.scribe({
                    action: 'received'
                }, {
                    event_value: pushId
                });

                pushEvent.waitUntil(
                    this.openIndexedDB('notification_cursors')
                    .then(function (db) {
                        return this.getCursors(db);
                    }.bind(this))
                    .then(function (cursors) {
                        return this.fetchNotifications(cursors, pushId);
                    }.bind(this))
                    .then(function (notifications) {
                        return this.displayNotifications(notifications);
                    }.bind(this))
                );
            };

            this.notificationcloseHandler = function (event) {
                var data = event.notification.data;
                this.scribe({
                    element: data ? data.scribeElementName : 'other',
                    action: 'dismiss'
                }, {
                    event_value: data.pushId
                });
            };

            this.notificationclickHandler = function (event) {
                event.notification.close();

                var data = event.notification.data;
                this.scribe({
                    element: data ? data.scribeElementName : 'other',
                    action: 'click'
                }, {
                    event_value: data.pushId
                });

                var clickHandler = notificationClickHandlers[data.notificationType] || notificationClickHandlers['default'];
                event.waitUntil(clickHandler(data));
            };

            /*
             * Indexed DB Interface
             */
            this.openIndexedDB = function (name) {
                return IndexedDB.open('notification_cursors', 2, [{
                    name: 'cursors',
                    keyPath: 'name'
                }]);
            };

            this.getCursors = function (db) {
                return db.getAll('cursors').then(function (cursors) {
                    var result = cursors.reduce(function (acc, val) {
                        acc[val.name] = val.cursor;
                        return acc;
                    }, {});
                    return result;
                });
            };

            this.storeCursorsFromResponse = function (data) {
                return this.openIndexedDB('notification_cursors').then(function (db) {
                    if (data.dmCursor) {
                        db.put({
                            cursors: [{
                                name: 'dm',
                                cursor: data.dmCursor
                            }]
                        });
                    }
                    if (data.interactionsCursor) {
                        db.put({
                            cursors: [{
                                name: 'interactions',
                                cursor: data.interactionsCursor
                            }]
                        });
                    }
                    return data;
                });
            };

            /*
             * Service worker interface
             */
            this.initialize = function () {
                self.addEventListener('push', this.pushHandler.bind(this));

                self.addEventListener('notificationclose', this.notificationcloseHandler.bind(this));

                self.addEventListener('notificationclick', this.notificationclickHandler.bind(this));

                // Make this worker active as soon as it's fetched instead of waiting for page close like normal
                self.addEventListener('install', function (event) {
                    return event.waitUntil(self.skipWaiting());
                });
                self.addEventListener('activate', function (event) {
                    return event.waitUntil(self.clients.claim());
                });
            };
        }

        module.exports = new PushServiceWorker();

    }, {
        "app/utils/storage/indexed_db": 2,
        "app/workers/client_filters": 3,
        "app/workers/notification_click_handlers": 4,
        "app/workers/notification_display_handlers": 5,
        "app/workers/scribe": 8,
        "app/workers/utils": 9
    }],
    7: [function (require, module, exports) {
        // no_unit_test
        var pushServiceWorker = require('app/workers/push_service_worker');

        pushServiceWorker.initialize();

    }, {
        "app/workers/push_service_worker": 6
    }],
    8: [function (require, module, exports) {
        // no_unit_test
        var utils = require('app/workers/utils');
        var CLIENT_APP_ID = 268278;

        /*
         * Lightweight scribe interface for logging display and clicks
         */
        var scribe = function (terms, data) {
            data = data || {};

            if (!terms || !terms.action) {
                throw new Error('You must specify an action term in your client_event.');
            }

            // http://go/clienteventnamespace for details
            var eventNamespace = {
                client: 'web',
                page: 'service_worker',
                section: (terms.section || ''),
                component: (terms.component || ''),
                element: (terms.element || ''),
                action: terms.action
            };

            var json = Object.assign({}, data, {
                event_namespace: eventNamespace,
                _category_: 'client_event',
                triggered_on: utils.getDate(),
                format_version: 2,
                client_app_id: CLIENT_APP_ID // Desktop Web
            });

            self.fetch('/i/jot', {
                credentials: 'include',
                method: 'post',
                headers: {
                    'Accept': 'application/x-www-form-urlencoded',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'log=' + encodeURIComponent(JSON.stringify(json))
            });
        };

        module.exports = scribe;

    }, {
        "app/workers/utils": 9
    }],
    9: [function (require, module, exports) {
        var clientFilters = require('app/workers/client_filters');

        /* Service Worker utils */
        module.exports = {
            displayNotification: function (notification) {
                return self.registration.showNotification(notification.title, notification);
            },

            getDate: Date.now,

            generatePushId: function () {
                return parseInt((Math.random() * Number.MAX_SAFE_INTEGER), 10);
            },

            combineFilters: function (filters) {
                return function (item) {
                    return filters.every(function (filter) {
                        return filter(item);
                    });
                };
            },

            getClients: function (filters) {
                filters = filters || [];
                filters.push(clientFilters.topLevel);
                var combinedFilter = this.combineFilters(filters);
                return self.clients.matchAll({
                    type: 'window'
                }).then(function (clientList) {
                    return clientList.filter(combinedFilter);
                });
            },

            triggerOnClient: function (client, eventName, eventData) {
                return client.postMessage(JSON.stringify({
                    event: eventName,
                    data: eventData
                }));
            },

            openURL: function (url, client) {
                url = url || '/';
                if (client && client.navigate) {
                    client.focus && client.focus();
                    return client.navigate(url);
                } else if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                } else {
                    return Promise.reject('Opening a URL via service worker is not supported in this browser');
                }
            }
        };

    }, {
        "app/workers/client_filters": 3
    }]
}, {}, [7]);