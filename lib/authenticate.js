var crypto = require('crypto');
var gravatar = require('gravatar');
var request = require('request');

/* Browser ID authentication
 * Requires: web request, settings configuration
 * Returns: a user's browser id email if they logged in successfully.
 */
exports.verify = function(req, settings, callback) {
  var authUrl = settings.options.authUrl + '/verify';
  var siteUrl = settings.options.domain + ':' + settings.options.authPort;

  if(!req.body.bid_assertion) {
    return false;
  }

  var qs = {
    assertion: req.body.bid_assertion,
    audience: siteUrl
  };

  var params = {
    url: authUrl,
    form: qs
  };

  request.post(params, function(error, resp, body) {
    var email = false;

    if(error) {
      return callback(error);
    }

    try {
      var jsonResp = JSON.parse(body);

      if(!error && jsonResp.status === 'okay') {
        email = jsonResp.email;
      } else {
        return callback(error);
      }
    } catch(error) {
      return callback(error);
    }

    return callback(null, email);
  });
  return true;
};

// Return a hash of the public user metadata
exports.getUserHash = function(req, nickname, channel, callback) {
  var user = {
    emailHash: crypto.createHash('md5').update(req.session.email).digest("hex"),
    avatar: gravatar.url(req.session.email, {}, true),
    nickname: nickname,
    pubKey: ''
  };
  return callback(null, user);
}

// generate a new nickname for a new channel user
exports.generateRandomNick = function() {
  return 'i_love_ie6_v' + (new Date().getTime()) + Math.floor(Math.random() * 100);
}
