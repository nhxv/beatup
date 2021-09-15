import {Game} from './game';

export class Renderer {
    constructor() {
        this.images = [];
        this.config = this.setupConfig();
        this.sprites = this.setupSpriteInfo();
        this.spriteConsts = this.setupSpriteConsts();
        this.ctx = null; // initialize when loadSprites
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
            laneDown  : ["lane_7.png", "lane_4.png", "lane_1.png",
                         "lane_9.png", "lane_6.png", "lane_3.png"],
            beatDown  : ["beatdown_7.png", "beatdown_4.png", "beatdown_1.png",
                          "beatdown_9.png", "beatdown_6.png", "beatdown_3.png"],
            tableL    : ["tableL.png"],
            laneL     : ["laneL.png"],
            landingL  : ["landingL.png"],
            tableR    : ["tableR.png"],
            laneR     : ["laneR.png"],
            landingR  : ["landingR.png"],
            spaceFrame: ["space_frame.png"],
            spaceFrameCursor  : ["space_frame_cursor.png"],
            spaceFrameExplode : ["space_frame_explode.png"],
            spaceExplode      : ["space_frame_space_explode.png"],
            arrowExplode      : ["arrow_explode.png"],
            a7        : ["a71.png", "a72.png", "a73.png", "a74.png", "a75.png", "a76.png", "a77.png", "a78.png"],
            a4        : ["a41.png", "a42.png", "a43.png", "a44.png", "a45.png", "a46.png", "a47.png", "a48.png"],
            a1        : ["a11.png", "a12.png", "a13.png", "a14.png", "a15.png", "a16.png", "a17.png", "a18.png"],
            a9        : ["a91.png", "a92.png", "a93.png", "a94.png", "a95.png", "a96.png", "a97.png", "a98.png"],
            a6        : ["a61.png", "a62.png", "a63.png", "a64.png", "a65.png", "a66.png", "a67.png", "a68.png"],
            a3        : ["a31.png", "a32.png", "a33.png", "a34.png", "a35.png", "a36.png", "a37.png", "a38.png"],
            spaceFrameLetters             : ["space_frame_letter_b.png", "space_frame_letter_e.png", "space_frame_letter_a.png",
                                            "space_frame_letter_t.png", "space_frame_letter_u.png", "space_frame_letter_p.png"],
            spaceFrameLetterGlowBlue      : ["space_frame_letter_glow_blue.png"],
            spaceFrameLetterGlowYellow    : ["space_frame_letter_glow_yellow.png"],
            spaceFrameGlowBlue            : ["space_frame_glow_blue.png"],
            spaceFrameGlowYellow_         : ["space_frame_glow_yellow.png"],
            blueUp        : ["up_1.png"],
            yellowUp      : ["up.png"],
            noteResults   : ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"],
            delIcons      : ["del_1.png", "del_2.png"],
            chanceIcons      : ["chance_1.png", "chance_2.png", "chance_3.png", "chance_4.png"],
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
            lane2Yofs          : 3+64,        // Renderer_.spritePos_.lane1Yofs + 64,
            lane3Yofs          : 3+64+64,     // Renderer_.spritePos_.lane2Yofs + 64,
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

    drawSprite(sprite, scale) {}


}