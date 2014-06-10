(function() {
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

}).call(this);
