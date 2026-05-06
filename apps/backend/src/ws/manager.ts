import type { WSEvent } from "@smartgrid/shared"

type WsClient = { send: (data: string) => void }

class WebSocketManager {
  private clients: Set<WsClient> = new Set()

  addClient(client: WsClient): void {
    this.clients.add(client)
  }

  removeClient(client: WsClient): void {
    this.clients.delete(client)
  }

  broadcast(event: WSEvent): void {
    const message = JSON.stringify(event)
    for (const client of this.clients) {
      client.send(message)
    }
  }

  getClientCount(): number {
    return this.clients.size
  }
}

export const wsManager = new WebSocketManager()
