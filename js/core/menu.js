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

    // open menu shortcut
    $(document).keydown(function (e) {
        if (e.which === 9) {
            e.preventDefault();
            _this.showSongListModal_();

        }
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
    var selectedLi = _this.songItemClick_.bind(this, selectedLi);

    var isMenuEmpty = true;
    console.log("First child: ");
    console.log($("#songlist-container").firstChild);

    // remove all child element of songlistContainer if exists
    if ($("#songlist-container").firstChild) {
        isMenuEmpty = false;
        $('#songlist-container').empty();
    }

    // create random selected choice
    var randomLi = _this.setSongAttr_("random");
    if (randomLi.classList.contains('selected')) {
        selectedLi = randomLi;
    }
    randomLi.innerText = "Random (Normal)";
    randomLi.onclick = _this.songItemClick_.bind(this, randomLi);
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
        li.onclick = _this.songItemClick_.bind(this, li);
        songlistContainer.append(li);
    }
    songlistModal.modal("show");

    _this.loadMenuShortcut_(selectedLi, isMenuEmpty);
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
** menu shortcut to quick start, load when menu is ready 
*/
BUJS.prototype.loadMenuShortcut_ = function(selectedLi, isMenuEmpty) {
    if (!isMenuEmpty) {
        console.log("Menu is not empty");
        $(document).off("keydown");
    } else {
        console.log("menu is empty. first time load event");
    }

    $(document).on("keydown", function (e) {
        if (e.which === 13 || e.which === 112) { // F1 or Enter to start
            e.preventDefault();
            $(selectedLi).click();
        }
    });
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