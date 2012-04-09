var assert = require('should');
var webRemix = require('../lib/web-remix');

describe('web-remix', function() {
  describe('.generate',  function() {

    it('returns embed code for a youtu.be short url', function() {
      var subject = webRemix.generate('http://youtu.be/5cazkHAHiPU');
      subject.should.equal(' <iframe width="500" height="281" src="//www.youtube.com/embed/5cazkHAHiPU" ' +
        'frameborder="0" allowfullscreen></iframe><a href="//www.youtube.com/watch?v=5cazkHAHiPU" ' +
        'class="media-link" target="_blank">http://www.youtube.com/watch?v=5cazkHAHiPU</a>');
    });

    it('returns embed code for a youtube normal url', function() {
      var subject = webRemix.generate('http://www.youtube.com/watch?v=5cazkHAHiPU');
      subject.should.equal(' <iframe width="500" height="281" src="//www.youtube.com/embed/5cazkHAHiPU" ' +
        'frameborder="0" allowfullscreen></iframe><a href="//www.youtube.com/watch?v=5cazkHAHiPU" ' +
        'class="media-link" target="_blank">http://www.youtube.com/watch?v=5cazkHAHiPU</a>');
    });

    it('returns embed code for a vimeo video url',function() {
      var subject = webRemix.generate('http://vimeo.com/37872583');
      subject.should.equal(' <iframe src="//player.vimeo.com/video/37872583" width="500" height="281" ' +
        'frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>' +
        '<a href="http://vimeo.com/37872583" class="media-link" target="_blank">http://vimeo.com/37872583</a>');
    });

    it('returns image code for an img url', function() {
      var subject = webRemix.generate('http://3.bp.blogspot.com/_K_1LxF4TvhU/S7UUE6PYKiI/AAAAAAAADto/XfpdX2CIxqY/' +
        's400/Riley+the+smiling+dog.jpg');
      subject.should.equal(' <img src="http://3.bp.blogspot.com/_K_1LxF4TvhU/S7UUE6PYKiI/AAAAAAAADto/XfpdX2CIxqY/' +
        's400/Riley+the+smiling+dog.jpg"><a href="http://3.bp.blogspot.com/_K_1LxF4TvhU/S7UUE6PYKiI/AAAAAAAADto/Xf' +
        'pdX2CIxqY/s400/Riley+the+smiling+dog.jpg" class="media-link" target="_blank">' +
        'http://3.bp.blogspot.com/_K_1LxF4TvhU/S7UUE6PYKiI/AAAAAAAADto/XfpdX2CIxqY/s400/Riley+the+smiling+dog.jpg</a>');
    });

    it('returns a link for an https url', function() {
      var subject = webRemix.generate('https://example.com');
      subject.should.equal(' <a href="https://example.com" target="_blank">https://example.com</a>');
    });

    it('returns a link for an http url', function() {
      var subject = webRemix.generate('http://example.com');
      subject.should.equal(' <a href="http://example.com" target="_blank">http://example.com</a>');
    });

    it('returns a heart image for an emotiHeart', function() {
      var heart = '&lt;3';
      var subject = webRemix.generate(heart);
      subject.should.equal(' <img src="/images/heart.png">');
    });

    it('returns video for a video link', function() {
      var video = 'http://blah.com/video.ogv';
      var subject = webRemix.generate(video);
      subject.should.equal(' <video controls="controls" preload="none" autobuffer><source src="' + video +
        '" type="video/ogg; codecs="vp8, vorbis" /></video><a href="' + video + '" target="_blank">' + video + '</a>');
    });

    it('returns audio for an audio link', function() {
      var audio = 'http://blah.com/audio.ogg';
      var subject = webRemix.generate(audio);
      subject.should.equal(' <audio controls="controls" preload="none" autobuffer><source src="' + audio +
        '" type="audio/ogg" /></audio><a href="' + audio + '" target="_blank">' + audio + '</a>');
    });

    it('returns a channel link', function() {
      var channel = 'join this #channel';
      var subject = webRemix.generate(channel);
      subject.should.equal(' join this <a href="/about/channel" target="_blank">#channel</a>');
    });

    it('returns the plain text for anything else', function() {
      var subject = webRemix.generate('foo');
      subject.should.equal(' foo');
    });

  });

  describe('.getNickName',function() {
    describe('have /nick', function() {
      describe('/nick paramater is not null', function() {
        describe('the parameter is not empty after striping spaces', function() {

          it('returns the nickname', function() {
            var subject = webRemix.getNickName('/nick wangernum');
            subject.should.equal('wangernum');
          });

          it('truncates nicks at unknown characters', function() {
            var subject = webRemix.getNickName('/nick f&f');
            subject.should.equal('f');
          });

        });

        it('returns an empty string the parameter is empty after stripping spaces', function() {
          var subject = webRemix.getNickName('/nick          ');
          subject.should.be.null;
        });
      });

      it('returns an empty string when /nick parameter is null', function() {
        var subject = webRemix.getNickName('/nick');
        subject.should.be.null;
      });
    });

    it('returns an empty string have no /nick', function() {
      var subject = webRemix.getNickName('testtest');
      subject.should.be.null;
    });
  });

});
