"use strict";
var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var settings = require('./settings')(app, configurations, express);
var userList = ['Anonymous'];

var io = require('socket.io').listen(app);
// Only using long-polling for now because heroku hates websockets
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

// routes
require("./routes")(app);
require("./routes/message")(app, io, userList);
require("./routes/auth")(app, settings, io, userList);

app.listen(settings.options.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
