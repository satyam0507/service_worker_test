'use strict';
var appJs = require('/app-0.1.js');
var chai = require('chai');
var expect = require('chai').expect;


describe('test getList',function(){
    it('return a list of request which is cached',function(){
        appJs.getList().should.eventually.have.length(3)
    })
})