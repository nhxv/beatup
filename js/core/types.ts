export interface Point {
    x: number;
    y: number;
}

export type Sprite = HTMLImageElement & { pos?: Point };

export interface Note {
    n: number;
    t: number;
    pressed?: boolean;
}

export interface SongListEntry {
    name: string;
    singer: string;
    slkauthor: string;
    bpm: number;
    ogg: string;
}

export interface SongInfo extends SongListEntry {
    notes: Note[];
}

export type SongList = Record<string, SongListEntry>;
