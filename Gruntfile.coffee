module.exports = (grunt) ->
    buildPlatforms = parseBuildPlatforms(grunt.option('platforms'))
    appVersion = getAppVersion(grunt)


    grunt.initConfig
        coffee:
            glob_to_multiple:
                expand: true
                flatten: true
                cwd: 'coffee'
                src: ['app/*.coffee']
                dest: 'app/js'
                ext: '.js'
            old:
                options:
                    bare: true
                files:
                    'app/js/app.js': ['app/coffee/-*.coffee', 'app/coffee/app.coffee', 'app/coffee/_*.coffee']

        compass:
            dist:
                options:
                    relativeAssets: true
                    sassDir: 'app/sass'
                    cssDir: 'app/css'
                files:
                    'app/css/app.css': 'app/sass/app.sass'

        shell:
            runnw:
                command: ->
                    if buildPlatforms.mac
                        return 'build/cache/mac/<%= nodewebkit.options.version %>/node-webkit.app/Contents/MacOS/node-webkit . --debug'
                    if buildPlatforms.win
                        return '"build/cache/win/<%= nodewebkit.options.version %>/nw.exe" . --debug'
                    if buildPlatforms.linux32
                        return '"build/cache/linux32/<%= nodewebkit.options.version %>/nw" . --debug'
                    if buildPlatforms.linux64
                        return '"build/cache/linux64/<%= nodewebkit.options.version %>/nw" . --debug'
            create_dmg:
                command: './dist/mac/yoursway-create-dmg/create-dmg --volname "HipHop ' + appVersion + '" --background ./dist/mac/background.png --window-size 480 540 --icon-size 128 --app-drop-link 240 370 --icon "HipHop" 240 110 ./build/releases/HipHop/mac/HipHop-' + appVersion + '.dmg ./build/releases/HipHop/mac/'

        nodewebkit:
            options:
                version: '0.9.2'
                build_dir: './build'
                mac_icns: './images/icon.icns'
                mac: buildPlatforms.mac
                win: buildPlatforms.win
                linux32: buildPlatforms.linux32
                linux64: buildPlatforms.linux64
            src: [
                './app/css/**',
                './app/images/**',
                './app/js/**',
                './app/index.html',
                './package.json',
                './node_modules/**',
                '!./node_modules/grunt*/**',
                '!./node_modules/bower/**'
            ]

        compress:
            linux32:
                options:
                    mode: 'tgz'
                    archive: 'build/releases/HipHop/linux32/HipHop-' + appVersion + '.tgz'
                expand: true
                cwd: 'build/releases/HipHop/linux32/'
                src: '**'
            linux64:
                options:
                    mode: 'tgz'
                    archive: 'build/releases/HipHop/linux64/HipHop-' + appVersion + '.tgz'
                expand: true
                cwd: 'build/releases/HipHop/linux64/'
                src: '**'

        clean: ['build/**']

    
    grunt.loadNpmTasks 'grunt-contrib-clean'
    grunt.loadNpmTasks 'grunt-contrib-coffee'
    grunt.loadNpmTasks 'grunt-contrib-compass'
    grunt.loadNpmTasks 'grunt-shell'
    grunt.loadNpmTasks 'grunt-node-webkit-builder'
    grunt.loadNpmTasks 'grunt-contrib-compress'
    
    grunt.registerTask 'default', ['compass', 'coffee:old']
    grunt.registerTask 'run', ['default', 'shell:runnw']
    grunt.registerTask 'build', ['default', 'clean', 'nodewebkit', 'shell:create_dmg', 'compress']



parseBuildPlatforms = (argumentPlatform) ->
    
    # this will make it build no platform when the platform option is specified
    # without a value which makes argumentPlatform into a boolean
    inputPlatforms = argumentPlatform or process.platform + ';' + process.arch
    
    # Do some scrubbing to make it easier to match in the regexes bellow
    inputPlatforms = inputPlatforms.replace('darwin', 'mac')
    inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, '')
    buildAll = /^all$/.test(inputPlatforms)
    buildPlatforms =
        mac: /mac/.test(inputPlatforms) or buildAll
        win: /win/.test(inputPlatforms) or buildAll
        linux32: /linux32/.test(inputPlatforms) or buildAll
        linux64: /linux64/.test(inputPlatforms) or buildAll

    return buildPlatforms

getAppVersion = (grunt) ->
    packageJson = grunt.file.readJSON('package.json')
    return packageJson.version
