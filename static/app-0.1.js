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
        console.log('service worker registered successfully');
    }).catch(function (err) {
        console.log('not able to register service worker :: ' + err);
    })
}

window.addEventListener('offline', offline);
// window.addEventListener('online', reload);

// function reload() {
//     location.reload();
// }
window.addEventListener('online', online);
function online() {
    var styleEl = document.getElementById('nv-style');
    if (styleEl) {
        styleEl.remove();
    }
}

if (!navigator.onLine) {
    offline();
}
function offline() {
    getList().then(function (links) {
        modifyLinks(links);
    }).catch(function (err) {
        console.log(err);
    })
}

function getList() {
    return caches.open('sw-test').then(function (cache) {
        return cache.keys();
    })
}

function modifyLinks(links) {
    var _urls = [];
    var _origin = location.origin;
    for (var key of links) {
        _urls.push(new URL(key.url));
    }
    var urls = _urls.filter(function (key) {
        if (key.origin === _origin) {
            return key;
        }
    })
    getAllKeys(urls)
}

function getAllKeys(_urls) {
    var elType = ['a'];
    var elem = [];
    for (var elStr of elType) {
        for (var key of _urls) {
            var searchStr = elStr + '[href="' + key.pathname + '"]';
            var el = document.querySelectorAll(searchStr);
            if (el && el.length > 0) {
                elem.push(el);
            }
        }
        elem.push(document.querySelectorAll(elStr + '[href^="#"]'));
    }
    addScript().then(function () {
        console.log('script Added');
    }).catch(function (err) {
        console.log('some thing wrong during adding the script');
    });
    addCss(elem).then(function () {
        console.log('class Added');
    }).catch(function (err) {
        console.log('some thing wrong during adding the class');
    });;
}

function addCss(elemArray) {
    return new Promise(function (resolve, reject) {
        var validElArray = elemArray.filter(function (elNode) {
            if (elNode.length > 0) {
                return elNode;
            } else {
                return;
            }
        })
        for (var elArray of validElArray) {
            if (elArray) {
                for (el of elArray) {
                    if (el) {
                        el.classList.add('available');
                    }
                    // if (el.style.backgroundColor) {
                    //     var col = el.style.backgroundColor;
                    //     col = rgb2hex(col);
                    //     var newColor = convertColor(col);
                    //         //                        var white = 0x000000;
                    //         //                        var newColor = toColor(white - parseInt(rgb2hex(color)));
                    //         newColor = d2h(newColor);
                    //     console.log(newColor);
                    //     el.style.backgroundColor = newColor;
                    // }
                }

            }
        }
        resolve();
    })


}
function d2h(d) {

    return '#' + (+ d).toString(16).toUpperCase();
}
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "0x" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(- 2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(- 2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(- 2) : '';
};
function convertColor(col) {
    return (((((((col >> 16) & 0xff) * 76) + (((col >> 8) & 0xff) * 150) +
        ((col & 0xff) * 29)) >> 8)) << 16) |
        (((((((col >> 16) & 0xff) * 76) + (((col >> 8) & 0xff) * 150) +
            ((col & 0xff) * 29)) >> 8)) << 8) |
        ((((((col >> 16) & 0xff) * 76) + (((col >> 8) & 0xff) * 150) +
            ((col & 0xff) * 29)) >> 8));
};
function addScript() {
    return new Promise(function (resolve, reject) {
        var style = document.createElement("style");
        style.textContent = `a:not(.available){
                        color: #dcb!important;
                        }
                        a:not(.available):hover{
                        color: #dcb!important;
                        }
                        a:not(.available):active{
                        color: #dcb!important;
                        }
                        *:not(.available){
                       filter:grayscale(100%);
                        }`;
        document.body.appendChild(style);
        resolve();
    })


}