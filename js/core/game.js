BUJS.Game_ = function (songId) {
    var _this = this;
    _this.songId_ = songId;
    _this.loadedComponent_ = [];
    _this.isOn_ = false; // game state
    _this.isTab_ = false // dont save record when player use tab to turn game off;

    _this.frameCount_ = 0;
    _this.fps_ = 0;

    _this.firstAvailNote_ = 0;
    _this.lastNoteResult_ = 0;
    _this.lastNoteTime_ = 0;
    _this.lastTime_ = 0;

    _this.pgcbm_ = [0, 0, 0, 0, 0];
    _this.score_ = 0;
    _this.perx_ = 0;
    _this.highestCombo_ = 0;
    _this.combo_ = 0;
    _this.xmax_ = 0;
    _this.chance_ = 0;

    _this.showBg_ = 0;
    _this.showPerfArrows_ = false;
    _this.showHelp_ = false;

    _this.numSelect_ = 0;
    _this.animations_ = [];
    _this.players_ = []; 

    _this.autoplay_ = false;
    _this.alwaysCorrect_ = false;

    _this.noteScores_ = [520, 260, 130, 26, 0];
    _this.spaceScores_ = [2000, 1500, 1000, 500, 0];
    _this.yellowBeatupRatio_ = 1.2;
    _this.blueBeatupRatio_ = 1.55;


    // load music and renderer; setTimeout for offset?
    setTimeout(function () {
        _this.music_ = new BUJS.Music_(_this.onComponentFinishLoading_);
    }, 0);

    _this.renderer_ = new BUJS.Renderer_(_this.onComponentFinishLoading_);
    _this.renderer_.asyncLoadSprites_();
    _this.input_ = new BUJS.Input_();
};

/**
 * Callback whenever we have a component finished loading
 */
BUJS.Game_.prototype.onComponentFinishLoading_ = function (component) {
    var _this = this;
    if (typeof component !== "undefined") {
        var componentType = component.constructor.name;
        // console.log("Component finished loading " + componentType);
        if (_this.loadedComponent_.indexOf(component) < 0) {
            _this.loadedComponent_.push(componentType);
        }
        if (_this.loadedComponent_.length === 2) {     // renderer & music
            // initialize remaining animation parameters
            _this.onFinishLoading_();
        }
    }
    $('html,body').animate({scrollTop: document.body.scrollHeight}, "fast"); // auto scroll to bottom
};

/**
 * Callback whenever we have ALL components (Renderer & Music) finished loading
 */
BUJS.Game_.prototype.onFinishLoading_ = function () {
    var _this = this;
    _this.isOn_ = true;
    gl_();
};

// obviously not belong to game class
function gl_() {
    if (bujs.game_.isOn_) {
        bujs.game_.loop_();
    } else {
        bujs.game_.drawMotionless_();

        // TODO: save final result; print to console for now - dont save when player use tab to turn game off
        if (!bujs.game_.isTab_) {
            console.log('Song: ' + bujs.game_.songId_);
            console.log('Score: ' + Math.round(bujs.game_.score_));
            console.log('Combo: ' + bujs.game_.highestCombo_);
            console.log('Perfect: ' + bujs.game_.pgcbm_[0]);
            console.log('Great: ' + bujs.game_.pgcbm_[1]);
            console.log('Cool: ' + bujs.game_.pgcbm_[2]);
            console.log('Bad: ' + bujs.game_.pgcbm_[3]);
            console.log('Miss: ' + bujs.game_.pgcbm_[4]);
        }
    }
}

/**
 * Main game loop
 */
BUJS.Game_.prototype.loop_ = function () {
    var _this = this;
    _this.update_();
    _this.draw_();
    window.requestAnimationFrame(gl_);
};

/**
 * Draw the whole scene
 */
BUJS.Game_.prototype.draw_ = function () {
    var _this = this;

    _this.drawMotionless_();

    _this.processAnimations_();
    _this.renderer_.drawNotes_(_this.music_.getCurrTime_());
    _this.renderer_.drawBigNoteResultText_();

    _this.checkMiss_();

    _this.renderer_.drawTable_(); // draw last to cover arrow
    // _this.renderer_.drawTouchArrows_(); remove this method by toggle later
};

BUJS.Game_.prototype.drawMotionless_ = function () {
    var _this = this;

    _this.renderer_.clear_();

    if (bujs.game_.showBg_ !== 0) {
        _this.renderer_.drawSprite_(_this.sprites_.background_[bujs.game_.showBg_ - 1]);
    }

    if (typeof _this.music_.musicStartTime_ === 'undefined' || _this.music_.musicStartTime_ === null) {
        bujs.showLoadingMsg_("Touch/click to start music");
    }

    // fps
    var fps = _this.calcFps_();
    var posFps = {x: 20, y: 10};
    _this.renderer_.writeText_(posFps, fps.toFixed(1) + ' fps');
    
    // song time
    if (_this.music_.getCurrTime_() / 1000 >= _this.music_.musicEndTime_) {
        _this.endGame_();
    }

    if (_this.isOn_) {
        _this.renderer_.writeText_(
            {x: 20, y: _this.renderer_.config_.canvasHeight_ - 8}, 
            _this.processSongTime_(Math.round(_this.music_.getCurrTime_() / 1000)) + " / " +
            _this.processSongTime_(Math.ceil(_this.music_.musicEndTime_)) 
        );
    } else {
        _this.renderer_.writeText_(
            {x: 20, y: _this.renderer_.config_.canvasHeight_ - 8}, 
            _this.processSongTime_(Math.ceil(_this.music_.musicEndTime_)) 
        );
    }


    // song name
    _this.renderer_.writeText_(
        {x: 20, y: _this.renderer_.config_.canvasHeight_ - 24}, 
        _this.music_.songInfo_.name + " - " + _this.music_.songInfo_.singer + 
        " (" + Math.round(_this.music_.songInfo_.bpm) + " bpm)"
    );

    // lanes, landings, icons, logo, space frame, scoreboard...
    _this.renderer_.drawFixContent_(_this.combo_);
    _this.renderer_.drawBeatupText_(_this.combo_);

    // when game stop, draw table
    if (!_this.isOn_) {
        _this.renderer_.drawTable_();
    }
}

BUJS.Game_.prototype.processSongTime_ = function(time) {
    var minutes = Math.floor(time / 60);
    var seconds = time - minutes * 60;
    var formatSec = seconds.toLocaleString('en-US', {minimumIntegerDigits: 2});
    return minutes + ':' + formatSec;
}

/**
 * Update game status
 */
BUJS.Game_.prototype.update_ = function () {
    var _this = this;

};

/**
 * Calculate frame per sec, not from beginning but for each sec
 */
BUJS.Game_.prototype.calcFps_ = function () {
    var _this = this;
    var currTime = _this.music_.getCurrTime_();
    _this.frameCount_ ++;
    if (_this.lastTime_ === 0) {
        _this.lastTime_ = currTime;
    }
    if (currTime > _this.lastTime_ + 1000) {
        _this.fps_ = _this.frameCount_ / (currTime - _this.lastTime_) * 1000;
        _this.lastTime_ = currTime;
        _this.frameCount_ = 0;
    }
    return _this.fps_;
};

BUJS.Game_.prototype.checkMiss_ = function () {
    var _this = this;
    var currTime = _this.music_.getCurrTime_();
    var maxNotes = Math.min(_this.firstAvailNote_ + _this.renderer_.consts_.numNotes_, _this.music_.songInfo_.notes_.length);
    if (_this.autoplay_) {
        if (_this.firstAvailNote_ >= 0) {
            // still have notes
            for (var i = _this.firstAvailNote_; i < maxNotes; i++) {
                if (_this.music_.songInfo_.notes_[i].t < currTime + 5) {
                    _this.input_.keyDown_(_this.music_.songInfo_.notes_[i].n);
                    //processKeyboard(true, 0, -1);

                    break;
                }
            }
        }
    }
    else {
        // check for misses
        if (_this.firstAvailNote_ >= 0) {
            // still have notes
            for (i = _this.firstAvailNote_; i < maxNotes; i++) {
                if (currTime > _this.music_.songInfo_.notes_[i].t + _this.music_.tickTime_ * 2) {
                    _this.music_.songInfo_.notes_[i].pressed_ = true;
                    _this.lastNoteResult_ = 4;		// 'missed' for the animation
                    _this.lastNoteTime_ = currTime;
                    _this.music_.playSound_(_this.music_.sounds_.miss_);
                    _this.updateScore_(_this.music_.songInfo_.notes_[i].n, 4);
                }
            }
        }

        // recalculate first_avail_note
        _this.firstAvailNote_ = -1;
        for (var j = 0; j < _this.music_.songInfo_.notes_.length; j++) {
            if (!_this.music_.songInfo_.notes_[j].pressed_) {
                _this.firstAvailNote_ = j;
                break;
            }
        }
    }
};

BUJS.Game_.prototype.processNoteResult_ = function (keyMap) {
    var _this = this;
    var noteResult = -1;
    if (keyMap !== 0 || _this.autoplay_) {
        var currTime = _this.music_.getCurrTime_();
        for (var i = _this.firstAvailNote_; i < _this.firstAvailNote_ + 4; i++) {
            if (_this.firstAvailNote_ >= _this.music_.songInfo_.notes_.length || _this.firstAvailNote_ < 0) break;
            var note = _this.music_.songInfo_.notes_[i];
            var noteKey = note.n;
            var keyTime = currTime - note.t;

            if (noteKey === keyMap || _this.autoplay_ || _this.alwaysCorrect_) {
                noteResult = _this.getKeyResult_(keyTime);
                if (noteKey === 5) {
                    _this.animations_.push(new BUJS.Animation_(_this.renderer_, currTime, _this.renderer_.consts_.arrowAnimationTime_, _this.renderer_.sprites_.spaceFrameExplode_[0],
                        (_this.renderer_.config_.canvasWidth_ - _this.renderer_.sprites_.spaceFrameExplode_[0].width) / 2,
                        _this.renderer_.config_.canvasHeight_ - _this.renderer_.consts_.spaceMarginBottom_ - _this.renderer_.sprites_.spaceFrameExplode_[0].height / 2));
                }
                // not an "outside" key? a correct key?
                if (noteResult >= 0 || _this.autoplay_) {
                    switch (noteKey){
                        case 5 : _this.animations_.push(new BUJS.Animation_(_this.renderer_, currTime, _this.renderer_.consts_.arrowAnimationTime_, _this.renderer_.sprites_.spaceExplode_[0],
                            (_this.renderer_.config_.canvasWidth_ - _this.renderer_.sprites_.spaceExplode_[0].width) / 2,
                            _this.renderer_.config_.canvasHeight_ - _this.renderer_.consts_.spaceMarginBottom_ - _this.renderer_.sprites_.spaceExplode_[0].height / 2));
                            break;
                    }
                    if (noteResult !== 4) {
                        if (noteKey !== 5) {
                            var leftLane = true;
                            var yOfs = 0;

                            // appropriate image surface, y offset
                            switch (noteKey) {
                                case 7 : yOfs = _this.renderer_.consts_.lane1Yofs_; break;
                                case 4 : yOfs = _this.renderer_.consts_.lane2Yofs_; break;
                                case 1 : yOfs = _this.renderer_.consts_.lane3Yofs_; break;
                                case 9 : leftLane = false; yOfs = _this.renderer_.consts_.lane1Yofs_; break;
                                case 6 : leftLane = false; yOfs = _this.renderer_.consts_.lane2Yofs_; break;
                                case 3 : leftLane = false; yOfs = _this.renderer_.consts_.lane3Yofs_; break;
                            }
                            yOfs = _this.renderer_.consts_.laneYStart_ + yOfs + _this.renderer_.sprites_.a1_[0].height / 2;
                            if (leftLane)
                                _this.animations_.push(new BUJS.Animation_(_this.renderer_, currTime, _this.renderer_.consts_.arrowAnimationTime_, _this.renderer_.sprites_.arrowExplode_[0],
                                    _this.renderer_.consts_.tableWidth_ - _this.renderer_.consts_.tableWidthTrans_ + _this.renderer_.consts_.laneWidth_ - _this.renderer_.consts_.chanceDist_ + _this.renderer_.consts_.arrowLaneOfs_ + _this.renderer_.sprites_.a1_[0].width / 2 - _this.renderer_.sprites_.arrowExplode_[0].width / 2,
                                    yOfs - _this.renderer_.sprites_.arrowExplode_[0].width / 2));
                            else
                                _this.animations_.push(new BUJS.Animation_(_this.renderer_, currTime, _this.renderer_.consts_.arrowAnimationTime_, _this.renderer_.sprites_.arrowExplode_[0],
                                    _this.renderer_.config_.canvasWidth_ - (_this.renderer_.consts_.tableWidth_ - _this.renderer_.consts_.tableWidthTrans_ + _this.renderer_.consts_.laneWidth_ - _this.renderer_.consts_.chanceDist_ + _this.renderer_.consts_.arrowLaneOfs_ + _this.renderer_.sprites_.a1_[0].width / 2) - _this.renderer_.sprites_.arrowExplode_[0].width / 2,
                                    yOfs - _this.renderer_.sprites_.arrowExplode_[0].height / 2));
                        }
                    }

                    // sound
                    if (noteKey === 5 && noteResult !== 4) _this.music_.playSound_(_this.music_.sounds_.space_);
                    else if (noteResult === 0) _this.music_.playSound_(_this.music_.sounds_.perfect_);  // arrow per?
                    else if (noteResult === 4) _this.music_.playSound_(_this.music_.sounds_.miss_);     // arrow miss?
                    else _this.music_.playSound_(_this.music_.sounds_.normal_);                         // arrow normal

                    // update pgcbm, score, combo, perx... and send to server if it's a space
                    _this.updateScore_(noteKey, noteResult);

                    // mark it as pressed
                    note.pressed_ = true;

                    // recalculate first_avail_note
                    _this.firstAvailNote_ = -1;
                    for (var j = 0; j < _this.music_.songInfo_.notes_.length; j++) {
                        if (typeof _this.music_.songInfo_.notes_[j].pressed_ === "undefined" || !_this.music_.songInfo_.notes_[j].pressed_) {
                            _this.firstAvailNote_ = j;
                            break;
                        }
                    }

                    // save note result for p/g/c/b/m animation
                    _this.lastNoteResult_ = noteResult;
                    _this.lastNoteTime_ = currTime;

                    // that's enough. found a note. break.
                    break;
                }
            }
        }
    }
};

/**
 * Convert time diff to key result p/g/c/b/m
 */
BUJS.Game_.prototype.getKeyResult_ = function (diff) {
    var _this = this;
    if (_this.autoplay_) return 0;
    var ratio = 4;
    var tickTime = _this.music_.tickTime_;

    // initial value 80
    if (diff > 80 * (tickTime * ratio) / 100 || diff < -tickTime * ratio) return -1;	// don't process
    if (diff < 0) {
        diff = -diff;
    }
    // initial values: 5 15 27 40, change difficulty here
    if (diff <= 5 * (tickTime * ratio) / 100) return 0;		// p
    if (diff <= 15 * (tickTime * ratio) / 100) return 1;	// g
    if (diff <= 27 * (tickTime * ratio) / 100) return 2;	// c
    if (diff <= 40 * (tickTime * ratio) / 100) return 3;	// b
    return 4;												// m
};

/**
 * Process all on-going animations
 */
BUJS.Game_.prototype.processAnimations_ = function () {
    var _this = this;
    for (var i = 0; i < _this.animations_.length; i++) {
        _this.animations_[i].process_(_this.music_.getCurrTime_());
    }
    // delete all finished animations
    for (i = _this.animations_.length - 1; i >= 0; i--) {
        if (_this.animations_[i].startTime_ < 0) {
            _this.animations_.splice(i, 1);
        }
    }
};

/**
 * Add/reset combo, add score, perx, p/g/c/b/m counters,...
 */
BUJS.Game_.prototype.updateScore_ = function (key, keyResult) {
    var _this = this;
    var noteScore = 0;
    if (key === 5) {
        if (keyResult >= 0) {
            noteScore = _this.spaceScores_[keyResult];
        }
    }
    else {
        if (keyResult >= 0) {
            noteScore = _this.noteScores_[keyResult];
        }
    }

    // ratios with BEATUP
    if (_this.combo_ >= 400) noteScore *= _this.blueBeatupRatio_;
    else if (_this.combo_ >= 100) noteScore *= _this.yellowBeatupRatio_;
    _this.score_ += noteScore;

    // result : pgcbm
    _this.pgcbm_[keyResult]++;

    // update combo
    //var prevCombo = _this.combo_;
    if (keyResult !== 4 && keyResult >= 0) {
        if (keyResult !== 3) _this.combo_++;
    } else {
        if (keyResult === 4) {
            if (_this.combo_ > 99 || _this.combo_ < 11) {
                _this.combo_ = 0; 
            } else if (_this.combo_ > 80) {
                _this.combo_ = 80;
            } else if (_this.combo_ > 60) {
                _this.combo_ = 60;
            } else if (_this.combo_ > 40) {
                _this.combo_ = 40;
            } else if (_this.combo_ > 20) {
                _this.combo_ = 20;
            } else {
                _this.combo_ = 10;
            }

        } 
    } 

    // update highest combo
    if (_this.highestCombo_ < _this.combo_) _this.highestCombo_ = _this.combo_;

    // update perx
    if (_this.lastNoteResult_ === 0 && keyResult === 0) {
        _this.perx_++;
    }
    else _this.perx_ = 0;

    if (_this.perx_ > _this.xmax_){
        _this.xmax_ = _this.perx_;
    }
};

BUJS.Game_.prototype.endGame_ = function(isTab) {
    var _this = this;
    _this.isTab_ = isTab;
    _this.music_.musicSource_.stop(0);
    _this.isOn_ = false; // stop game
}