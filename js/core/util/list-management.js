/* 
To manage song list in list.json
*/

const fs = require('fs');
const relativePath = '../../../notes/list.json';
let listData = fs.readFileSync(relativePath);
let songList = JSON.parse(listData); // list object, not array

calculateStats(songList);
sort(songList, fs, relativePath);
console.log('Sorted!');

function sort(songList, fs, path) {
    let sortedSongEntries = Object.entries(songList).sort((a, b) =>  {
        if (a[1]['singer'].localeCompare(b[1]['singer']) === 0) {
            return a[1]['ogg'].localeCompare(b[1]['ogg']);
        } else {
           return a[1]['singer'].localeCompare(b[1]['singer']);
        }    
    });
    const sortedSongList = Object.fromEntries(sortedSongEntries);
    const songListData = JSON.stringify(sortedSongList, null, 2);
    fs.writeFile(path, songListData, err => {
        if (err) { console.log(err); }
    });
}

function calculateStats(songList) {
    let sum = 0;
    let count = 0;
    for (const song in songList) {
        count++;
        sum += songList[song].bpm;
    }
    const average = Math.round((sum / count) * 10) / 10;
    console.log('--- BASIC STATS ---');
    console.log('Number of songs: ' + count);
    console.log('Average speed: ' + average + ' bpm');
}