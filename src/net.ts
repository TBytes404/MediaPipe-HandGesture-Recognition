import { type DataConnection, Peer } from "peerjs"

export class Net {
  hostid: HTMLElement
  share: HTMLButtonElement
  peerid: HTMLInputElement
  join: HTMLButtonElement

  url: URL
  isHost: boolean
  private peer: Peer
  private connection?: DataConnection
  onOpen?: () => void
  onData?: (data: unknown) => void
  onClose?: () => void

  constructor(app: Element) {
    this.hostid = app.querySelector("#hostid")!
    this.share = app.querySelector("#share")!
    this.peerid = app.querySelector("#peerid")!
    this.join = app.querySelector("#join")!
    this.isHost = true
    this.peer = new Peer()
    this.url = new URL(location.href)
    this.peerid.value = this.url.searchParams.get("hostid") || ""
  }

  send(data: any) {
    this.connection?.send(data)
  }

  close() {
    this.connection?.close()
  }

  setup() {
    this.peer.on("open", (id) => {
      this.hostid.textContent = id
      this.url.searchParams.set("hostid", id)
      history.pushState(null, '', this.url)
    })
    this.peer.on("connection", (conn) =>
      this.setupConnectionListeners(conn, true))

    this.share.onclick = async () => {
      await navigator.clipboard.writeText(this.url.toString())
      this.share.innerText = "Copied ✅"
    }
    this.join.onclick = () => {
      this.join.innerText = "Joining..."
      this.join.disabled = true
      setTimeout(() => {
        this.join.innerText = "Join"
        this.join.disabled = false
      }, 8000)
      this.setupConnectionListeners(
        this.peer.connect(this.peerid.value.trim()), false)
    }
  }

  private setupConnectionListeners(conn: DataConnection, isHost: boolean) {
    if (this.connection?.open) { conn.close(); return }
    this.connection = conn
    this.isHost = isHost
    if (this.onOpen) conn.on("open", this.onOpen)
    if (this.onData) conn.on("data", this.onData)
    if (!this.onClose) return
    conn.on("close", this.onClose)
    conn.on("error", this.onClose)
  }
}
