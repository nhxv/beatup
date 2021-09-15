import {Game} from './game';
import { Song } from './song';

// DONE
export class Sound {
    constructor(songInfo) {
        this.song = new Song(
            songInfo.ogg,
            songInfo.singer,
            songInfo.name,
            songInfo.slkauthor,
            songInfo.bpm
            );
        this.sounds = {
            perfect: "perfect.wav",
            normal : "normal.wav",
            miss   : "miss.wav",
            space  : "space.wav"
        };
        this.tickTime = 0;
        this.musicStartTime = 0;

        this.context = new (window.AudioContext || window.webkitAudioContext)();
    
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
            this.tickTime = 1000 * 60.0 / (this.song.bpm * 4);
            this.convertTickToMs();
            this.loadBackgroundMusic('music/' + this.song.ogg);
        }).catch(err => console.log(err));
    }

    convertTickToMs() {
        for (var i = 0; i < this.song.notes.length; i++) {
            this.song.notes[i].t = this.song.notes[i].t * this.tickTime; // t: json property
        }
    }

    loadBackgroundMusic(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            this.context.decodeAudioData(request.response, function (buffer) {
                this.musicStartTime = this.context.currentTime;
                this.playSound(buffer);
                Game.loadedComponentCount++; // TODO: maybe check null before increment
            },
            function(error) {
                console.log("Error decoding audio data", error);
            });
        };

        // // TODO: convert to fetch
        // fetch(url).then(response => {
        //     this.context.decodeAudioData(response, buffer => {
        //         this.playSound(buffer);
        //         // TODO: count music time
        //     }, error => console.log(error));
        // }).catch(err => console.log(err));
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

    // to display time
    getCurrentTime() { 
        return (this.context.currentTime - this.musicStartTime) * 1000; 
    } 
    // interesting read: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html
}