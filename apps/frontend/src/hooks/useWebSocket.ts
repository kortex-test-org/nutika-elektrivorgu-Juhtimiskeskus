"use client"

import type { WSEvent } from "@smartgrid/shared"
import { useEffect, useRef } from "react"
import { useWsStore } from "@/stores/wsStore"

const WS_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:3001/ws")
    : "ws://localhost:3001/ws"

const INITIAL_DELAY_MS = 1_000
const MAX_DELAY_MS = 30_000
const BACKOFF_FACTOR = 2

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectDelayRef = useRef(INITIAL_DELAY_MS)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMounted = useRef(true)

  const setConnected = useWsStore((s) => s.setConnected)
  const handleEvent = useWsStore((s) => s.handleEvent)

  useEffect(() => {
    isMounted.current = true

    function connect() {
      if (!isMounted.current) return

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        reconnectDelayRef.current = INITIAL_DELAY_MS
        setConnected(true)
      }

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data as string) as WSEvent
          handleEvent(parsed)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (!isMounted.current) return
        const delay = Math.min(reconnectDelayRef.current, MAX_DELAY_MS)
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * BACKOFF_FACTOR,
          MAX_DELAY_MS,
        )
        reconnectTimerRef.current = setTimeout(connect, delay)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      isMounted.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [setConnected, handleEvent])
}
