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

var ver = '0.0.26';

// // var notifyvisitors_brandid = null;
// // importScripts('./sw-notify.js');
// function fetchListener(event){
//     // console.log(request);
//     fetch(event.request).then(function(response){
//         if(response && response.status === 200){
//             return response;
//         }else{
//             console.log('not a good response');
//         }
//     }).catch(function(err){
//         console.log(err);
//     })
// }

// self.addEventListener('fetch',fetchListener);

'use strict';

var f1 = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var x;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return resolveAfter2Seconds(10);

          case 2:
            x = _context.sent;

            console.log(x); // 10

          case 4:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function f1() {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function resolveAfter2Seconds(x) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(x);
    }, 2000);
  });
}

f1();
console.log('ha');


