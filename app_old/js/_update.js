(function() {
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

}).call(this);
