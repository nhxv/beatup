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