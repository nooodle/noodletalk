$(function() {
  var socket = io.connect('http://' + document.domain),
      messagesUnread = 0,
      currentNickname = 'Anonymous',
      userList = ['Anonymous'],
      userCount = 0,
      logLimit = 80;
      myPost = false
      windowIsActive = true;

  var updateMessage = function(data) {
    // Update the message
    var message = $.trim(data.message);

    if(message.length > 0 && $('ol li[data-created="' + data.created + '"]').length === 0) {
      if(currentNickname !== data.nickname){
        currentNickname = data.nickname;
      }

      if(data.is_action) {
        var msg = $('<li class="action font' + data.font + '" data-created="' + data.created +
                    '"><p></p><a href="#" class="delete">delete</a></li>');
        msg.find('p').html(message);

        // if this is a nick change, set the nick in the dom for the user
        if(data.action_type === 'nick' && myPost) {
          $('body').data('nick', data.nickname.replace(/\s/, ''));
          myPost = false;
        }

      } else {
        var highlight = '';
        var nickReference = data.message.split(': ')[0];

        if(nickReference) {
          nickReference = nickReference.replace(/\s/, '');

          // Someone is pinging you!
          if(nickReference === $('body').data('nick') && !myPost){
            highlight = 'nick-highlight';

            // Flash the favicon on pings.
            if (windowIsActive === false) {
              flashFavicon();
            }
          }
        }

        var msg = $('<li class="font' + data.font + ' ' + highlight +
                    '" data-created="' + data.created +
                    '"><img><span class="nick">' + data.nickname + '</span><time>' +
                    getMessageDateTimeString(data) + '</time><p></p>' +
                    '<a href="#" class="delete">delete</a></li>');
        msg.find('img').attr('src', data.gravatar);
        msg.find('p').html(message);
        myPost = false;
      }

      // Apply log limiter
      $('body ol li:nth-child(n+' + logLimit +')').remove();

      // Add new message
      $('body #messages ol').prepend(msg);

      // If this is media, add it to the media display
      var mediaColumn = $('body #media ol');
      if(message.indexOf('<iframe ') > -1 || message.indexOf('<video ') > -1
        || message.indexOf('<audio ') > -1) {
        var videoItem = $('<li></li>');
        mediaColumn.prepend(videoItem.html(message));
        if(mediaColumn.find('li').length > 3) {
          // drop off old media so it doesn't clutter
          mediaColumn.find('li:last').remove();
        }
      }
    }
    
    messagesUnread += 1;
    document.title = 'Noodle Talk (' + messagesUnread + ')';
  };

  // if the user just landed on this page, get the recent messages
  $.get('/recent', function(data) {
    var messages = data.messages;
    for(var i=0; i < messages.length; i++) {
      updateMessage(messages[i]);
    }
    
    // Update the user list
    userList = data.user_list;
    
    // Update the user count
    userCount = parseInt(data.connected_clients, 10)+1; // jcw: Adding one in this call only because we haven't counted our own connection yet.
    $('#info .connected span').text(userCount);
    
    // Keep list sane, compile tab completion, etc.
    keepListSane();
  });

  $('#login').click(function() {
    navigator.id.getVerifiedEmail(function(assertion) {
      if(assertion) {
        var loginForm = $('#login-form');

        loginForm.find('input').val(assertion);
        $.post('/login', loginForm.serialize(), function(data) {
          document.location.href = '/';
        });
      }
    });
  });

  $('form input').focus(function() {
    document.title = 'Noodle Talk';
    messagesUnread = 0;
  });

  $('#help').click(function() {
    $(this).fadeOut();
  });

  $('form').submit(function(ev) {
    ev.preventDefault();
    var self = $(this);

    var helpMatcher = /^(\/help)/i;
    var clearMatcher = /^(\/clear)/i;

    // if this is a help trigger, open up the help window
    if(self.find('input').val().match(helpMatcher)) {
      $('#help').fadeIn();
      self.find('input').val('');
    // if this is a clear trigger, clear all messages
    } else if(self.find('input').val().match(clearMatcher)) {
      $('ol li').remove();
      self.find('input').val('');

    // this is a submission
    } else {
      myPost = true;
      $.ajax({
        type: 'POST',
        url: self.attr('action'),
        data: self.serialize(),
        success: function(data) {
          $('form input').val('');
          document.title = 'Noodle Talk';
          messagesUnread = 0;
        },
        dataType: 'json'
      });
    }
  });

  $('ol').on('click', 'li a.delete', function(ev) {
    ev.preventDefault();
    $(this).closest('li').remove();
  });

  socket.on('connect', function () {
    socket.on('userlist', function (data) {
      userList = data;
      keepListSane();
    });
    socket.on('usercount', function (data) {
      userCount = data;
      $('#info .connected span').text(userCount);
      keepListSane();
    });
    socket.on('message', function (data) {
      updateMessage(data);
    });
  });
  
  var keepListSane = function() {
    if (userList.length > userCount) {
      userList.splice(userCount, userList.length - userCount);
    }
    socket.tabComplete = new TabComplete(userList);
  };
  
  var showUsers = function() {
    if ($('#userList').css('display') === 'none') {
      if (userList instanceof Array) {
        $('#noodlers').text('');
        userList.forEach(function(user) {
            $('#noodlers').append('<li>' + user + '</li>');
        });
        if (userList.length < userCount) {
          $('#noodlers').append('<li>' + (userCount-userList.length) + ' Anonymous</li>');
        }
      }
      $('#userList').fadeIn();
    }
  };
  var hideUsers = function() {
    if ($('#userList').css('display') !== 'none') { $('#userList').fadeOut(); }
    return false;
  }

  var flashFavicon = function() {
    // The window is active now: quit flashing!
    var favHTML;
    var favIcon = $('link[rel="shortcut icon"]');
    var favURL;

    if (windowIsActive === true) {
      favURL = '/images/favicon.png';
    } else {
      favURL = (favIcon.attr('href') === '/images/favicon.png') ? '/images/favicon-ping.png' : '/images/favicon.png';
    }
    favHTML = '<link rel="shortcut icon" href="' + favURL + '">';

    $(favIcon).remove();
    $('head').append(favHTML);

    if (windowIsActive === false) {
      setTimeout(flashFavicon, 900);
    }
  }
  
  $('.connected').click(showUsers);
  $('.connected').mouseout(hideUsers);
  if (navigator.userAgent.match(/iPad|iPhone/)) { document.addEventListener('touchstart', hideUsers, false); }

  // Set active tab state. This lets us flash a favicon at the user if
  // noodle isn't the active tab but they have new mentions.
  $(window).hover(
    function() { // mouseenter
      windowIsActive = true;
    },
    function() { // mouseleave
      windowIsActive = false;
    }
  );
});
