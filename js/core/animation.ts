import { bujs } from "./bujs";
import { Renderer } from "./renderer";
import { Sprite } from "./types";

/**
 * A simple animation interpolation utility
 */
export class Animation {
    renderer: Renderer;
    startTime: number;
    duration: number;
    sprite: Sprite | null;
    x: number;
    y: number;

    constructor(renderer: Renderer, startTime: number, duration?: number, sprite?: Sprite | null, x?: number, y?: number) {
        this.renderer = renderer;
        this.startTime = startTime;
        this.duration = duration || (bujs.game ? bujs.game.renderer.consts.arrowAnimationTime : 0);
        this.sprite = sprite || null;
        this.x = x || 0;
        this.y = y || 0;
    }

    /**
     * We can apply different interpolation algorithms here.
     * For now it's linear interpolation
     */
    interpolate(currTime: number): number {
        return 1 - (currTime - this.startTime) / this.duration;
    }

    /**
     * Process a predefined animation
     */
    process(currTime: number): void {
        if (this.sprite == null) return;
        if (this.startTime + this.duration > currTime) {
            if (this.startTime <= currTime) {
                // equivalent to setSpritePos()
                this.sprite.pos = { x: this.x, y: this.y };
                this.renderer.ctx!.globalAlpha = this.interpolate(currTime);
                this.renderer.drawSprite(this.sprite);
                this.renderer.ctx!.globalAlpha = 1;
            }
        } else {
            this.startTime = -1;
        }
    }
}
