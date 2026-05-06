import { logger } from "@smartgrid/shared/logger"
import { Elysia } from "elysia"
import { wsManager } from "./manager"

export const wsHandler = new Elysia().ws("/ws", {
  open(ws) {
    wsManager.addClient(ws)
    logger.info("WebSocket client connected", {
      clients: wsManager.getClientCount(),
    })
  },
  close(ws) {
    wsManager.removeClient(ws)
    logger.info("WebSocket client disconnected", {
      clients: wsManager.getClientCount(),
    })
  },
  message(_ws, message) {
    logger.info("WebSocket message received", { message })
  },
})
