import {Game} from './game';

export class Menu {
    start() {
        this.createCanvas();
        this.loadSongList();
    }

    createCanvas() {
        var canvas = document.querySelector('#cvs');
        canvas.width = 980;
        canvas.height = 400;
    }

    loadSongList() {
        fetch('notes/list.json').then(list => {
            this.showSongList(list);
        }).catch(err => console.log(err));
    }

    showSongList(songList) {
        // TODO: append this list of items to html
        var randomLi = document.createElement("li");
        randomLi.setAttribute("class", "songListItem");
        var songFileNames = Object.keys(this.songList);
        randomLi.setAttribute("songid", songFileNames[Math.floor(Math.random() * songFileNames.length)]);
        randomLi.innerText = "Random (Normal)";
        randomLi.onclick = this.chooseSong();
        songlistContainer.append(randomLi);
        for (var id of songList) {
            // id is json filename
            var song = this.songList[id];
            var li = document.createElement("li");
            li.setAttribute("class", "songListItem");
            li.setAttribute("songid", id);
            li.innerText = song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
            li.onclick = this.chooseSong(id, songList);
        }
    }

    chooseSong(id) {
        // TODO: navigation maybe
        new Game(id, songList);
    }
}