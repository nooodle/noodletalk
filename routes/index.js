var gravatar = require('gravatar');
var request = require('request');

var auth = require('../lib/authenticate');
var content = require('../lib/web-imagery');

var settings = require('../settings');
var io = require('socket.io').listen(settings.app);
var message = {};

var getMessageDateTimeString = function() {
  var message_datetime = new Date();
  var message_hours = message_datetime.getHours();
  var message_mins  = message_datetime.getMinutes();
  var message_seconds = message_datetime.getSeconds();
  return message_datetime.toLocaleDateString() + " @ " + message_hours + ":" + message_mins + ":" + message_seconds;
}

var getMessage = function(req) {
  if(req.body) {
    message = {
      message: content.generate(req.body.message),
      gravatar: gravatar.url(req.session.email),
      font: req.session.userFont,
      created_datetime:getMessageDateTimeString(), 
      created: Math.round(new Date().getTime() / 1000)
    };

    return message;
  };
}


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
      req.session.userFont = Math.floor(Math.random() * 5);
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
  res.redirect('/');
};
