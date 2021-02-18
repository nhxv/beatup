import { Sound } from "./sound";
import { Renderer } from "./renderer";

export class Game {
    static loadedComponentCount = 0;

    constructor(songId, songList) {
        this.songId = songId;

        this.frameCount = 0;
        this.fps = 0;

        this.firstAvailNote = 0;
        this.lastNoteResult = 0;
        this.lastNoteTime = 0;
        this.lastTime = 0;

        this.pgcbm = [0, 0, 0, 0, 0];
        this.score = 0;
        this.perx = 0;
        this.highestCombo = 0;
        this.combo = 0;
        this.xmax = 0;
        this.chance = 0;

        this.showBg = 0;
        this.showPerfArrows = false;
        this.showHelp = false;

        this.numSelect = 0;
        this.animations = [];
        this.players = [];

        this.autoplay = false;
        this.alwaysCorrect = false;

        this.noteScores = [520, 260, 130, 26, 0];
        this.spaceScores = [2000, 1500, 1000, 500, 0];
        this.yellowBeatupRatio = 1.2;
        this.blueBeatupRatio = 1.55;

        // load sound, renderer, input system
        this.sound = new Sound(songList[songId]);
        this.renderer = new Renderer();
        this.renderer.loadSprites();
    }
}