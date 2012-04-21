"use strict";
var noodle = require('./package');
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings = require('./settings')(app, configurations, express);
var redis = require("redis");
var client = redis.createClient();

client.select(settings.app.set('redisnoodle'), function(errDb, res) {
  console.log('PROD/DEV database connection status: ', res);
});

// Always set noodletalk as an available channel and never expire it
client.set('channels:noodletalk', 'noodletalk');

var io = require('socket.io').listen(app);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10);
});

io.sockets.on('connection', function (socket) {
  socket.on('join channel', function (channel) {
    socket.join(channel);
  });

  socket.on('private', function (data) {
    io.sockets.in(data.channel).emit('private', data.privateChannel);
  });
});

// routes
require("./routes")(client, noodle, app, io);
require("./routes/message")(client, settings, app, io);
require("./routes/auth")(client, settings, app, io);

app.listen(settings.options.port);
