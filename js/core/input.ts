import { bujs } from "./bujs";
import { Animation } from "./animation";

/**
 * Handles keyboard and touch input for the game.
 */
export class Input {
    constructor() {
        document.body.onkeydown = (e) => {
            this.checkKeyboard(e);
        };

        const el = document.getElementsByTagName("canvas")[0];
        el.addEventListener("touchstart", (e) => {
            this.touchStart(e);
        }, false);
        if (bujs.iOS) {
            el.addEventListener("touchend", (e) => {
                this.touchEnd(e);
            }, false);
        }
    }

    checkKeyboard(e: KeyboardEvent): void {
        switch (e.which) {
            case 9: // tab open menu
                if (bujs.game.isOn) bujs.game.endGame(true);
                break;
            case 112: // f1: toggle help
                bujs.game.showHelp = !bujs.game.showHelp;
                break;
            case 113: // f2: save replay
                break;
            case 114: // f3: chance
                bujs.game.chance = (bujs.game.chance + 1) % 3;
                break;
            case 115: // f4: background
                bujs.game.showBg = (bujs.game.showBg + 1) % (bujs.game.renderer.sprites.background.length + 1);
                break;
            case 55: // 7
            case 82: // r
            case 103: // numpad7
            case 36: // home
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(7);
                }
                break;
            case 52: // 4
            case 70: // f
            case 100: // numpad4
            case 37: // left
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(4);
                }
                break;
            case 49: // 1
            case 86: // v
            case 97: // numpad1
            case 35: // en
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(1);
                }
                break;
            case 57: // 9
            case 73: // i
            case 105: // numpad9
            case 33: // pg up
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(9);
                }
                break;
            case 54: // 6
            case 74: // j
            case 102: // numpad6
            case 39: // right
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(6);
                }
                break;
            case 51: // 3
            case 78: // n
            case 99: // numpad3
            case 34: // pg dn
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(3);
                }
                break;
            case 17: // ctrl
            case 48: // 0
            case 53: // 5
            case 32: // space
            case 71: // b
            case 96: // numpad0
            case 101: // numpad5
                if (!bujs.game.autoplay && bujs.game.isOn) {
                    this.keyDown(5);
                }
                break;
        }
    }

    // maybe move this to game class?
    keyDown(keyMap: number): void {
        let leftLane = true;
        let spriteLaneIndex = -1;
        let xOfs = 0;
        let xOfsBeat = 0;
        let yOfs = 0;
        let yOfsBeat = 0;
        switch (keyMap) {
            case 7: spriteLaneIndex = 0; yOfs = bujs.game.renderer.consts.lane1Yofs; break;
            case 4: spriteLaneIndex = 1; xOfsBeat = 6; yOfs = bujs.game.renderer.consts.lane2Yofs; break;
            case 1: spriteLaneIndex = 2; yOfs = bujs.game.renderer.consts.lane3Yofs; break;
            case 9: spriteLaneIndex = 3; leftLane = false; yOfs = bujs.game.renderer.consts.lane1Yofs; break;
            case 6: spriteLaneIndex = 4; leftLane = false; xOfsBeat = -5; yOfs = bujs.game.renderer.consts.lane2Yofs; break;
            case 3: spriteLaneIndex = 5; leftLane = false; yOfs = bujs.game.renderer.consts.lane3Yofs; break;
        }
        if (spriteLaneIndex >= 0) {
            if (leftLane) {
                xOfs = bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.tableWidthTrans - bujs.game.renderer.consts.chanceDist - bujs.game.renderer.consts.arrowLaneOfs;
                xOfsBeat = xOfsBeat + bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.tableWidthTrans + bujs.game.renderer.consts.laneWidth - bujs.game.renderer.consts.chanceDist + bujs.game.renderer.consts.arrowLaneOfs;
            } else {
                xOfs = bujs.game.renderer.config.canvasWidth - (bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.chanceDist + bujs.game.renderer.consts.laneWidth - bujs.game.renderer.consts.arrowLaneOfs + bujs.game.renderer.sprites.a1[0].width + 3); // 3 is a little weird here.
                xOfsBeat = xOfsBeat + bujs.game.renderer.config.canvasWidth - (bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.tableWidthTrans + bujs.game.renderer.consts.laneWidth - bujs.game.renderer.consts.chanceDist + bujs.game.renderer.consts.arrowLaneOfs + bujs.game.renderer.sprites.a1[0].width + 1);
            }
            yOfsBeat = yOfs + bujs.game.renderer.consts.laneYStart + bujs.game.renderer.sprites.a1[0].height / 2 - bujs.game.renderer.sprites.beatDown[0].height / 2;
            yOfs = yOfs + bujs.game.renderer.consts.laneYStart + bujs.game.renderer.sprites.a1[0].height / 2 - bujs.game.renderer.sprites.laneDown[0].height / 2;

            // lane
            bujs.game.animations.push(new Animation(bujs.game.renderer, bujs.game.music.getCurrTime(), bujs.game.renderer.consts.arrowAnimationTime, bujs.game.renderer.sprites.laneDown[spriteLaneIndex], xOfs, yOfs));

            // beat
            bujs.game.animations.push(new Animation(bujs.game.renderer, bujs.game.music.getCurrTime(), bujs.game.renderer.consts.arrowAnimationTime, bujs.game.renderer.sprites.beatDown[spriteLaneIndex], xOfsBeat, yOfsBeat));
        }

        // space down
        if (keyMap === 5) {
            bujs.game.animations.push(new Animation(bujs.game.renderer, bujs.game.music.getCurrTime(),
                bujs.game.renderer.consts.arrowAnimationTime,
                bujs.game.renderer.sprites.spaceFrameExplode[0],
                (bujs.game.renderer.config.canvasWidth - bujs.game.renderer.sprites.spaceFrameExplode[0].width) / 2,
                bujs.game.renderer.config.canvasHeight - bujs.game.renderer.consts.spaceMarginBottom - bujs.game.renderer.sprites.spaceFrameExplode[0].height / 2));
        }

        bujs.game.processNoteResult(keyMap);
    }

    touchStart(e: TouchEvent): void {
        e.preventDefault();
        const el = e.changedTouches[0].target as HTMLElement,
            elLeft = el.offsetLeft,
            elTop = el.offsetTop,
            arrowSprite = bujs.game.renderer.sprites.a7[0],
            spaceFrameSprite = bujs.game.renderer.sprites.spaceFrame[0],
            logoSprite = bujs.game.renderer.sprites.dnxpLogo[0];
        const leftPerfectX = bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.tableWidthTrans +
            bujs.game.renderer.consts.laneWidth - bujs.game.renderer.consts.chanceDist +
            bujs.game.renderer.consts.arrowLaneOfs;
        const rightPerfectX = bujs.game.renderer.config.canvasWidth -
            (bujs.game.renderer.consts.tableWidth - bujs.game.renderer.consts.tableWidthTrans +
                bujs.game.renderer.consts.laneWidth - bujs.game.renderer.consts.chanceDist +
                bujs.game.renderer.consts.arrowLaneOfs + arrowSprite.width);
        const spaceLeft = (bujs.game.renderer.config.canvasWidth - spaceFrameSprite.width) / 2,
            spaceTop = bujs.game.renderer.config.canvasHeight - bujs.game.renderer.consts.spaceMarginBottom - spaceFrameSprite.height / 2;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i],
                touchLeft = touch.pageX - elLeft,
                touchTop = touch.pageY - elTop;
            let key = 0;

            let row = 0;
            if (touchTop >= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane1Yofs &&
                touchTop <= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane1Yofs + arrowSprite.height) {
                row = 1;
            }
            if (touchTop >= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane2Yofs &&
                touchTop <= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane2Yofs + arrowSprite.height) {
                row = 2;
            }
            if (touchTop >= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane3Yofs &&
                touchTop <= bujs.game.renderer.consts.laneYStart + bujs.game.renderer.consts.lane3Yofs + arrowSprite.height) {
                row = 3;
            }

            let leftRight = 0;
            if ((touchLeft >= leftPerfectX &&
                touchLeft <= leftPerfectX + arrowSprite.width) ||
                (touchLeft >= 0 &&
                    touchLeft <= bujs.game.renderer.sprites.tableL[0].width)) {
                leftRight = 1;
            }
            if ((touchLeft >= rightPerfectX &&
                touchLeft <= rightPerfectX + arrowSprite.width) ||
                (touchLeft >= bujs.game.renderer.config.canvasWidth - bujs.game.renderer.sprites.tableR[0].width &&
                    touchLeft <= bujs.game.renderer.config.canvasWidth)) {
                leftRight = 2;
            }

            if (row === 1 && leftRight === 1) key = 7;
            else if (row === 2 && leftRight === 1) key = 4;
            else if (row === 3 && leftRight === 1) key = 1;
            else if (row === 1 && leftRight === 2) key = 9;
            else if (row === 2 && leftRight === 2) key = 6;
            else if (row === 3 && leftRight === 2) key = 3;

            if (touchLeft >= spaceLeft && touchLeft <= spaceLeft + spaceFrameSprite.width &&
                touchTop >= spaceTop && touchTop <= spaceTop + spaceFrameSprite.height) {
                key = 5;
            }

            if (touchLeft >= 0 && touchLeft <= logoSprite.width &&
                touchTop >= bujs.game.renderer.config.canvasHeight - logoSprite.height && touchTop <= bujs.game.renderer.config.canvasHeight) {
                key = 5;
            }

            if (touchLeft >= bujs.game.renderer.config.canvasWidth - logoSprite.width && touchLeft <= bujs.game.renderer.config.canvasWidth &&
                touchTop >= bujs.game.renderer.config.canvasHeight - logoSprite.height && touchTop <= bujs.game.renderer.config.canvasHeight) {
                key = 5;
            }

            if (key !== 0) {
                this.keyDown(key);
            }
        }
    }

    touchEnd(_e: TouchEvent): void {
        const music = bujs.game.music;
        // TODO: BUM thingies...
        if (typeof music.musicStartTime === "undefined" || music.musicStartTime === null) {
            music.context.decodeAudioData(music.response!.slice(0), (buffer) => {
                music.musicSource = music.loadSound(buffer);
                music.musicStartTime = music.context.currentTime;
                music.musicSource.start(0);
                if (typeof music.onComponentFinishLoading !== "undefined") {
                    music.onComponentFinishLoading(music);
                }
            }, (error) => {
                console.error("Error decoding audio data", error);
            });
        }
    }
}
