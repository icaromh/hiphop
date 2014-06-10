(function() {
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

}).call(this);
