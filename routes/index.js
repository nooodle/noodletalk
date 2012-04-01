module.exports = function(noodle, app, userList) {
  var auth = require('../lib/authenticate');

  app.get("/", function (req, res) {
    res.redirect('/about/noodletalk');
  });
  
  app.get("/about/:channel?", function(req, res) {
    var channel = req.params.channel;
    if (!channel) {
      res.redirect('/about/noodletalk');
    }
    if (!userList[channel]) {
      userList[channel] = [];
    }
    var nickname = null;
    if (req.session.email) {
      if (!req.session.nickname) {
        req.session.nickname = new Object();
      }
      if (!req.session.nickname[channel]) {
        req.session.nickname[channel] = auth.generateRandomNick(userList[channel]);
      }
      var nickname = req.session.nickname[channel];
    }
    res.render('index', { title: 'Noodle Talk', channel: channel, nickname: nickname });
  });

  app.get("/font", function(req, res) {
    req.session.userFont = Math.floor(Math.random() * 9);
    res.json({
      'font': req.session.userFont
    });
  });
};
