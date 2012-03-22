module.exports = function(app, io, userList, recentMessages) {
  var message = {};
  var gravatar = require('gravatar');
  var content = require('../lib/web-remix');

  var getMessage = function(req) {
    if(req.body) {
      var datetime = new Date();
      var oldNickname = req.session.nickname.toLowerCase();
      var nickname = content.getNickName(req.body.message).toLowerCase();
      var message = content.generate(req.body.message);
      var isAction = false;
      var actionType = '';

      if(nickname.length > 0) {
        if (nickname == oldNickname) return '';
        
        /* Right now multiple people can have the same username, so if we remove,
         * then we risk removing their nick?
        */ 
        if(oldNickname !== 'i_love_ie6') {
          var idx = userList.indexOf(oldNickname);
          if (idx > -1) userList.splice(idx, 1);
        }
        if(userList.indexOf(nickname) === -1 && nickname != 'i_love_ie6') {
          userList.unshift(nickname);
        }
        io.sockets.emit('userlist', userList);
        req.session.nickname = nickname;
        message = '<em>' + oldNickname + ' has changed to ' + nickname + '</em>';
        isAction = true;
        actionType = 'nick';
      }

      if(!req.session.nickname) {
        req.session.nickname = 'i_love_ie6';
      }
      
      // Sort this nickname to the front of the list, make sure the list is not longer than connected clients.
      if (req.session.nickname != 'i_love_ie6')
      {
        var idx = userList.indexOf(req.session.nickname);
        if (idx === -1) {
          userList.unshift(req.session.nickname);
          if (userList.length > io.sockets.clients().length) {
            userList = userList.splice(io.sockets.clients().length, userList.length - io.sockets.clients().length);
          }
          io.sockets.emit('userlist', userList);
        } else if (idx != 0) {
          userList.splice(idx, 1);
          userList.unshift(req.session.nickname);
          if (userList.length > io.sockets.clients().length) {
            userList = userList.splice(io.sockets.clients().length, userList.length - io.sockets.clients().length);
          }
          io.sockets.emit('userlist', userList);
        }
      }

      // if this is a /me prepend with the nick
      var meMatch = /^(\s\/me\s)/i;

      if(message.match(meMatch)) {
        message = '<em>' + req.session.nickname + ' ' + message.replace(meMatch, '') + '</em>';
        isAction = true;
        actionType = 'activity';
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
        created: new Date().getTime(),
        is_action: isAction,
        action_type: actionType
      };

      return message;
    }
  };

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
    var message = getMessage(req);

    recentMessages.generic.push(message);
    if(recentMessages.generic.length > 20) {
      recentMessages.generic.shift();
    }
    // Add if this is a media item
    if(message.message.indexOf('<iframe') > -1 || message.message.indexOf('<video') > -1 ||
      message.message.indexOf('<audio') > -1) {
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
