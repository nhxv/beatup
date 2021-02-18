import {Game} from './game';
import { Song } from './song';

export class Sound {
    constructor(songInfo) {
        this.song = new Song(
            songInfo.ogg,
            songInfo.singer,
            songInfo.name,
            songInfo.slkauthor,
            songInfo.bpm
            );
        this.songList = songList;
        this.sounds = {
            perfect: "perfect.wav",
            normal : "normal.wav",
            miss   : "miss.wav",
            space  : "space.wav"
        };
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        Game.loadedComponentCount++;
    
        // from async.js lib
        async.eachOf(this.sounds, function (sound, index, callback) {
            // TODO: maybe change to fetch?
            var request = new XMLHttpRequest();
            request.open('GET', "sound/" + sound, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                this.context.decodeAudioData(request.response, function (buffer) {
                    console.log("Loaded sound", sound);
                    this.sounds[index] = buffer;
                }, function (error) {
                    console.error("Error decoding audio data", error);
                });
                callback();
            };
            request.send();
        });
        this.parseNotes("notes/" + songId + ".json");
    }

    parseNotes(url) {
        fetch(url).then(response => {
            this.song.notes = response;
            // TODO: calculate tick time ...
            this.loadBackgroundMusic('music/' + this.song.ogg);
        }).catch(err => console.log(err));
    }

    loadBackgroundMusic(url) {
        fetch(url).then(response => {
            this.context.decodeAudioData(response, buffer => {
                this.playSound(buffer);
                // TODO: count music time
            }, error => console.log(error));
        }).catch(err => console.log(err));
    }

    loadSound(buffer) {
        var source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        return source;
    }

    playSound(buffer) {
        this.loadSound(buffer).start(0);
    }
}