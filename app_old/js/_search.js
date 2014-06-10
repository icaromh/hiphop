(function() {
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

}).call(this);
