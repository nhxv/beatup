/**
 * A simple animation interpolation utility
 */
 BUJS.Animation_ = function (renderer, startTime, duration, sprite, x, y) {
    this.renderer_ = renderer;
    this.startTime_ = startTime;
    this.duration_ = duration || bujs.game_.renderer_.consts_.arrowAnimationTime_;
    this.sprite_ = sprite || null;
    this.x_ = x || 0;
    this.y_ = y || 0;
}

/**
 * We can apply different interpolation algorithms here.
 * For now it's linear interpolation
 */
BUJS.Animation_.prototype.interpolate_ = function (currTime) {
    var _this = this;
    var alpha = 1 - (currTime - _this.startTime_) / _this.duration_;
    return alpha;
};

/**
 * Process a predefined animation
 */
BUJS.Animation_.prototype.process_ = function (currTime) {
    var _this = this;
    if (_this.sprite_ == null) return;
    if (_this.startTime_ + _this.duration_ > currTime) {
        if (_this.startTime_ <= currTime) {
            // equivalent to setSpritePos_()
            _this.sprite_.pos = {x: _this.x_, y: _this.y_};
            _this.renderer_.ctx_.globalAlpha = _this.interpolate_(currTime);
            _this.renderer_.drawSprite_(_this.sprite_);
            _this.renderer_.ctx_.globalAlpha = 1;
        }
    }
    else {
        _this.startTime_ = -1;
    }
};