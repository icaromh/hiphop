# for node-webkit builds only
try
    # Load native UI library
    gui = require('nw.gui')

    # Get window object (!= $(window))
    win = gui.Window.get()

    # Debug flag
    isDebug = gui.App.argv.indexOf('--debug') > -1

    # Set the app title (for Windows mostly)
    win.title = gui.App.manifest.name + ' ' + gui.App.manifest.version

    # Focus the window when the app opens
    win.focus()

    # Cancel all new windows (Middle clicks / New Tab)
    win.on "new-win-policy", (frame, url, policy) ->
        policy.ignore()

    # Prevent dragging/dropping files into/outside the window
    preventDefault = (e) ->
        e.preventDefault()
    window.addEventListener "dragover", preventDefault, false
    window.addEventListener "drop", preventDefault, false
    window.addEventListener "dragstart", preventDefault, false

    if isDebug
        menu = new gui.Menu(type: 'menubar')

        menu.append new gui.MenuItem(
            label: 'Tools'
            submenu: new gui.Menu()
        )

        menu.items[0].submenu.append new gui.MenuItem(
            label: 'Developer Tools'
            click: ->
                win.showDevTools()
        )

        menu.items[0].submenu.append new gui.MenuItem(
            label: "Reload ignoring cache"
            click: ->
                win.reloadIgnoringCache()
        )

        win.menu = menu


#####################################################################
$ ->
    # Resize sidebar and tracklist heights when window is being resized - should be removed later
    $(window).resize(->
        $('#main #sidebar-container, #tracklist-container').height($(window).height() - ($('#header').outerHeight() + $('#player-container').outerHeight() + 20))
    ).resize()

    $('#search-input').focus()

#####################################################################

hiphop = angular.module "hiphop", []
