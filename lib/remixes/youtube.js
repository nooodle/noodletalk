// Generate Youtube iframe
const SERVICE_YOUTUBE = /(youtube)|(youtu\.be)/i;

exports.process = function(media, remix, url, options) {
  if (!remix.isMatched && media.match(SERVICE_YOUTUBE)) {
    var youtubeId = "";
    remix.isMatched = true;

    if (media.indexOf('youtu.be') > -1) {
      youtubeId = url[url.length - 1];
    } else {
      youtubeId = url[url.length - 1].split('v=')[1].split('&')[0];
    }

    remix.result = '<iframe width="' + options.width + '" height="' + options.height + '" ' +
     'src="//www.youtube.com/embed/' + youtubeId + '" frameborder="0" ' +
     'allowfullscreen></iframe><a href="//www.youtube.com/watch?v=' + youtubeId + '" ' +
     'class="media-link" target="_blank">http://www.youtube.com/watch?v=' + youtubeId + '</a>';
  }
  return remix;
};
