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

    // create random selected choice
    var songFileNames = Object.keys(_this.songList_);
    var randomId = songFileNames[Math.floor(Math.random() * songFileNames.length)];
    var randomLi = _this.setSongAttr_(randomId, true);
    if (randomLi.classList.contains('selected')) {
        selectedLi = randomLi;
    }
    randomLi.innerText = "Random (Normal)";
    randomLi.onclick = _this.songItemClick_;
    songlistContainer.append(randomLi);

    // create song list
    for (var id in _this.songList_) {
        // id is json filename
        var song = _this.songList_[id];
        var li = _this.setSongAttr_(id, false);
        if (li.classList.contains('selected')) {
            selectedLi = li;
        }
        li.innerText =  song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
        li.onclick = _this.songItemClick_;
        songlistContainer.append(li);
    }
    songlistModal.modal("show");
    
    // load menu shortcut
    this.loadMenuShortcut_(selectedLi);
};

BUJS.prototype.setSongAttr_ = function(songId, isRandom) {
    var li = document.createElement("li");
    if (isRandom) {
        li.setAttribute("choice", "random");
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

BUJS.prototype.loadMenuShortcut_ = function(selectedLi) {
    $(document).keydown(function (e) {
        if (e.which == '13') {
            selectedLi.songItemClick_();
            console.log('clicked pleaseee');
        }
    });
}

BUJS.prototype.loadTemplate_ = function (id) {
    var t = document.querySelector(id);
    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);
};

BUJS.prototype.songItemClick_ = function () {
    var songId = this.getAttribute("songid");
    if (this.getAttribute("choice") === "random") {
        sessionStorage.setItem("selected", "random");
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