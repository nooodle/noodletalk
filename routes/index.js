var auth = require('../lib/authenticate');
var gravatar = require('gravatar');
var noodleRedis = require('../lib/noodle-redis');

module.exports = function(client, noodle, app, io) {
  app.get("/", function (req, res) {
    res.redirect('/about/noodletalk');
  });
  
  app.get("/about/:channel?", function(req, res) {
    var avatar = '';
    // Always push noodletalk in as a default channel if it doesn't
    // already exist.
    client.sadd('channels', 'noodletalk');

    var channel = escape(req.params.channel);
    var nickname = '';

    if (!channel) {
      res.redirect('/about/noodletalk');
    } else {
      if (channel.match(/^private-[a-f0-9]{32}-[a-f0-9]{32}$/i)) {
        var privateParts = channel.split('-');
        if (req.session.emailHash !== privateParts[1] && req.session.emailHash !== privateParts[2]) {
            res.send(403);
        }
      }
      noodleRedis.setChannel(client, channel);
    }
    
    if (req.session.email) {
      avatar = gravatar.url(req.session.email, {}, true)
      if (!req.session.nickname[channel]) {
        req.session.nickname[channel] = auth.generateRandomNick();
      }
      nickname = req.session.nickname[channel];
    }

    noodleRedis.getUserlist(client, channel, function(err, userList) {
      io.sockets.in(channel).emit('userlist', userList);
      res.render('index', {
        title: 'Noodle Talk',
        channel: channel,
        nickname: nickname,
        avatar: avatar
      });
    });
  });

  // Change the random font
  app.get("/font", function(req, res) {
    req.session.userFont = Math.floor(Math.random() * 9);
    io.sockets.emit('font', req.session.userFont);
    res.json({
      'font': req.session.userFont
    });
  });

  // Set options
  app.post("/options", function(req, res) {
    var userOption = req.body.userOptions;
    if (userOption === 'off') {
      userOption = 'mediaOff';
    } else {
      userOption = 'mediaOn';
    }
    req.session.userOptions = userOption;
    res.json({
      'options': req.session.userOptions
    });
  });

  // Request the current version number
  app.get("/version", function(req, res) {
    res.json({
      'version': noodle.version
    });
  });
};
