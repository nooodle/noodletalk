var content = require('../lib/web-remix');

var getMessageType = exports.getMessageType = function(req){
  var meMatch = /^(\/me\s)/i;
  var messageContent = req.body.message || "";
  if(req.body){
    var nick = content.getNickName(messageContent);
    if(nick.length > 0){
      return "nick";
    }
    else if(messageContent.match(meMatch)){
      return "activity";
    }
  }
  return "";
}

// Message processing
exports.getMessage = function(noodle, channel, req, io, userList, messageType) {
  var auth = require('../lib/authenticate');
  var gravatar = require('gravatar');
  var regalPrefixes = ["", "Sir", "Count", "Duchess", "Baron", "Commodore", "Peon"];
  var epicSuffixes = ["", "the Great", "the Silent", "the Wicked", "the Disturbed",
                      "the Outcast", "the Heroine", "Esquire"];

  messageType = messageType || getMessageType(req);

  if (!userList) {
    userList = new Object();
  }
  if (!userList[channel]) {
    userList[channel] = [];
  }
  if (!req.session.nickname) {
    req.session.nickname = new Object();
  }
  if (!req.session.nickname[channel]) {
    req.session.nickname[channel] = auth.generateRandomNick(userList);
  }

  this.pushUser = function(nickname) {
    if(this.checkMatchingNickIdx(nickname) === false) {
      userList[channel].unshift({
        username: nickname,
        avatar: gravatar.url(req.session.email, { size: 20 }, true)
      });
    }
  }

  this.shiftUserList = function() {
    this.pushUser(req.session.nickname[channel]);
    if (userList[channel].length > io.sockets.clients(channel).length) {
      userList[channel] = userList[channel].splice(io.sockets.clients(channel).length,
        userList[channel].length - io.sockets.clients(channel).length);
    }
    io.sockets.in(channel).emit('userlist', userList[channel]);
  }

  this.checkMatchingNickIdx = function(nickname) {
    for(var i=0; i < userList.length; i++) {
      if (userList[channel][i].username === nickname) {
        return i;
      }
    }
    return false;
  }

  this.generateNickMessage = function() {
    var nickname = content.getNickName(messageContent);
    var nickMatched = this.checkMatchingNickIdx(nickname);

    // If the new nick change is the same as the old nick or attempting
    // to match an existing nick ignore and return the old one
    if (nickname === oldNickname || nickMatched) {
      message = '';
      return oldNickname;
    } else {
      var nickMatched = this.checkMatchingNickIdx(oldNickname);
      userList[channel].splice(nickMatched, 1);
      req.session.nickname[channel] = nickname;
      req.session.updated = new Date(); // to make sure session gets updated properly
      message = '<em>' + oldNickname + ' has changed to ' + nickname + '</em>';
      this.pushUser(nickname);
    }

    io.sockets.in(channel).emit('userlist', userList[channel]);
    isAction = true;
  };

  if(req.body) {
    if (!req.session.nickname) {
      req.session.nickname = new Object();
    }
    if (!req.session.nickname[channel]) {
      req.session.nickname[channel] = auth.generateRandomNick(userList);
    }

    var messageContent = req.body.message || "";
    var datetime = new Date();
    var oldNickname = req.session.nickname[channel].toLowerCase();
    var message = content.generate(messageContent.substring(0, 399));
    var isAction = false;

    if(messageType === "nick") {
      this.generateNickMessage();
    }

    // Sort this nickname to the front of the list, make sure the list is not longer than connected clients.
    var nickMatched = this.checkMatchingNickIdx(req.session.nickname);
    if (nickMatched) {
      userList[channel].splice(nickMatched, 1);
    }
    this.shiftUserList();

    // if this is a /me prepend with the nick
    if (messageType === "activity") {
      var meMatch = /^(\s\/me\s?)/i;
      message = '<em>' + req.session.nickname[channel] + ' ' + message.replace(meMatch, '') + '</em>';
      isAction = true;

    } else if(messageType === "joined") {
      message = '<em>Now introducing, ' + 
                regalPrefixes[Math.round(Math.random() * (regalPrefixes.length - 1))] + 
                ' ' + req.session.nickname[channel] + 
                ' ' + epicSuffixes[Math.round(Math.random() * (epicSuffixes.length - 1))];
      isAction = true;
    }

    message = {
      nickname: req.session.nickname[channel],
      message: message,
      channel: channel,
      gravatar: gravatar.url(req.session.email, {}, true),
      font: req.session.userFont,
      hours: datetime.getHours(),
      mins: datetime.getMinutes(),
      secs: datetime.getSeconds(),
      raw_time: datetime.getTime(),
      server_timezone: datetime.getTimezoneOffset() / 60,
      created: new Date().getTime(),
      is_action: isAction,
      action_type: messageType,
      version: noodle.version
    };

    return message;
  }
};
