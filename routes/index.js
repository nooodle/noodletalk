var gravatar = require('gravatar');

var auth = require('../lib/authenticate');
var content = require('../lib/web-remix');

var settings = require('../settings');
var io = require('socket.io').listen(settings.app);
var message = {};


var getMessage = function(req) {
  if(req.body) {
    var datetime = new Date();
    var old_nickname = req.session.nickname;
    var nickname = content.getNickName(req.body.message);
    var message = content.generate(req.body.message);
    var is_action = false;

    if(nickname.length > 0) {
      req.session.nickname = nickname;
      message = '<em>' + old_nickname + ' has changed to ' + nickname + '</em>';
      is_action = true;
    }

    if(!req.session.nickname) {
      req.session.nickname = 'Anonymous';
    } 

    // if this is a /me prepend with the nick
    var meMatch = /^(\s\/me\s)/i;

    if(message.match(meMatch)) {
      message = '<em>' + req.session.nickname + ' ' + message.replace(meMatch, '') + '</em>';
      is_action = true;
    }

    message = {
      nickname: req.session.nickname,
      message: message,
      gravatar: gravatar.url(req.session.email),
      font: req.session.userFont,
      hours: datetime.getHours(),
      mins: datetime.getMinutes(),
      secs: datetime.getSeconds(),
      raw_time: datetime.getTime(),
      server_timezone: datetime.getTimezoneOffset() / 60,
      created: Math.round(new Date().getTime() / 1000),
      connected_clients: io.sockets.clients().length,
      is_action: is_action
    };

    return message;
  }
};


// Home/main
exports.index = function(req, res) {
  res.render('index', { title: 'Noodle Talk' });
};


// Login
exports.login = function(req, res) {
  auth.verify(req, function(error, email) {
    if(email) {
      res.cookie('rememberme', 'yes', {
        secure: settings.options.secureCookie,
        httpOnly: true
      });
      req.session.email = email;
      req.session.userFont = Math.floor(Math.random() * 8);
      req.session.nickname = 'Anonymous';
    }
    res.redirect('back');
  });
};


// Add new message
exports.message = function(req, res) {
  var message = getMessage(req);
  
  io.sockets.emit('message', message);
  res.json(message);
}


// Logout
exports.logout = function(req, res) {
  req.session.email = null;
  req.session.userFont = null;
  req.session.nickname = null;
  res.redirect('/');
};
