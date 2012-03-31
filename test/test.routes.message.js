var express = require('express');
var assert = require('should');
var sinon = require('sinon');
var messages = require('../routes/message');
var messageMaker = require('../lib/message-maker');
var app = express.createServer();
var io = require('socket.io').listen(app);
var content = require('../lib/web-remix');
var userList = new Array();
var noodle = require('../package');

describe('message', function() {
  beforeEach(function() {
    var userList = {};
    var recentMessages = {};
    recentMessages.generic = [];
    recentMessages.media = [];
    messages(noodle, app, sinon.stub(), userList, recentMessages);
  });
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
              nickname: 'oldnick',
              email: 'test@test.org'
            }
          };
          var message = messageMaker.getMessage(noodle, req, io, userList);

          req.session.nickname.should.equal(newNick);
        });
        it('updates the userList', function() {
          var newNick = 'nick';
          var req = { 
            body: { 
              message: '/nick ' + newNick
            },
            session: {
              nickname: 'oldnick',
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, req, io, userList);

          userList.should.not.include('oldnick');
        });

        describe('nickname is not on the userList', function() {
          it('adds the nickname to the userList', function() {
            var newNick = 'nick';
            var req = { 
              body: { 
                message: '/nick ' + newNick
              },
              session: {
                nickname: 'oldnick',
                email: 'test@test.org'
              }
            };

            var message = messageMaker.getMessage(noodle, req, io, userList);

            req.body.message = "/nick gonzo"
            var message = messageMaker.getMessage(noodle, req, io, userList);

            req.session.nickname.should.equal('gonzo');
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
              nickname: 'test',
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, req, io, userList);

          req.session.nickname.should.equal('test');
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
              nickname: '',
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, req, io, userList);

          req.session.nickname.should.match(/i_love_ie6.+/);
        });
      });

      describe('has a /me', function() {
        it('sets the status of the user', function() {
          var req = { 
            body: { 
              message: '/me is testing'
            },
            session: {
              nickname: 'test',
              email: 'test@test.org'
            }
          };

          var message = messageMaker.getMessage(noodle, req, io, userList);

          message.message.should.equal('<em>test is testing</em>');
        });
      });

    });
    //describe('has no request body');
  });
});
