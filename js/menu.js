import {Game} from './game';

// TODO: rename to UI class maybe
export class Menu {
    constructor() {
        loadedComponentCount = 0; // want this to be 2
        this.game = null;
    }

    display() {
        this.createCanvas();

        fetch('template/modal.html').then((html) => {
            document.querySelector('#template-container').html(html); 
            this.loadSongList(); 
        }).catch(err => console.log(err));
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

    loadTemplate() {
        var t = document.querySelector(id);
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    }

    showSongList(songList) {
        this.showLoadingMsg("");
        this.loadTemplate_("#songlist-template");
        var songlistModal = document.querySelector('#songlist-modal');
        var songlistContainer = songlistModal.find("#songlist-container");

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
        // TODO: hide modal
        this.game = new Game(id, songList); // initialize game loading
        this.closeModal(songlistModal);
    }

    closeModal(modal) {
        // get modal
        var modal = modal;
        // change state like in hidden modal
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        modal.setAttribute('style', 'display: none');
        // get modal backdrop
        var modalBackdrops = document.getElementsByClassName('modal-backdrop');
        // remove opened modal backdrop
        document.body.removeChild(modalBackdrops[0]);
    }

    showLoadingMsg() {
        var canvas = document.getElementById("cvs");
        var ctx = canvas.getContext("2d");
        var width = canvas.width;
        var height = canvas.height;
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, width, height);
        ctx.font = "12px Segoe UI";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(msg, width / 2, height / 2);
    }

    set loadedComponentCount(isLoaded) {
        if (isLoaded) this.loadedComponentCount++;
        if (this.loadedComponentCount == 2) this.game.onFinishLoading();
    }
}