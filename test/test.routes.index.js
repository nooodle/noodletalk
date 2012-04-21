var express = require('express');
var assert = require('should');
var sinon = require('sinon');
var session = require('client-sessions');
var app = express.createServer();
var io = require('socket.io').listen(app);
var noodle = require('../package');
var redis = require("redis");
var client = redis.createClient();
var configurations = module.exports;
var settings = require('../settings')(app, configurations, express);
var noodleRedis = require('../lib/noodle-redis');
var http = require('http');
var nock = require('nock');
var addr = null;

require('../routes')(client, noodle, app, io);

client.select(settings.app.set('redisnoodle'), function(errDb, res) {
  if (errDb) {
    console.log('TEST database connection failed.');
  }
});

describe('index', function() {
  before(function(done) {
    app.listen().on('listening', function () {;
      addr = app.address();
      done();
    });
  });
  after(function() {
    client.flushdb();
    app.close();
  });
  describe('request for default route', function() {
    it('should redirect to /about/noodletalk', function(done) {
      http.get({ host: addr.address, port: addr.port, path: '/' }, function (res) {
        res.headers['location'].should.match(/\/about\/noodletalk$/);
        done();
      });
    });
  });

  describe('request for /about/noodletalk', function() {
    it('should render the index view with title #noodletalk', function(done) {
      http.get({ host: addr.address, port: addr.port, path: '/about/noodletalk' }, function (res) {
        res.statusCode.should.equal(200);
        var data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          data.should.match(/<title>#noodletalk<\/title>/);
          done();
        });
      });
    });
  });

  describe('request for /font', function() {
    it('should return the new font JSON', function(done) {
      http.get({ host: addr.address, port: addr.port, path: '/font' }, function (res) {
        var data = '';
        res.on('data', function (chunk) {
          data += chunk;
        });
        res.on('end', function () {
          data.should.match(/\{"font":[0-9]+\}/);
          done();
        });
      });
    });
  });

  describe('request for a private chat not including this user', function() {
    it('should return a 403 Forbidden', function(done) {
      http.get({
          host: addr.address,
          port: addr.port,
          path: '/about/private-844ab0f2f8ce63760d92b75722be5b87-8837992a7a410d4e950c949d6a066708'
        }, function (res) {
          res.statusCode.should.equal(403);
          done();
        });
    });
  });

  describe('request for a private chat including this user', function() {
    it('should render the index view', function(done) {
      app.get('/create-test-session', function (req, res) {
        req.session.email = 'test@test.org';
        req.session.emailHash = '617d86fdffa6007ede1628d91049094c';
        req.session.nickname = {};
        res.json('OK');
      });
      http.get({ host: addr.address, port: addr.port, path: '/create-test-session' }, function (res) {
        var testSession = String(res.headers['set-cookie']).split(';')[0];
        http.get({
          host: addr.address,
          port: addr.port,
          headers: {
            Cookie: testSession
          },
          path: '/about/private-617d86fdffa6007ede1628d91049094c-8837992a7a410d4e950c949d6a066708'
        }, function (res) {
          res.statusCode.should.equal(200);
          done();
        });
      });
    });
  });
});
