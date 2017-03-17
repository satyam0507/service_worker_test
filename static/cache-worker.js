'use strict';
var version = '1.0.0';
console.log('sw cache ' + version);


//var notify_config = {
//    defaultHandler: "networkOnly",
//    navigationFallback: '/notifyvisitors_push/cache/offline.html',
//    cache: {
//        name: "notify-2", //@ string
//        maxAge: 604800, //@ number in sec
//        maxLimit: 10000 //@ number in sec
//    },
//    urls: {
//        '/(.*)': {
//            handler: 'networkFirst', // @ string
//        }
//    },
//    preCache: [
//        "/", "/notifyvisitors_push/cache/offline.html"
//    ],
//    staticFiles: [
//        {
//            maxAge: 604800, //@ number in sec
//            maxLimit: 10000, //@ number in sec
//            origin: 'https://s3.amazonaws.com',
//            urlPattern: '/(.*)'
//        }
//    ]
//
//
//};
//var notify_config ;
fetch('https://devpush.notifyvisitors.com/pwa/sw/notification')
            .then(function (response) {
                return response.json();
            }).then(function (resObj) {
        console.log(resObj);
        if (resObj.config && typeof resObj.config === 'object') {
            notify.init(resObj.config);
        } else {
            notify.init();
        }
    });

(function (e) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = e()
    } else if (typeof define === "function" && define.amd) {
        define([], e)
    } else {
        var t;
        if (typeof window !== "undefined") {
            t = window
        } else if (typeof global !== "undefined") {
            t = global
        } else if (typeof self !== "undefined") {
            t = self
        } else {
            t = this
        }
        t.toolbox = e()
    }
})(function () {
    var e, t, r;
    return function e(t, r, n) {
        function o(i, c) {
            if (!r[i]) {
                if (!t[i]) {
                    var s = typeof require == "function" && require;
                    if (!c && s)
                        return s(i, !0);
                    if (a)
                        return a(i, !0);
                    var u = new Error("Cannot find module '" + i + "'");
                    throw u.code = "MODULE_NOT_FOUND", u
                }
                var f = r[i] = {exports: {}};
                t[i][0].call(f.exports, function (e) {
                    var r = t[i][1][e];
                    return o(r ? r : e)
                }, f, f.exports, e, t, r, n)
            }
            return r[i].exports
        }
        var a = typeof require == "function" && require;
        for (var i = 0; i < n.length; i++)
            o(n[i]);
        return o
    }({1: [function (e, t, r) {
                "use strict";
                var n = e("./options");
                var o = e("./idb-cache-expiration");
                function a(e, t) {
                    t = t || {};
                    var r = t.debug || n.debug;
                    if (r) {
                        console.log("[sw-toolbox] " + e)
                    }
                }
                function i(e) {
                    var t;
                    if (e && e.cache) {
                        t = e.cache.name
                    }
                    t = t || n.cache.name;
                    return caches.open(t)
                }
                function c(e, t) {
                    t = t || {};
                    var r = t.successResponses || n.successResponses;
                    return fetch(e.clone()).then(function (o) {
                        if (e.method === "GET" && r.test(o.status)) {
                            i(t).then(function (r) {
                                r.put(e, o).then(function () {
                                    var o = t.cache || n.cache;
                                    if ((o.maxEntries || o.maxAgeSeconds) && o.name) {
                                        u(e, r, o)
                                    }
                                })
                            })
                        }
                        return o.clone()
                    })
                }
                var s;
                function u(e, t, r) {
                    var n = f.bind(null, e, t, r);
                    if (s) {
                        s = s.then(n)
                    } else {
                        s = n()
                    }
                }
                function f(e, t, r) {
                    var n = e.url;
                    var i = r.maxAgeSeconds;
                    var c = r.maxEntries;
                    var s = r.name;
                    var u = Date.now();
                    a("Updating LRU order for " + n + ". Max entries is " + c + ", max age is " + i);
                    return o.getDb(s).then(function (e) {
                        return o.setTimestampForUrl(e, n, u)
                    }).then(function (e) {
                        return o.expireEntries(e, c, i, u)
                    }).then(function (e) {
                        a("Successfully updated IDB.");
                        var r = e.map(function (e) {
                            return t.delete(e)
                        });
                        return Promise.all(r).then(function () {
                            a("Done with cache cleanup.")
                        })
                    }).catch(function (e) {
                        a(e)
                    })
                }
                function l(e, t, r) {
                    a("Renaming cache: [" + e + "] to [" + t + "]", r);
                    return caches.delete(t).then(function () {
                        return Promise.all([caches.open(e), caches.open(t)]).then(function (t) {
                            var r = t[0];
                            var n = t[1];
                            return r.keys().then(function (e) {
                                return Promise.all(e.map(function (e) {
                                    return r.match(e).then(function (t) {
                                        return n.put(e, t)
                                    })
                                }))
                            }).then(function () {
                                return caches.delete(e)
                            })
                        })
                    })
                }
                function h(e, t) {
                    return i(t).then(function (t) {
                        return t.add(e)
                    })
                }
                function p(e, t) {
                    return i(t).then(function (t) {
                        return t.delete(e)
                    })
                }
                function v(e) {
                    if (!(e instanceof Promise)) {
                        d(e)
                    }
                    n.preCacheItems = n.preCacheItems.concat(e)
                }
                function d(e) {
                    var t = Array.isArray(e);
                    if (t) {
                        e.forEach(function (e) {
                            if (!(typeof e === "string" || e instanceof Request)) {
                                t = false
                            }
                        })
                    }
                    if (!t) {
                        throw new TypeError("The precache method expects either an array of " + "strings and/or Requests or a Promise that resolves to an array of " + "strings and/or Requests.")
                    }
                    return e
                }
                function g(e, t, r) {
                    if (!e) {
                        return false
                    }
                    if (t) {
                        var n = e.headers.get("date");
                        if (n) {
                            var o = new Date(n);
                            if (o.getTime() + t * 1e3 < r) {
                                return false
                            }
                        }
                    }
                    return true
                }
                t.exports = {debug: a, fetchAndCache: c, openCache: i, renameCache: l, cache: h, uncache: p, precache: v, validatePrecacheInput: d, isResponseFresh: g, globalOptions: n}
            }, {"./idb-cache-expiration": 2, "./options": 4}], 2: [function (e, t, r) {
                "use strict";
                var n = "sw-toolbox-";
                var o = 1;
                var a = "store";
                var i = "url";
                var c = "timestamp";
                var s = {};
                function u(e) {
                    return new Promise(function (t, r) {
                        var s = indexedDB.open(n + e, o);
                        s.onupgradeneeded = function () {
                            var e = s.result.createObjectStore(a, {keyPath: i});
                            e.createIndex(c, c, {unique: false})
                        };
                        s.onsuccess = function () {
                            t(s.result)
                        };
                        s.onerror = function () {
                            r(s.error)
                        }
                    })
                }
                function f(e) {
                    if (!(e in s)) {
                        s[e] = u(e)
                    }
                    return s[e]
                }
                function l(e, t, r) {
                    return new Promise(function (n, o) {
                        var i = e.transaction(a, "readwrite");
                        var c = i.objectStore(a);
                        c.put({url: t, timestamp: r});
                        i.oncomplete = function () {
                            n(e)
                        };
                        i.onabort = function () {
                            o(i.error)
                        }
                    })
                }
                function h(e, t, r) {
                    if (!t) {
                        return Promise.resolve([])
                    }
                    return new Promise(function (n, o) {
                        var s = t * 1e3;
                        var u = [];
                        var f = e.transaction(a, "readwrite");
                        var l = f.objectStore(a);
                        var h = l.index(c);
                        h.openCursor().onsuccess = function (e) {
                            var t = e.target.result;
                            if (t) {
                                if (r - s > t.value[c]) {
                                    var n = t.value[i];
                                    u.push(n);
                                    l.delete(n);
                                    t.continue()
                                }
                            }
                        };
                        f.oncomplete = function () {
                            n(u)
                        };
                        f.onabort = o
                    })
                }
                function p(e, t) {
                    if (!t) {
                        return Promise.resolve([])
                    }
                    return new Promise(function (r, n) {
                        var o = [];
                        var s = e.transaction(a, "readwrite");
                        var u = s.objectStore(a);
                        var f = u.index(c);
                        var l = f.count();
                        f.count().onsuccess = function () {
                            var e = l.result;
                            if (e > t) {
                                f.openCursor().onsuccess = function (r) {
                                    var n = r.target.result;
                                    if (n) {
                                        var a = n.value[i];
                                        o.push(a);
                                        u.delete(a);
                                        if (e - o.length > t) {
                                            n.continue()
                                        }
                                    }
                                }
                            }
                        };
                        s.oncomplete = function () {
                            r(o)
                        };
                        s.onabort = n
                    })
                }
                function v(e, t, r, n) {
                    return h(e, r, n).then(function (r) {
                        return p(e, t).then(function (e) {
                            return r.concat(e)
                        })
                    })
                }
                t.exports = {getDb: f, setTimestampForUrl: l, expireEntries: v}
            }, {}], 3: [function (e, t, r) {
                "use strict";
                e("serviceworker-cache-polyfill");
                var n = e("./helpers");
                var o = e("./router");
                var a = e("./options");
                function i(e) {
                    var t = o.match(e.request);
                    if (t) {
                        e.respondWith(t(e.request).then(function (e) {
                            return e
                        }).catch(function (e) {
                            return n.openCache(n.globalOptions.cache.name).then(function (e) {
                                return e.match(n.globalOptions.navigationFallback).then(function (e) {
                                    return e
                                })
                            })
                        }))
                    } else if (o.default && e.request.method === "GET" && e.request.url.indexOf("http") === 0) {
                        e.respondWith(o.default(e.request).then(function (e) {
                            return e
                        }).catch(function (e) {
                            return n.openCache(n.globalOptions.cache.name).then(function (e) {
                                return e.match(n.globalOptions.navigationFallback).then(function (e) {
                                    return e
                                })
                            })
                        }))
                    }
                }
                function c(e) {
                    n.debug("activate event fired");
                    var t = a.cache.name + "$$$inactive$$$";
                    e.waitUntil(n.renameCache(t, a.cache.name))
                }
                function s(e) {
                    return e.reduce(function (e, t) {
                        return e.concat(t)
                    }, [])
                }
                function u(e) {
                    var t = a.cache.name + "$$$inactive$$$";
                    n.debug("install event fired");
                    n.debug("creating cache [" + t + "]");
                    e.waitUntil(n.openCache({cache: {name: t}}).then(function (e) {
                        return Promise.all(a.preCacheItems).then(s).then(n.validatePrecacheInput).then(function (t) {
                            n.debug("preCache list: " + (t.join(", ") || "(none)"));
                            return e.addAll(t)
                        })
                    }))
                }
                t.exports = {fetchListener: i, activateListener: c, installListener: u}
            }, {"./helpers": 1, "./options": 4, "./router": 6, "serviceworker-cache-polyfill": 16}], 4: [function (e, t, r) {
                "use strict";
                var n;
                if (self.registration) {
                    n = self.registration.scope
                } else {
                    n = self.scope || new URL("./", self.location).href
                }
                t.exports = {cache: {name: "$$$toolbox-cache$$$" + n + "$$$", maxAgeSeconds: null, maxEntries: null}, debug: false, networkTimeoutSeconds: null, preCacheItems: [], successResponses: /^0|([123]\d\d)|(40[14567])|410$/, navigationFallback: ""}
            }, {}], 5: [function (e, t, r) {
                "use strict";
                var n = new URL("./", self.location);
                var o = n.pathname;
                var a = e("path-to-regexp");
                var i = function (e, t, r, n) {
                    if (t instanceof RegExp) {
                        this.fullUrlRegExp = t
                    } else {
                        if (t.indexOf("/") !== 0) {
                            t = o + t
                        }
                        this.keys = [];
                        this.regexp = a(t, this.keys)
                    }
                    this.method = e;
                    this.options = n;
                    this.handler = r
                };
                i.prototype.makeHandler = function (e) {
                    var t;
                    if (this.regexp) {
                        var r = this.regexp.exec(e);
                        t = {};
                        this.keys.forEach(function (e, n) {
                            t[e.name] = r[n + 1]
                        })
                    }
                    return function (e) {
                        return this.handler(e, t, this.options)
                    }.bind(this)
                };
                t.exports = i
            }, {"path-to-regexp": 15}], 6: [function (e, t, r) {
                "use strict";
                var n = e("./route");
                var o = e("./helpers");
                function a(e) {
                    return e.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
                }
                var i = function (e, t) {
                    var r = e.entries();
                    var n = r.next();
                    var o = [];
                    while (!n.done) {
                        var a = new RegExp(n.value[0]);
                        if (a.test(t)) {
                            o.push(n.value[1])
                        }
                        n = r.next()
                    }
                    return o
                };
                var c = function () {
                    this.routes = new Map;
                    this.routes.set(RegExp, new Map);
                    this.default = null
                };
                ["get", "post", "put", "delete", "head", "any"].forEach(function (e) {
                    c.prototype[e] = function (t, r, n) {
                        return this.add(e, t, r, n)
                    }
                });
                c.prototype.add = function (e, t, r, i) {
                    i = i || {};
                    var c;
                    if (t instanceof RegExp) {
                        c = RegExp
                    } else {
                        c = i.origin || self.location.origin;
                        if (c instanceof RegExp) {
                            c = c.source
                        } else {
                            c = a(c)
                        }
                    }
                    e = e.toLowerCase();
                    var s = new n(e, t, r, i);
                    if (!this.routes.has(c)) {
                        this.routes.set(c, new Map)
                    }
                    var u = this.routes.get(c);
                    if (!u.has(e)) {
                        u.set(e, new Map)
                    }
                    var f = u.get(e);
                    var l = s.regexp || s.fullUrlRegExp;
                    if (f.has(l.source)) {
                        o.debug('"' + t + '" resolves to same regex as existing route.')
                    }
                    f.set(l.source, s)
                };
                c.prototype.matchMethod = function (e, t) {
                    var r = new URL(t);
                    var n = r.origin;
                    var o = r.pathname;
                    return this._match(e, i(this.routes, n), o) || this._match(e, [this.routes.get(RegExp)], t)
                };
                c.prototype._match = function (e, t, r) {
                    if (t.length === 0) {
                        return null
                    }
                    for (var n = 0; n < t.length; n++) {
                        var o = t[n];
                        var a = o && o.get(e.toLowerCase());
                        if (a) {
                            var c = i(a, r);
                            if (c.length > 0) {
                                return c[0].makeHandler(r)
                            }
                        }
                    }
                    return null
                };
                c.prototype.match = function (e) {
                    return this.matchMethod(e.method, e.url) || this.matchMethod("any", e.url)
                };
                t.exports = new c
            }, {"./helpers": 1, "./route": 5}], 7: [function (e, t, r) {
                "use strict";
                var n = e("../options");
                var o = e("../helpers");
                function a(e, t, r) {
                    r = r || {};
                    o.debug("Strategy: cache first [" + e.url + "]", r);
                    return o.openCache(r).then(function (t) {
                        return t.match(e).then(function (t) {
                            var a = r.cache || n.cache;
                            var i = Date.now();
                            if (o.isResponseFresh(t, a.maxAgeSeconds, i)) {
                                return t
                            }
                            return o.fetchAndCache(e, r)
                        })
                    })
                }
                t.exports = a
            }, {"../helpers": 1, "../options": 4}], 8: [function (e, t, r) {
                "use strict";
                var n = e("../options");
                var o = e("../helpers");
                function a(e, t, r) {
                    r = r || {};
                    o.debug("Strategy: cache only [" + e.url + "]", r);
                    return o.openCache(r).then(function (t) {
                        return t.match(e).then(function (e) {
                            var t = r.cache || n.cache;
                            var a = Date.now();
                            if (o.isResponseFresh(e, t.maxAgeSeconds, a)) {
                                return e
                            }
                            return undefined
                        })
                    })
                }
                t.exports = a
            }, {"../helpers": 1, "../options": 4}], 9: [function (e, t, r) {
                "use strict";
                var n = e("../helpers");
                var o = e("./cacheOnly");
                function a(e, t, r) {
                    n.debug("Strategy: fastest [" + e.url + "]", r);
                    return new Promise(function (a, i) {
                        var c = false;
                        var s = [];
                        var u = function (e) {
                            s.push(e.toString());
                            if (c) {
                                i(new Error('Both cache and network failed: "' + s.join('", "') + '"'))
                            } else {
                                c = true
                            }
                        };
                        var f = function (e) {
                            if (e instanceof Response) {
                                a(e)
                            } else {
                                u("No result returned")
                            }
                        };
                        n.fetchAndCache(e.clone(), r).then(f, u);
                        o(e, t, r).then(f, u)
                    })
                }
                t.exports = a
            }, {"../helpers": 1, "./cacheOnly": 8}], 10: [function (e, t, r) {
                t.exports = {networkOnly: e("./networkOnly"), networkFirst: e("./networkFirst"), cacheOnly: e("./cacheOnly"), cacheFirst: e("./cacheFirst"), fastest: e("./fastest")}
            }, {"./cacheFirst": 7, "./cacheOnly": 8, "./fastest": 9, "./networkFirst": 11, "./networkOnly": 12}], 11: [function (e, t, r) {
                "use strict";
                var n = e("../options");
                var o = e("../helpers");
                function a(e, t, r) {
                    r = r || {};
                    var a = r.successResponses || n.successResponses;
                    var i = r.networkTimeoutSeconds || n.networkTimeoutSeconds;
                    o.debug("Strategy: network first [" + e.url + "]", r);
                    return o.openCache(r).then(function (t) {
                        var c;
                        var s = [];
                        var u;
                        if (i) {
                            var f = new Promise(function (a) {
                                c = setTimeout(function () {
                                    t.match(e).then(function (e) {
                                        var t = r.cache || n.cache;
                                        var i = Date.now();
                                        var c = t.maxAgeSeconds;
                                        if (o.isResponseFresh(e, c, i)) {
                                            a(e)
                                        }
                                    })
                                }, i * 1e3)
                            });
                            s.push(f)
                        }
                        var l = o.fetchAndCache(e, r).then(function (e) {
                            if (c) {
                                clearTimeout(c)
                            }
                            if (a.test(e.status)) {
                                return e
                            }
                            o.debug("Response was an HTTP error: " + e.statusText, r);
                            u = e;
                            throw new Error("Bad response")
                        }).catch(function (n) {
                            o.debug("Network or response error, fallback to cache [" + e.url + "]", r);
                            return t.match(e).then(function (e) {
                                if (e) {
                                    return e
                                }
                                if (u) {
                                    return u
                                }
                                throw n
                            })
                        });
                        s.push(l);
                        return Promise.race(s)
                    })
                }
                t.exports = a
            }, {"../helpers": 1, "../options": 4}], 12: [function (e, t, r) {
                "use strict";
                var n = e("../helpers");
                function o(e, t, r) {
                    n.debug("Strategy: network only [" + e.url + "]", r);
                    return fetch(e).then(function (e) {
                        return e
                    })
                }
                t.exports = o
            }, {"../helpers": 1}], 13: [function (e, t, r) {
                "use strict";
                var n = e("./options");
                var o = e("./router");
                var a = e("./helpers");
                var i = e("./strategies");
                var c = e("./listeners");
                a.debug("Service Worker Toolbox is loading");
                self.addEventListener("install", c.installListener);
                self.addEventListener("activate", c.activateListener);
                self.addEventListener("fetch", c.fetchListener);
                t.exports = {networkOnly: i.networkOnly, networkFirst: i.networkFirst, cacheOnly: i.cacheOnly, cacheFirst: i.cacheFirst, fastest: i.fastest, router: o, options: n, cache: a.cache, uncache: a.uncache, precache: a.precache}
            }, {"./helpers": 1, "./listeners": 3, "./options": 4, "./router": 6, "./strategies": 10}], 14: [function (e, t, r) {
                t.exports = Array.isArray || function (e) {
                    return Object.prototype.toString.call(e) == "[object Array]"
                }
            }, {}], 15: [function (e, t, r) {
                var n = e("isarray");
                t.exports = x;
                t.exports.parse = a;
                t.exports.compile = i;
                t.exports.tokensToFunction = u;
                t.exports.tokensToRegExp = m;
                var o = new RegExp(["(\\\\.)", "([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))"].join("|"), "g");
                function a(e, t) {
                    var r = [];
                    var n = 0;
                    var a = 0;
                    var i = "";
                    var c = t && t.delimiter || "/";
                    var s;
                    while ((s = o.exec(e)) != null) {
                        var u = s[0];
                        var h = s[1];
                        var p = s.index;
                        i += e.slice(a, p);
                        a = p + u.length;
                        if (h) {
                            i += h[1];
                            continue
                        }
                        var v = e[a];
                        var d = s[2];
                        var g = s[3];
                        var m = s[4];
                        var x = s[5];
                        var w = s[6];
                        var y = s[7];
                        if (i) {
                            r.push(i);
                            i = ""
                        }
                        var b = d != null && v != null && v !== d;
                        var E = w === "+" || w === "*";
                        var R = w === "?" || w === "*";
                        var k = s[2] || c;
                        var C = m || x;
                        r.push({name: g || n++, prefix: d || "", delimiter: k, optional: R, repeat: E, partial: b, asterisk: !!y, pattern: C ? l(C) : y ? ".*" : "[^" + f(k) + "]+?"})
                    }
                    if (a < e.length) {
                        i += e.substr(a)
                    }
                    if (i) {
                        r.push(i)
                    }
                    return r
                }
                function i(e, t) {
                    return u(a(e, t))
                }
                function c(e) {
                    return encodeURI(e).replace(/[\/?#]/g, function (e) {
                        return"%" + e.charCodeAt(0).toString(16).toUpperCase()
                    })
                }
                function s(e) {
                    return encodeURI(e).replace(/[?#]/g, function (e) {
                        return"%" + e.charCodeAt(0).toString(16).toUpperCase()
                    })
                }
                function u(e) {
                    var t = new Array(e.length);
                    for (var r = 0; r < e.length; r++) {
                        if (typeof e[r] === "object") {
                            t[r] = new RegExp("^(?:" + e[r].pattern + ")$")
                        }
                    }
                    return function (r, o) {
                        var a = "";
                        var i = r || {};
                        var u = o || {};
                        var f = u.pretty ? c : encodeURIComponent;
                        for (var l = 0; l < e.length; l++) {
                            var h = e[l];
                            if (typeof h === "string") {
                                a += h;
                                continue
                            }
                            var p = i[h.name];
                            var v;
                            if (p == null) {
                                if (h.optional) {
                                    if (h.partial) {
                                        a += h.prefix
                                    }
                                    continue
                                } else {
                                    throw new TypeError('Expected "' + h.name + '" to be defined')
                                }
                            }
                            if (n(p)) {
                                if (!h.repeat) {
                                    throw new TypeError('Expected "' + h.name + '" to not repeat, but received `' + JSON.stringify(p) + "`")
                                }
                                if (p.length === 0) {
                                    if (h.optional) {
                                        continue
                                    } else {
                                        throw new TypeError('Expected "' + h.name + '" to not be empty')
                                    }
                                }
                                for (var d = 0; d < p.length; d++) {
                                    v = f(p[d]);
                                    if (!t[l].test(v)) {
                                        throw new TypeError('Expected all "' + h.name + '" to match "' + h.pattern + '", but received `' + JSON.stringify(v) + "`")
                                    }
                                    a += (d === 0 ? h.prefix : h.delimiter) + v
                                }
                                continue
                            }
                            v = h.asterisk ? s(p) : f(p);
                            if (!t[l].test(v)) {
                                throw new TypeError('Expected "' + h.name + '" to match "' + h.pattern + '", but received "' + v + '"')
                            }
                            a += h.prefix + v
                        }
                        return a
                    }
                }
                function f(e) {
                    return e.replace(/([.+*?=^!:${}()[\]|\/\\])/g, "\\$1")
                }
                function l(e) {
                    return e.replace(/([=!:$\/()])/g, "\\$1")
                }
                function h(e, t) {
                    e.keys = t;
                    return e
                }
                function p(e) {
                    return e.sensitive ? "" : "i"
                }
                function v(e, t) {
                    var r = e.source.match(/\((?!\?)/g);
                    if (r) {
                        for (var n = 0; n < r.length; n++) {
                            t.push({name: n, prefix: null, delimiter: null, optional: false, repeat: false, partial: false, asterisk: false, pattern: null})
                        }
                    }
                    return h(e, t)
                }
                function d(e, t, r) {
                    var n = [];
                    for (var o = 0; o < e.length; o++) {
                        n.push(x(e[o], t, r).source)
                    }
                    var a = new RegExp("(?:" + n.join("|") + ")", p(r));
                    return h(a, t)
                }
                function g(e, t, r) {
                    return m(a(e, r), t, r)
                }
                function m(e, t, r) {
                    if (!n(t)) {
                        r = t || r;
                        t = []
                    }
                    r = r || {};
                    var o = r.strict;
                    var a = r.end !== false;
                    var i = "";
                    for (var c = 0; c < e.length; c++) {
                        var s = e[c];
                        if (typeof s === "string") {
                            i += f(s)
                        } else {
                            var u = f(s.prefix);
                            var l = "(?:" + s.pattern + ")";
                            t.push(s);
                            if (s.repeat) {
                                l += "(?:" + u + l + ")*"
                            }
                            if (s.optional) {
                                if (!s.partial) {
                                    l = "(?:" + u + "(" + l + "))?"
                                } else {
                                    l = u + "(" + l + ")?"
                                }
                            } else {
                                l = u + "(" + l + ")"
                            }
                            i += l
                        }
                    }
                    var v = f(r.delimiter || "/");
                    var d = i.slice(-v.length) === v;
                    if (!o) {
                        i = (d ? i.slice(0, -v.length) : i) + "(?:" + v + "(?=$))?"
                    }
                    if (a) {
                        i += "$"
                    } else {
                        i += o && d ? "" : "(?=" + v + "|$)"
                    }
                    return h(new RegExp("^" + i, p(r)), t)
                }
                function x(e, t, r) {
                    if (!n(t)) {
                        r = t || r;
                        t = []
                    }
                    r = r || {};
                    if (e instanceof RegExp) {
                        return v(e, t)
                    }
                    if (n(e)) {
                        return d(e, t, r)
                    }
                    return g(e, t, r)
                }}
            , {isarray: 14}], 16: [function (e, t, r) {
                (function () {
                    var e = Cache.prototype.addAll;
                    var t = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);
                    if (t) {
                        var r = t[1];
                        var n = parseInt(t[2])
                    }
                    if (e && (!t || r === "Firefox" && n >= 46 || r === "Chrome" && n >= 50)) {
                        return
                    }
                    Cache.prototype.addAll = function e(t) {
                        var r = this;
                        function n(e) {
                            this.name = "NetworkError";
                            this.code = 19;
                            this.message = e
                        }
                        n.prototype = Object.create(Error.prototype);
                        return Promise.resolve().then(function () {
                            if (arguments.length < 1)
                                throw new TypeError;
                            var e = [];
                            t = t.map(function (e) {
                                if (e instanceof Request) {
                                    return e
                                } else {
                                    return String(e)
                                }
                            });
                            return Promise.all(t.map(function (e) {
                                if (typeof e === "string") {
                                    e = new Request(e)
                                }
                                var t = new URL(e.url).protocol;
                                if (t !== "http:" && t !== "https:") {
                                    throw new n("Invalid scheme")
                                }
                                return fetch(e.clone())
                            }))
                        }).then(function (e) {
                            if (e.some(function (e) {
                                return!e.ok
                            })) {
                                throw new n("Incorrect response status")
                            }
                            return Promise.all(e.map(function (e, n) {
                                return r.put(t[n], e)
                            }))
                        }).then(function () {
                            return undefined
                        })
                    };
                    Cache.prototype.add = function e(t) {
                        return this.addAll([t])
                    }
                })()
            }, {}]}, {}, [13])(13)
});


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
                    name: 'notify-2',
                    maxAge: 604800,
                    maxLimit: 1000
                },
                // @ option.preCache ::- Array that contain urlPattern that will be precache at 
                //                       install phase of the service worker
                preCache: [
                    "/", "/notifyvisitors_push/cache/offline.html"
                ],
                // @ defaultHandler ::- it is the default handler for the Requests 
                defaultHandler: 'networkFirst',
                // @ navigationFallback ::- fallback page which will be served if both network and cache request fails
                navigationFallback: '/notifyvisitors_push/cache/offline.html' //todo link to our custom offline page

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
                    this.options = extendedOption;
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
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
                                            },
                                    'origin': origin
                                }
                        )
                    } else {
                        toolbox.router.any(
                                regex,
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
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
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
                                            },
                                    'origin': origin
                                }
                        )
                    } else {
                        toolbox.router.any(
                                regex,
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
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
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
                                            },
                                    'origin': origin
                                }
                        )
                    } else {
                        toolbox.router.any(
                                regex,
                                toolbox[handler] || utils.getDefaultHandler(),
                                {
                                    'cache':
                                            {
                                                'name': cacheName || utils.getDefaultCacheName(),
                                                'maxAgeSeconds': maxAge || utils.getDefaultMaxAge(),
                                                'maxEntries': maxLimit || utils.getDefaultMaxLimit()
                                            }

                                }
                        )
                    }
                } else {
                    console.log('not a valid regex');
                    return;
                }
            },
            getDefaultHandler: function () {
                return self.notify.options.defaultHandler;
            },
            getDefaultCacheName: function () {
                return self.notify.options.cache.name;
            },
            getDefaultMaxAge: function () {
                return self.notify.options.cache.maxAge;
            },
            getDefaultMaxLimit: function () {
                return self.notify.options.cache.maxLimit;
            },
            getDefaultRequestType: function () {
                var _defaultRequestType = 'any';
                return _defaultRequestType;
            },
            setDefault: function (configOption) {
                toolbox.options.debug = true;
                toolbox.options.cache.name = configOption.cache.name;
                toolbox.options.preCacheItems = configOption.preCache;
                toolbox.options.navigationFallback = configOption.navigationFallback;
            },
            setUrls: function (configOption) {
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
                            utils[utils.getDefaultRequestType()](urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);

                        }
                    }
                }
            },
            setStatic: function (configOption) {
                if (configOption.hasOwnProperty('staticFiles')) {
                    for (var key in configOption.staticFiles) {
                        var _requestType = configOption.staticFiles[key].requestType;
                        var _handler = configOption.staticFiles[key].handler || 'cacheFirst';
                        var _maxAge = configOption.staticFiles[key].maxAge;
                        var _maxLimit = configOption.staticFiles[key].maxLimit;
                        var _cacheName = utils.getDefaultCacheName();
                        var _origin = configOption.staticFiles[key].origin;
                        var _urlPattern = configOption.staticFiles[key].urlPattern;
                        if (_requestType && utils.validateRequestType(_requestType)) {
                            // yes  'requestType' property is present
                            utils[_requestType](_urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        } else {
                            // no 'requestType' property is not present
                            //  fallback to default
                            utils[utils.getDefaultRequestType()](_urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);

                        }
                    }
                }
            },
            setDynamic: function (configOption) {
                if (configOption.hasOwnProperty('dynamicFiles')) {
                    for (var key in configOption.dynamicFiles) {
                        var _requestType = configOption.dynamicFiles[key].requestType;
                        var _handler = configOption.dynamicFiles[key].handler || 'networkOnly';
                        var _maxAge = configOption.dynamicFiles[key].maxAge;
                        var _maxLimit = configOption.dynamicFiles[key].maxLimit;
                        var _cacheName = utils.getDefaultCacheName();
                        var _origin = configOption.dynamicFiles[key].origin;
                        var _urlPattern = configOption.dynamicFiles[key].urlPattern;
                        if (_requestType && utils.validateRequestType(_requestType)) {
                            // yes  'requestType' property is present
                            utils[_requestType](_urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        } else {
                            // no 'requestType' property is not present
                            //  fallback to default
                            utils[utils.getDefaultRequestType()](_urlPattern, _handler, _maxAge, _maxLimit, _cacheName, _origin);
                        }
                    }
                }
            },
            notify_toolbox: function (configOption) {

//                var _defaultRequestType = 'any';
                utils.setDefault(configOption);
                utils.setUrls(configOption);
                utils.setStatic(configOption);
                utils.setDynamic(configOption);

                // add default handler if some request does not match
//                toolbox.router.default = toolbox[configOption.defaultHandler];
                toolbox.router.default = toolbox[utils.getDefaultHandler()];

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

//notify.init();

//
//fetch('https://devpush.notifyvisitors.com/pwa/sw/notification')
//            .then(function (response) {
//                return response.json();
//            }).then(function (resObj) {
//        console.log(resObj);
//        if (resObj.config && typeof resObj.config === 'object') {
//            notify.init(resObj.config);
//        } else {
//            notify.init();
//        }
//    });
