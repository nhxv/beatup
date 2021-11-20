/* 
To manage song list in list.json
*/

const fs = require('fs');
const relativePath = '../../../notes/list.json';
let listData = fs.readFileSync(relativePath);
let songList = JSON.parse(listData); // list object, not array

// calculateAverageBpm(songList);

sort(songList, fs, 'singer', relativePath);

function sort(songList, fs, attr, path) {
    const sortedSongEntries = Object.entries(songList).sort((a, b) => a[1][attr].localeCompare(b[1][attr]) );
    const sortedSongList = Object.fromEntries(sortedSongEntries);
    const songListData = JSON.stringify(sortedSongList, null, 4);
    fs.writeFile(path, songListData, err => {
        if (err) { console.log(err); }
    });
}

function calculateAverageBpm(songList) {
    let sum = 0;
    let count = 0;
    for (const song in songList) {
        count++;
        sum += songList[song].bpm;
    }
    const average = Math.round((sum / count) * 10) / 10;
    console.log(average + ' bpm');
}