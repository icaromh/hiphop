(function() {
  var PlayNext, PlayTrack, itag_priorities, request, spinner_cover, video_error_codes, ytdl, __LastSelectedTrack, __currentTrack, __playerTracklist;

  request = require('request');

  ytdl = require('ytdl');

  itag_priorities = [172, 171, 43, 140, 141];

  video_error_codes = {
    1: 'MEDIA_ERR_ABORTED',
    2: 'MEDIA_ERR_NETWORK',
    3: 'MEDIA_ERR_DECODE',
    4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
  };

  __LastSelectedTrack = null;

  __currentTrack = {};

  __playerTracklist = [];

  spinner_cover = null;

  PlayNext = function(artist, title, success) {
    return $.each(__playerTracklist, function(i, track) {
      var t;
      if (track.artist === artist && track.title === title) {
        $('#tracklist-container .track-container').removeClass('playing');
        if (i < __playerTracklist.length - 1) {
          t = __playerTracklist[i + 1];
          $('#tracklist-container .track-container').eq(i + 1).addClass('playing');
        } else {
          t = __playerTracklist[0];
          $('#tracklist-container .track-container').eq(0).addClass('playing');
        }
        return PlayTrack(t.artist, t.title, t.cover_url_medium, t.cover_url_large);
      }
    });
  };

  PlayTrack = function(artist, title, cover_url_medium, cover_url_large) {
    var __CurrentSelectedTrack;
    userTracking.event("Player", "Play", artist + ' - ' + title).send();
    __currentTrack = {
      artist: artist,
      title: title
    };
    __playerTracklist = __currentTracklist;
    __CurrentSelectedTrack = Math.random();
    __LastSelectedTrack = __CurrentSelectedTrack;
    videojs('video_player').pause().currentTime(0);
    History.addTrack(artist, title, cover_url_medium, cover_url_large);
    if (spinner_cover) {
      $('#player-container #cover #loading-overlay').hide();
      spinner_cover.stop();
    }
    $('#player-container #info #video-info').html('► Loading...');
    $('#player-container #info #track-info #artist, #title').empty();
    $('#player-container #duration, #current-time').text('0:00');
    $('#player-container #cover').css({
      'background-image': 'url(' + cover_url_large + ')'
    });
    $('#player-container #cover #loading-overlay').show();
    spinner_cover = new Spinner(spinner_cover_opts).spin($('#player-container #cover')[0]);
    $('#player-container #progress-current').css({
      'width': '0px'
    });
    $('#player-container #info #track-info #artist').html(artist);
    $('#player-container #info #track-info #title').html(title);
    return request({
      url: 'http://gdata.youtube.com/feeds/api/videos?alt=json&max-results=1&q=' + encodeURIComponent(artist + ' - ' + title),
      json: true
    }, function(error, response, data) {
      if (!data.feed.entry) {
        return PlayNext(__currentTrack.artist, __currentTrack.title);
      } else {
        $('#player-container #info #video-info').html('► ' + data.feed.entry[0].title['$t'] + ' (' + data.feed.entry[0].author[0].name['$t'] + ')');
        return ytdl.getInfo(data.feed.entry[0].link[0].href, {
          downloadURL: true
        }, function(err, info) {
          var stream_urls;
          if (err) {
            return console.log(err);
          } else {
            stream_urls = [];
            $.each(info.formats, function(i, format) {
              return stream_urls[format.itag] = format.url;
            });
            return $.each(itag_priorities, function(i, itag) {
              if (stream_urls[itag]) {
                if (__CurrentSelectedTrack === __LastSelectedTrack) {
                  videojs('video_player').src(stream_urls[itag]).play();
                  userTracking.event("Playback Info", "itag", itag).send();
                }
                return false;
              }
            });
          }
        });
      }
    });
  };

  videojs('video_player');

  $(document).keydown(function(e) {
    if (e.keyCode === 32 && e.target.tagName !== 'INPUT') {
      if (videojs('video_player').paused()) {
        videojs('video_player').play();
      } else {
        videojs('video_player').pause();
      }
      return false;
    }
  });

  $('#player-container #info #track-info #action i').click(function() {
    if ($(this).hasClass('play')) {
      return videojs('video_player').play();
    } else {
      return videojs('video_player').pause();
    }
  });

  videojs('video_player').ready(function() {
    this.on('loadedmetadata', function() {
      return $('#player-container #duration').text(moment(this.duration() * 1000).format('m:ss'));
    });
    this.on('timeupdate', function() {
      $('#player-container #progress-current').css({
        'width': (this.currentTime() / this.duration()) * 100 + '%'
      });
      return $('#player-container #current-time').text(moment(this.currentTime() * 1000).format('m:ss'));
    });
    this.on('ended', function() {
      return PlayNext(__currentTrack.artist, __currentTrack.title);
    });
    this.on('play', function() {
      if (spinner_cover) {
        $('#player-container #cover #loading-overlay').hide();
        spinner_cover.stop();
      }
      $('#player-container #info #track-info #action i.play').hide();
      return $('#player-container #info #track-info #action i.pause').show();
    });
    this.on('pause', function() {
      $('#player-container #info #track-info #action i.pause').hide();
      return $('#player-container #info #track-info #action i.play').show();
    });
    return this.on('error', function(e) {
      var code;
      code = e.target.error ? e.target.error.code : e.code;
      userTracking.event("Playback Error", video_error_codes[code], __currentTrack.artist + ' - ' + __currentTrack.title).send();
      return alert('Playback Error (' + video_error_codes[code] + ')');
    });
  });

  $('#player-container #progress-bg').on('click', function(e) {
    var percentage;
    percentage = (e.pageX - $(this).offset().left) / $(this).width();
    videojs('video_player').currentTime(percentage * videojs('video_player').duration());
    return $('#player-container #progress-current').css({
      'width': percentage * 100 + '%'
    });
  });

  $('#player-container #volume-bg').on('click', function(e) {
    var percentage;
    percentage = (e.pageX - $(this).offset().left) / $(this).width();
    videojs('video_player').volume(percentage);
    return $('#player-container #volume-current').css({
      'width': percentage * 100 + '%'
    });
  });

}).call(this);
