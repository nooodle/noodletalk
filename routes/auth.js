module.exports = function(noodle, app, settings, io, userList) {
  var auth = require('../lib/authenticate');
  var messageMaker = require('../lib/message-maker');

  // Login
  app.post("/about/:channel/login", function(req, res) {
    var channel = req.params.channel;
    auth.verify(req, settings, function(error, email) {
      if(email) {        
        req.session.email = email;
        req.session.userFont = Math.floor(Math.random() * 9);
        req.session.nickname = new Object({ channel: auth.generateRandomNick(userList[channel]) });;
        
        var message = messageMaker.getMessage(noodle, channel, req, io, userList, "joined");
        io.sockets.in(channel).emit('userlist', userList[channel]);
        io.sockets.in(channel).emit('message', message);
      }
      res.redirect('/about/' + escape(channel));
    });
  });

  // Logout
  app.get("/about/:channel/logout", function(req, res) {
    var channel = req.params.channel;
    // Housekeeping:
    var idx = -1;
    if (userList[channel]) {
      idx = userList[channel].indexOf(req.session.nickname[channel]);
    }
    if (idx > -1) {
      userList[channel].splice(idx, 1);
      io.sockets.in(channel).emit('userlist', userList[channel]);
    }
    
    // Adios:
    req.session.email = null;
    req.session.userFont = null;
    req.session.nickname = null;
    res.redirect('/about/' + escape(channel));
  });
};
