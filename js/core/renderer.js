/**
 * Constructor for this renderer
 */
 BUJS.Renderer_ = function (onComponentFinishLoading_) {
    var _this = this;
    _this.images_ = [];
    _this.onComponentFinishLoading_ = onComponentFinishLoading_;
    _this.setupConfig_();
    _this.setupSpriteInfo_();
    _this.setupSpriteConsts_();
};

/**
 * Load sprite images for each type in parallel
 */
BUJS.Renderer_.prototype.asyncLoadSprites_ = function () {
    var _this = this;
    async.eachOf(_this.sprites_, _this.loadSpritesForType_,
        function (err) {
            if (err) {
                console.error("Meh. Error", err);
            }
            else {
                // console.log("Finished loading sprites.");
                _this.initSpritePos_();
                // resize canvas
                var canvas = document.getElementById("cvs");
                _this.ctx_ = canvas.getContext("2d");
                var width = _this.config_.canvasWidth_ * _this.config_.scaleRatio_;
                var height = _this.config_.canvasHeight_ * _this.config_.scaleRatio_;
                canvas.width = width;
                canvas.height = height;

                if (typeof _this.onComponentFinishLoading_ !== "undefined") {
                    _this.onComponentFinishLoading_.call(bujs.game_, _this);
                }
            }
        });
};

/**
 * Initialize config variables
 */
BUJS.Renderer_.prototype.setupConfig_ = function () {
    this.config_ = {
        imagePath_          : "img/",
        scaleRatio_         : 1,
        canvasWidth_        : 980,
        canvasHeight_       : 400 // initial 400
    };
};

/**
 * Initialize sprite names
 */
BUJS.Renderer_.prototype.setupSpriteInfo_ = function () {
    var _this = this;
    _this.sprites_ = {
        background_: ["bg/lafesta.jpg"],
        dnxpLogo_  : ["dnxp.png"],
        laneDown_  : ["lane_7.png", "lane_4.png", "lane_1.png",
                     "lane_9.png", "lane_6.png", "lane_3.png"],
        beatDown_  : ["beatdown_7.png", "beatdown_4.png", "beatdown_1.png",
                      "beatdown_9.png", "beatdown_6.png", "beatdown_3.png"],
        tableL_    : ["tableL.png"],
        laneL_     : ["laneL.png"],
        landingL_  : ["landingL.png"],
        tableR_    : ["tableR.png"],
        laneR_     : ["laneR.png"],
        landingR_  : ["landingR.png"],
        spaceFrame_: ["space_frame.png"],
        spaceFrameCursor_  : ["space_frame_cursor.png"],
        spaceFrameExplode_ : ["space_frame_explode.png"],
        spaceExplode_      : ["space_frame_space_explode.png"],
        arrowExplode_      : ["arrow_explode.png"],
        a7_        : ["a71.png", "a72.png", "a73.png", "a74.png", "a75.png", "a76.png", "a77.png", "a78.png"],
        a4_        : ["a41.png", "a42.png", "a43.png", "a44.png", "a45.png", "a46.png", "a47.png", "a48.png"],
        a1_        : ["a11.png", "a12.png", "a13.png", "a14.png", "a15.png", "a16.png", "a17.png", "a18.png"],
        a9_        : ["a91.png", "a92.png", "a93.png", "a94.png", "a95.png", "a96.png", "a97.png", "a98.png"],
        a6_        : ["a61.png", "a62.png", "a63.png", "a64.png", "a65.png", "a66.png", "a67.png", "a68.png"],
        a3_        : ["a31.png", "a32.png", "a33.png", "a34.png", "a35.png", "a36.png", "a37.png", "a38.png"],
        spaceFrameLetters_             : ["space_frame_letter_b.png", "space_frame_letter_e.png", "space_frame_letter_a.png",
                                        "space_frame_letter_t.png", "space_frame_letter_u.png", "space_frame_letter_p.png"],
        spaceFrameLetterGlowBlue_      : ["space_frame_letter_glow_blue.png"],
        spaceFrameLetterGlowYellow_    : ["space_frame_letter_glow_yellow.png"],
        spaceFrameGlowBlue_            : ["space_frame_glow_blue.png"],
        spaceFrameGlowYellow_          : ["space_frame_glow_yellow.png"],
        blueUp_        : ["up_1.png"],
        yellowUp_      : ["up.png"],
        noteResults_   : ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"],
        delIcons_      : ["del_1.png", "del_2.png"],
        chanceIcons_      : ["chance_1.png", "chance_2.png", "chance_3.png", "chance_4.png"],
        c7_        : ["c71.png"],
        c4_        : ["c41.png"],
        c1_        : ["c11.png"],
        c9_        : ["c91.png"],
        c6_        : ["c61.png"],
        c3_        : ["c31.png"]
    };

    for (var key in _this.sprites_) _this.sprites_[key]._this = _this;   // add _this...
};

/**
 * Some special constants for drawing
 */
BUJS.Renderer_.prototype.setupSpriteConsts_ = function () {
    var _this = this;
    _this.consts_ = {
        chanceDist_         : 90, // initial value 80
        baseResultLine_     : 150,
        arrowAnimationTime_ : 135, // initial value 135, time arrow explode animate
        laneYStart_         : _this.config_.canvasHeight_ - 350,
        lane1Yofs_          : 3,
        lane2Yofs_          : 3+64,        // Renderer_.spritePos_.lane1Yofs + 64,
        lane3Yofs_          : 3+64+64,     // Renderer_.spritePos_.lane2Yofs + 64,
        lane2Xofs_          : 5,
        laneWidth_          : 256, // initial value 256
        tableWidth_         : 123,
        tableWidthTrans_    : 3,
        arrowLaneOfs_       : 1,
        spaceMarginBottom_  : 80, // initial value 80
        beatupLetterDist_   : 46,
        dnxpLogoMargin_     : 50, // initial value 20
        textHeight_         : 20,
        textMarginTop_      : 64,
        numNotes_           : 14,
        playerListUp_       : 40,
        playerListName_     : 200,
        playerListScore_    : 60,
        playerListYofs_     : 80,
        scoreTableXofs_     : (_this.config_.canvasWidth_ - 600) / 2,
        fontSize_           : 11,
        helpYofs_           : 150
    }
};


/**
 * Load a set of images for a type, e.g.
 * { noteResults   : ["perfect.png", "great.png", "cool.png", "bad.png", "miss.png"] },
 */
BUJS.Renderer_.prototype.loadSpritesForType_ = function (spriteInfo, key, callback) {
    var _this = spriteInfo._this;
    async.each(spriteInfo, function (fileName, urlCallback) {
            if (typeof fileName !== "string") return;
            // console.log("sprite", key, "fetching ", fileName);
            var img = new Image();
            img.onload = function () {
                if (typeof _this.sprites_[key] === "undefined") {
                    _this.sprites_[key] = [];
                }
                _this.sprites_[key][spriteInfo.indexOf(fileName)] = img;
                urlCallback();
            };
            img.src = _this.config_.imagePath_ + fileName;
        },
        function (err) {
            // loaded all images for one spriteInfo ok.
            if (err) {
                console.error("Meh. Error", err);
            }
            else {
                // console.log("Finished fetching images for object", key);
                callback();
            }
        });
};

/**
 * Clear the whole canvas
 */
BUJS.Renderer_.prototype.clear_ = function () {
    var _this = this;
    if (_this.ctx_) {
        _this.ctx_.fillStyle = "black";
        _this.ctx_.clearRect(0, 0, _this.config_.canvasWidth_, _this.config_.canvasHeight_);
    }
};

/**
 * A wrapper to write some text on canvas
 */
BUJS.Renderer_.prototype.writeText_ = function (pos, text, font, size, color) {
    var _this = this;
    if (!size) size = "12px";
    if (!font) font = "Segoe UI";
    if (!color) color = "white";
    _this.ctx_.font = size + " " + font;
    _this.ctx_.fillStyle = color;
    _this.ctx_.textAlign = "left";
    _this.ctx_.fillText(text, pos.x, pos.y);
};

/**
 * Draw a specific sprite
 */
BUJS.Renderer_.prototype.drawSprite_ = function (sprite, scale) {
    var _this = this;
    if (typeof sprite === "undefined" || sprite === null) {
        console.log("meh.");
    }
    if (typeof sprite !== "undefined" && sprite !== null && typeof sprite.pos !== "undefined") {
        if (typeof scale === "undefined") scale = 1;
        _this.ctx_.drawImage(sprite, sprite.pos.x, sprite.pos.y, sprite.width * scale, sprite.height * scale);
    }
};

/**
 * Draw fix contents, such as lanes, landings, logo...
 */
BUJS.Renderer_.prototype.drawFixContent_ = function (combo) {
    var _this = this;

    // lane, landing, logo
    _this.drawSprite_(_this.sprites_.laneL_[0]);
    _this.drawSprite_(_this.sprites_.laneR_[0]);
    _this.drawSprite_(_this.sprites_.landingL_[0]);
    _this.drawSprite_(_this.sprites_.landingR_[0]);
    _this.drawSprite_(_this.sprites_.dnxpLogo_[0]);
    _this.drawSpaceFrame_(combo);
    _this.drawResults_();
};

BUJS.Renderer_.prototype.drawTouchArrows_ = function () {
    var _this = this;
    _this.drawSprite_(_this.sprites_.c7_[0]);
    _this.drawSprite_(_this.sprites_.c9_[0]);
    _this.drawSprite_(_this.sprites_.c4_[0]);
    _this.drawSprite_(_this.sprites_.c6_[0]);
    _this.drawSprite_(_this.sprites_.c1_[0]);
    _this.drawSprite_(_this.sprites_.c3_[0]);
};

BUJS.Renderer_.prototype.drawResults_ = function () {
    var _this = this;
    var x = (_this.config_.canvasWidth_ - 135) / 2;
    var y = (_this.consts_.laneYStart_ + _this.consts_.textMarginTop_);
    _this.writeText_({x: x, y: y},
        'P/G/C/B/M: ' + bujs.game_.pgcbm_[0] + '/'
        + bujs.game_.pgcbm_[1] + '/' + bujs.game_.pgcbm_[2] + '/'
        + bujs.game_.pgcbm_[3] + '/' + bujs.game_.pgcbm_[4]);
    _this.writeText_({x: x, y: y + 16}, 'Score: ' + Math.round(bujs.game_.score_));
    _this.writeText_({x: x, y: y + 32}, 'Current Combo: ' + bujs.game_.combo_);
    _this.writeText_({x: x, y: y + 48}, 'Highest Combo: ' + bujs.game_.highestCombo_);
    var pgcbm = bujs.game_.pgcbm_,
        perpercent = 0;
    if (pgcbm[0] !== 0 || pgcbm[1] !== 0 ||
        pgcbm[2] !== 0 || pgcbm[3] !== 0 ||
        pgcbm[4] !== 0) {
        perpercent = (pgcbm[0] * 100) / (pgcbm[0] + pgcbm[1] + pgcbm[2] + pgcbm[3] + pgcbm[4]);
    }
    _this.writeText_({x: x, y: y + 64}, 'Per %: ' + perpercent.toFixed(2) + '%');
    _this.writeText_({x: x, y: y + 80}, 'Per Combo: ' + bujs.game_.xmax_);
};

/**
 * Draw space frame
 */
BUJS.Renderer_.prototype.drawSpaceFrame_ = function (combo) {
    var _this = this;
    if (combo) {
        if (combo >= 100 && combo < 400) {
            _this.drawSprite_(_this.sprites_.spaceFrameGlowYellow_[0]);
        }
        else if (combo >= 400) {
            _this.drawSprite_(_this.sprites_.spaceFrameGlowBlue_[0]);
        }
    }
    _this.drawSprite_(_this.sprites_.spaceFrame_[0]);
};

/**
 * Beat Up text at the bottom
 */
BUJS.Renderer_.prototype.drawBeatupText_ = function (combo) {
    var _this = this;
    // B-E-A-T-U-P glows
    var letterGlow1 = null;
    var letterGlow2 = null;
    var numGlow1 = 0;
    var numGlow2 = 0;

    // decide what to draw
    if (combo >= 400) {
        // all blue
        letterGlow1 = _this.sprites_.spaceFrameLetterGlowBlue_;
        numGlow1 = 6;
    }
    else if (combo >= 100) {
        // some blue + some yellow
        letterGlow1 = _this.sprites_.spaceFrameLetterGlowBlue_;
        letterGlow2 = _this.sprites_.spaceFrameLetterGlowYellow_;
        numGlow1 = Math.floor((combo - 100) / 50);
        numGlow2 = 6 - numGlow1;
    }
    else {
        // some yellow
        letterGlow1 = _this.sprites_.spaceFrameLetterGlowYellow_;
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
            _this.setSpritePos_(letterGlow1[0],
                _this.config_.canvasWidth_ / 2 - _this.consts_.beatupLetterDist_ / 2 * (5 - i * 2) - _this.sprites_.spaceFrameLetterGlowBlue_[0].width / 2,
                _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrameLetterGlowBlue_[0].height / 2);
            _this.drawSprite_(letterGlow1[0]);

            // and its letter
            _this.drawSprite_(_this.sprites_.spaceFrameLetters_[i]);
        }
    }
    if (letterGlow2 != null) {
        for (var i = numGlow1; i < numGlow1 + numGlow2; i++) {
            // the glow
            _this.setSpritePos_(letterGlow2[0],
                _this.config_.canvasWidth_ / 2 - _this.consts_.beatupLetterDist_ / 2 * (5 - i * 2) - _this.sprites_.spaceFrameLetterGlowBlue_[0].width / 2,
                _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrameLetterGlowBlue_[0].height / 2);
            _this.drawSprite_(letterGlow2[0]);

            // and its letter
            _this.drawSprite_(_this.sprites_.spaceFrameLetters_[i]);
        }
    }
};

/**
 * Draw table parts. Should be called last to overdraw the arrows
 */
BUJS.Renderer_.prototype.drawTable_ = function () {
    var _this = this;
    _this.drawSprite_(_this.sprites_.tableL_[0]);
    _this.drawSprite_(_this.sprites_.tableR_[0]);
};

/**
 * Set sprite position
 */
BUJS.Renderer_.prototype.setSpritePos_ = function (img, posX, posY) {
    img.pos = {x: posX, y: posY};
};

/**
 * Define sprite position. These are fixed.
 */
BUJS.Renderer_.prototype.initSpritePos_ = function () {
    var _this = this;
    _this.setSpritePos_(_this.sprites_.dnxpLogo_[0],
        _this.config_.canvasWidth_ - _this.sprites_.dnxpLogo_[0].width - _this.consts_.dnxpLogoMargin_,
        _this.config_.canvasHeight_ - _this.sprites_.dnxpLogo_[0].height - _this.consts_.dnxpLogoMargin_);

    _this.setSpritePos_(_this.sprites_.tableL_[0],
        0,
        _this.consts_.laneYStart_);

    _this.setSpritePos_(_this.sprites_.laneL_[0],
        _this.consts_.tableWidth_ - _this.consts_.tableWidthTrans_ - _this.consts_.chanceDist_,
        _this.consts_.laneYStart_);

    _this.setSpritePos_(_this.sprites_.landingL_[0],
        _this.sprites_.laneL_[0].pos.x + _this.consts_.laneWidth_,
        _this.consts_.laneYStart_);


    _this.setSpritePos_(_this.sprites_.tableR_[0],
        _this.config_.canvasWidth_ - _this.consts_.tableWidth_,
        _this.consts_.laneYStart_);

    _this.setSpritePos_(_this.sprites_.laneR_[0],
        _this.config_.canvasWidth_ - _this.consts_.tableWidth_ + _this.consts_.tableWidthTrans_ - _this.consts_.laneWidth_ + _this.consts_.chanceDist_,
        _this.consts_.laneYStart_);

    _this.setSpritePos_(_this.sprites_.landingR_[0],
        _this.config_.canvasWidth_ - _this.consts_.tableWidth_ + _this.consts_.tableWidthTrans_ - _this.consts_.laneWidth_ - _this.sprites_.landingR_[0].width + _this.consts_.chanceDist_,
        _this.consts_.laneYStart_);

    _this.setSpritePos_(_this.sprites_.spaceFrame_[0],
        (_this.config_.canvasWidth_ - _this.sprites_.spaceFrame_[0].width) / 2,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrame_[0].height / 2);

    // del icons
    _this.setSpritePos_(_this.sprites_.delIcons_[0], 
        _this.config_.canvasWidth_/2 + _this.sprites_.spaceFrame_[0].width/2, 
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.delIcons_[0].height / 2);

    _this.setSpritePos_(_this.sprites_.delIcons_[1],
        _this.config_.canvasWidth_/2 + _this.sprites_.spaceFrame_[0].width/2,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.delIcons_[1].height / 2);

    // chance icons
    _this.setSpritePos_(_this.sprites_.chanceIcons_[0],
        _this.config_.canvasWidth_/2 - _this.sprites_.spaceFrame_[0].width/2 - _this.sprites_.chanceIcons_[0].width,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.chanceIcons_[0].height / 2);

    _this.setSpritePos_(_this.sprites_.chanceIcons_[1],
        _this.config_.canvasWidth_/2 - _this.sprites_.spaceFrame_[0].width/2 - _this.sprites_.chanceIcons_[1].width,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.chanceIcons_[1].height / 2);

    _this.setSpritePos_(_this.sprites_.chanceIcons_[2],
        _this.config_.canvasWidth_/2 - _this.sprites_.spaceFrame_[0].width/2 - _this.sprites_.chanceIcons_[2].width,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.chanceIcons_[2].height / 2);

    _this.setSpritePos_(_this.sprites_.chanceIcons_[3],
        _this.config_.canvasWidth_/2 - _this.sprites_.spaceFrame_[0].width/2 - _this.sprites_.chanceIcons_[3].width,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.chanceIcons_[3].height / 2);

    // space glows
    _this.setSpritePos_(_this.sprites_.spaceFrameGlowBlue_[0],
        (_this.config_.canvasWidth_ - _this.sprites_.spaceFrame_[0].width) / 2,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrame_[0].height / 2);

    _this.setSpritePos_(_this.sprites_.spaceFrameGlowYellow_[0],
        (_this.config_.canvasWidth_ - _this.sprites_.spaceFrame_[0].width) / 2,
        _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrame_[0].height / 2);

    // B-E-A-T-U-P letters
    for (var i = 0; i < 6; i++) {
        _this.setSpritePos_(_this.sprites_.spaceFrameLetters_[i],
            _this.config_.canvasWidth_ / 2 - _this.consts_.beatupLetterDist_ / 2 * (5 - i * 2) - _this.sprites_.spaceFrameLetters_[0].width / 2,
            _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrameLetters_[0].height / 2);
    }
    var leftX = 0,
        rightX = _this.config_.canvasWidth_ - _this.sprites_.a7_[0].width;
    _this.setSpritePos_(_this.sprites_.c7_[0], leftX, _this.consts_.laneYStart_ + _this.consts_.lane1Yofs_);
    _this.setSpritePos_(_this.sprites_.c9_[0], rightX, _this.consts_.laneYStart_ + _this.consts_.lane1Yofs_);
    _this.setSpritePos_(_this.sprites_.c4_[0], leftX, _this.consts_.laneYStart_ + _this.consts_.lane2Yofs_);
    _this.setSpritePos_(_this.sprites_.c6_[0], rightX, _this.consts_.laneYStart_ + _this.consts_.lane2Yofs_);
    _this.setSpritePos_(_this.sprites_.c1_[0], leftX, _this.consts_.laneYStart_ + _this.consts_.lane3Yofs_);
    _this.setSpritePos_(_this.sprites_.c3_[0], rightX, _this.consts_.laneYStart_ + _this.consts_.lane3Yofs_);
};


/**
 * Draw a single arrow on the lane/landing
 */
BUJS.Renderer_.prototype.drawArrow_ = function (arrowSprite, xOfs, yOfs, leftLane, noteTime) {
    var _this = this;
    var delta = 0; // initial value 0
    var x = 0;
    var y = _this.consts_.laneYStart_ + yOfs;
    var currTime = bujs.game_.music_.getCurrTime_();
    if (leftLane) {
        x = (xOfs + _this.consts_.tableWidth_ - _this.consts_.tableWidthTrans_ +
            _this.consts_.laneWidth_ - _this.consts_.chanceDist_ +
            _this.consts_.arrowLaneOfs_) -
            (noteTime - currTime - delta) * 40.0 / bujs.game_.music_.tickTime_;
    }
    else {
        x = _this.config_.canvasWidth_ -
            (xOfs + _this.consts_.tableWidth_ - _this.consts_.tableWidthTrans_ +
                _this.consts_.laneWidth_ - _this.consts_.chanceDist_ +
                _this.consts_.arrowLaneOfs_ + arrowSprite.width) +
            (noteTime - currTime - delta) * 40.0 / bujs.game_.music_.tickTime_;
    }

    // skip out of visible areas
    if (x > _this.config_.canvasWidth_ - _this.consts_.tableWidth_ || x + arrowSprite.width < _this.consts_.tableWidth_) {
        return;
    }

    _this.setSpritePos_(arrowSprite, x, y);
    _this.drawSprite_(arrowSprite);
};

/**
 * Draw arrows for perfect alignment
 */
BUJS.Renderer_.prototype.drawPerfectArrows_ = function () {
    var _this = this;
    var xOfs = 1;
    _this.drawArrow_(_this.sprites_.a7_[0], xOfs, _this.consts_.lane1Yofs_, true, bujs.game_.music_.getCurrTime_());
    _this.drawArrow_(_this.sprites_.a9_[0], xOfs, _this.consts_.lane1Yofs_, false, bujs.game_.music_.getCurrTime_());
    _this.drawArrow_(_this.sprites_.a4_[0], xOfs + _this.consts_.lane2Xofs_, _this.consts_.lane2Yofs_, true, bujs.game_.music_.getCurrTime_());
    _this.drawArrow_(_this.sprites_.a6_[0], xOfs + _this.consts_.lane2Xofs_, _this.consts_.lane2Yofs_, false, bujs.game_.music_.getCurrTime_());
    _this.drawArrow_(_this.sprites_.a1_[0], xOfs, _this.consts_.lane3Yofs_, true, bujs.game_.music_.getCurrTime_());
    _this.drawArrow_(_this.sprites_.a3_[0], xOfs, _this.consts_.lane3Yofs_, false, bujs.game_.music_.getCurrTime_());

};

/**
 * Draw arrows for current notes;
 */
BUJS.Renderer_.prototype.drawNotes_ = function (currTime) {
    var _this = this;
    var lastAvailNote = Math.min(bujs.game_.firstAvailNote_ + _this.consts_.numNotes_, bujs.game_.music_.songInfo_.notes_.length);
    if (bujs.game_.firstAvailNote_ >= 0) {
        var tickTime = bujs.game_.music_.tickTime_;
        for (var i = bujs.game_.firstAvailNote_; i < lastAvailNote; i++) {
            var note = bujs.game_.music_.songInfo_.notes_[i];
            var noteTime = note.t;
            var noteKey = note.n;

            // max note time for drawing
            var maxArrowAvailTime = currTime + tickTime * (_this.consts_.numNotes_ + 1);
            var maxSpaceAvailTime = currTime + tickTime * 8;
            if ((noteKey !== 5 && noteTime > maxArrowAvailTime) ||
                (noteKey === 5 && noteTime > maxSpaceAvailTime)) break;


            // only draw unpressed notes
            if (!note.pressed_) {
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
                if (bujs.game_.chance_ === 0) {
                    switch (noteKey) {
                        case 7 : arrowToDraw = _this.sprites_.a7_[imageIndex]; yOfs = _this.consts_.lane1Yofs_; break;
                        case 4 : arrowToDraw = _this.sprites_.a4_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 1 : arrowToDraw = _this.sprites_.a1_[imageIndex]; yOfs = _this.consts_.lane3Yofs_; break;
                        case 9 : leftLane = false; arrowToDraw = _this.sprites_.a9_[imageIndex]; yOfs = _this.consts_.lane1Yofs_;  break;
                        case 6 : leftLane = false; arrowToDraw = _this.sprites_.a6_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 3 : leftLane = false; arrowToDraw = _this.sprites_.a3_[imageIndex]; yOfs = _this.consts_.lane3Yofs_; break;
                    }
                }
                // set chance number 1 : all mid lane
                if (bujs.game_.chance_ === 1) {
                    switch (noteKey) {
                        case 7 : arrowToDraw = _this.sprites_.a7_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 4 : arrowToDraw = _this.sprites_.a4_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 1 : arrowToDraw = _this.sprites_.a1_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 9 : leftLane = false; arrowToDraw = _this.sprites_.a9_[imageIndex]; yOfs = _this.consts_.lane2Yofs_;  break;
                        case 6 : leftLane = false; arrowToDraw = _this.sprites_.a6_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 3 : leftLane = false; arrowToDraw = _this.sprites_.a3_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                    }
                }
                // set chance number 2 : invert up/down
                if (bujs.game_.chance_ === 2) {
                    switch (noteKey) {
                        case 7 : arrowToDraw = _this.sprites_.a7_[imageIndex]; yOfs = _this.consts_.lane3Yofs_; break;
                        case 4 : arrowToDraw = _this.sprites_.a4_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 1 : arrowToDraw = _this.sprites_.a1_[imageIndex]; yOfs = _this.consts_.lane1Yofs_; break;
                        case 9 : leftLane = false; arrowToDraw = _this.sprites_.a9_[imageIndex]; yOfs = _this.consts_.lane3Yofs_;  break;
                        case 6 : leftLane = false; arrowToDraw = _this.sprites_.a6_[imageIndex]; yOfs = _this.consts_.lane2Yofs_; break;
                        case 3 : leftLane = false; arrowToDraw = _this.sprites_.a3_[imageIndex]; yOfs = _this.consts_.lane1Yofs_; break;
                    }
                }

                // draw it!
                if (arrowToDraw !== null) {
                    _this.drawArrow_(arrowToDraw, xOfs, yOfs, leftLane, noteTime);
                }
                else if (noteKey === 5) {
                    // a space?
                    var cursorLx = (_this.config_.canvasWidth_ - _this.sprites_.spaceFrameCursor_[0].width) / 2 - (noteTime - currTime)/tickTime*31.0/2;
                    var cursorRx = (_this.config_.canvasWidth_ - _this.sprites_.spaceFrameCursor_[0].width)/  2 + (noteTime - currTime)/tickTime*31.0/2;
                    var cursorY = _this.config_.canvasHeight_ - _this.consts_.spaceMarginBottom_ - _this.sprites_.spaceFrameCursor_[0].height / 2;
                    _this.setSpritePos_(_this.sprites_.spaceFrameCursor_[0], cursorLx, cursorY);
                    _this.drawSprite_(_this.sprites_.spaceFrameCursor_[0]);

                    _this.setSpritePos_(_this.sprites_.spaceFrameCursor_[0], cursorRx, cursorY);
                    _this.drawSprite_(_this.sprites_.spaceFrameCursor_[0]);
                }
            }
        }
    }
};

/**
 * Draw note result big text (p/g/c/b/m) on top
 */
BUJS.Renderer_.prototype.drawBigNoteResultText_ = function () {
    var _this = this;
    if (bujs.game_.lastNoteTime_ > 0) {
        var diff = bujs.game_.music_.getCurrTime_() - bujs.game_.lastNoteTime_;
        var noteResult = _this.sprites_.noteResults_[bujs.game_.lastNoteResult_];

        // result width / height
        var ratio = 1;
        if (diff < 50) ratio = 1 + (50 - diff) / 90;

        // draw it with ratio
        _this.setSpritePos_(noteResult, (_this.config_.canvasWidth_ - noteResult.width * ratio) / 2, (_this.consts_.baseResultLine_ - noteResult.height * ratio) / 2);
        _this.drawSprite_(noteResult, ratio);

        if (diff > 200) {
            bujs.game_.lastNoteResult_ = 0;
            bujs.game_.lastNoteTime_ = 0;
        }
    }
};