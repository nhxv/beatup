import { bujs } from "./bujs";
import { Note, SongInfo } from "./types";

/**
 * Loads and plays background music and sound effects.
 */
export class Music {
    sounds: Record<string, string | AudioBuffer> = {
        perfect: "perfect.wav",
        normal: "normal.wav",
        miss: "miss.wav",
        space: "space.wav",
    };
    context: AudioContext;
    onComponentFinishLoading?: (component: Music) => void;
    songInfo!: SongInfo;
    tickTime = 0;
    musicSource?: AudioBufferSourceNode;
    musicStartTime?: number;
    musicEndTime?: number;
    response?: ArrayBuffer;

    constructor(onComponentFinishLoading?: (component: Music) => void) {
        const AudioContextCtor = window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.context = new AudioContextCtor();
        this.onComponentFinishLoading = onComponentFinishLoading;

        Object.keys(this.sounds).forEach((key) => {
            const sound = this.sounds[key] as string;
            const request = new XMLHttpRequest();
            request.open("GET", "sound/" + sound, true);
            request.responseType = "arraybuffer";
            request.onload = () => {
                this.context.decodeAudioData(request.response, (buffer) => {
                    this.sounds[key] = buffer;
                }, (error) => {
                    console.error("Error decoding audio data", error);
                });
            };
            request.send();
        });

        this.parse("notes/" + bujs.game.songId + ".json");
    }

    /**
     * Parse song info json
     */
    parse(url: string): void {
        fetch(url)
            .then((resp) => resp.json())
            .then((resp: Note[]) => {
                this.songInfo = bujs.songList[bujs.game.songId] as SongInfo;
                this.songInfo.notes = resp;
                this.tickTime = 1000 * 60.0 / (this.songInfo.bpm * 4);
                this.convertTickToMs();
                this.loadBackgroundMusic("music/" + this.songInfo.ogg);
            });
    }

    /**
     * Load music from server, pass to audio context
     */
    loadBackgroundMusic(url: string): void {
        const request = new XMLHttpRequest();
        bujs.showLoadingMsg("Downloading music");
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
            // TODO: BUM thingies...
            if (bujs.iOS) {
                this.response = new ArrayBuffer(request.response.byteLength);
                new Uint8Array(this.response).set(new Uint8Array(request.response));
                bujs.showLoadingMsg("Touch/click to start music");
            } else {
                this.context.decodeAudioData(request.response, (buffer) => {
                    this.musicSource = this.loadSound(buffer);
                    this.musicStartTime = this.context.currentTime; // ms
                    this.musicEndTime = buffer.duration;
                    this.musicSource.start(0);
                    if (this.onComponentFinishLoading) {
                        this.onComponentFinishLoading(this);
                    }

                    // this.onStopSound(this.musicSource); // listen when to stop sound
                }, (error) => {
                    console.error("Error decoding audio data", error);
                });
            }
        };
        request.send();
    }

    /**
     * Wrapper to load a specific sound and attach it to the audio context
     */
    loadSound(buffer: AudioBuffer): AudioBufferSourceNode {
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        return source;
    }

    /**
     * Load a sound then play it
     */
    playSound(buffer: AudioBuffer): void {
        this.loadSound(buffer).start(0);
    }

    convertTickToMs(): void {
        for (let i = 0; i < this.songInfo.notes.length; i++) {
            this.songInfo.notes[i].t = this.songInfo.notes[i].t * this.tickTime;
        }
    }

    getCurrTime(): number {
        return (this.context.currentTime - this.musicStartTime!) * 1000;
    }

    // interesting read: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html
    getEndTime(buffer: AudioBuffer): number {
        return buffer.duration;
    }
}
