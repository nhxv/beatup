class Game {
    constructor(songId, songList) {
        this.songId = songId;

        this.frameCount = 0;
        this.fps = 0;

        this.firstAvailNote = 0;
        this.lastNoteResult = 0;
        this.lastNoteTime = 0;
        this.lastTime = 0;

        this.pgcbm = [0, 0, 0, 0, 0];
        this.score = 0;
        this.perx = 0;
        this.highestCombo = 0;
        this.combo = 0;
        this.xmax = 0;
        this.chance = 0;

        this.showBg = 0;
        this.showPerfArrows = false;
        this.showHelp = false;

        this.numSelect = 0;
        this.animations = [];
        this.players = [];

        this.autoplay = false;
        this.alwaysCorrect = false;

        this.noteScores = [520, 260, 130, 26, 0];
        this.spaceScores = [2000, 1500, 1000, 500, 0];
        this.yellowBeatupRatio = 1.2;
        this.blueBeatupRatio = 1.55;

        this.menu = new Menu();

        // load sound, renderer
        this.sound = new Sound(songList, songId, this.menu); // load sound & notes after selecting song
        this.renderer = new Renderer(this.sound, this.menu);
        this.renderer.loadSprites(); // render the visuals
        this.input = null;
    }

    onFinishLoading(game) {
        this.input = new Input(game, renderer);
       this.gl(); 
    }

    gl() {this.loop();}

    loop() {
        // this.update();
        this.draw();
        if (this.sound.context !== null) {
            window.requestAnimationFrame(gl); // might be wrong here
        }
    }

    draw() {
        this.renderer.clear();

        if (this.showBg !== 0) {
            this.renderer.drawSprite(this.sprites.background[this.showBg - 1]);
        }

        // if (typeof this.sound.soundStartTime === 'undefined' || this.sound.soundStartTime === null) {
        //     bujs.showLoadingMsg("Touch/click to start sound"); // TODO: menu
        // }

        // fps
        var fps = this.calcFps();
        var posFps = {x: 20, y: 10};
        this.renderer.writeText(posFps, fps.toFixed(1) + ' fps');

        // write the selected song name
        this.renderer.writeText({x: 20, y: this.renderer.config.canvasHeight - 5 - 16}, this.sound.song.name + " - " + this.sound.song.singer + " (" + Math.round(this.sound.song.bpm) + " bpm)");

        // lanes, landings, icons, logo, space frame...
        this.renderer.drawFixedContent(this.combo);
        this.renderer.drawBeatupText(this.combo);

        if (this.showPerfArrows) {
            this.renderer.drawPerfectArrows();
        }
        this.processAnimations();
        this.renderer.drawNotes(this.sound.getCurrTime());
        this.renderer.drawBigNoteResultText();
        this.checkMiss();
        this.renderer.drawTable();
        // this.renderer.drawTouchArrows(); remove this method by toggle later
    }

    checkMiss() {
        var currTime = this.sound.getCurrTime();
        var maxNotes = Math.min(this.firstAvailNote + this.renderer.consts.numNotes, this.sound.song.notes.length);
        if (this.autoplay) {
            if (this.firstAvailNote >= 0) {
                // still have notes
                for (var i = this.firstAvailNote; i < maxNotes; i++) {
                    if (this.sound.song.notes[i].t < currTime + 5) {
                        this.input.keyDown(this.sound.song.notes[i].n);
                        //processKeyboard(true, 0, -1);

                        break;
                    }
                }
            }
        }
        else {
            // check for misses
            if (this.firstAvailNote >= 0) {
                // still have notes
                for (i = this.firstAvailNote; i < maxNotes; i++) {
                    if (currTime > this.sound.song.notes[i].t + this.sound.tickTime * 2) {
                        this.sound.song.notes[i].pressed = true;
                        this.lastNoteResult = 4;		// 'missed' for the animation
                        this.lastNoteTime = currTime;
                        this.sound.playSound(this.sound.sounds.miss);
                        this.updateScore(this.sound.song.notes[i].n, 4);
                    }
                }
            }
    
            // recalculate first availnote
            this.firstAvailNote = -1;
            for (var j = 0; j < this.sound.song.notes.length; j++) {
                if (!this.sound.song.notes[j].pressed) {
                    this.firstAvailNote = j;
                    break;
                }
            }
        }
    }

    calcFps() {
        var currTime = this.sound.getCurrTime();
        this.frameCount++;
        if (this.lastTime === 0) {
            this.lastTime = currTime;
        }
        if (currTime > this.lastTime + 1000) {
            this.fps = this.frameCount / (currTime - this.lastTime) * 1000;
            this.lastTime = currTime;
            this.frameCount = 0;
        }
        return this.fps;
    }

    processNoteResult() {
        var noteResult = -1;
        if (keyMap !== 0 || this.autoplay) {
            var currTime = this.sound.getCurrTime();
            for (var i = this.firstAvailNote; i < this.firstAvailNote + 4; i++) {
                if (this.firstAvailNote >= this.sound.song.notes.length || this.firstAvailNote < 0) break;
                var note = this.sound.song.notes[i];
                var noteKey = note.n;
                var keyTime = currTime - note.t;

                if (noteKey === keyMap || this.autoplay || this.alwaysCorrect) {
                    noteResult = this.getKeyResult(keyTime);
                    if (noteKey === 5) {
                        this.animations.push(new Animation(this.renderer, currTime, this.renderer.consts.arrowAnimationTime, this.renderer.sprites.spaceFrameExplode[0],
                            (this.renderer.config.canvasWidth - this.renderer.sprites.spaceFrameExplode[0].width) / 2,
                            this.renderer.config.canvasHeight - this.renderer.consts.spaceMarginBottom - this.renderer.sprites.spaceFrameExplode[0].height / 2));
                    }
                    // not an "outside" key? a correct key?
                    if (noteResult >= 0 || this.autoplay) {
                        switch (noteKey) {
                            // TODO: add Animation class
                            case 5 : this.animations.push(new Animation(this.renderer, currTime, this.renderer.consts.arrowAnimationTime, this.renderer.sprites.spaceExplode[0],
                                (this.renderer.config.canvasWidth - this.renderer.sprites.spaceExplode[0].width) / 2,
                                this.renderer.config.canvasHeight - this.renderer.consts.spaceMarginBottom - this.renderer.sprites.spaceExplode[0].height / 2));
                                break;
                        }
                        if (noteResult !== 4) {
                            if (noteKey !== 5) {
                                var leftLane = true;
                                var yOfs = 0;

                                // appropriate image surface, y offset
                                switch (noteKey) {
                                    case 7 : yOfs = this.renderer.consts.lane1Yofs; break;
                                    case 4 : yOfs = this.renderer.consts.lane2Yofs; break;
                                    case 1 : yOfs = this.renderer.consts.lane3Yofs; break;
                                    case 9 : leftLane = false; yOfs = this.renderer.consts.lane1Yofs; break;
                                    case 6 : leftLane = false; yOfs = this.renderer.consts.lane2Yofs; break;
                                    case 3 : leftLane = false; yOfs = this.renderer.consts.lane3Yofs; break;
                                }
                                yOfs = this.renderer.consts.laneYStart + yOfs + this.renderer.sprites.a1[0].height / 2;
                                if (leftLane)
                                    this.animations.push(new Animation(this.renderer, currTime, this.renderer.consts.arrowAnimationTime, this.renderer.sprites.arrowExplode[0],
                                        this.renderer.consts.tableWidth - this.renderer.consts.tableWidthTrans + this.renderer.consts.laneWidth - this.renderer.consts.chanceDist + this.renderer.consts.arrowLaneOfs + this.renderer.sprites.a1[0].width / 2 - this.renderer.sprites.arrowExplode[0].width / 2,
                                        yOfs - this.renderer.sprites.arrowExplode[0].width / 2));
                                else
                                    this.animations.push(new Animation(this.renderer, currTime, this.renderer.consts.arrowAnimationTime, this.renderer.sprites.arrowExplode[0],
                                        this.renderer.config.canvasWidth - (this.renderer.consts.tableWidth - this.renderer.consts.tableWidthTrans + this.renderer.consts.laneWidth - this.renderer.consts.chanceDist + this.renderer.consts.arrowLaneOfs + this.renderer.sprites.a1[0].width / 2) - this.renderer.sprites.arrowExplode[0].width / 2,
                                        yOfs - this.renderer.sprites.arrowExplode[0].height / 2));
                            }
                        }

                        // sound
                        if (noteKey === 5 && noteResult !== 4) this.sound.playSound(this.sound.sounds.space);
                        else if (noteResult === 0) this.sound.playSound(this.sound.sounds.perfect);  // arrow per?
                        else if (noteResult === 4) this.sound.playSound(this.sound.sounds.miss);     // arrow miss?
                        else this.sound.playSound(this.sound.sounds.normal);                         // arrow normal

                        // update pgcbm, score, combo, perx... and send to server if it's a space
                        this.updateScore(noteKey, noteResult);

                        // mark it as pressed
                        note.pressed = true;

                        // recalculate firstavailnote
                        this.firstAvailNote = -1;
                        for (var j = 0; j < this.sound.song.notes.length; j++) {
                            if (typeof this.sound.song.notes[j].pressed === "undefined" || !this.sound.song.notes[j].pressed) {
                                this.firstAvailNote = j;
                                break;
                            }
                        }

                        // save note result for p/g/c/b/m animation
                        this.lastNoteResult = noteResult;
                        this.lastNoteTime = currTime;

                        // that's enough. found a note. break.
                        break;
                    }
                }
            }
        }
    }

    getKeyResult(diff) {
        if (this.autoplay) return 0;
        var ratio = 4;
        var tickTime = this.sound.tickTime;
        // initial value 80
        if (diff > 60 * (tickTime * ratio) / 100 || diff < -tickTime * ratio) return -1;	// don't process
        if (diff < 0) {
            diff = -diff;
        }
        // initial values: 5 15 27 40, change difficulty here
        if (diff <= 5 * (tickTime * ratio) / 100) return 0;		// p
        if (diff <= 15 * (tickTime * ratio) / 100) return 1;	// g
        if (diff <= 27 * (tickTime * ratio) / 100) return 2;	// c
        if (diff <= 40 * (tickTime * ratio) / 100) return 3;	// b
        return 4;												// m
    }

    /**
    * Process all on-going animations
    */
    processAnimations() {
        for (var i = 0; i < this.animations.length; i++) {
            this.animations[i].process(this.sound.getCurrTime());
        }
        // delete all finished animations
        for (i = this.animations.length - 1; i >= 0; i--) {
            if (this.animations[i].startTime < 0) {
                this.animations.splice(i, 1);
            }
        }
    }

    updateScore() {
        var noteScore = 0;
        if (key === 5) {
            if (keyResult >= 0) {
                noteScore = this.spaceScores[keyResult];
            }
        }
        else {
            if (keyResult >= 0) {
                noteScore = this.noteScores[keyResult];
            }
        }

        // ratios with BEATUP
        if (this.combo >= 400) noteScore *= this.blueBeatupRatio;
        else if (this.combo >= 100) noteScore *= this.yellowBeatupRatio;
        this.score += noteScore;

        // result : pgcbm
        this.pgcbm[keyResult]++;

        // update combo
        //var prevCombo = this.combo;
        if (keyResult !== 4 && keyResult >= 0) {
            if (keyResult !== 3) this.combo++;
        } else {
            if (keyResult === 4) {
                if (this.combo > 99 || this.combo < 11) {
                    this.combo = 0; 
                } else if (this.combo > 80) {
                    this.combo = 80;
                } else if (this.combo > 60) {
                    this.combo = 60;
                } else if (this.combo > 40) {
                    this.combo = 40;
                } else if (this.combo > 20) {
                    this.combo = 20;
                } else {
                    this.combo = 10;
                }
            } 
        } 

        // update highest combo
        if (this.highestCombo < this.combo) this.highestCombo = this.combo;

        // update perx
        if (this.lastNoteResult === 0 && keyResult === 0) {		// still per?
            this.perx++;
        }
        else this.perx = 0;

        if (this.perx > this.xmax){
            this.xmax = this.perx;
        }

        // TODO: send to server
    }
}