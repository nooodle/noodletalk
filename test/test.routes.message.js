var express = require('express');
var assert = require('should');
var sinon = require('sinon');
var messages = require('../routes/message');
var messageMaker = require('../lib/message-maker');
var app = express.createServer();
var io = require('socket.io').listen(app);
var content = require('../lib/web-remix');
var userList = { 'noodletalk': new Array() };
var noodle = require('../package');
var recentMessages = {};
var channel = 'noodletalk';

describe('message', function() {
  describe('.getMessage', function() {
    describe('has a request body', function() {
      describe('has a nickname change', function() {

        it('sets the session nickname', function() {
          var newNick = 'nick';
          var req = { 
            body: { 
              message: '/nick ' + newNick
            },
            session: {
              nickname: { 'noodletalk': 'oldnick' },
              email: 'test@test.org'
            }
          };
          var message = messageMaker.getMessage(noodle, channel, req, io, userList);

          req.session.nickname[channel].should.equal(newNick);
        });
        it('updates the userList', function() {
          var newNick = 'nick';
          var req = { 
            body: { 
              message: '/nick ' + newNick
            },
            session: {
              nickname: { 'noodletalk': 'oldnick' },
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, channel, req, io, userList);
          userList[channel].should.not.include('oldnick');
        });

        describe('nickname is not on the userList', function() {
          it('adds the nickname to the userList', function() {
            var newNick = 'nick';
            var req = { 
              body: { 
                message: '/nick ' + newNick
              },
              session: {
                nickname: { 'noodletalk': 'oldnick' },
                email: 'test@test.org'
              }
            };

            var message = messageMaker.getMessage(noodle, channel, req, io, userList);

            req.body.message = "/nick gonzo"
            var message = messageMaker.getMessage(noodle, channel, req, io, userList);

            req.session.nickname[channel].should.equal('gonzo');
          });
        });
      });
      
      describe('has no nickname change', function() {
        it('should not change the nickname', function() {
          var req = { 
            body: { 
              message: '/nick'
            },
            session: {
              nickname: { 'noodletalk': 'test' },
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, channel, req, io, userList);

          req.session.nickname[channel].should.equal('test');
          message.message.should.equal(' ');
        });
      });

      describe('has no request session nickname', function() {
        it('sets the nickname to i_love_ie6xxxxxxx', function() {
          var req = { 
            body: { 
              message: 'test'
            },
            session: {
              nickname: { 'noodletalk': 'i_love_ie61212121' },
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, channel, req, io, userList);

          req.session.nickname[channel].should.match(/i_love_ie6.+/);
        });
      });

      describe('has a /me', function() {
        it('sets the status of the user', function() {
          var req = { 
            body: { 
              message: '/me is testing'
            },
            session: {
              nickname: { 'noodletalk': 'test' },
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, channel, req, io, userList);

          message.message.should.equal('<em>test is testing</em>');
        });
      });

    });
    //describe('has no request body');
  });
});
