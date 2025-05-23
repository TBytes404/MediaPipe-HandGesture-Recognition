import { type DataConnection, Peer } from "peerjs"

export class Game {
  hostid: HTMLElement;
  host: HTMLButtonElement;
  peerid: HTMLInputElement;
  connect: HTMLButtonElement;
  gestures: NodeListOf<HTMLElement>;
  opposition: HTMLImageElement;
  message: HTMLElement;
  scores: NodeListOf<HTMLElement>;
  match: HTMLElement;
  game: HTMLElement;

  url: URL;
  peer: Peer;
  connected: boolean
  private loop?: NodeJS.Timeout;
  pause: boolean;
  stableGestureIdx: number;
  gestureNames: string[];
  displayTexts: string[];

  constructor(app: Element) {
    this.match = app.querySelector("#match")!;
    this.hostid = app.querySelector("#hostid")!;
    this.host = app.querySelector("#host")!;
    this.peerid = app.querySelector("#peerid")!;
    this.connect = app.querySelector("#connect")!;
    this.game = app.querySelector("#game")!;
    this.gestures = app.querySelectorAll("#gestures>li");
    this.opposition = app.querySelector("#opposition")!;
    this.message = app.querySelector("#message")!;
    this.scores = app.querySelectorAll("#scores>li>span")!;

    this.peer = new Peer();
    this.url = new URL(location.href);
    this.peerid.value = this.url.searchParams.get("hostid") || "";
    this.connected = false;
    this.pause = false;
    this.stableGestureIdx = 0;
    this.gestureNames = ["rock", "paper", "scissors"];
    this.displayTexts = ["It's a Tie!", "You Win!", "You Lose!"];
    this.gestures[this.stableGestureIdx].classList.add("active");
  }

  select(gesture: string) {
    let idx = this.gestureNames.indexOf(gesture);
    if (idx === -1 || idx === this.stableGestureIdx || this.pause) return;
    this.gestures[idx].classList.add("active");
    this.gestures[this.stableGestureIdx].classList.remove("active");
    this.stableGestureIdx = idx;
  }

  setupMatchMaking() {
    this.peer.on("open", (id) => {
      this.hostid.textContent = id;
      this.url.searchParams.set("hostid", id);
      history.pushState(null, '', this.url);
    })

    this.peer.on("connection", (conn) =>
      this.setupConnectionListeners(conn, true))

    this.host.onclick = () =>
      navigator.clipboard.writeText(this.url.toString());

    this.connect.onclick = () => {
      this.connect.disabled = true;
      this.loop = setTimeout(() => {
        this.connect.disabled = false;
      }, 8000)
      this.setupConnectionListeners(
        this.peer.connect(this.peerid.value), false)
    }
  }

  private setupConnectionListeners(conn: DataConnection, isHost: boolean) {
    if (this.connected) { conn.close(); return }
    this.connected = true;
    conn.removeAllListeners();

    conn.on("open", () => {
      console.log('DataConnection Opened');
      clearInterval(this.loop);
      for (const li of this.scores) li.textContent = "0";
      this.opposition.src = "/loading.webp";
      this.match.hidden = true;
      this.game.hidden = false;
      if (isHost)
        this.loop = setInterval(() => {
          this.pause = true;
          this.gestures[this.stableGestureIdx].classList.add("pause");
          conn.send(this.stableGestureIdx);
        }, 12000);
    });

    conn.on("data", (data) => {
      const oppositionIdx = data as number;
      const winnerIdx = (this.stableGestureIdx - oppositionIdx + 3) % 3;
      this.message.textContent = this.displayTexts[winnerIdx];
      this.opposition.src = `/${this.gestureNames[oppositionIdx]}.webp`;
      this.scores[winnerIdx].textContent =
        (parseInt(this.scores[winnerIdx].textContent!) + 1).toString();
      if (!isHost) {
        this.pause = true;
        this.gestures[this.stableGestureIdx].classList.add("pause");
        conn.send(this.stableGestureIdx);
      }
      setTimeout(() => {
        this.pause = false;
        this.gestures[this.stableGestureIdx].classList.remove("pause");
        this.opposition.src = "/loading.webp";
      }, 4000);
      speechSynthesis.speak(new SpeechSynthesisUtterance(this.displayTexts[winnerIdx]));
    });

    conn.on("close", () => {
      console.log("DataConnection Closed.");
      clearInterval(this.loop);
      conn.close();
      this.connected = false;
      this.match.hidden = false;
      this.game.hidden = true;
      this.connect.disabled = false;
    });

    conn.on("error", (err) => {
      console.error("DataConnection error:", err);
      clearInterval(this.loop);
      conn.close();
      this.connected = false;
      this.match.hidden = true;
      this.game.hidden = true;
    });
  }
}
