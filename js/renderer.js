import {Game} from './game';

export class Renderer {
    constructor(sound) {
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

                    Game.loadedComponentCount++; // increase count after loading Renderer, might have to check for null
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
        // TODO: when does firstAvailNote change??
        var lastAvailNote = Math.min(bujs.game.firstAvailNote + this.consts.numNotes, this.sound.notes.length);
        if (bujs.game.firstAvailNote >= 0) {
            var tickTime = this.sound.tickTime;
            for (var i = bujs.game.firstAvailNote; i < lastAvailNote; i++) {
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

}