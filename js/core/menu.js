function BUJS () {}

/*
** initialize UI
*/
BUJS.prototype.start_ = function () {
    var _this = this;

    // draw some "loading" things...
    _this.initCanvas_();
    _this.showLoadingMsg_("Loading extra UI components");

    // load modal
    $.get('template/modal.html', function (html) {
        $('#template-container').html(html);
        _this.loadSongList_();
    });

    _this.iOS_ = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

BUJS.prototype.initCanvas_ = function () {
    var canvas = document.getElementById("cvs");
    canvas.width = 980;
    canvas.height = 400;
};

BUJS.prototype.showLoadingMsg_ = function (msg) {
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
};

BUJS.prototype.loadSongList_ = function () {
    var _this = this;
    _this.showLoadingMsg_("Loading songs");
    // fetch list from server
    $.get("notes/list.json", function (list) {
        _this.songList_ = list; // List object, not array
        _this.showSongListModal_();
    });
};

BUJS.prototype.showSongListModal_ = function () {
    var _this = this;
    _this.showLoadingMsg_("");
    _this.loadTemplate_("#songlist-template");
    var songlistModal = $('#songlist-modal');
    var songlistContainer = songlistModal.find("#songlist-container");

    // previously selected element; default to random if nothing else is selected
    var selectedLi = null;
    var isMenuEmpty = true;

    // remove all child element of songlistContainer if exists
    if (songlistContainer[0].firstChild) {
        isMenuEmpty = false;
        songlistContainer[0].innerHTML = "";
    }

    // create random selected choice
    var randomLi = _this.setSongAttr_("random");
    randomLi.innerText = "Random (Normal)";
    randomLi.onclick = _this.songItemClick_.bind(this, randomLi);
    songlistContainer.append(randomLi);

    if (randomLi.classList.contains('selected')) {
        selectedLi = randomLi;
    }

    // create song list
    for (var id in _this.songList_) {
        // id is json filename
        var song = _this.songList_[id];
        var li = _this.setSongAttr_(id, false);
        li.innerText =  song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
        li.onclick = _this.songItemClick_.bind(this, li);
        songlistContainer.append(li);

        if (li.classList.contains('selected')) {
            selectedLi = li;
        }
    }

    songlistModal.modal("show");
    _this.loadShortcutHandler_(selectedLi, isMenuEmpty);
};

BUJS.prototype.setSongAttr_ = function(songId) {
    var li = document.createElement("li");

    if (songId === "random") {
        li.setAttribute("songid", songId);
        if (sessionStorage.getItem('selected') === "random" || 
            sessionStorage.getItem('selected') === null) {
            li.setAttribute("class", "songListItem selected");
        } else {
            li.setAttribute("class", "songListItem");
        }
        return li;
    }

    if (songId === sessionStorage.getItem('selected')) {
        li.setAttribute("class", "songListItem selected");
    } else {
        li.setAttribute("class", "songListItem");
    }
    li.setAttribute("songid", songId);
    return li;
}

/*
** load shortcut handler to quick start, call when menu is ready 
*/
BUJS.prototype.loadShortcutHandler_ = function(selectedLi, isMenuEmpty) {
    var _this = this;
    var f1 = _this.f1_.bind(_this, selectedLi);
    if (isMenuEmpty) {
        $(document).on("keydown", f1);
        $(document).on("keydown", _this.tab_.bind(this));
    } else {
        $(document).off(); // turn off previous event handlers
        $(document).on("keydown", _this.tab_.bind(this));
        $(document).on("keydown", f1);
    }
}

/*
** quick start song by pressing F1/Enter
*/
BUJS.prototype.f1_ = function(selectedLi, e) {
    if (e.which === 13 || e.which === 112) { // F1 or Enter to start
        e.preventDefault();
        $(selectedLi).click();
    }
}

/*
** open menu by pressing tab
*/
BUJS.prototype.tab_ = function (e) {
    var _this = this;
    if (e.which === 9) {
        e.preventDefault();
        _this.showSongListModal_();

    }
}

BUJS.prototype.loadTemplate_ = function (id) {
    var t = document.querySelector(id);
    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);
};

BUJS.prototype.songItemClick_ = function (li) {
    var _this = this;
    var songId = li.getAttribute("songid");

    if (songId === "random") {
        sessionStorage.setItem("selected", "random"); // store selected value
        var songFileNames = Object.keys(_this.songList_);
        songId = songFileNames[Math.floor(Math.random() * songFileNames.length)]; // generate songId when click
    } else {
        sessionStorage.setItem("selected", songId);
    }
    bujs.game_ = new BUJS.Game_(songId);
    $('#songlist-modal').modal("hide");
};

bujs = new BUJS();
$(window).on('load', function () {
    bujs.start_();
});