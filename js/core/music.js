BUJS.Music_ = function (onComponentFinishLoading_) {
    var _this = this;
    _this.sounds_ = {
        perfect_: "perfect.wav",
        normal_ : "normal.wav",
        miss_   : "miss.wav",
        space_  : "space.wav" 
    };
    _this.context_ = new (window.AudioContext || window.webkitAudioContext)();
    _this.onComponentFinishLoading_ = onComponentFinishLoading_;

    // from async.js
    async.eachOf(_this.sounds_, function (sound, index, callback) {
        var request = new XMLHttpRequest();
        request.open('GET', "sound/" + sound, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            _this.context_.decodeAudioData(request.response, function (buffer) {
                console.log("Loaded sound", sound);
                _this.sounds_[index] = buffer;
            }, function (error) {
                console.error("Error decoding audio data", error);
            });
            callback();
        };
        request.send();
    });

    _this.parse_("notes/" + bujs.game_.songId_ + ".json");
};

/**
 * Parse song info json
 */
BUJS.Music_.prototype.parse_ = function (url) {
    var _this = this;
    $.get(url, function (resp) {
        _this.songInfo_ = bujs.songList_[bujs.game_.songId_];
        _this.songInfo_.notes_ = resp;
        _this.tickTime_ = 1000 * 60.0 / (_this.songInfo_.bpm * 4);
        _this.convertTickToMs_();
        _this.loadBackgroundMusic_("music/" + _this.songInfo_.ogg);
    });
};

/**
 * Load music from server, pass to audio context
 */
BUJS.Music_.prototype.loadBackgroundMusic_ = function (url) {
    var _this = this;
    var request = new XMLHttpRequest();
    bujs.showLoadingMsg_("Downloading music");
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = function () {
        // TODO: BUM thingies...
        if (bujs.iOS_) {
            _this.response_ = new ArrayBuffer(request.response.byteLength);
            new Uint8Array(_this.response_).set(new Uint8Array(request.response));
            bujs.showLoadingMsg_("Touch/click to start music");
        }
        else {
            _this.context_.decodeAudioData(request.response, function (buffer) {
                    _this.musicSource_ = _this.loadSound_(buffer);
                    _this.musicStartTime_ = _this.context_.currentTime;
                    _this.musicSource_.start(0);
                    if (typeof _this.onComponentFinishLoading_ !== 'undefined') {
                        _this.onComponentFinishLoading_.call(bujs.game_, _this);
                    }
                },
                function (error) {
                    console.error("Error decoding audio data", error);
                });
        }
    };
    request.send();
};

/**
 * Wrapper to load a specific sound and attach it to the audio context
 */
BUJS.Music_.prototype.loadSound_ = function (buffer) {
    var source = this.context_.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context_.destination);
    return source;
};

BUJS.Music_.prototype.stopSound_ = function () {
    var _this = this;
     // open menu shortcut
     $(document).keydown(function (e) {
        if (e.which === 9) {
            console.log('stopping sound...');
            e.preventDefault();
            $("#songlist-modal").modal("show"); // have to set a new random
            _this.musicSource_ = _this.loadSound_(buffer);
            _this.musicSource_.stop(0);
        }
    });
    
}

/**
 * Load a sound then play it
 */
BUJS.Music_.prototype.playSound_ = function (buffer) {
    this.loadSound_(buffer).start(0);
};

BUJS.Music_.prototype.convertTickToMs_ = function () {
    var _this = this;
    for (var i = 0; i < _this.songInfo_.notes_.length; i++) {
        _this.songInfo_.notes_[i].t = _this.songInfo_.notes_[i].t * _this.tickTime_;
    }
};

BUJS.Music_.prototype.getCurrTime_ = function () {
    return (this.context_.currentTime - this.musicStartTime_) * 1000;
};// interesting read: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html