(function() {
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

}).call(this);
