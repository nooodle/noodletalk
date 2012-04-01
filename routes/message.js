module.exports = function(noodle, app, io, userList, recentMessages) {
  var message = {};
  var auth = require('../lib/authenticate');
  var content = require('../lib/web-remix');
  var messageMaker = require('../lib/message-maker');

  // Get recent messages
  app.get("/about/:channel/recent", function(req, res) {
    var channel = req.params.channel;
    var channelMessages = {};
    channelMessages.generic = recentMessages.generic.filter(function (m) {
      return (m.channel == channel);
    });
    channelMessages.media = recentMessages.media.filter(function (m) {
      return (m.channel == channel);
    });
    if (!userList[channel]) {
      userList[channel] = [];
    }
    req.session = null;
    res.json({
      'messages': channelMessages,
      'connected_clients': io.sockets.clients(channel).length,
      'user_list': userList[channel],
    });
  });

  // Add new message
  app.post("/about/:channel/message", function(req, res) {
    var channel = req.params.channel;
    var message = messageMaker.getMessage(noodle, channel, req, io, userList);
    var mediaIframeMatcher = /<iframe\s.+><\/iframe>/i;
    var mediaVideoMatcher = /<video\s.+>.+<\/video>/i;
    var mediaAudioMatcher = /<audio\s.+>.+<\/audio>/i;
    
    recentMessages.generic.push(message);
    
    var totalTopics = {};
    recentMessages.generic.forEach(function (m, i, a) {
        totalTopics[m.channel] = 1;
    });
    
    if (recentMessages.generic.length > Object.keys(totalTopics).length * 20) {
      for (var i = recentMessages.generic.length - 1; i >= 0; i--) {
        if (recentMessages.generic[i].channel == channel) {
          recentMessages.generic.splice(i, 1);
        }
      }
    }
    // Add if this is a media item
    if(mediaIframeMatcher.exec(message.message) !== null ||
      mediaVideoMatcher.exec(message.message) !== null ||
      mediaAudioMatcher.exec(message.message) !== null) {
      recentMessages.media.push(messages);
    }
    
    if (recentMessages.media.length > Object.keys(totalTopics).length * 3) {
      for (var i = recentMessages.media.length - 1; i >= 0; i--) {
        if (recentMessages.media[i].channel == channel) {
          recentMessages.media.splice(i, 1);
        }
      }
    }
    
    io.sockets.in(channel).emit('message', message);
    io.sockets.in(channel).emit('usercount', io.sockets.clients(channel).length);
    res.json(message);
  });
};
