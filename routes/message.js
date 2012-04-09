var auth = require('../lib/authenticate');
var content = require('../lib/web-remix');
var messageMaker = require('../lib/message-maker');
var noodleRedis = require('../lib/noodle-redis');

module.exports = function(client, settings, app, io) {
  // Get recent messages
  app.get("/about/:channel/recent", function(req, res) {
    var channel = escape(req.params.channel);
    noodleRedis.getRecentMessages(client, channel, function(err, messages) {
      var channelMessages = {};

      channelMessages.generic = messages;

      noodleRedis.getRecentMedia(client, channel, function(err, media) {
        channelMessages.media = media;
        noodleRedis.getUserlist(client, channel, function(userErr, userList) {
          io.sockets.in(channel).emit('userlist', userList);

          res.json({
            'messages': channelMessages,
            'connected_clients': io.sockets.clients(channel).length,
            'user_list': userList
          });
        });
      });
    });
  });

  // Add new message
  app.post("/about/:channel/message", function(req, res) {
    noodleRedis.setRecentMessage(client, req, io, function(err, message) {
      try {
        var channel = req.params.channel;
        noodleRedis.getUserlist(client, channel, function(userErr, userList) {
          try {
            noodleRedis.getChannelList(client, io, function(err, channels) {
              io.sockets.emit('channels', channels);
              io.sockets.in(channel).emit('userlist', userList);
              io.sockets.in(channel).emit('message', message);
              io.sockets.in(channel).emit('usercount', io.sockets.clients(channel).length);
            });
            res.json(message);
          } catch(userErr) {
            res.json({ 'status': 500, 'error': userErr });
          }
        });

      } catch(err) {
        res.json({ 'status': 500, 'error': userErr });
      }
    });
  });
};
