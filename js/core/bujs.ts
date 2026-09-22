import { Game } from "./game";
import { SongList } from "./types";

/**
 * App-level singleton: global state plus the song-select menu UI.
 */
export class Bujs {
    iOS = false;
    songList: SongList = {};
    game!: Game;
    keydownHandlers?: Array<(e: KeyboardEvent) => void>;

    /*
    ** initialize UI
    */
    start(): void {
        // draw some "loading" things...
        this.initCanvas();
        this.showLoadingMsg("Loading extra UI components");

        // load modal
        fetch("template/songlist-modal.html")
            .then((resp) => resp.text())
            .then((html) => {
                document.getElementById("template-container")!.innerHTML = html;
                this.loadSongList();
            });

        this.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !(window as unknown as { MSStream?: unknown }).MSStream;
    }

    initCanvas(): void {
        const canvas = document.getElementById("cvs") as HTMLCanvasElement;
        canvas.width = 980;
        canvas.height = 400;
    }

    showLoadingMsg(msg: string): void {
        const canvas = document.getElementById("cvs") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d")!;
        const width = canvas.width;
        const height = canvas.height;
        ctx.fillStyle = "black";
        ctx.clearRect(0, 0, width, height);
        ctx.font = "12px Segoe UI";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(msg, width / 2, height / 2);
    }

    /*
    ** get song list from list.json
    */
    loadSongList(): void {
        this.showLoadingMsg("Loading songs");
        // fetch list from server
        fetch("notes/list.json")
            .then((resp) => resp.json())
            .then((list: SongList) => {
                this.songList = list; // List object, not array
                this.showSongListModal();
            });
    }

    /*
    ** load song list to modal
    */
    showSongListModal(): void {
        this.showLoadingMsg("");
        this.loadTemplate("#songlist-template");
        const songlistModal = document.getElementById("songlist-modal") as HTMLElement;
        const songlistContainer = songlistModal.querySelector("#songlist-container")!;

        // previously selected element; default to random if nothing else is selected
        let selectedLi: HTMLLIElement | null = null;
        let isMenuEmpty = true;

        // remove all child element of songlistContainer if exists
        if (songlistContainer.firstChild) {
            isMenuEmpty = false;
            songlistContainer.innerHTML = "";
        }

        // create random selected choice
        const randomLi = this.setSongAttr("random");
        randomLi.innerText = "Random (Normal)";
        randomLi.onclick = this.songItemClick.bind(this, randomLi);
        songlistContainer.appendChild(randomLi);

        if (randomLi.classList.contains("selected")) {
            selectedLi = randomLi;
        }

        // create song list
        for (const id in this.songList) {
            // id is json filename
            const song = this.songList[id];
            const li = this.setSongAttr(id);
            li.innerText = song.singer + " " + song.name + " (" + song.slkauthor + ") " + Math.round(song.bpm) + " bpm";
            li.onclick = this.songItemClick.bind(this, li);
            songlistContainer.appendChild(li);

            if (li.classList.contains("selected")) {
                selectedLi = li;
            }
        }

        this.showModal(songlistModal);
        this.loadShortcutHandler(selectedLi, isMenuEmpty);
    }

    /*
    ** vanilla replacements for Bootstrap's $(el).modal("show"/"hide")
    */
    showModal(el: HTMLElement): void {
        el.classList.add("show");
        el.style.display = "block";
        document.body.classList.add("modal-open");

        const backdrop = document.createElement("div");
        backdrop.className = "modal-backdrop fade show";
        backdrop.id = "songlist-backdrop";
        document.body.appendChild(backdrop);

        const closeBtn = el.querySelector('[data-dismiss="modal"]') as HTMLElement | null;
        if (closeBtn) {
            closeBtn.onclick = () => this.hideModal(el);
        }
    }

    hideModal(el: HTMLElement): void {
        el.classList.remove("show");
        el.style.display = "none";
        document.body.classList.remove("modal-open");
        const backdrop = document.getElementById("songlist-backdrop");
        if (backdrop) backdrop.remove();
    }

    /*
    ** store selected song to session, load song audio file based on songId attr
    */
    setSongAttr(songId: string): HTMLLIElement {
        const li = document.createElement("li");

        if (songId === "random") {
            li.setAttribute("songid", songId);
            if (sessionStorage.getItem("selected") === "random" ||
                sessionStorage.getItem("selected") === null) {
                li.setAttribute("class", "songListItem selected");
            } else {
                li.setAttribute("class", "songListItem");
            }
            return li;
        }

        if (songId === sessionStorage.getItem("selected")) {
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
    loadShortcutHandler(selectedLi: HTMLLIElement | null, isMenuEmpty: boolean): void {
        const f1 = (e: KeyboardEvent) => this.f1(selectedLi, e);
        const tab = (e: KeyboardEvent) => this.tab(e);
        if (!isMenuEmpty && this.keydownHandlers) {
            // turn off previous event handlers
            this.keydownHandlers.forEach((handler) => {
                document.removeEventListener("keydown", handler);
            });
        }
        document.addEventListener("keydown", tab);
        document.addEventListener("keydown", f1);
        this.keydownHandlers = [tab, f1];
    }

    /*
    ** start game by pressing F1
    */
    f1(selectedLi: HTMLLIElement | null, e: KeyboardEvent): void {
        if (e.which === 112 && selectedLi) { // F1
            e.preventDefault();
            selectedLi.click();
        }
    }

    /*
    ** open menu by pressing tab
    */
    tab(e: KeyboardEvent): void {
        if (e.which === 9) {
            e.preventDefault();
            this.showSongListModal();
        }
    }

    loadTemplate(id: string): void {
        const t = document.querySelector(id) as HTMLTemplateElement;
        const clone = document.importNode(t.content, true);
        document.body.appendChild(clone);
    }

    songItemClick(li: HTMLLIElement): void {
        let songId = li.getAttribute("songid")!;

        if (songId === "random") {
            sessionStorage.setItem("selected", "random"); // store selected value
            const songFileNames = Object.keys(this.songList);
            songId = songFileNames[Math.floor(Math.random() * songFileNames.length)]; // generate songId when click
        } else {
            sessionStorage.setItem("selected", songId);
        }
        this.hideModal(document.getElementById("songlist-modal")!);
        this.game = new Game(songId);
    }
}

export const bujs = new Bujs();
