// All functionality that doesn't require backend requests but triggers an action
var commandIsMatched = false;
var helpMatcher = /^(\/help)/i;
var clearMatcher = /^(\/clear)/i;
var usersMatcher = /^(\/users)/i;
var logoutMatcher = /^(\/logout)/i;
var fontMatcher = /^(\/font)/i;
var joinMatcher = /^(\/join)/i;
var leaveMatcher = /^(\/leave|\/part)/i;

var commandMatched = function(matcher) {
  if ($('form input[name="message"]').val().match(matcher)) {
    return true;
  }
  return false;
}

var checkCommands = function(form) {
  // if this is a help trigger, open up the help window
  if (commandMatched(helpMatcher)) {
    hideAllCommands('#userList');
    $('#help').fadeIn();
    commandIsMatched = true;

  // if this is a clear trigger, clear all messages
  } else if (commandMatched(clearMatcher)) {
    $('ol li').remove();
    commandIsMatched = true;

  // if this is a users trigger, display the user list
  } else if (commandMatched(usersMatcher)) {
    hideAllCommands('#help');
    $('#userList').fadeIn();
    commandIsMatched = true;
  
  // if this is a logout trigger, log the user out
  } else if(commandMatched(logoutMatcher)) {
    commandIsMatched = true;
    document.location.href = '/about/' + $('body').data('channel') + '/logout';

  // switch fonts
  } else if(commandMatched(fontMatcher)) {
    commandIsMatched = true;
    hideAllCommands();
    $.get('/font', function(data) {
      console.log('font has changed to ' + data.font);
      $('#message form').attr('class', 'font' + data.font);
    });

  // join a channel
  } else if (commandMatched(joinMatcher)) {
    hideAllCommands();
    commandIsMatched = true;
    var channel = $('form input[name="message"]').val().replace(/^\/join #?/, '');
    window.open('/about/' + escape(channel), '_blank');

  // leave a channel
  } else if (commandMatched(leaveMatcher)) {
    hideAllCommands();
    commandIsMatched = true;
    window.close();
  }

  if (commandIsMatched) {
    form.find('input').val('');
  }
};

var hideAllCommands = function(options) {
  if (options) {
    $(options).fadeOut();
  } else {
    $('#help').fadeOut();
    $('#userList').fadeOut();
  }
}
