'use strict';

var express = require('express');
var exphbs  = require('express-handlebars');
// var bodyParser = require('body-parser');
var app = express();
// app.use(bodyParser.json());

var port  = 5002;

app.engine('hbs', exphbs({defaultLayout: 'main',extname:'.hbs'}));
app.set('view engine', 'hbs');


app.use('/', express.static('static'));



app.get('/', function (req, res) {
    res.render('home');

});
app.get('/about', function (req, res) {
    res.render('about');

});

app.get('/view3',function(req,res){
   res.render('view3');
})
app.get('/view4',function(req,res){
   res.render('view4');
})
app.get('/view5',function(req,res){
   res.render('view5');
})
app.get('/view6',function(req,res){
   res.render('view6');
})


app.listen(port,function(){
    console.log('app at port:- ' +port);
})