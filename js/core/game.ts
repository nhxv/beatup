import { bujs } from "./bujs";
import { Music } from "./music";
import { Renderer } from "./renderer";
import { Input } from "./input";
import { Animation } from "./animation";
import { Point } from "./types";

// obviously not belong to game class
function gl(): void {
    if (bujs.game.isOn) {
        bujs.game.loop();
    } else {
        bujs.game.drawMotionless();

        // TODO: save final result; print to console for now - dont save when player use tab to turn game off
        if (!bujs.game.isTab) {
            console.log("Song: " + bujs.game.songId);
            console.log("Score: " + Math.round(bujs.game.score));
            console.log("Combo: " + bujs.game.highestCombo);
            console.log("Perfect: " + bujs.game.pgcbm[0]);
            console.log("Great: " + bujs.game.pgcbm[1]);
            console.log("Cool: " + bujs.game.pgcbm[2]);
            console.log("Bad: " + bujs.game.pgcbm[3]);
            console.log("Miss: " + bujs.game.pgcbm[4]);
        }
    }
}

/**
 * The main game state and loop.
 */
export class Game {
    songId: string;
    loadedComponent: string[] = [];
    isOn = false; // game state
    isTab = false; // dont save record when player use tab to turn game off

    frameCount = 0;
    fps = 0;

    firstAvailNote = 0;
    lastNoteResult = 0;
    lastNoteTime = 0;
    lastTime = 0;

    pgcbm = [0, 0, 0, 0, 0];
    score = 0;
    perx = 0;
    highestCombo = 0;
    combo = 0;
    xmax = 0;
    chance = 0;

    showBg = 0;
    showPerfArrows = false;
    showHelp = false;

    numSelect = 0;
    animations: Animation[] = [];
    players: unknown[] = [];

    autoplay = false;
    alwaysCorrect = false;

    noteScores = [520, 260, 130, 26, 0];
    spaceScores = [2000, 1500, 1000, 500, 0];
    yellowBeatupRatio = 1.2;
    blueBeatupRatio = 1.55;

    music!: Music;
    renderer: Renderer;
    input: Input;

    constructor(songId: string) {
        this.songId = songId;

        // load music and renderer; setTimeout for offset?
        setTimeout(() => {
            this.music = new Music(this.onComponentFinishLoading);
        }, 0);

        this.renderer = new Renderer(this.onComponentFinishLoading);
        this.renderer.asyncLoadSprites();
        this.input = new Input();
    }

    /**
     * Callback whenever we have a component finished loading
     */
    onComponentFinishLoading = (component?: Renderer | Music): void => {
        if (typeof component !== "undefined") {
            const componentType = component.constructor.name;
            // console.log("Component finished loading " + componentType);
            if (this.loadedComponent.indexOf(componentType) < 0) {
                this.loadedComponent.push(componentType);
            }
            if (this.loadedComponent.length === 2) { // renderer & music
                // initialize remaining animation parameters
                this.onFinishLoading();
            }
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); // auto scroll to bottom
    };

    /**
     * Callback whenever we have ALL components (Renderer & Music) finished loading
     */
    onFinishLoading(): void {
        this.isOn = true;
        gl();
    }

    /**
     * Main game loop
     */
    loop(): void {
        this.update();
        this.draw();
        window.requestAnimationFrame(gl);
    }

    /**
     * Draw the whole scene
     */
    draw(): void {
        this.drawMotionless();

        this.processAnimations();
        this.renderer.drawNotes(this.music.getCurrTime());
        this.renderer.drawBigNoteResultText();

        this.checkMiss();

        this.renderer.drawTable(); // draw last to cover arrow
        // this.renderer.drawTouchArrows(); remove this method by toggle later
    }

    drawMotionless(): void {
        this.renderer.clear();

        if (this.showBg !== 0) {
            this.renderer.drawSprite(this.renderer.sprites.background[this.showBg - 1]);
        }

        if (typeof this.music.musicStartTime === "undefined" || this.music.musicStartTime === null) {
            bujs.showLoadingMsg("Touch/click to start music");
        }

        // fps
        const fps = this.calcFps();
        const posFps: Point = { x: 20, y: 10 };
        this.renderer.writeText(posFps, fps.toFixed(1) + " fps");

        // song time
        if (this.music.getCurrTime() / 1000 >= this.music.musicEndTime!) {
            const isTab = false; // game end naturally
            this.endGame(isTab);
        }

        if (this.isOn) {
            this.renderer.writeText(
                { x: 20, y: this.renderer.config.canvasHeight - 8 },
                this.processSongTime(Math.round(this.music.getCurrTime() / 1000)) + " / " +
                this.processSongTime(Math.ceil(this.music.musicEndTime!))
            );
        } else {
            this.renderer.writeText(
                { x: 20, y: this.renderer.config.canvasHeight - 8 },
                this.processSongTime(Math.ceil(this.music.musicEndTime!))
            );
        }

        // song name
        this.renderer.writeText(
            { x: 20, y: this.renderer.config.canvasHeight - 24 },
            this.music.songInfo.name + " - " + this.music.songInfo.singer +
            " (" + Math.round(this.music.songInfo.bpm) + " bpm)"
        );

        // lanes, landings, icons, logo, space frame, scoreboard...
        this.renderer.drawFixContent(this.combo);
        this.renderer.drawBeatupText(this.combo);

        // when game stop, draw table
        if (!this.isOn) {
            this.renderer.drawTable();
        }
    }

    processSongTime(time: number): string {
        const minutes = Math.floor(time / 60);
        const seconds = time - minutes * 60;
        const formatSec = seconds.toLocaleString("en-US", { minimumIntegerDigits: 2 });
        return minutes + ":" + formatSec;
    }

    /**
     * Update game status
     */
    update(): void {
    }

    /**
     * Calculate frame per sec, not from beginning but for each sec
     */
    calcFps(): number {
        const currTime = this.music.getCurrTime();
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

    checkMiss(): void {
        const currTime = this.music.getCurrTime();
        const maxNotes = Math.min(this.firstAvailNote + this.renderer.consts.numNotes, this.music.songInfo.notes.length);
        if (this.autoplay) {
            if (this.firstAvailNote >= 0) {
                // still have notes
                for (let i = this.firstAvailNote; i < maxNotes; i++) {
                    if (this.music.songInfo.notes[i].t < currTime + 5) {
                        this.input.keyDown(this.music.songInfo.notes[i].n);
                        break;
                    }
                }
            }
        } else {
            // check for misses
            if (this.firstAvailNote >= 0) {
                // still have notes
                for (let i = this.firstAvailNote; i < maxNotes; i++) {
                    if (currTime > this.music.songInfo.notes[i].t + this.music.tickTime * 2) {
                        this.music.songInfo.notes[i].pressed = true;
                        this.lastNoteResult = 4; // 'missed' for the animation
                        this.lastNoteTime = currTime;
                        this.music.playSound(this.music.sounds.miss as AudioBuffer);
                        this.updateScore(this.music.songInfo.notes[i].n, 4);
                    }
                }
            }

            // recalculate first_avail_note
            this.firstAvailNote = -1;
            for (let j = 0; j < this.music.songInfo.notes.length; j++) {
                if (!this.music.songInfo.notes[j].pressed) {
                    this.firstAvailNote = j;
                    break;
                }
            }
        }
    }

    processNoteResult(keyMap: number): void {
        let noteResult = -1;
        if (keyMap !== 0 || this.autoplay) {
            const currTime = this.music.getCurrTime();
            for (let i = this.firstAvailNote; i < this.firstAvailNote + 4; i++) {
                if (this.firstAvailNote >= this.music.songInfo.notes.length || this.firstAvailNote < 0) break;
                const note = this.music.songInfo.notes[i];
                const noteKey = note.n;
                const keyTime = currTime - note.t;

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
                            case 5: this.animations.push(new Animation(this.renderer, currTime, this.renderer.consts.arrowAnimationTime, this.renderer.sprites.spaceExplode[0],
                                (this.renderer.config.canvasWidth - this.renderer.sprites.spaceExplode[0].width) / 2,
                                this.renderer.config.canvasHeight - this.renderer.consts.spaceMarginBottom - this.renderer.sprites.spaceExplode[0].height / 2));
                                break;
                        }
                        if (noteResult !== 4) {
                            if (noteKey !== 5) {
                                let leftLane = true;
                                let yOfs = 0;

                                // appropriate image surface, y offset
                                switch (noteKey) {
                                    case 7: yOfs = this.renderer.consts.lane1Yofs; break;
                                    case 4: yOfs = this.renderer.consts.lane2Yofs; break;
                                    case 1: yOfs = this.renderer.consts.lane3Yofs; break;
                                    case 9: leftLane = false; yOfs = this.renderer.consts.lane1Yofs; break;
                                    case 6: leftLane = false; yOfs = this.renderer.consts.lane2Yofs; break;
                                    case 3: leftLane = false; yOfs = this.renderer.consts.lane3Yofs; break;
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
                        if (noteKey === 5 && noteResult !== 4) this.music.playSound(this.music.sounds.space as AudioBuffer);
                        else if (noteResult === 0) this.music.playSound(this.music.sounds.perfect as AudioBuffer); // arrow per?
                        else if (noteResult === 4) this.music.playSound(this.music.sounds.miss as AudioBuffer); // arrow miss?
                        else this.music.playSound(this.music.sounds.normal as AudioBuffer); // arrow normal

                        // update pgcbm, score, combo, perx... and send to server if it's a space
                        this.updateScore(noteKey, noteResult);

                        // mark it as pressed
                        note.pressed = true;

                        // recalculate first_avail_note
                        this.firstAvailNote = -1;
                        for (let j = 0; j < this.music.songInfo.notes.length; j++) {
                            if (typeof this.music.songInfo.notes[j].pressed === "undefined" || !this.music.songInfo.notes[j].pressed) {
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

    /**
     * Convert time diff to key result p/g/c/b/m
     */
    getKeyResult(diff: number): number {
        if (this.autoplay) return 0;
        const ratio = 4;
        const tickTime = this.music.tickTime;

        // initial value 80
        if (diff > 60 * (tickTime * ratio) / 100 || diff < -tickTime * ratio) return -1; // don't process
        if (diff < 0) {
            diff = -diff;
        }
        // initial values: 5 15 27 40, change difficulty here
        if (diff <= 5 * (tickTime * ratio) / 100) return 0; // p
        if (diff <= 15 * (tickTime * ratio) / 100) return 1; // g
        if (diff <= 25 * (tickTime * ratio) / 100) return 2; // c
        if (diff <= 35 * (tickTime * ratio) / 100) return 3; // b
        return 4; // m
    }

    /**
     * Process all on-going animations
     */
    processAnimations(): void {
        for (let i = 0; i < this.animations.length; i++) {
            this.animations[i].process(this.music.getCurrTime());
        }
        // delete all finished animations
        for (let i = this.animations.length - 1; i >= 0; i--) {
            if (this.animations[i].startTime < 0) {
                this.animations.splice(i, 1);
            }
        }
    }

    /**
     * Add/reset combo, add score, perx, p/g/c/b/m counters,...
     */
    updateScore(key: number, keyResult: number): void {
        let noteScore = 0;
        if (key === 5) {
            if (keyResult >= 0) {
                noteScore = this.spaceScores[keyResult];
            }
        } else {
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
        if (this.lastNoteResult === 0 && keyResult === 0) {
            this.perx++;
        } else this.perx = 0;

        if (this.perx > this.xmax) {
            this.xmax = this.perx;
        }
    }

    endGame(isTab: boolean): void {
        this.isTab = isTab;
        this.music.musicSource!.stop(0);
        if (this.isOn) {
            this.isOn = false;
        }
    }
}
