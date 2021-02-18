import {Game} from './game';

export class Renderer {
    constructor() {
        this.images = [];
        Game.loadedComponentCount++;
        this.config = this.setupConfig();
    }

    setupConfig() {
        return {
            imagePath          : "img/",
            scaleRatio         : 1,
            canvasWidth        : 980,
            canvasHeight       : 400
        };
    }

    setupSpriteInfo() {}

    setupSpriteConsts() {}

    loadSprites() {}
}