import { type DataConnection, Peer } from "peerjs"

export class Net {
  hostid: HTMLElement
  peerid: HTMLInputElement

  url: URL
  isHost: boolean
  private peer: Peer
  private connection?: DataConnection
  onOpen?: () => void
  onData?: (data: unknown) => void
  onClose?: () => void

  constructor(app: Element) {
    this.hostid = app.querySelector("#hostid")!
    this.peerid = app.querySelector("#peerid")!
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
      this.join()
    })
    this.peer.on("connection", (conn) =>
      this.setupConnectionListeners(conn, true))
  }

  join() {
    this.setupConnectionListeners(
      this.peer.connect(this.peerid.value.trim()), false)
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
