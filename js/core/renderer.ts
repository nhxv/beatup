import { bujs } from "./bujs";
import { Point, Sprite } from "./types";

export interface RendererConfig {
    imagePath: string;
    scaleRatio: number;
    canvasWidth: number;
    canvasHeight: number;
}

export interface RendererConsts {
    chanceDist: number;
    baseResultLine: number;
    arrowAnimationTime: number;
    laneYStart: number;
    lane1Yofs: number;
    lane2Yofs: number;
    lane3Yofs: number;
    lane2Xofs: number;
    laneWidth: number;
    tableWidth: number;
    tableWidthTrans: number;
    arrowLaneOfs: number;
    spaceMarginBottom: number;
    beatupLetterDist: number;
    dnxpLogoMargin: number;
    textHeight: number;
    textMarginTop: number;
    numNotes: number;
    playerListUp: number;
    playerListName: number;
    playerListScore: number;
    playerListYofs: number;
    scoreTableXofs: number;
    fontSize: number;
    helpYofs: number;
}

/**
 * Renders sprites, text and layout for the game onto the canvas.
 */
export class Renderer {
    onComponentFinishLoading?: (component: Renderer) => void;
    config!: RendererConfig;
    spriteFiles!: Record<string, string[]>;
    sprites: Record<string, Sprite[]> = {};
    consts!: RendererConsts;
    ctx?: CanvasRenderingContext2D;

    constructor(onComponentFinishLoading?: (component: Renderer) => void) {
        this.onComponentFinishLoading = onComponentFinishLoading;
        this.setupConfig();
        this.setupSpriteInfo();
        this.setupSpriteConsts();
    }

    /**
     * Load sprite images for each type in parallel
     */
    asyncLoadSprites(): void {
        const keys = Object.keys(this.spriteFiles);
        Promise.all(keys.map((key) => this.loadSpritesForType(this.spriteFiles[key], key)))
            .then(() => {
                this.initSpritePos();
                // resize canvas
                const canvas = document.getElementById("cvs") as HTMLCanvasElement;
                this.ctx = canvas.getContext("2d")!;
                const width = this.config.canvasWidth * this.config.scaleRatio;
                const height = this.config.canvasHeight * this.config.scaleRatio;
                canvas.width = width;
                canvas.height = height;

                if (this.onComponentFinishLoading) {
                    this.onComponentFinishLoading(this);
                }
            })
            .catch((err) => {
                console.error("Meh. Error", err);
            });
    }

    /**
     * Initialize config variables
     */
    setupConfig(): void {
        this.config = {
            imagePath: "img/",
            scaleRatio: 1,
            canvasWidth: 980,
            canvasHeight: 400, // initial 400
        };
    }

    /**
     * Initialize sprite file names
     */
    setupSpriteInfo(): void {
        this.spriteFiles = {
            background: ["bg/lafesta.jpg"],
            dnxpLogo: ["dnxp.png"],
            laneDown: ["lane_7.png", "lane_4.png", "lane_1.png",
                "lane_9.png", "lane_6.png", "lane_3.png"],
            beatDown: ["beatdown_7.png", "beatdown_4.png", "beatdown_1.png",
                "beatdown_9.png", "beatdown_6.png", "beatdown_3.png"],
            tableL: ["tableL.png"],
            laneL: ["laneL.png"],
            landingL: ["landingL.png"],
            tableR: ["tableR.png"],
            laneR: ["laneR.png"],
            landingR: ["landingR.png"],
            spaceFrame: ["space_frame.png"],
            spaceFrameCursor: ["space_frame_cursor.png"],
            spaceFrameExplode: ["space_frame_explode.png"],
            spaceExplode: ["space_frame_space_explode.png"],
            arrowExplode: ["arrow_explode.png"],
            a7: ["a71.png", "a72.png", "a73.png", "a74.png", "a75.png", "a76.png", "a77.png", "a78.png"],
            a4: ["a41.png", "a42.png", "a43.png", "a44.png", "a45.png", "a46.png", "a47.png", "a48.png"],
            a1: ["a11.png", "a12.png", "a13.png", "a14.png", "a15.png", "a16.png", "a17.png", "a18.png"],
            a9: ["a91.png", "a92.png", "a93.png", "a94.png", "a95.png", "a96.png", "a97.png", "a98.png"],
            a6: ["a61.png", "a62.png", "a63.png", "a64.png", "a65.png", "a66.png", "a67.png", "a68.png"],
            a3: ["a31.png", "a32.png", "a33.png", "a34.png", "a35.png", "a36.png", "a37.png", "a38.png"],
            spaceFrameLetters: ["space_frame_letter_b.png", "space_frame_letter_e.png", "space_frame_letter_a.png",
                "space_frame_letter_t.png", "space_frame_letter_u.png", "space_frame_letter_p.png"],
            spaceFrameLetterGlowBlue: ["space_frame_letter_glow_blue.png"],
            spaceFrameLetterGlowYellow: ["space_frame_letter_glow_yellow.png"],
            spaceFrameGlowBlue: ["space_frame_glow_blue.png"],
            spaceFrameGlowYellow: ["space_frame_glow_yellow.png"],
            blueUp: ["up_1.png"],
            yellowUp: ["up.png"],
            noteResults: ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"],
            delIcons: ["del_1.png", "del_2.png"],
            chanceIcons: ["chance_1.png", "chance_2.png", "chance_3.png", "chance_4.png"],
            c7: ["c71.png"],
            c4: ["c41.png"],
            c1: ["c11.png"],
            c9: ["c91.png"],
            c6: ["c61.png"],
            c3: ["c31.png"],
        };
    }

    /**
     * Some special constants for drawing
     */
    setupSpriteConsts(): void {
        this.consts = {
            chanceDist: 90, // initial value 80
            baseResultLine: 150,
            arrowAnimationTime: 135, // initial value 135, time arrow explode animate
            laneYStart: this.config.canvasHeight - 350,
            lane1Yofs: 3,
            lane2Yofs: 3 + 64,
            lane3Yofs: 3 + 64 + 64,
            lane2Xofs: 5,
            laneWidth: 256, // initial value 256
            tableWidth: 123,
            tableWidthTrans: 3,
            arrowLaneOfs: 1,
            spaceMarginBottom: 80, // initial value 80
            beatupLetterDist: 46,
            dnxpLogoMargin: 50, // initial value 20
            textHeight: 20,
            textMarginTop: 64,
            numNotes: 14,
            playerListUp: 40,
            playerListName: 200,
            playerListScore: 60,
            playerListYofs: 80,
            scoreTableXofs: (this.config.canvasWidth - 600) / 2,
            fontSize: 11,
            helpYofs: 150,
        };
    }

    /**
     * Load a set of images for a type, e.g.
     * noteResults: ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"]
     */
    loadSpritesForType(fileNames: string[], key: string): Promise<void[]> {
        return Promise.all(fileNames.map((fileName, index) => {
            return new Promise<void>((resolve, reject) => {
                const img = new Image() as Sprite;
                img.onload = () => {
                    if (typeof this.sprites[key] === "undefined") {
                        this.sprites[key] = [];
                    }
                    this.sprites[key][index] = img;
                    resolve();
                };
                img.onerror = () => reject(new Error(`Failed to load sprite: ${fileName}`));
                img.src = this.config.imagePath + fileName;
            });
        }));
    }

    /**
     * Clear the whole canvas
     */
    clear(): void {
        if (this.ctx) {
            this.ctx.fillStyle = "black";
            this.ctx.clearRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        }
    }

    /**
     * A wrapper to write some text on canvas
     */
    writeText(pos: Point, text: string, font = "Segoe UI", size = "12px", color = "white"): void {
        this.ctx!.font = size + " " + font;
        this.ctx!.fillStyle = color;
        this.ctx!.textAlign = "left";
        this.ctx!.fillText(text, pos.x, pos.y);
    }

    /**
     * Draw a specific sprite
     */
    drawSprite(sprite: Sprite | null | undefined, scale = 1): void {
        if (typeof sprite === "undefined" || sprite === null) {
            console.log("meh.");
            return;
        }
        if (sprite.pos) {
            this.ctx!.drawImage(sprite, sprite.pos.x, sprite.pos.y, sprite.width * scale, sprite.height * scale);
        }
    }

    /**
     * Draw fix contents, such as lanes, landings, logo...
     */
    drawFixContent(combo: number): void {
        this.drawSprite(this.sprites.laneL[0]);
        this.drawSprite(this.sprites.laneR[0]);
        this.drawSprite(this.sprites.landingL[0]);
        this.drawSprite(this.sprites.landingR[0]);
        this.drawSprite(this.sprites.dnxpLogo[0]);
        this.drawSpaceFrame(combo);
        this.drawResults();
    }

    drawTouchArrows(): void {
        this.drawSprite(this.sprites.c7[0]);
        this.drawSprite(this.sprites.c9[0]);
        this.drawSprite(this.sprites.c4[0]);
        this.drawSprite(this.sprites.c6[0]);
        this.drawSprite(this.sprites.c1[0]);
        this.drawSprite(this.sprites.c3[0]);
    }

    drawResults(): void {
        const x = (this.config.canvasWidth - 135) / 2;
        const y = this.consts.laneYStart + this.consts.textMarginTop;
        this.writeText({ x, y },
            "P/G/C/B/M: " + bujs.game.pgcbm[0] + "/"
            + bujs.game.pgcbm[1] + "/" + bujs.game.pgcbm[2] + "/"
            + bujs.game.pgcbm[3] + "/" + bujs.game.pgcbm[4]);
        this.writeText({ x, y: y + 16 }, "Score: " + Math.round(bujs.game.score));
        this.writeText({ x, y: y + 32 }, "Current Combo: " + bujs.game.combo);
        this.writeText({ x, y: y + 48 }, "Highest Combo: " + bujs.game.highestCombo);
        const pgcbm = bujs.game.pgcbm;
        let perpercent = 0;
        if (pgcbm[0] !== 0 || pgcbm[1] !== 0 ||
            pgcbm[2] !== 0 || pgcbm[3] !== 0 ||
            pgcbm[4] !== 0) {
            perpercent = (pgcbm[0] * 100) / (pgcbm[0] + pgcbm[1] + pgcbm[2] + pgcbm[3] + pgcbm[4]);
        }
        this.writeText({ x, y: y + 64 }, "Per %: " + perpercent.toFixed(2) + "%");
        this.writeText({ x, y: y + 80 }, "Per Combo: " + bujs.game.xmax);
    }

    /**
     * Draw space frame
     */
    drawSpaceFrame(combo: number): void {
        if (combo) {
            if (combo >= 100 && combo < 400) {
                this.drawSprite(this.sprites.spaceFrameGlowYellow[0]);
            } else if (combo >= 400) {
                this.drawSprite(this.sprites.spaceFrameGlowBlue[0]);
            }
        }
        this.drawSprite(this.sprites.spaceFrame[0]);
    }

    /**
     * Beat Up text at the bottom
     */
    drawBeatupText(combo: number): void {
        // B-E-A-T-U-P glows
        let letterGlow1: Sprite[] | null = null;
        let letterGlow2: Sprite[] | null = null;
        let numGlow1 = 0;
        let numGlow2 = 0;

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
            for (let i = 0; i < numGlow1; i++) {
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
            for (let i = numGlow1; i < numGlow1 + numGlow2; i++) {
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

    /**
     * Draw table parts. Should be called last to overdraw the arrows
     */
    drawTable(): void {
        this.drawSprite(this.sprites.tableL[0]);
        this.drawSprite(this.sprites.tableR[0]);
    }

    /**
     * Set sprite position
     */
    setSpritePos(img: Sprite, posX: number, posY: number): void {
        img.pos = { x: posX, y: posY };
    }

    /**
     * Define sprite position. These are fixed.
     */
    initSpritePos(): void {
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
            this.sprites.laneL[0].pos!.x + this.consts.laneWidth,
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
            this.config.canvasWidth / 2 + this.sprites.spaceFrame[0].width / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.delIcons[0].height / 2);

        this.setSpritePos(this.sprites.delIcons[1],
            this.config.canvasWidth / 2 + this.sprites.spaceFrame[0].width / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.delIcons[1].height / 2);

        // chance icons
        this.setSpritePos(this.sprites.chanceIcons[0],
            this.config.canvasWidth / 2 - this.sprites.spaceFrame[0].width / 2 - this.sprites.chanceIcons[0].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[0].height / 2);

        this.setSpritePos(this.sprites.chanceIcons[1],
            this.config.canvasWidth / 2 - this.sprites.spaceFrame[0].width / 2 - this.sprites.chanceIcons[1].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[1].height / 2);

        this.setSpritePos(this.sprites.chanceIcons[2],
            this.config.canvasWidth / 2 - this.sprites.spaceFrame[0].width / 2 - this.sprites.chanceIcons[2].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[2].height / 2);

        this.setSpritePos(this.sprites.chanceIcons[3],
            this.config.canvasWidth / 2 - this.sprites.spaceFrame[0].width / 2 - this.sprites.chanceIcons[3].width,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.chanceIcons[3].height / 2);

        // space glows
        this.setSpritePos(this.sprites.spaceFrameGlowBlue[0],
            (this.config.canvasWidth - this.sprites.spaceFrame[0].width) / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrame[0].height / 2);

        this.setSpritePos(this.sprites.spaceFrameGlowYellow[0],
            (this.config.canvasWidth - this.sprites.spaceFrame[0].width) / 2,
            this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrame[0].height / 2);

        // B-E-A-T-U-P letters
        for (let i = 0; i < 6; i++) {
            this.setSpritePos(this.sprites.spaceFrameLetters[i],
                this.config.canvasWidth / 2 - this.consts.beatupLetterDist / 2 * (5 - i * 2) - this.sprites.spaceFrameLetters[0].width / 2,
                this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameLetters[0].height / 2);
        }
        const leftX = 0,
            rightX = this.config.canvasWidth - this.sprites.a7[0].width;
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
    drawArrow(arrowSprite: Sprite, xOfs: number, yOfs: number, leftLane: boolean, noteTime: number): void {
        const delta = 0; // initial value 0
        let x = 0;
        const y = this.consts.laneYStart + yOfs;
        const currTime = bujs.game.music.getCurrTime();
        if (leftLane) {
            x = (xOfs + this.consts.tableWidth - this.consts.tableWidthTrans +
                this.consts.laneWidth - this.consts.chanceDist +
                this.consts.arrowLaneOfs) -
                (noteTime - currTime - delta) * 40.0 / bujs.game.music.tickTime;
        } else {
            x = this.config.canvasWidth -
                (xOfs + this.consts.tableWidth - this.consts.tableWidthTrans +
                    this.consts.laneWidth - this.consts.chanceDist +
                    this.consts.arrowLaneOfs + arrowSprite.width) +
                (noteTime - currTime - delta) * 40.0 / bujs.game.music.tickTime;
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
    drawPerfectArrows(): void {
        const xOfs = 1;
        this.drawArrow(this.sprites.a7[0], xOfs, this.consts.lane1Yofs, true, bujs.game.music.getCurrTime());
        this.drawArrow(this.sprites.a9[0], xOfs, this.consts.lane1Yofs, false, bujs.game.music.getCurrTime());
        this.drawArrow(this.sprites.a4[0], xOfs + this.consts.lane2Xofs, this.consts.lane2Yofs, true, bujs.game.music.getCurrTime());
        this.drawArrow(this.sprites.a6[0], xOfs + this.consts.lane2Xofs, this.consts.lane2Yofs, false, bujs.game.music.getCurrTime());
        this.drawArrow(this.sprites.a1[0], xOfs, this.consts.lane3Yofs, true, bujs.game.music.getCurrTime());
        this.drawArrow(this.sprites.a3[0], xOfs, this.consts.lane3Yofs, false, bujs.game.music.getCurrTime());
    }

    /**
     * Draw arrows for current notes;
     */
    drawNotes(currTime: number): void {
        const lastAvailNote = Math.min(bujs.game.firstAvailNote + this.consts.numNotes, bujs.game.music.songInfo.notes.length);
        if (bujs.game.firstAvailNote >= 0) {
            const tickTime = bujs.game.music.tickTime;
            for (let i = bujs.game.firstAvailNote; i < lastAvailNote; i++) {
                const note = bujs.game.music.songInfo.notes[i];
                const noteTime = note.t;
                const noteKey = note.n;

                // max note time for drawing
                const maxArrowAvailTime = currTime + tickTime * (this.consts.numNotes + 1);
                const maxSpaceAvailTime = currTime + tickTime * 8;
                if ((noteKey !== 5 && noteTime > maxArrowAvailTime) ||
                    (noteKey === 5 && noteTime > maxSpaceAvailTime)) break;

                // only draw unpressed notes
                if (!note.pressed) {
                    let leftLane = true;
                    const xOfs = 0;
                    let yOfs = 0;
                    let arrowToDraw: Sprite | null = null;

                    let timeDiff = currTime - noteTime;
                    if (timeDiff < 0) {
                        timeDiff = -timeDiff;
                    }
                    const imageIndex = Math.round(timeDiff / tickTime) % 4;
                    // appropriate image surface, y offset
                    // default
                    if (bujs.game.chance === 0) {
                        switch (noteKey) {
                            case 7: arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                            case 4: arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1: arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                            case 9: leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                            case 6: leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3: leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                        }
                    }
                    // set chance number 1 : all mid lane
                    if (bujs.game.chance === 1) {
                        switch (noteKey) {
                            case 7: arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 4: arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1: arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 9: leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 6: leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3: leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                        }
                    }
                    // set chance number 2 : invert up/down
                    if (bujs.game.chance === 2) {
                        switch (noteKey) {
                            case 7: arrowToDraw = this.sprites.a7[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                            case 4: arrowToDraw = this.sprites.a4[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 1: arrowToDraw = this.sprites.a1[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                            case 9: leftLane = false; arrowToDraw = this.sprites.a9[imageIndex]; yOfs = this.consts.lane3Yofs; break;
                            case 6: leftLane = false; arrowToDraw = this.sprites.a6[imageIndex]; yOfs = this.consts.lane2Yofs; break;
                            case 3: leftLane = false; arrowToDraw = this.sprites.a3[imageIndex]; yOfs = this.consts.lane1Yofs; break;
                        }
                    }

                    // draw it!
                    if (arrowToDraw !== null) {
                        this.drawArrow(arrowToDraw, xOfs, yOfs, leftLane, noteTime);
                    } else if (noteKey === 5) {
                        // a space?
                        const cursorLx = (this.config.canvasWidth - this.sprites.spaceFrameCursor[0].width) / 2 - (noteTime - currTime) / tickTime * 31.0 / 2;
                        const cursorRx = (this.config.canvasWidth - this.sprites.spaceFrameCursor[0].width) / 2 + (noteTime - currTime) / tickTime * 31.0 / 2;
                        const cursorY = this.config.canvasHeight - this.consts.spaceMarginBottom - this.sprites.spaceFrameCursor[0].height / 2;
                        this.setSpritePos(this.sprites.spaceFrameCursor[0], cursorLx, cursorY);
                        this.drawSprite(this.sprites.spaceFrameCursor[0]);

                        this.setSpritePos(this.sprites.spaceFrameCursor[0], cursorRx, cursorY);
                        this.drawSprite(this.sprites.spaceFrameCursor[0]);
                    }
                }
            }
        }
    }

    /**
     * Draw note result big text (p/g/c/b/m) on top
     */
    drawBigNoteResultText(): void {
        if (bujs.game.lastNoteTime > 0) {
            const diff = bujs.game.music.getCurrTime() - bujs.game.lastNoteTime;
            const noteResult = this.sprites.noteResults[bujs.game.lastNoteResult];

            // result width / height
            let ratio = 1;
            if (diff < 50) ratio = 1 + (50 - diff) / 90;

            // draw it with ratio
            this.setSpritePos(noteResult, (this.config.canvasWidth - noteResult.width * ratio) / 2, (this.consts.baseResultLine - noteResult.height * ratio) / 2);
            this.drawSprite(noteResult, ratio);

            if (diff > 200) {
                bujs.game.lastNoteResult = 0;
                bujs.game.lastNoteTime = 0;
            }
        }
    }
}
