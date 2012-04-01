"use strict";
var noodle = require('./package');
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings = require('./settings')(app, configurations, express);

var recentMessages = new Object();
recentMessages.generic = [];
recentMessages.media = [];

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
  });
});

// routes
require("./routes")(noodle, app, userList);
require("./routes/message")(noodle, app, io, userList, recentMessages);
require("./routes/auth")(noodle, app, settings, io, userList);

app.listen(settings.options.port);
