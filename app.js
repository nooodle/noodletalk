"use strict";
var noodle = require('./package');
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings = require('./settings')(app, configurations, express);

var recentMessages = new Object();
recentMessages.generic = [];
recentMessages.medias = [];

// jcw: If we don't construct our userlist as an object it won't
// be passed by reference and won't be in-common between routes:
var userList = new Object();

var io = require('socket.io').listen(app);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) {
  socket.on('join channel', function (channel) {
    socket.join(channel);
    socket.set('channel', channel);
  });
  socket.on('reply', function (data) {
    var avatarURL = '';
    userList[data.channel].forEach(function (u, i, a) {
      if (u.username === data.nickname) {
        avatarURL = u.avatar;
      }
    });
    io.sockets.in(data.channel).emit('reply', {
      reply: data.message,
      user: {
        nickname: data.nickname,
        avatar: avatarURL
      }
    });
  });
});

// routes
require("./routes/message")(noodle, app, io, userList, recentMessages);
require("./routes")(noodle, app, userList);
require("./routes/auth")(noodle, app, settings, io, userList);

app.listen(settings.options.port);
