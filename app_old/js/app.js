var Settings;

Settings = {
  get: function(variable) {
    return localStorage['settings_' + variable];
  },
  set: function(variable, newValue) {
    return localStorage.setItem('settings_' + variable, newValue);
  },
  init: function() {
    if (!this.get('updateUrl')) {
      return this.set('updateUrl', 'http://gethiphop.net/update.json');
    }
  }
};

Settings.init();

var db, gui, isDebug, preventDefault, spinner_cover_opts, spinner_opts, win;

gui = require('nw.gui');

win = gui.Window.get();

isDebug = gui.App.argv.indexOf('--debug') > -1;

win.title = gui.App.manifest.name + ' ' + gui.App.manifest.version;

win.focus();

db = openDatabase('hiphopdb', '1.0', '', 10 * 1024 * 1024);

win.on("new-win-policy", function(frame, url, policy) {
  return policy.ignore();
});

preventDefault = function(e) {
  return e.preventDefault();
};

window.addEventListener("dragover", preventDefault, false);

window.addEventListener("drop", preventDefault, false);

window.addEventListener("dragstart", preventDefault, false);

spinner_opts = {
  lines: 10,
  length: 8,
  width: 3,
  radius: 8,
  color: '#aaa',
  speed: 2
};

spinner_cover_opts = {
  lines: 8,
  length: 5,
  width: 2,
  radius: 6,
  color: '#fff',
  speed: 2
};

$(function() {
  $(window).resize(function() {
    return $('#main #sidebar-container, #tracklist-container').height($(window).height() - ($('#header').outerHeight() + $('#player-container').outerHeight() + 20));
  }).resize();
  Playlists.getAll(function(playlists) {
    return populateSidebar(playlists);
  });
  setTimeout((function() {
    return History.countTracks(function(cnt) {
      if (cnt > 10) {
        return $('#sidebar-container li.history').click();
      } else {
        return $('#sidebar-container li.top').click();
      }
    });
  }), 1);
  return $('#search-input').focus();
});

var History;

db.transaction(function(tx) {
  return tx.executeSql('CREATE TABLE IF NOT EXISTS history (artist, title, cover_url_medium, cover_url_large, last_played)');
});

History = (function() {
  function History() {}

  History.clear = function(success) {
    return db.transaction(function(tx) {
      tx.executeSql('DROP TABLE history');
      return typeof success === "function" ? success() : void 0;
    });
  };

  History.addTrack = function(artist, title, cover_url_medium, cover_url_large) {
    var unix_timestamp;
    unix_timestamp = Math.round((new Date()).getTime() / 1000);
    return db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS history (artist, title, cover_url_medium, cover_url_large, last_played)');
      tx.executeSql('DELETE FROM history WHERE artist = ? and title = ?', [artist, title]);
      return tx.executeSql('INSERT INTO history (artist, title, cover_url_medium, cover_url_large, last_played) VALUES (?, ?, ?, ?, ?)', [artist, title, cover_url_medium, cover_url_large, unix_timestamp]);
    });
  };

  History.getTracks = function(success) {
    var tracks;
    tracks = [];
    return db.transaction(function(tx) {
      return tx.executeSql('SELECT * FROM history ORDER BY last_played DESC LIMIT 150', [], function(tx, results) {
        var i;
        i = 0;
        while (i < results.rows.length) {
          tracks.push(results.rows.item(i));
          i++;
        }
        return typeof success === "function" ? success(tracks) : void 0;
      });
    });
  };

  History.countTracks = function(success) {
    return db.transaction(function(tx) {
      return tx.executeSql('SELECT COUNT(*) AS cnt FROM history', [], function(tx, results) {
        return typeof success === "function" ? success(results.rows.item(0).cnt) : void 0;
      });
    });
  };

  return History;

})();



var Playlists, __playlists;

db.transaction(function(tx) {
  return tx.executeSql('CREATE TABLE IF NOT EXISTS playlists (name, created)');
});

__playlists = [];

Playlists = (function() {
  function Playlists() {}

  Playlists.clear = function(success) {
    return db.transaction(function(tx) {
      tx.executeSql('DROP TABLE playlist_tracks');
      tx.executeSql('DROP TABLE playlists');
      return typeof success === "function" ? success() : void 0;
    });
  };

  Playlists.addTrack = function(artist, title, cover_url_medium, cover_url_large, playlist) {
    var unix_timestamp;
    unix_timestamp = Math.round((new Date()).getTime() / 1000);
    return db.transaction(function(tx) {
      tx.executeSql('CREATE TABLE IF NOT EXISTS playlist_tracks (artist, title, cover_url_medium, cover_url_large, playlist, added)');
      tx.executeSql('DELETE FROM playlist_tracks WHERE artist = ? and title = ? and playlist = ?', [artist, title, playlist]);
      return tx.executeSql('INSERT INTO playlist_tracks (artist, title, cover_url_medium, cover_url_large, playlist, added) VALUES (?, ?, ?, ?, ?, ?)', [artist, title, cover_url_medium, cover_url_large, playlist, unix_timestamp]);
    });
  };

  Playlists.removeTrack = function(artist, title, playlist) {
    return db.transaction(function(tx) {
      return tx.executeSql('DELETE FROM playlist_tracks WHERE artist = ? and title = ? and playlist = ?', [artist, title, playlist]);
    });
  };

  Playlists.create = function(name) {
    var unix_timestamp;
    unix_timestamp = Math.round((new Date()).getTime() / 1000);
    return db.transaction(function(tx) {
      tx.executeSql('DELETE FROM playlists WHERE name = ?', [name]);
      return tx.executeSql('INSERT INTO playlists (name, created) VALUES (?, ?)', [name, unix_timestamp]);
    });
  };

  Playlists["delete"] = function(name) {
    return db.transaction(function(tx) {
      tx.executeSql('DELETE FROM playlists WHERE name = ?', [name]);
      return tx.executeSql('DELETE FROM playlist_tracks WHERE playlist = ?', [name]);
    });
  };

  Playlists.getAll = function(success) {
    var playlists;
    playlists = [];
    return db.transaction(function(tx) {
      return tx.executeSql('SELECT * FROM playlists ORDER BY created ASC', [], function(tx, results) {
        var i;
        i = 0;
        while (i < results.rows.length) {
          playlists.push(results.rows.item(i));
          i++;
        }
        __playlists = playlists;
        return typeof success === "function" ? success(playlists) : void 0;
      });
    });
  };

  Playlists.getTracksForPlaylist = function(playlist, success) {
    var tracks;
    tracks = [];
    return db.transaction(function(tx) {
      return tx.executeSql('SELECT * FROM playlist_tracks WHERE playlist = ? ORDER BY added DESC', [playlist], function(tx, results) {
        var i;
        i = 0;
        while (i < results.rows.length) {
          tracks.push(results.rows.item(i));
          i++;
        }
        return typeof success === "function" ? success(tracks) : void 0;
      });
    });
  };

  Playlists.rename = function(name, new_name) {
    return db.transaction(function(tx) {
      return tx.executeSql('UPDATE playlists SET name = ? WHERE name = ?', [new_name, name]);
    });
  };

  return Playlists;

})();

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

var menu;

if (isDebug) {
  menu = new gui.Menu({
    type: 'menubar'
  });
  menu.append(new gui.MenuItem({
    label: 'Tools',
    submenu: new gui.Menu()
  }));
  menu.items[0].submenu.append(new gui.MenuItem({
    label: 'Developer Tools',
    click: function() {
      return win.showDevTools();
    }
  }));
  menu.items[0].submenu.append(new gui.MenuItem({
    label: "Reload ignoring cache",
    click: function() {
      return win.reloadIgnoringCache();
    }
  }));
  menu.items[0].submenu.append(new gui.MenuItem({
    label: "Reset database",
    click: function() {
      return Playlists.clear(function() {
        return History.clear(function() {
          return win.reloadIgnoringCache();
        });
      });
    }
  }));
  win.menu = menu;
}

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

$(function() {
  $('#search-input').keypress(function(e) {
    var spinner;
    if (e.which === 13 && $(this).val() !== '') {
      userTracking.event("Search", "organic", $(this).val()).send();
      $('#sidebar-container li.active').removeClass('active');
      $('#tracklist-container').empty();
      spinner = new Spinner(spinner_opts).spin($('#tracklist-container')[0]);
      return TrackSource.search($(this).val(), (function(tracks) {
        spinner.stop();
        return PopulateTrackList(tracks);
      }));
    }
  });
  return $('#tracklist-container').on('click', '.track-container', function() {
    PlayTrack($(this).find('.artist').text(), $(this).find('.title').text(), $(this).find('.cover').attr('data-cover_url_medium'), $(this).find('.cover').attr('data-cover_url_large'));
    $(this).siblings('.playing').removeClass('playing');
    return $(this).addClass('playing');
  });
});

var populateSidebar;

populateSidebar = function(playlists) {
  var currentlyActive, playlist, _i, _len;
  currentlyActive = $('#sidebar-container ul li.active').text();
  $('#sidebar-container ul').empty();
  $('#sidebar-container ul').append('<li class="top">Top Tracks</li>');
  $('#sidebar-container ul').append('<li class="sep"><hr></li>');
  $('#sidebar-container ul').append('<li class="history">History</li>');
  $('#sidebar-container ul').append('<li class="sep"><hr></li>');
  for (_i = 0, _len = playlists.length; _i < _len; _i++) {
    playlist = playlists[_i];
    $('#sidebar-container ul').append('<li class="playlist">' + playlist.name + '</li>');
  }
  $('#sidebar-container ul').append('<li class="new">+ New playlist</li>');
  return $('#sidebar-container ul li').filter(function() {
    return $(this).text() === currentlyActive;
  }).addClass('active');
};

$(function() {
  $('#sidebar-container').on('click', 'li.history, li.playlist, li.top', function() {
    $(this).siblings('.active').removeClass('active');
    return $(this).addClass('active');
  });
  $('#sidebar-container').on('click', 'li', function() {
    var spinner;
    if ($(this).hasClass('top')) {
      $('#tracklist-container').empty();
      spinner = new Spinner(spinner_opts).spin($('#tracklist-container')[0]);
      return TrackSource.topTracks(function(tracks) {
        spinner.stop();
        return PopulateTrackList(tracks);
      });
    } else if ($(this).hasClass('history')) {
      return TrackSource.history(function(tracks) {
        return PopulateTrackList(tracks);
      });
    } else if ($(this).hasClass('playlist')) {
      return TrackSource.playlist($(this).text(), (function(tracks) {
        return PopulateTrackList(tracks);
      }));
    }
  });
  $('#sidebar-container ul').on('click', 'li.new', function() {
    var new_playlist_name;
    new_playlist_name = prompt('Enter new playlist name:');
    if (new_playlist_name) {
      Playlists.create(new_playlist_name);
      Playlists.getAll(function(playlists) {
        return populateSidebar(playlists);
      });
      return userTracking.event("Playlist", "Create", new_playlist_name).send();
    }
  });
  return $('#sidebar-container ul').on('contextmenu', 'li.playlist', function(e) {
    var menu, playlist_name;
    playlist_name = $(this).text();
    e.stopPropagation();
    menu = new gui.Menu();
    menu.append(new gui.MenuItem({
      label: 'Delete ' + $(this).text(),
      click: function() {
        Playlists["delete"](playlist_name);
        Playlists.getAll(function(playlists) {
          return populateSidebar(playlists);
        });
        return userTracking.event("Playlist", "Delete", playlist_name).send();
      }
    }));
    menu.append(new gui.MenuItem({
      label: 'Rename ' + $(this).text(),
      click: function() {
        var playlist_new_name;
        playlist_new_name = prompt("Set a new name", playlist_name);
        if (playlist_new_name) {
          Playlists.rename(playlist_name, playlist_new_name);
          Playlists.getAll(function(playlists) {
            return populateSidebar(playlists);
          });
          return userTracking.event("Playlist", "Rename", playlist_name).send();
        }
      }
    }));
    menu.popup(e.clientX, e.clientY);
    return false;
  });
});

var dummyMethod, getOperatingSystem, getTrackingId, os, resolution, ua, userTracking;

os = require('os');

getTrackingId = function() {
  var clientId, uuid;
  clientId = Settings.get("trackingId");
  if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
    uuid = require("node-uuid");
    Settings.set("trackingId", uuid.v4());
    clientId = Settings.get("trackingId");
    if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
      Settings.set("trackingId", uuid.v1());
      clientId = Settings.get("trackingId");
      if (typeof clientId === "undefined" || (clientId == null) || clientId === "") {
        clientId = null;
      }
    }
  }
  return clientId;
};

ua = require("universal-analytics");

if (getTrackingId() == null) {
  dummyMethod = function() {
    return {
      send: function() {}
    };
  };
  userTracking = window.userTracking = {
    event: dummyMethod,
    pageview: dummyMethod,
    timing: dummyMethod,
    exception: dummyMethod,
    transaction: dummyMethod
  };
} else {
  userTracking = window.userTracking = ua("UA-49098639-1", getTrackingId());
}

getOperatingSystem = function() {
  var platform;
  platform = os.platform();
  if (platform === "win32" || platform === "win64") {
    return "windows";
  }
  if (platform === "darwin") {
    return "mac";
  }
  if (platform === "linux") {
    return "linux";
  }
  return null;
};

userTracking.event("Device Stats", "Version", gui.App.manifest.version).send();

userTracking.event("Device Stats", "Type", getOperatingSystem()).send();

userTracking.event("Device Stats", "Operating System", os.type() + " " + os.release()).send();

userTracking.event("Device Stats", "CPU", os.cpus()[0].model + " @ " + (os.cpus()[0].speed / 1000).toFixed(1) + "GHz" + " x " + os.cpus().length).send();

userTracking.event("Device Stats", "RAM", Math.round(os.totalmem() / 1024 / 1024 / 1024) + "GB").send();

userTracking.event("Device Stats", "Uptime", Math.round(os.uptime() / 60 / 60) + "hs").send();

if (typeof screen.width === "number" && typeof screen.height === "number") {
  resolution = screen.width.toString() + "x" + (screen.height.toString());
  if (typeof screen.pixelDepth === "number") {
    resolution += "@" + screen.pixelDepth.toString();
  }
  if (typeof window.devicePixelRatio === "number") {
    resolution += "#" + window.devicePixelRatio.toString();
  }
  userTracking.event("Device Stats", "Resolution", resolution).send();
}

userTracking.event("Device Stats", "Language", navigator.language.toLowerCase()).send();

userTracking.pageview("/").send();

setInterval((function() {
  return userTracking.event("_KeepAlive", "Pulse").send();
}), 600 * 1000);

var PopulateTrackList, currentContextTrack, track_menu, __currentTracklist;

track_menu = new gui.Menu();

track_menu.append(new gui.MenuItem({
  label: 'Add to Favorites'
}));

currentContextTrack = null;

__currentTracklist = [];

PopulateTrackList = function(tracks) {
  $('#tracklist-container').empty().scrollTop();
  if (tracks.length > 0) {
    $('#tmpl-tracklist').tmpl(tracks).appendTo('#tracklist-container');
    return __currentTracklist = tracks;
  } else {
    return $('#tmpl-tracklist-error').tmpl({
      message: 'No tracks'
    }).appendTo('#tracklist-container');
  }
};

$(function() {
  $('#tracklist-container').on('contextmenu', '.track-container', function(e) {
    var menu, playlist_name, _this;
    _this = $(this);
    e.stopPropagation();
    menu = new gui.Menu();
    $.each(__playlists, function(k, playlist) {
      return menu.append(new gui.MenuItem({
        label: 'Add to ' + playlist.name,
        click: function() {
          Playlists.addTrack(_this.find('.artist').text(), _this.find('.title').text(), _this.find('.cover').attr('data-cover_url_medium'), _this.find('.cover').attr('data-cover_url_large'), playlist.name);
          return userTracking.event("Playlist", "Add Track to Playlist", playlist.name).send();
        }
      }));
    });
    if ($('#sidebar-container li.active').hasClass('playlist')) {
      menu.append(new gui.MenuItem({
        type: 'separator'
      }));
      playlist_name = $('#sidebar-container li.active').text();
      menu.append(new gui.MenuItem({
        label: 'Remove from ' + playlist_name,
        click: function() {
          Playlists.removeTrack(_this.find('.artist').text(), _this.find('.title').text(), playlist_name);
          _this.remove();
          return userTracking.event("Playlist", "Remove Track to Playlist", playlist_name).send();
        }
      }));
    }
    menu.popup(e.clientX, e.clientY);
    return false;
  });
  return track_menu.items[0].click = function() {
    return Playlists.addTrack(currentContextTrack.find('.artist').text(), currentContextTrack.find('.title').text(), currentContextTrack.find('.cover').attr('data-cover_url_medium'), currentContextTrack.find('.cover').attr('data-cover_url_large'), 'Favorites');
  };
});

var request, versionCompare;

request = require('request');

request({
  url: Settings.get('updateUrl'),
  json: true
}, function(error, response, data) {
  if (!error && response.statusCode === 200) {
    if (data.updateUrl && data.downloadUrl) {
      Settings.set('updateUrl', data.updateUrl);
    }
    if (data[getOperatingSystem()]) {
      if (versionCompare(data[getOperatingSystem()].version, gui.App.manifest.version) === 1) {
        if (confirm('A new version of HipHop is available (' + data[getOperatingSystem()].version + ') !\n\nBy pressing OK, you will be redirected to the website where you can download the latest version.\n\nWhat\'s New:\n' + data[getOperatingSystem()].description)) {
          return gui.Shell.openExternal(data.downloadUrl);
        }
      }
    }
  }
});

versionCompare = function(left, right) {
  var a, b, i, len;
  if (typeof left + typeof right !== "stringstring") {
    return false;
  }
  a = left.split(".");
  b = right.split(".");
  i = 0;
  len = Math.max(a.length, b.length);
  while (i < len) {
    if ((a[i] && !b[i] && parseInt(a[i]) > 0) || (parseInt(a[i]) > parseInt(b[i]))) {
      return 1;
    } else {
      if ((b[i] && !a[i] && parseInt(b[i]) > 0) || (parseInt(a[i]) < parseInt(b[i]))) {
        return -1;
      }
    }
    i++;
  }
  return 0;
};
