BUJS.Input_ = function () {
    var _this = this;
    $("body")[0].onkeydown = function (e) {
        var keyCode = e.keyCode;
        _this.checkKeyboard_(keyCode);
    };
    var el = document.getElementsByTagName("canvas")[0];
    el.addEventListener("touchstart", function (e) {
        _this.touchStart_(e);
    }, false);
    if (bujs.iOS_) {
        el.addEventListener("touchend", function (e) {
            _this.touchEnd_(e);
        }, false);
    }
};

BUJS.Input_.prototype.checkKeyboard_ = function (keyCode) {
    var _this = this;
    switch (keyCode) {
        case 112:   // f1: toggle help
            bujs.game_.showHelp_ = !bujs.game_.showHelp_;
            break;
        case 113:   // f2: save replay
            break;
        case 114:   // f3: chance
            bujs.game_.chance_ = (bujs.game_.chance_ + 1) % 3;
            break;
        case 115:   // f4: background
            bujs.game_.showBg_ = (bujs.game_.showBg_ + 1) % (bujs.game_.renderer_.sprites_.background_.length + 1);
            break;
        case 16:    // lshift: toggle arrow perfect position
            bujs.game_.showPerfArrows_ = !bujs.game_.showPerfArrows_;
            break;
        case 93:    // rcommand/rwin: toggle autoplay
            bujs.game_.autoplay_ = !bujs.game_.autoplay_;
        case 55:    // 7
        case 82:    // r
        case 103:   // numpad7
        case 36:    // home
            if (!bujs.game_.autoplay_) _this.keyDown_(7);
            break;
        case 52:    // 4
        case 70:    // f
        case 100:   // numpad4
        case 37:    // left
            if (!bujs.game_.autoplay_) _this.keyDown_(4);
            break;
        case 49:    // 1
        case 86:    // v
        case 97:    // numpad1
        case 35:    // en
            if (!bujs.game_.autoplay_) _this.keyDown_(1);
            break;
        case 57:    // 9
        case 73:    // i
        case 105:   // numpad9
        case 33:    // pg up
            if (!bujs.game_.autoplay_) _this.keyDown_(9);
            break;
        case 54:    // 6
        case 74:    // j
        case 102:   // numpad6
        case 39:    // right
            if (!bujs.game_.autoplay_) _this.keyDown_(6);
            break;
        case 51:    // 3
        case 78:    // n
        case 99:    // numpad3
        case 34:    // pg dn
            if (!bujs.game_.autoplay_) _this.keyDown_(3);
            break;
        case 17:    // ctrl
        case 48:    // 0
        case 53:    // 5
        case 32:    // space
        case 71:    // b
        case 96:    // numpad0
        case 101:   // numpad5
            if (!bujs.game_.autoplay_) _this.keyDown_(5);
            break;

    }
};

BUJS.Input_.prototype.keyDown_ = function (keyMap) {
    var leftLane = true;
    var spriteLaneIndex = -1;
    var xOfs = 0;
    var xOfsBeat = 0;
    var yOfs = 0;
    var yOfsBeat = 0;
    switch (keyMap) {
        case 7 : spriteLaneIndex = 0; yOfs = bujs.game_.renderer_.consts_.lane1Yofs_; break;
        case 4 : spriteLaneIndex = 1; xOfsBeat = 6; yOfs = bujs.game_.renderer_.consts_.lane2Yofs_; break;
        case 1 : spriteLaneIndex = 2; yOfs = bujs.game_.renderer_.consts_.lane3Yofs_; break;
        case 9 : spriteLaneIndex = 3; leftLane = false; yOfs = bujs.game_.renderer_.consts_.lane1Yofs_; break;
        case 6 : spriteLaneIndex = 4; leftLane = false; xOfsBeat = -5; yOfs = bujs.game_.renderer_.consts_.lane2Yofs_; break;
        case 3 : spriteLaneIndex = 5; leftLane = false; yOfs = bujs.game_.renderer_.consts_.lane3Yofs_; break;
    }
    if (spriteLaneIndex >= 0) {
        if (leftLane) {
            xOfs = bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.tableWidthTrans_ - bujs.game_.renderer_.consts_.chanceDist_ - bujs.game_.renderer_.consts_.arrowLaneOfs_;
            xOfsBeat = xOfsBeat + bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.tableWidthTrans_ + bujs.game_.renderer_.consts_.laneWidth_ - bujs.game_.renderer_.consts_.chanceDist_ + bujs.game_.renderer_.consts_.arrowLaneOfs_;
        }
        else {
            xOfs = bujs.game_.renderer_.config_.canvasWidth_ - (bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.chanceDist_ + bujs.game_.renderer_.consts_.laneWidth_ - bujs.game_.renderer_.consts_.arrowLaneOfs_ + bujs.game_.renderer_.sprites_.a1_[0].width + 3);	// 3 is a little weird here.
            xOfsBeat = xOfsBeat + bujs.game_.renderer_.config_.canvasWidth_ - (bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.tableWidthTrans_ + bujs.game_.renderer_.consts_.laneWidth_ - bujs.game_.renderer_.consts_.chanceDist_ + bujs.game_.renderer_.consts_.arrowLaneOfs_ + bujs.game_.renderer_.sprites_.a1_[0].width + 1);
        }
        yOfsBeat = yOfs + bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.sprites_.a1_[0].height / 2 - bujs.game_.renderer_.sprites_.beatDown_[0].height / 2;
        yOfs = yOfs + bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.sprites_.a1_[0].height / 2 - bujs.game_.renderer_.sprites_.laneDown_[0].height / 2;

        // lane
        bujs.game_.animations_.push(new BUJS.Animation_(bujs.game_.renderer_, bujs.game_.music_.getCurrTime_(), bujs.game_.renderer_.consts_.arrowAnimationTime_, bujs.game_.renderer_.sprites_.laneDown_[spriteLaneIndex], xOfs, yOfs));

        // beat
        bujs.game_.animations_.push(new BUJS.Animation_(bujs.game_.renderer_, bujs.game_.music_.getCurrTime_(), bujs.game_.renderer_.consts_.arrowAnimationTime_, bujs.game_.renderer_.sprites_.beatDown_[spriteLaneIndex], xOfsBeat, yOfsBeat));
    }

    // space down
    if (keyMap === 5) {
        bujs.game_.animations_.push(new BUJS.Animation_(bujs.game_.renderer_, bujs.game_.music_.getCurrTime_(),
            bujs.game_.renderer_.consts_.arrowAnimationTime_,
            bujs.game_.renderer_.sprites_.spaceFrameExplode_[0],
            (bujs.game_.renderer_.config_.canvasWidth_ - bujs.game_.renderer_.sprites_.spaceFrameExplode_[0].width) / 2,
            bujs.game_.renderer_.config_.canvasHeight_ - bujs.game_.renderer_.consts_.spaceMarginBottom_ - bujs.game_.renderer_.sprites_.spaceFrameExplode_[0].height / 2));
    }

    bujs.game_.processNoteResult_(keyMap);
};

BUJS.Input_.prototype.touchStart_ = function (e) {
    e.preventDefault();
    var _this = this;
    var el = e.changedTouches[0].target,
        elLeft = el.offsetLeft,
        elTop = el.offsetTop,
        arrowSprite = bujs.game_.renderer_.sprites_.a7_[0],
        spaceFrameSprite = bujs.game_.renderer_.sprites_.spaceFrame_[0],
        logoSprite = bujs.game_.renderer_.sprites_.dnxpLogo_[0];
    var leftPerfectX = bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.tableWidthTrans_ +
                        bujs.game_.renderer_.consts_.laneWidth_ - bujs.game_.renderer_.consts_.chanceDist_ +
                        bujs.game_.renderer_.consts_.arrowLaneOfs_;
    var rightPerfectX = bujs.game_.renderer_.config_.canvasWidth_ -
                        (bujs.game_.renderer_.consts_.tableWidth_ - bujs.game_.renderer_.consts_.tableWidthTrans_ +
                            bujs.game_.renderer_.consts_.laneWidth_ - bujs.game_.renderer_.consts_.chanceDist_ +
                            bujs.game_.renderer_.consts_.arrowLaneOfs_ + arrowSprite.width);
    var spaceLeft = (bujs.game_.renderer_.config_.canvasWidth_ - spaceFrameSprite.width) / 2,
        spaceTop = bujs.game_.renderer_.config_.canvasHeight_ - bujs.game_.renderer_.consts_.spaceMarginBottom_ - spaceFrameSprite.height / 2;

    for (var i = 0; i < e.changedTouches.length; i++) {
        var touch = e.changedTouches[i],
            touchLeft = touch.pageX - elLeft,
            touchTop = touch.pageY - elTop;
        var key = 0;

        var row = 0;
        if (touchTop >= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane1Yofs_ &&
            touchTop <= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane1Yofs_ + arrowSprite.height) {
            row = 1;
        }
        if (touchTop >= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane2Yofs_ &&
            touchTop <= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane2Yofs_ + arrowSprite.height) {
            row = 2;
        }
        if (touchTop >= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane3Yofs_ &&
            touchTop <= bujs.game_.renderer_.consts_.laneYStart_ + bujs.game_.renderer_.consts_.lane3Yofs_ + arrowSprite.height) {
            row = 3;
        }

        var leftRight = 0;
        if ((touchLeft >= leftPerfectX &&
             touchLeft <= leftPerfectX + arrowSprite.width) ||
            (touchLeft >= 0 &&
             touchLeft <= bujs.game_.renderer_.sprites_.tableL_[0].width)) {
            leftRight = 1;
        }
        if ((touchLeft >= rightPerfectX &&
             touchLeft <= rightPerfectX + arrowSprite.width) ||
            (touchLeft >= bujs.game_.renderer_.config_.canvasWidth_ - bujs.game_.renderer_.sprites_.tableR_[0].width &&
             touchLeft <= bujs.game_.renderer_.config_.canvasWidth_)) {
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
            touchTop >= bujs.game_.renderer_.config_.canvasHeight_ - logoSprite.height && touchTop <= bujs.game_.renderer_.config_.canvasHeight_) {
            key = 5;
        }

        if (touchLeft >= bujs.game_.renderer_.config_.canvasWidth_ - logoSprite.width && touchLeft <= bujs.game_.renderer_.config_.canvasWidth_ &&
            touchTop >= bujs.game_.renderer_.config_.canvasHeight_ - logoSprite.height && touchTop <= bujs.game_.renderer_.config_.canvasHeight_) {
            key = 5;
        }


        if (key !== 0) {
            _this.keyDown_(key);
        }
    }

};

BUJS.Input_.prototype.touchEnd_ = function (e) {
    var _music = bujs.game_.music_;
    // TODO: BUM thingies...
    if (typeof _music.musicStartTime_ === 'undefined' || _music.musicStartTime_ === null) {
        _music.context_.decodeAudioData(_music.response_.slice(0), function (buffer) {
            _music.musicSource_ = _music.loadSound_(buffer);
            _music.musicStartTime_ = _music.context_.currentTime;
            _music.musicSource_.start(0);
            if (typeof _music.onComponentFinishLoading_ !== 'undefined') {
                _music.onComponentFinishLoading_.call(bujs.game_, _music);
            }
        }, function (error) {
            console.error("Error decoding audio data", error);
        });
    }
};