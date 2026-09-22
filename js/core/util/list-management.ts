/*
To manage song list in list.json
*/

import fs from "node:fs";

interface SongListEntry {
    name: string;
    singer: string;
    slkauthor: string;
    bpm: number;
    ogg: string;
}

type SongList = Record<string, SongListEntry>;

const relativePath = "../../../public/notes/list.json";
const listData = fs.readFileSync(relativePath);
const songList: SongList = JSON.parse(listData.toString()); // list object, not array

calculateStats(songList);
sort(songList, relativePath);
console.log("Sorted!");

function sort(songList: SongList, path: string): void {
    const sortedSongEntries = Object.entries(songList).sort((a, b) => {
        if (a[1].singer.localeCompare(b[1].singer) === 0) {
            return a[1].ogg.localeCompare(b[1].ogg);
        } else {
            return a[1].singer.localeCompare(b[1].singer);
        }
    });
    const sortedSongList = Object.fromEntries(sortedSongEntries);
    const songListData = JSON.stringify(sortedSongList, null, 2);
    fs.writeFile(path, songListData, (err) => {
        if (err) { console.log(err); }
    });
}

function calculateStats(songList: SongList): void {
    let sum = 0;
    let count = 0;
    for (const song in songList) {
        count++;
        sum += songList[song].bpm;
    }
    const average = Math.round((sum / count) * 10) / 10;
    console.log("--- BASIC STATS ---");
    console.log("Number of songs: " + count);
    console.log("Average speed: " + average + " bpm");
}
