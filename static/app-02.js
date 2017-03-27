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

window.addEventListener('offline',getList);
window.addEventListener('online',reload);

function reload(){
    location.reload();
}

if (!navigator.onLine) {
    getList();
}

function getList() {
    caches.open('sw-test').then(function (cache) {
        cache.keys().then(function (keys) {
            modifyLinks(keys);
        })
    }).catch(function (err) {
        console.log(err);
    })

}

function modifyLinks(links) {
    var _urls = [];
    var _origin = location.origin;
    for (var key of links) {
        _urls.push(new URL(key.url));
    }
    var urls = _urls.map(function (key) {
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
            var searchStr = 'a[href="' + key.pathname + '"]';
            var el = document.querySelectorAll(searchStr);
            if (el) {
                elem.push(el);
            }
        }
    }
    addCss(elem);
}

function addCss(elemArray) {
    var validElArray = elemArray.map(function (elNode) {
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
            }

        }
    }
    addScript();
}
function addScript() {
    var style = document.createElement("style");
    style.textContent = `a:not(.available){
                            color: #ddd!important;
                        }
                        a:not(.available):hover{
                            color: #ddd!important;
                        }
                        a:not(.available):active{
                            color: #ddd!important;
                        }`;
    document.body.appendChild(style);

}