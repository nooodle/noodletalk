// Date formatting functions
var padTimeDigit = function(digit) {
  if(digit < 10) {
    return '0' + digit;
  }
  return digit;
}

var buildTimeString = function( hours, mins, secs ) {
  return padTimeDigit(hours) + ":" + padTimeDigit(mins) + ":" + padTimeDigit(secs);
}

var getMessageDateTimeString = function(data) {
  var serverTime = new Date(data.raw_time);
  var timezoneOffsetInHours = (new Date().getTimezoneOffset()/60) - data.server_timezone;
  var messageLocale = new Date(data.raw_time).toLocaleDateString();
  var messageHours = new Date(data.raw_time - (timezoneOffsetInHours*60000)).getHours();
  var messageMinutes  = data.mins;
  var messageSeconds = data.secs;

  return messageLocale + " @ " + buildTimeString(messageHours, messageMinutes, messageSeconds);
};
