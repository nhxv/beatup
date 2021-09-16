export class Song {
    constructor(ogg, singer, name, slkauthor, bpm) {
        this.notes = [];
        this.ogg = ogg;
        this.singer = singer;
        this.name = name;
        this.slkauthor = slkauthor;
        this.bpm = bpm;
    }

    set notes(notes) {
        this.notes = notes;
    }
}