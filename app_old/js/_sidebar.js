(function() {
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

}).call(this);
