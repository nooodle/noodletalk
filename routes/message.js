module.exports = function(noodle, app, io, userList, recentMessages) {
  var message = {};
  var auth = require('../lib/authenticate');
  var gravatar = require('gravatar');
  var content = require('../lib/web-remix');
  var messageMaker = require('../lib/message-maker');

  // Get recent messages
  app.get("/recent", function(req, res) {
    res.json({
      'messages': recentMessages, 
      'connected_clients': io.sockets.clients().length,
      'user_list': userList,
    });
  });

  // Add new message
  app.post("/message", function(req, res) {
    var message = messageMaker.getMessage(noodle, req, io, userList);
    var mediaIframeMatcher = /<iframe\s.+><\/iframe>/i;
    var mediaVideoMatcher = /<video\s.+>.+<\/video>/i;
    var mediaAudioMatcher = /<audio\s.+>.+<\/audio>/i;

    recentMessages.generic.push(message);
    if(recentMessages.generic.length > 20) {
      recentMessages.generic.shift();
    }
    // Add if this is a media item
    if(mediaIframeMatcher.exec(message.message) !== null ||
      mediaVideoMatcher.exec(message.message) !== null ||
      mediaAudioMatcher.exec(message.message) !== null) {
      recentMessages.media.push(message);
    }
    if(recentMessages.media.length > 3) {
      recentMessages.media.shift();
    }

    io.sockets.emit('message', message);
    io.sockets.emit('usercount', io.sockets.clients().length);
    res.json(message);
  });
};
