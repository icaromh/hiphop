# where to put this ?
db = openDatabase('hiphopdb', '1.0', '', 10 * 1024 * 1024)

#####################################################################

getUnixTimestamp = ->
    return Math.round((new Date()).getTime() / 1000)

#####################################################################

hiphop.service "History", ->

    db.transaction (tx) ->
        tx.executeSql 'CREATE TABLE IF NOT EXISTS history (artist, title, cover_url_medium, cover_url_large, last_played)'

    @clear: (cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DROP TABLE history'
            cb?()

    @addTrack: (track, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DELETE FROM history WHERE artist = ? and title = ?', [track.artist, track.title]
            tx.executeSql 'INSERT INTO history (artist, title, cover_url_medium, cover_url_large, last_played) VALUES (?, ?, ?, ?, ?)', [track.artist, track.title, track.cover_url_medium, track.cover_url_large, getUnixTimestamp()]
            cb?()

    @getTracks: (cb) ->
        db.transaction (tx) ->
            tx.executeSql 'SELECT * FROM history ORDER BY last_played DESC LIMIT 150', [], (tx, results) ->
                tracks = []
                i = 0
                while i < results.rows.length
                    tracks.push results.rows.item(i)
                    i++
                cb? tracks

    @countTracks: (cb) ->
        db.transaction (tx) ->
            tx.executeSql 'SELECT COUNT(*) AS cnt FROM history', [], (tx, results) ->
                cb? results.rows.item(0).cnt


#####################################################################

hiphop.service "Playlists", ->

    db.transaction (tx) ->
        tx.executeSql 'CREATE TABLE IF NOT EXISTS playlists (name, created)'

    @clear = (cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DROP TABLE playlist_tracks'
            tx.executeSql 'DROP TABLE playlists'
            cb?()

    @addTrack: (track, playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'CREATE TABLE IF NOT EXISTS playlist_tracks (artist, title, cover_url_medium, cover_url_large, playlist, added)'
            tx.executeSql 'DELETE FROM playlist_tracks WHERE artist = ? and title = ? and playlist = ?', [track.artist, track.title, playlist]
            tx.executeSql 'INSERT INTO playlist_tracks (artist, title, cover_url_medium, cover_url_large, playlist, added) VALUES (?, ?, ?, ?, ?, ?)', [track.artist, track.title, track.cover_url_medium, track.cover_url_large, playlist, getUnixTimestamp()]
            cb?()

    @removeTrack: (track, playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DELETE FROM playlist_tracks WHERE artist = ? and title = ? and playlist = ?', [track.artist, track.title, playlist]
            cb?()

    @create: (playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DELETE FROM playlists WHERE name = ?', [playlist]
            tx.executeSql 'INSERT INTO playlists (name, created) VALUES (?, ?)', [playlist, getUnixTimestamp()]
            cb?()

    @rename: (playlist, new_playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'UPDATE playlists SET name = ? WHERE name = ?', [new_playlist, playlist]
            tx.executeSql 'UPDATE playlist_tracks SET playlist = ? WHERE playlist = ?', [new_playlist, playlist]
            cb?()

    @delete: (playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'DELETE FROM playlists WHERE name = ?', [playlist]
            tx.executeSql 'DELETE FROM playlist_tracks WHERE playlist = ?', [playlist]
            cb?()

    @getAll = (cb) ->
        db.transaction (tx) ->
            tx.executeSql 'SELECT * FROM playlists ORDER BY created ASC', [], (tx, results) ->
                playlists = []
                i = 0
                while i < results.rows.length
                    playlists.push results.rows.item(i)
                    i++
                cb? playlists

    @getTracksFromPlaylist = (playlist, cb) ->
        db.transaction (tx) ->
            tx.executeSql 'SELECT * FROM playlist_tracks WHERE playlist = ? ORDER BY added DESC', [playlist], (tx, results) ->
                tracks = []
                i = 0
                while i < results.rows.length
                    tracks.push results.rows.item(i)
                    i++
                cb? tracks
