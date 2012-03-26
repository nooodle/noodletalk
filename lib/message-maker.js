var content = require('../lib/web-remix');
var regalPrefixes = ["", "Sir", "Count", "Duchess", "Baron", "Commodore", "Peon"];
var epicSuffixes = ["", "The Great", "The Silent", "The Wicked", "The Disturbed", "The Outcast", "The Heroine", "Esquire"];

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
exports.getMessage = function(noodle, req, io, userList, messageType) {
  messageType = messageType || getMessageType(req);

  var gravatar = require('gravatar');
  var auth = require('../lib/authenticate');

  this.shiftUserList = function() {
    userList.unshift(req.session.nickname);
    if (userList.length > io.sockets.clients().length) {
      userList = userList.splice(io.sockets.clients().length, userList.length - io.sockets.clients().length);
    }
    io.sockets.emit('userlist', userList);
  }

  if(req.body) {
    var messageContent = req.body.message || "";

    var datetime = new Date();
    var oldNickname = req.session.nickname.toLowerCase();
    var message = content.generate(messageContent.substring(0, 399));

    var isAction = false;

    if(messageType === "nick") {
      var nickname = content.getNickName(messageContent).toLowerCase();
      var nickInArray = userList.indexOf(nickname);

      // If the new nick change is the same as the old nick or attempting
      // to match an existing nick, ignore and return the old one
      if (nickname === oldNickname || nickInArray > -1) {
        return oldNickname;
      } else {
        var idx = userList.indexOf(oldNickname);
        userList.splice(idx, 1);
        req.session.nickname = nickname;
        message = '<em>' + oldNickname + ' has changed to ' + nickname + '</em>';
        userList.unshift(nickname);
      }

      io.sockets.emit('userlist', userList);
      isAction = true;
    }

    if(!req.session.nickname) {
      req.session.nickname = auth.generateRandomNick(userList);
    }

    // Sort this nickname to the front of the list, make sure the list is not longer than connected clients.
    var idx = userList.indexOf(req.session.nickname);
    if (idx === -1) {
      this.shiftUserList();
    } else if (idx != 0) {
      userList.splice(idx, 1);
      this.shiftUserList();
    }

    // if this is a /me prepend with the nick
    if(messageType === "activity") {
      var meMatch = /^(\s\/me\s)/i;
      message = '<em>' + req.session.nickname + ' ' + message.replace(meMatch, '') + '</em>';
      isAction = true;
    }

    if(messageType === "joined") {
      message = '<em>Now introducing, ' + 
                regalPrefixes[Math.round(Math.random() * (regalPrefixes.length - 1))] + 
                ' ' + req.session.nickname + 
                ' ' + epicSuffixes[Math.round(Math.random() * (epicSuffixes.length - 1))];
      isAction = true;
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
      action_type: messageType,
      version: noodle.version
    };

    return message;
  }
};
