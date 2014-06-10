(function() {
  var TrackSource, request,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  request = require('request');

  TrackSource = (function() {
    function TrackSource() {}

    TrackSource.search = function(keywords, success) {
      var mashTracks, tracks_all;
      tracks_all = {};
      mashTracks = function() {
        var tracks_deduplicated, tracks_hash;
        tracks_all = tracks_all['itunes'].concat(tracks_all['lastfm']);
        tracks_deduplicated = [];
        tracks_hash = [];
        $.each(tracks_all, function(i, track) {
          var track_hash;
          if (track.artist && track.title) {
            track_hash = track.artist.toLowerCase() + '___' + track.title.toLowerCase();
            if (__indexOf.call(tracks_hash, track_hash) < 0) {
              tracks_deduplicated.push(track);
              return tracks_hash.push(track_hash);
            }
          }
        });
        return typeof success === "function" ? success(tracks_deduplicated) : void 0;
      };
      request({
        url: 'http://itunes.apple.com/search?media=music&entity=song&limit=100&term=' + encodeURIComponent(keywords),
        json: true
      }, function(error, response, data) {
        var tracks;
        if (!error && response.statusCode === 200) {
          tracks = [];
          try {
            $.each(data.results, function(i, track) {
              return tracks.push({
                title: track.trackCensoredName,
                artist: track.artistName,
                cover_url_medium: track.artworkUrl60,
                cover_url_large: track.artworkUrl100
              });
            });
          } catch (_error) {}
          tracks_all['itunes'] = tracks;
          if (Object.keys(tracks_all).length === 2) {
            return mashTracks();
          }
        }
      });
      return request({
        url: 'http://ws.audioscrobbler.com/2.0/?method=track.search&api_key=c513f3a2a2dad1d1a07021e181df1b1f&format=json&track=' + encodeURIComponent(keywords),
        json: true
      }, function(error, response, data) {
        var tracks;
        if (!error && response.statusCode === 200) {
          tracks = [];
          try {
            if (data.results.trackmatches.track.name) {
              data.results.trackmatches.track = [data.results.trackmatches.track];
            }
            $.each(data.results.trackmatches.track, function(i, track) {
              var cover_url_large, cover_url_medium;
              cover_url_medium = cover_url_large = 'images/cover_default_large.png';
              if (track.image) {
                $.each(track.image, function(i, image) {
                  if (image.size === 'medium' && image['#text'] !== '') {
                    return cover_url_medium = image['#text'];
                  } else if (image.size === 'large' && image['#text'] !== '') {
                    return cover_url_large = image['#text'];
                  }
                });
              }
              return tracks.push({
                title: track.name,
                artist: track.artist,
                cover_url_medium: cover_url_medium,
                cover_url_large: cover_url_large
              });
            });
          } catch (_error) {}
          tracks_all['lastfm'] = tracks;
          if (Object.keys(tracks_all).length === 2) {
            return mashTracks();
          }
        }
      });
    };

    TrackSource.topTracks = function(success) {
      return request({
        url: 'http://itunes.apple.com/rss/topsongs/limit=50/explicit=true/json',
        json: true
      }, function(error, response, data) {
        var tracks, tracks_hash;
        if (!error && response.statusCode === 200) {
          tracks = [];
          tracks_hash = [];
          $.each(data.feed.entry, function(i, track) {
            var track_hash;
            track_hash = track['im:artist'].label + '___' + track['im:name'].label;
            if (__indexOf.call(tracks_hash, track_hash) < 0) {
              tracks.push({
                title: track['im:name'].label,
                artist: track['im:artist'].label,
                cover_url_medium: track['im:image'][1].label,
                cover_url_large: track['im:image'][2].label
              });
              return tracks_hash.push(track_hash);
            }
          });
          return typeof success === "function" ? success(tracks) : void 0;
        }
      });
    };

    TrackSource.history = function(success) {
      return History.getTracks(function(tracks) {
        return typeof success === "function" ? success(tracks) : void 0;
      });
    };

    TrackSource.playlist = function(playlist, success) {
      return Playlists.getTracksForPlaylist(playlist, (function(tracks) {
        return typeof success === "function" ? success(tracks) : void 0;
      }));
    };

    return TrackSource;

  })();

}).call(this);
