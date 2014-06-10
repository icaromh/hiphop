(function() {
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

}).call(this);
