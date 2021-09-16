function BUJS () {}

/*
** initialize UI
*/
BUJS.prototype.start_ = function () {
    var _this = this;

    // draw some "loading" things...
    _this.initCanvas_();
    _this.showLoadingMsg_("Loading extra UI components");

    // load extra contents
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
    // create random selected element
    var songFileNames = Object.keys(_this.songList_);
    var randomId = songFileNames[Math.floor(Math.random() * songFileNames.length)];
    var randomLi = _this.setSongAttr_(randomId);
    randomLi.innerText = "Random (Normal)";
    randomLi.onclick = _this.songItemClick_;
    songlistContainer.append(randomLi);
    for (var id in _this.songList_) {
        // id is json filename
        var song = _this.songList_[id];
        var li = _this.setSongAttr_(id);
        li.innerText =  song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
        li.onclick = _this.songItemClick_;
        songlistContainer.append(li);
    }
    songlistModal.modal("show");
};

BUJS.prototype.setSongAttr_ = function(songId) {
    var li = document.createElement("li");
    if (songId === sessionStorage.getItem('selected')) {
        li.setAttribute("class", "songListItem selected");
    } else {
        li.setAttribute("class", "songListItem");
    }
    li.setAttribute("songid", songId);
    return li;
}

BUJS.prototype.loadTemplate_ = function (id) {
    var t = document.querySelector(id);
    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);
};

BUJS.prototype.songItemClick_ = function () {
    var songId = this.getAttribute("songid");
    sessionStorage.setItem("selected", songId);
    bujs.game_ = new BUJS.Game_(songId);
    $('#songlist-modal').modal("hide");
};

bujs = new BUJS();
$(window).on('load', function () {
    bujs.start_();
});