// import {Menu} from 'menu';

class Menu {
    constructor() {
        this.loadedComponentCount = 0; // want this to be 2
        this.game = null;
    }

    display() {
        this.createCanvas();

        $.get('template/modal.html', function (html) {
            $('#template-container').html(html);
            this.loadSongList();
        });
    }

    createCanvas() {
        var canvas = document.querySelector('#cvs');
        canvas.width = 980;
        canvas.height = 400;
    }

    loadSongList() {
        fetch('notes/list.json').then(list => {
            this.showSongList(list);
        }).catch(err => console.log(err));
    }

    loadTemplate(id) {
        var t = document.querySelector(id);
        console.log(document.querySelector("#songlist-template"));
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    }

    showSongList(songList) {
        this.showLoadingMsg("");
        this.loadTemplate("#songlist-template");
        var songlistModal = $('#songlist-modal');
        var songlistContainer = songlistModal.find("#songlist-container");

        var randomLi = document.createElement("li");
        randomLi.setAttribute("class", "songListItem");
        var songFileNames = Object.keys(this.songList);
        randomLi.setAttribute("songid", songFileNames[Math.floor(Math.random() * songFileNames.length)]);
        randomLi.innerText = "Random (Normal)";
        randomLi.onclick = this.chooseSong();
        songlistContainer.append(randomLi);
        for (var id of songList) {
            // id is json filename
            var song = this.songList[id];
            var li = document.createElement("li");
            li.setAttribute("class", "songListItem");
            li.setAttribute("songid", id);
            li.innerText = song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
            li.onclick = this.chooseSong(id, songList);
        }
        songlistModal.modal("show");
    }

    chooseSong(id) {
        // TODO: hide modal
        this.game = new Game(id, songList); // initialize game loading
        $('#songlist-modal').modal("hide");
    }

    closeModal(modal) {
        // get modal
        var modal = modal;
        // change state like in hidden modal
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('style', 'display: none');
        // get modal backdrop
        var modalBackdrops = document.getElementsByClassName('modal-backdrop');
        // remove opened modal backdrop
        document.body.removeChild(modalBackdrops[0]);
    }

    showLoadingMsg(msg) {
        var canvas = document.getElementById("cvs");
        var ctx = canvas.getContext("2d");
        var width = canvas.width;
        var height = canvas.height;
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, width, height);
        ctx.font = "12px Segoe UI";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(msg, width / 2, height / 2);
    }

    set loadedComponentCount(isLoaded) {
        if (isLoaded) this.loadedComponentCount++;
        if (this.loadedComponentCount == 2) this.game.onFinishLoading();
    }
}

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
        this.sound = new Sound(songList[songId], this.menu); // load sound & notes after selecting song
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

class Renderer {
    constructor(sound, menu) {
        this.menu = menu;
        this.images = [];
        this.config = this.setupConfig();
        this.sprites = this.setupSpriteInfo();
        this.spriteConsts = this.setupSpriteConsts();
        this.ctx = null; // initialize when loadSprites
        this.sound = sound;
    }

    setupConfig() {
        return {
            imagePath          : "img/",
            scaleRatio         : 1,
            canvasWidth        : 980,
            canvasHeight       : 400
        };
    }

    setupSpriteInfo() {
        return {
            background: ["bg/lafesta.jpg"],
            dnxpLogo  : ["dnxp.png"],
            laneDown  : ["lane7.png", "lane4.png", "lane1.png",
                         "lane9.png", "lane6.png", "lane3.png"],
            beatDown  : ["beatdown7.png", "beatdown4.png", "beatdown1.png",
                          "beatdown9.png", "beatdown6.png", "beatdown3.png"],
            tableL    : ["tableL.png"],
            laneL     : ["laneL.png"],
            landingL  : ["landingL.png"],
            tableR    : ["tableR.png"],
            laneR     : ["laneR.png"],
            landingR  : ["landingR.png"],
            spaceFrame: ["spaceframe.png"],
            spaceFrameCursor  : ["spaceframecursor.png"],
            spaceFrameExplode : ["spaceframeexplode.png"],
            spaceExplode      : ["spaceframespaceexplode.png"],
            arrowExplode      : ["arrowexplode.png"],
            a7        : ["a71.png", "a72.png", "a73.png", "a74.png", "a75.png", "a76.png", "a77.png", "a78.png"],
            a4        : ["a41.png", "a42.png", "a43.png", "a44.png", "a45.png", "a46.png", "a47.png", "a48.png"],
            a1        : ["a11.png", "a12.png", "a13.png", "a14.png", "a15.png", "a16.png", "a17.png", "a18.png"],
            a9        : ["a91.png", "a92.png", "a93.png", "a94.png", "a95.png", "a96.png", "a97.png", "a98.png"],
            a6        : ["a61.png", "a62.png", "a63.png", "a64.png", "a65.png", "a66.png", "a67.png", "a68.png"],
            a3        : ["a31.png", "a32.png", "a33.png", "a34.png", "a35.png", "a36.png", "a37.png", "a38.png"],
            spaceFrameLetters             : ["spaceframeletterb.png", "spaceframelettere.png", "spaceframelettera.png",
                                            "spaceframelettert.png", "spaceframeletteru.png", "spaceframeletterp.png"],
            spaceFrameLetterGlowBlue      : ["spaceframeletterglowblue.png"],
            spaceFrameLetterGlowYellow    : ["spaceframeletterglowyellow.png"],
            spaceFrameGlowBlue            : ["spaceframeglowblue.png"],
            spaceFrameGlowYellow         : ["spaceframeglowyellow.png"],
            blueUp        : ["up1.png"],
            yellowUp      : ["up.png"],
            noteResults   : ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"],
            delIcons      : ["del1.png", "del2.png"],
            chanceIcons      : ["chance1.png", "chance2.png", "chance3.png", "chance4.png"],
            c7        : ["c71.png"],
            c4        : ["c41.png"],
            c1        : ["c11.png"],
            c9        : ["c91.png"],
            c6        : ["c61.png"],
            c3        : ["c31.png"]
        };
    }

    /**
     * Some special constants for drawing
     */
    setupSpriteConsts() {
        return {
            chanceDist         : 90, // initial value 80
            baseResultLine     : 150,
            arrowAnimationTime : 135, // initial value 135
            laneYStart         : this.config.canvasHeight - 350,
            lane1Yofs          : 3,
            lane2Yofs          : 3+64,        // Renderer.spritePos.lane1Yofs + 64,
            lane3Yofs          : 3+64+64,     // Renderer.spritePos.lane2Yofs + 64,
            lane2Xofs          : 5,
            laneWidth          : 256,
            tableWidth         : 123,
            tableWidthTrans    : 3,
            arrowLaneOfs       : 1,
            spaceMarginBottom  : 90, // initial value 80
            beatupLetterDist   : 46,
            dnxpLogoMargin     : 20,
            textHeight         : 20,
            textMarginTop      : 64,
            numNotes           : 14,
            playerListUp       : 40,
            playerListName     : 200,
            playerListScore    : 60,
            playerListYofs     : 80,
            scoreTableXofs     : (this.config.canvasWidth - 600) / 2,
            fontSize           : 11,
            helpYofs           : 150
        }
    }

    loadSprites() {
        async.eachOf(this.sprites, this.loadSpritesForType,
            function (err) {
                if (err) {
                    console.log("Meh. Error", err);
                }
                else {
                    console.log("Finished loading sprites.");
                    this.initSpritePos();
                    // resize canvas
                    var canvas = document.querySelector("#cvs");
                    this.ctx = canvas.getContext("2d");
                    var width = this.config.canvasWidth * this.config.scaleRatio;
                    var height = this.config.canvasHeight * this.config.scaleRatio;
                    canvas.width = width;
                    canvas.height = height;

                    this.menu.loadedComponentCount(true);
                }
            });
    }

    /**
    * Load a set of images for a type, e.g.
    * { noteResults   : ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"] },
    */
    loadSpritesForType(spriteInfo, key, callback) {
        async.each(spriteInfo, function (fileName, urlCallback) {
            if (typeof fileName !== "string") return;
            // console.log("sprite", key, "fetching ", fileName);
            var img = new Image();
            img.onload = function () {
                if (typeof this.sprites[key] === "undefined") {
                    this.sprites[key] = [];
                }
                this.sprites[key][spriteInfo.indexOf(fileName)] = img;
                urlCallback();
            };
            img.src = this.config.imagePath + fileName;
        },
        function (err) {
            // loaded all images for one spriteInfo ok.
            if (err) {
                console.error("Meh. Error", err);
            }
            else {
                console.log("Finished fetching images for object", key);
                callback();
            }
        });
    }

    /**
    * Clear the whole canvas
    */
    clear() {
        this.ctx.fillStyle = "black";
        this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
    }

    /**
    * Write scoreboard and song info on canvas
    */
    writeText(pos, text, font, size, color) {
        if (!size) size = "12px";
        if (!font) font = "Segoe UI";
        if (!color) color = "white";
        this.ctx.font = size + " " + font;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "left";
        this.ctx.fillText(text, pos.x, pos.y);
    }


    /**
     * Utility to draw a specific sprite
     */
    drawSprite(sprite, scale) {
        if (typeof sprite === "undefined" || sprite === null) {
            console.log("meh.");
        }
        if (typeof sprite !== "undefined" && sprite !== null && typeof sprite.pos !== "undefined") {
            if (typeof scale === "undefined") scale = 1;
            this.ctx.drawImage(sprite, sprite.pos.x, sprite.pos.y, sprite.width * scale, sprite.height * scale);
        }
    }

    /**
     * Draw fixed contents, such as lanes, landings, logo...
     */
    drawFixedContent() {
        // lane, landing, logo
        this.drawSprite(this.sprites.laneL[0]);
        this.drawSprite(this.sprites.laneR[0]);
        this.drawSprite(this.sprites.landingL[0]);
        this.drawSprite(this.sprites.landingR[0]);
        this.drawSprite(this.sprites.dnxpLogo[0]);
        this.drawSpaceFrame(combo);
        this.drawResults();
    }

    drawTouchArrow() {
        this.drawSprite(this.sprites.c7[0]);
        this.drawSprite(this.sprites.c9[0]);
        this.drawSprite(this.sprites.c4[0]);
        this.drawSprite(this.sprites.c6[0]);
        this.drawSprite(this.sprites.c1[0]);
        this.drawSprite(this.sprites.c3[0]);
    }

    drawResults() {
        var x = (this.config.canvasWidth - 135) / 2;
        var y = (this.consts.laneYStart + this.consts.textMarginTop);
        this.writeText({x: x, y: y},
            'P/G/C/B/M: ' + bujs.game.pgcbm[0] + '/'
            + bujs.game.pgcbm[1] + '/' + bujs.game.pgcbm[2] + '/'
            + bujs.game.pgcbm[3] + '/' + bujs.game.pgcbm[4]);
        this.writeText({x: x, y: y + 16}, 'Score: ' + Math.round(bujs.game.score));
        this.writeText({x: x, y: y + 32}, 'Current Combo: ' + bujs.game.combo);
        this.writeText({x: x, y: y + 48}, 'Highest Combo: ' + bujs.game.highestCombo);
        var pgcbm = bujs.game.pgcbm,
            perpercent = 0;
        if (pgcbm[0] !== 0 || pgcbm[1] !== 0 ||
            pgcbm[2] !== 0 || pgcbm[3] !== 0 ||
            pgcbm[4] !== 0) {
            perpercent = (pgcbm[0] * 100) / (pgcbm[0] + pgcbm[1] + pgcbm[2] + pgcbm[3] + pgcbm[4]);
        }
        this.writeText({x: x, y: y + 64}, 'Per %: ' + perpercent.toFixed(2) + '%');
        this.writeText({x: x, y: y + 80}, 'Per Combo: ' + bujs.game.xmax);
    }

    drawSpaceFrame() {
        if (combo) {
            if (combo >= 100 && combo < 400) {
                this.drawSprite(this.sprites.spaceFrameGlowYellow[0]);
            }
            else if (combo >= 400) {
                this.drawSprite(this.sprites.spaceFrameGlowBlue[0]);
            }
        }
        this.drawSprite(this.sprites.spaceFrame[0]);
    }

    drawBeatupTextGlow() {
        // B-E-A-T-U-P glows
        var letterGlow1 = null;
        var letterGlow2 = null;
        var numGlow1 = 0;
        var numGlow2 = 0;

        // decide what to draw
        if (combo >= 400) {
            // all blue
            letterGlow1 = this.sprites.spaceFrameLetterGlowBlue;
            numGlow1 = 6;
        } else if (combo >= 100) {
            // some blue + some yellow
            letterGlow1 = this.sprites.spaceFrameLetterGlowBlue;
            letterGlow2 = this.sprites.spaceFrameLetterGlowYellow;
            numGlow1 = Math.floor((combo - 100) / 50);
            numGlow2 = 6 - numGlow1;
        } else {
            // some yellow
            letterGlow1 = this.sprites.spaceFrameLetterGlowYellow;
            if (combo >= 80) numGlow1 = 5;
            else if (combo >= 60) numGlow1 = 4;
            else if (combo >= 40) numGlow1 = 3;
            else if (combo >= 20) numGlow1 = 2;
            else if (combo >= 10) numGlow1 = 1;
        }

        // and draw them
        if (letterGlow1 != null) {
            for (var i = 0; i < numGlow1; i++) {
                // the glow
                this.setSpritePos(letterGlow1[0],
                    this.config.canvasWidth / 2 - this.consts.beatupLetterDist / 2 * (5 - i * 2) - this.sprites.spaceFrameLetterGlowBlue[0].width / 2,
                    this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameLetterGlowBlue[0].height / 2);
                this.drawSprite(letterGlow1[0]);

                // and its letter
                this.drawSprite(this.sprites.spaceFrameLetters[i]);
            }
        }
        if (letterGlow2 != null) {
            for (var i = numGlow1; i < numGlow1 + numGlow2; i++) {
                // the glow
                this.setSpritePos(letterGlow2[0],
                    this.config.canvasWidth / 2 - this.consts.beatupLetterDist / 2 * (5 - i * 2) - this.sprites.spaceFrameLetterGlowBlue[0].width / 2,
                    this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameLetterGlowBlue[0].height / 2);
                this.drawSprite(letterGlow2[0]);

                // and its letter
                this.drawSprite(this.sprites.spaceFrameLetters[i]);
            }
        }
    }

    drawTable() {
        this.drawSprite(this.sprites.tableL[0]);
        this.drawSprite(this.sprites.tableR[0]);
    }

    /**
     * Set sprite position
    */
    setSpritePos(img, posX, posY) {
        img.pos = {x: posX, y: posY};
    }

    /**
    * Define sprite position. These are fixed.
    */
    initSpritePos() {
        this.setSpritePos(this.sprites.dnxpLogo[0],
            this.config.canvasWidth - this.sprites.dnxpLogo[0].width - this.consts.dnxpLogoMargin,
            this.config.canvasHeight - this.sprites.dnxpLogo[0].height - this.consts.dnxpLogoMargin);
    
        this.setSpritePos(this.sprites.tableL[0],
            0,
            this.consts.laneYStart);
    
        this.setSpritePos(this.sprites.laneL[0],
            this.consts.tableWidth - this.consts.tableWidthTrans - this.consts.chanceDist,
            this.consts.laneYStart);
    
        this.setSpritePos(this.sprites.landingL[0],
            this.sprites.laneL[0].pos.x + this.consts.laneWidth,
            this.consts.laneYStart);
    
    
        this.setSpritePos(this.sprites.tableR[0],
            this.config.canvasWidth - this.consts.tableWidth,
            this.consts.laneYStart);
    
        this.setSpritePos(this.sprites.laneR[0],
            this.config.canvasWidth - this.consts.tableWidth + this.consts.tableWidthTrans - this.consts.laneWidth + this.consts.chanceDist,
            this.consts.laneYStart);
    
        this.setSpritePos(this.sprites.landingR[0],
            this.config.canvasWidth - this.consts.tableWidth + this.consts.tableWidthTrans - this.consts.laneWidth - this.sprites.landingR[0].width + this.consts.chanceDist,
            this.consts.laneYStart);
    
        this.setSpritePos(this.sprites.spaceFrame[0],
            (this.config.canvasWidth - this.sprites.spaceFrame[0].width) / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrame[0].height / 2);
    
        // del icons
        this.setSpritePos(this.sprites.delIcons[0], 
            this.config.canvasWidth/2 + this.sprites.spaceFrame[0].width/2, 
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.delIcons[0].height / 2);
    
        this.setSpritePos(this.sprites.delIcons[1],
            this.config.canvasWidth/2 + this.sprites.spaceFrame[0].width/2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.delIcons[1].height / 2);
    
        // chance icons
        this.setSpritePos(this.sprites.chanceIcons[0],
            this.config.canvasWidth/2 - this.sprites.spaceFrame[0].width/2 - this.sprites.chanceIcons[0].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[0].height / 2);
    
        this.setSpritePos(this.sprites.chanceIcons[1],
            this.config.canvasWidth/2 - this.sprites.spaceFrame[0].width/2 - this.sprites.chanceIcons[1].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[1].height / 2);
    
        this.setSpritePos(this.sprites.chanceIcons[2],
            this.config.canvasWidth/2 - this.sprites.spaceFrame[0].width/2 - this.sprites.chanceIcons[2].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[2].height / 2);
    
        this.setSpritePos(this.sprites.chanceIcons[3],
            this.config.canvasWidth/2 - this.sprites.spaceFrame[0].width/2 - this.sprites.chanceIcons[3].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[3].height / 2);
    
        // space glows
        this.setSpritePos(this.sprites.spaceFrameGlowBlue[0],
            (this.config.canvasWidth - this.sprites.spaceFrame[0].width) / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrame[0].height / 2);
    
        this.setSpritePos(this.sprites.spaceFrameGlowYellow[0],
            (this.config.canvasWidth - this.sprites.spaceFrame[0].width) / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrame[0].height / 2);
    
        // B-E-A-T-U-P letters
        for (var i = 0; i < 6; i++) {
            this.setSpritePos(this.sprites.spaceFrameLetters[i],
                this.config.canvasWidth / 2 - this.consts.beatupLetterDist / 2 * (5 - i * 2) - this.sprites.spaceFrameLetters[0].width / 2,
                this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameLetters[0].height / 2);
        }
        var leftX = 0;
        var rightX = this.config.canvasWidth - this.sprites.a7[0].width;
        this.setSpritePos(this.sprites.c7[0], leftX, this.consts.laneYStart + this.consts.lane1Yofs);
        this.setSpritePos(this.sprites.c9[0], rightX, this.consts.laneYStart + this.consts.lane1Yofs);
        this.setSpritePos(this.sprites.c4[0], leftX, this.consts.laneYStart + this.consts.lane2Yofs);
        this.setSpritePos(this.sprites.c6[0], rightX, this.consts.laneYStart + this.consts.lane2Yofs);
        this.setSpritePos(this.sprites.c1[0], leftX, this.consts.laneYStart + this.consts.lane3Yofs);
        this.setSpritePos(this.sprites.c3[0], rightX, this.consts.laneYStart + this.consts.lane3Yofs);
    }

    /**
    * Draw a single arrow on the lane/landing
    */
    drawArrow(arrowSprite, xOfs, yOfs, leftLane, noteTime) {
        var delta = 0; // initial value 0
        var x = 0;
        var y = this.consts.laneYStart + yOfs;
        var currTime = this.sound.getCurrTime();
        if (leftLane) {
            x = (xOfs + this.consts.tableWidth - this.consts.tableWidthTrans +
                this.consts.laneWidth - this.consts.chanceDist +
                this.consts.arrowLaneOfs) -
                (noteTime - currTime - delta) * 40.0 / this.sound.tickTime;
        }
        else {
            x = this.config.canvasWidth -
                (xOfs + this.consts.tableWidth - this.consts.tableWidthTrans +
                    this.consts.laneWidth - this.consts.chanceDist +
                    this.consts.arrowLaneOfs + arrowSprite.width) +
                (noteTime - currTime - delta) * 40.0 / this.sound.tickTime;
        }
    
        // skip out of visible areas
        if (x > this.config.canvasWidth - this.consts.tableWidth || x + arrowSprite.width < this.consts.tableWidth) {
            return;
        }
    
        this.setSpritePos(arrowSprite, x, y);
        this.drawSprite(arrowSprite);
    }

    /**
    * Draw arrows for perfect alignment
    */
    drawPerfectArrows() {
        var xOfs = 1;
        this.drawArrow(this.sprites.a7[0], xOfs, this.consts.lane1Yofs, true, this.sound.getCurrTime());
        this.drawArrow(this.sprites.a9[0], xOfs, this.consts.lane1Yofs, false, this.sound.getCurrTime());
        this.drawArrow(this.sprites.a4[0], xOfs + this.consts.lane2Xofs, this.consts.lane2Yofs, true, this.sound.getCurrTime());
        this.drawArrow(this.sprites.a6[0], xOfs + this.consts.lane2Xofs, this.consts.lane2Yofs, false, this.sound.getCurrTime());
        this.drawArrow(this.sprites.a1[0], xOfs, this.consts.lane3Yofs, true, this.sound.getCurrTime());
        this.drawArrow(this.sprites.a3[0], xOfs, this.consts.lane3Yofs, false, this.sound.getCurrTime());
    }

    drawNotes() {
        var lastAvailNote = Math.min(this.sound.firstAvailNote + this.consts.numNotes, this.sound.notes.length);
        if (this.sound.firstAvailNote >= 0) {
            var tickTime = this.sound.tickTime;
            for (var i = this.sound.firstAvailNote; i < lastAvailNote; i++) {
                var note = this.sound.songInfo.notes[i];
                var noteTime = note.t;
                var noteKey = note.n;

                // max note time for drawing
                var maxArrowAvailTime = currTime + tickTime * (this.consts.numNotes + 1);
                var maxSpaceAvailTime = currTime + tickTime * 8;
                if ((noteKey !== 5 && noteTime > maxArrowAvailTime) ||
                    (noteKey === 5 && noteTime > maxSpaceAvailTime)) break;


                // only draw unpressed notes
                if (!note.pressed) {
                    var imageIndex = 0;
                    var leftLane = true;
                    var xOfs = 0;
                    var yOfs = 0;
                    var arrowToDraw = null;

                    var timeDiff = currTime - noteTime;
                    if (timeDiff < 0){
                        timeDiff = -timeDiff;
                    }
                    imageIndex = Math.round(timeDiff / tickTime) % 4;
                    // appropriate image surface, y offset
                    // default
                    if (bujs.game.chance === 0) {
                        switch (noteKey) {
                            case 7 : arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                            case 4 : arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1 : arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                            case 9 : leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane1Yofs;  break;
                            case 6 : leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3 : leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                        }
                    }
                    // set chance number 1 : all mid lane
                    if (bujs.game.chance === 1) {
                        switch (noteKey) {
                            case 7 : arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 4 : arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1 : arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 9 : leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane2Yofs;  break;
                            case 6 : leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3 : leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                        }
                    }
                    // set chance number 2 : invert up/down
                    if (bujs.game.chance === 2) {
                        switch (noteKey) {
                            case 7 : arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                            case 4 : arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1 : arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                            case 9 : leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane3Yofs;  break;
                            case 6 : leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3 : leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                        }
                    }

                    // draw it!
                    if (arrowToDraw !== null) {
                        this.drawArrow(arrowToDraw, xOfs, yOfs, leftLane, noteTime);
                    }
                    else if (noteKey === 5) {
                        // a space?
                        var cursorLx = (this.config.canvasWidth - this.sprites.spaceFrameCursor[0].width) / 2 - (noteTime - currTime)/tickTime*31.0/2;
                        var cursorRx = (this.config.canvasWidth - this.sprites.spaceFrameCursor[0].width)/  2 + (noteTime - currTime)/tickTime*31.0/2;
                        var cursorY = this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameCursor[0].height / 2;
                        this.setSpritePos(this.sprites.spaceFrameCursor[0], cursorLx, cursorY);
                        this.drawSprite(this.sprites.spaceFrameCursor[0]);

                        this.setSpritePos(this.sprites.spaceFrameCursor[0], cursorRx, cursorY);
                        this.drawSprite(this.sprites.spaceFrameCursor[0]);
                    }
                }
            }
        }
    }

    drawBigNoteResultText() {
        if (this.sound.lastNoteTime > 0) {
            var diff = this.sound.getCurrTime() - this.sound.lastNoteTime;
            var noteResult = this.sprites.noteResults[this.sound.lastNoteResult];
    
            // result width / height
            var ratio = 1;
            if (diff < 50) ratio = 1 + (50 - diff) / 90;
    
            // draw it with ratio
            this.setSpritePos(noteResult, (this.config.canvasWidth - noteResult.width * ratio) / 2, (this.consts.baseResultLine - noteResult.height * ratio) / 2);
            this.drawSprite(noteResult, ratio);
    
            if (diff > 200) {
                this.sound.lastNoteResult = 0;
                this.sound.lastNoteTime = 0;
            }
        }
    }
}

class Sound {
    constructor(songInfo, menu) {
        this.menu = menu;
        this.song = new Song(
            songInfo.ogg,
            songInfo.singer,
            songInfo.name,
            songInfo.slkauthor,
            songInfo.bpm
            );

        this.sounds = {
            perfect: "perfect.wav",
            normal : "normal.wav",
            miss   : "miss.wav",
            space  : "space.wav"
        };

        this.tickTime = 0;
        this.musicStartTime = 0;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
    
        // from async.js lib
        async.eachOf(this.sounds, function (sound, index, callback) {
            // TODO: maybe change to fetch?
            var request = new XMLHttpRequest();
            request.open('GET', "sound/" + sound, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                this.context.decodeAudioData(request.response, function (buffer) {
                    console.log("Loaded sound", sound);
                    this.sounds[index] = buffer;
                }, function (error) {
                    console.error("Error decoding audio data", error);
                });
                callback();
            };
            request.send();
        });
        this.parseNotes("notes/" + songId + ".json");
    }

    parseNotes(url) {
        fetch(url).then(response => {
            this.song.notes = response;
            this.tickTime = 1000 * 60.0 / (this.song.bpm * 4);
            this.convertTickToMs();
            this.loadBackgroundMusic('music/' + this.song.ogg);
        }).catch(err => console.log(err));
    }

    convertTickToMs() {
        for (var i = 0; i < this.song.notes.length; i++) {
            this.song.notes[i].t = this.song.notes[i].t * this.tickTime; // t: json property
        }
    }

    loadBackgroundMusic(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            this.context.decodeAudioData(request.response, function (buffer) {
                this.musicStartTime = this.context.currentTime;
                this.playSound(buffer);
                this.menu.loadedComponentCount(true);
            },
            function(error) {
                console.log("Error decoding audio data", error);
            });
        };

        // // TODO: convert to fetch
        // fetch(url).then(response => {
        //     this.context.decodeAudioData(response, buffer => {
        //         this.playSound(buffer);
        //         // TODO: count music time
        //     }, error => console.log(error));
        // }).catch(err => console.log(err));
    }

    loadSound(buffer) {
        var source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        return source;
    }

    playSound(buffer) {
        this.loadSound(buffer).start(0);
    }

    // to display time
    getCurrentTime() { 
        return (this.context.currentTime - this.musicStartTime) * 1000; 
    } 
    // interesting read: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html
}

class Song {
    constructor(ogg, singer, name, slkauthor, bpm) {
        this.notes = [];
        this.ogg = ogg;
        this.singer = singer;
        this.name = name;
        this.slkauthor = slkauthor;
        this.bpm = bpm;
    }

    set notes(notes) {
        this.notes = notes;
    }
}

class Input {
    constructor(game, renderer) {
        this.game = game;
        this.renderer = renderer;

        document.querySelector("body")[0].onkeydown = function (e) {
            var keyCode = e.keyCode;
            this.checkKeyboard(keyCode);
        };
    }

    checkKeyboard(keyCode) {
        switch (keyCode) {
            case 55:    // 7
            case 82:    // r
            case 103:   // numpad7
            case 36:    // home
                this.keyDown(7);
                break;
            case 52:    // 4
            case 70:    // f
            case 100:   // numpad4
            case 37:    // left
                this.keyDown(4);
                break;
            case 49:    // 1
            case 86:    // v
            case 97:    // numpad1
            case 35:    // en
                this.keyDown(1);
                break;
            case 57:    // 9
            case 73:    // i
            case 105:   // numpad9
            case 33:    // pg up
                this.keyDown(9);
                break;
            case 54:    // 6
            case 74:    // j
            case 102:   // numpad6
            case 39:    // right
                this.keyDown(6);
                break;
            case 51:    // 3
            case 78:    // n
            case 99:    // numpad3
            case 34:    // pg dn
                this.keyDown(3);
                break;
            case 17:    // ctrl
            case 48:    // 0
            case 53:    // 5
            case 32:    // space
            case 71:    // b
            case 96:    // numpad0
            case 101:   // numpad5
                this.keyDown(5);
                break;
        }
    }

    keyDown(keyMap) {
        var leftLane = true;
        var spriteLaneIndex = -1;
        var xOfs = 0;
        var xOfsBeat = 0;
        var yOfs = 0;
        var yOfsBeat = 0;
        switch (keyMap) {
            case 7 : spriteLaneIndex = 0; yOfs = this.renderer.consts.lane1Yofs; break;
            case 4 : spriteLaneIndex = 1; xOfsBeat = 6; yOfs = this.renderer.consts.lane2Yofs; break;
            case 1 : spriteLaneIndex = 2; yOfs = this.renderer.consts.lane3Yofs; break;
            case 9 : spriteLaneIndex = 3; leftLane = false; yOfs = this.renderer.consts.lane1Yofs; break;
            case 6 : spriteLaneIndex = 4; leftLane = false; xOfsBeat = -5; yOfs = this.renderer.consts.lane2Yofs; break;
            case 3 : spriteLaneIndex = 5; leftLane = false; yOfs = this.renderer.consts.lane3Yofs; break;
        }
        if (spriteLaneIndex >= 0) {
            if (leftLane) {
                xOfs = this.renderer.consts.tableWidth - this.renderer.consts.tableWidthTrans - this.renderer.consts.chanceDist - this.renderer.consts.arrowLaneOfs;
                xOfsBeat = xOfsBeat + this.renderer.consts.tableWidth - this.renderer.consts.tableWidthTrans + this.renderer.consts.laneWidth - this.renderer.consts.chanceDist + this.renderer.consts.arrowLaneOfs;
            }
            else {
                xOfs = this.renderer.config.canvasWidth - (this.renderer.consts.tableWidth - this.renderer.consts.chanceDist + this.renderer.consts.laneWidth - this.renderer.consts.arrowLaneOfs + this.renderer.sprites.a1[0].width + 3);	// 3 is a little weird here.
                xOfsBeat = xOfsBeat + this.renderer.config.canvasWidth - (this.renderer.consts.tableWidth - this.renderer.consts.tableWidthTrans + this.renderer.consts.laneWidth - this.renderer.consts.chanceDist + this.renderer.consts.arrowLaneOfs + this.renderer.sprites.a1[0].width + 1);
            }
            yOfsBeat = yOfs + this.renderer.consts.laneYStart + this.renderer.sprites.a1[0].height / 2 - this.renderer.sprites.beatDown[0].height / 2;
            yOfs = yOfs + this.renderer.consts.laneYStart + this.renderer.sprites.a1[0].height / 2 - this.renderer.sprites.laneDown[0].height / 2;

            // lane
            this.game.animations.push(new Animation(this.renderer, this.game.sound.getCurrTime(), this.renderer.consts.arrowAnimationTime, this.renderer.sprites.laneDown[spriteLaneIndex], xOfs, yOfs));

            // beat
            this.game.animations.push(new Animation(this.renderer, this.game.sound.getCurrTime(), this.renderer.consts.arrowAnimationTime, this.renderer.sprites.beatDown[spriteLaneIndex], xOfsBeat, yOfsBeat));
        }

        // space down
        if (keyMap === 5) {
            this.game.animations.push(new Animation(this.renderer, this.game.sound.getCurrTime(),
                this.renderer.consts.arrowAnimationTime,
                this.renderer.sprites.spaceFrameExplode[0],
                (this.renderer.config.canvasWidth - this.renderer.sprites.spaceFrameExplode[0].width) / 2,
                this.renderer.config.canvasHeight - this.renderer.consts.spaceMarginBottom - this.renderer.sprites.spaceFrameExplode[0].height / 2));
        }

        this.game.processNoteResult(keyMap);
        }
}

class Animation {
    constructor (renderer, startTime, duration, sprite, x, y) {
        this.renderer = renderer;
        this.startTime = startTime;
        this.duration = duration || renderer.consts.arrowAnimationTime; // could be wrong here!
        this.sprite = sprite || null;
        this.x = x || 0;
        this.y = y || 0;
    }

    process(currTime) {
        if (this.sprite == null) return;
        if (this.startTime + this.duration > currTime) {
            if (this.startTime <= currTime) {
                // equivalent to setSpritePos()
                this.sprite.pos = {x: this.x, y: this.y};
                this.renderer.ctx.globalAlpha = this.interpolate(currTime);
                this.renderer.drawSprite(this.sprite);
                this.renderer.ctx.globalAlpha = 1;
            }
        }
        else {
            this.startTime = -1;
        }
    }
    

    interpolate(currTime) {
        var alpha = 1 - (currTime - this.startTime) / this.duration;
        return alpha;
    }
}

var menu = new Menu();
menu.display();