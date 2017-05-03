var abc = require('./abc');

function debug(msg){
    console.log('[app.js] ::' + msg);
}
function a (){
    console.log('i am a');
    abc();
}

module.exports = {
    debug:debug,
    a:a
}