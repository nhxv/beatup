// need class Game

class Menu {
    constructor() {
        this.loadedComponentCount = 0; // want this to be 2
        this.game = null;
        this.songList = null;
    }

    display() {
        this.createCanvas();
        var _this = this;
        $.get('template/modal.html', (html) => {
            $('#template-container').html(html);
            _this.loadSongList();
        });
    }

    createCanvas() {
        var canvas = document.querySelector('#cvs');
        canvas.width = 980;
        canvas.height = 400;
    }

    loadSongList() {
        this.showLoadingMsg("Loading songs");
        // fetch list from server
        var _this = this;
        $.get("notes/list.json", (list) => {
            this.songList = list; // List object, not array
            _this.showSongList(this.songList);
    });
    }

    loadTemplate(id) {
        var t = document.querySelector(id);
        console.log(document.querySelector("#songlist-template"));
        var clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    }

    showSongList(songList) {
        this.showLoadingMsg("");
        this.loadTemplate("#songlist-template");
        var songlistModal = $('#songlist-modal');
        var songlistContainer = songlistModal.find("#songlist-container");

        var randomLi = document.createElement("li");
        randomLi.setAttribute("class", "songListItem");
        var songFileNames = Object.keys(this.songList);
        randomLi.setAttribute("songid", songFileNames[Math.floor(Math.random() * songFileNames.length)]);
        randomLi.innerText = "Random (Normal)";
        // randomLi.onclick = this.chooseSong();
        songlistContainer.append(randomLi);
        for (var id in songList) {
            // id is json filename
            var song = this.songList[id];
            var li = document.createElement("li");
            li.setAttribute("class", "songListItem");
            li.setAttribute("songid", id);
            li.innerText = song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
            li.onclick = this.chooseSong(id, songList);
            songlistContainer.append(li);
        }
        songlistModal.modal("show");
    }

    chooseSong(id, songList) {
        this.game = new Game(id, songList); // initialize game loading
        $('#songlist-modal').modal("hide");
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

    showLoadingMsg(msg) {
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

    setLoadedComponentCount(isLoaded) {
        if (isLoaded) this.loadedComponentCount++;
        if (this.loadedComponentCount == 2) {
            console.log("Finished loading renderer and sound");
            this.game.onFinishLoading();
            this.loadedComponentCount = 0;
        } 
    }
}