module.exports = function(app, settings, io, userList) {
  var auth = require('../lib/authenticate');

  // Login
  app.post("/login", function(req, res) {
    auth.verify(req, settings, function(error, email) {
      if(email) {
        res.cookie('rememberme', 'yes', {
          secure: settings.options.secureCookie,
          httpOnly: true
        });
        req.session.email = email;
        req.session.userFont = Math.floor(Math.random() * 8);
        req.session.nickname = 'i_love_ie6';
        io.sockets.emit('userlist', userList);
      }
      res.redirect('back');
    });
  });

  // Logout
  app.get("/logout", function(req, res) {
    // Housekeeping:
    var idx = userList.indexOf(req.session.nickname);
    if (idx > -1) {
      userList.splice(idx, 1);
      io.sockets.emit('userlist', userList);
    }
    
    // Adios:
    req.session.email = null;
    req.session.userFont = null;
    req.session.nickname = null;
    res.redirect('/');
  });
};
