(function() {
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

}).call(this);
