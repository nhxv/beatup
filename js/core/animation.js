export class Animation {
    constructor (renderer, startTime, duration, sprite, x, y) {
        this.renderer = renderer;
        this.startTime = startTime;
        this.duration = duration || renderer.consts.arrowAnimationTime; // could be wrong here!
        this.sprite = sprite || null;
        this.x = x || 0;
        this.y = y || 0;
    }

    process(currTime) {
        if (this.sprite == null) return;
        if (this.startTime + this.duration > currTime) {
            if (this.startTime <= currTime) {
                // equivalent to setSpritePos()
                this.sprite.pos = {x: this.x, y: this.y};
                this.renderer.ctx.globalAlpha = this.interpolate(currTime);
                this.renderer.drawSprite(this.sprite);
                this.renderer.ctx.globalAlpha = 1;
            }
        }
        else {
            this.startTime = -1;
        }
    }
    

    interpolate(currTime) {
        var alpha = 1 - (currTime - this.startTime) / this.duration;
        return alpha;
    }
}