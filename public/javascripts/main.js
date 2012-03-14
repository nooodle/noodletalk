$(function() {
  var socket = io.connect('http://localhost');
  var messagesUnread = 0;
  var currentNickname = 'Anonymous';

  var padTimeDigit = function(digit) {
    if(digit < 10) {
      return '0' + digit;
    }
    return digit;
  }

  var buildTimeString = function( hours, mins, secs ) {
    return padTimeDigit(hours) + ":" + padTimeDigit(mins) + ":" + padTimeDigit(secs)
  }

  var getMessageDateTimeString = function(data) {
    var serverTime = new Date( data.raw_time );
    var timezoneOffsetInHours = (new Date().getTimezoneOffset()/60) - data.server_timezone;
    var messageLocale = new Date(data.raw_time).toLocaleDateString();
    var messageHours = new Date( data.raw_time - (timezoneOffsetInHours*60000)).getHours();
    var messageMinutes  = data.mins;
    var messageSeconds = data.secs;

    return messageLocale + " @ " + buildTimeString(messageHours, messageMinutes, messageSeconds);
  };

  var updateMessage = function(data) {
    if($('li[data-created="'+ data.created +'"]').length < 1 && data.created !== undefined) {
      // Update the message
      var message = $.trim(data.message);

      currentNickname = data.nickname;
      if(message.length > 0) {
        if(data.is_action) {
          var msg = $('<li class="action font' + data.font + '" data-created="' + data.created +
                      '"><p></p><a href="#" class="delete">delete</a></li>');
          msg.find('p').html(message);
        } else {
          var msg = $('<li class="font' + data.font + '" data-created="' + data.created +
                      '"><img><span class="nick">' + data.nickname + '</span><time>' +
                      getMessageDateTimeString(data) + '</time><p></p>' +
                      '<a href="#" class="delete">delete</a></li>');
          msg.find('img').attr('src', data.gravatar);
          msg.find('p').html(message);
        }
        $('body ol').prepend(msg);
      }

      // Update the user count
      $('#info .connected span').text(parseInt(data.connected_clients, 10));

      // Update new message count - assuming unread until focus is on input
      messagesUnread += 1;
      document.title = 'Noodle Talk (' + messagesUnread + ')';
    }
  };

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
    socket.on('message', function (data) {
      updateMessage(data);
    });
  });
});
