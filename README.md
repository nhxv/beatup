 ### Game flow
 
 main

    state: when user load website
    - create BUJS object and start app
    - setup menu

 menu

    state: before user select song
    - create in-game canvas dimension to show loading message
    - show loading message (e.g. "Loading extra UI components...")
    - load song list from "notes/list.json"
    - show song list modal
    - load menu input system (Tab, F1 shortcut)

    state: after user select song
    - store selected song in session
    - create Game object, give it note (e.g. "notes/Sea.json") of selected song
    - hide modal

game

    state: before all components finish loading
    - create music object, load sound system
    - create renderer object, load rendering system
    - create in-game input object, load input system

music

    state: while loading music
    - load beatup sound e.g. "sound/perfect.wav"
    - load song note e.g. "notes/Sea.json"
    - load music file e.g. "music/Sea.json"
    - create event listener to stop music when menu is open in-game
    
    state: when start music
    - notify game object after finish loading
    - get music start time

renderer

    state: while loading render system
    - create in-game canvas dimension
    - load images for table, space frame, etc

    state: when all images are loaded
    - notify game object after finish loading

input

    state: when loading
    - setup event listeners for in-game key press

    state: when in-game
    - when key press, push animation to game object's animation array

game

    state: after all components finish loading
    - update _this context
    - reset / clear in-game graphic with renderer object
    - renderer object draw background if it exists (default black, no draw)
    - renderer object draw fps, song info, logo, b-e-a-t-u-p space text, scoreboard
    - process animation (delete completed animations, load on-going animation)
    - renderer object draw notes
    - check miss
    - renderer draw table (draw last)

menu

    state: open while in-game    
    - load song list modal

game
    state: stop while in-game
    - stop game loop, draw final frame    
 
