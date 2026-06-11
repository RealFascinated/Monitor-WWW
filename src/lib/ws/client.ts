import type { QueryClient } from "@tanstack/react-query"

import { env } from "@/env/client"
import { applyWebSocketMessage } from "@/lib/ws/dispatch"
import type { WebSocketMessage } from "@/lib/ws/messages"
import { setWsConnected } from "@/lib/ws/state"
import { getToken } from "@/lib/auth/token"

const RECONNECT_BASE_MS = 1_000
const RECONNECT_MAX_MS = 30_000

function buildWebSocketUrl(token: string): string {
  const apiUrl = env.VITE_API_URL
  const base =
    apiUrl.length > 0
      ? apiUrl
      : `${window.location.protocol}//${window.location.host}`
  const wsBase = base.replace(/^http/, "ws")
  const url = new URL("/v1/ws/servers", wsBase)
  url.searchParams.set("token", token)
  return url.toString()
}

export type MonitorWebSocketHandle = {
  close: () => void
}

export function connectMonitorWebSocket(
  queryClient: QueryClient
): MonitorWebSocketHandle {
  let socket: WebSocket | null = null
  let reconnectAttempt = 0
  let closedByUser = false
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null

  function clearReconnectTimer() {
    if (reconnectTimer !== null) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
  }

  function scheduleReconnect() {
    if (closedByUser) {
      return
    }
    const delay = Math.min(
      RECONNECT_BASE_MS * 2 ** reconnectAttempt,
      RECONNECT_MAX_MS
    )
    reconnectAttempt += 1
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      openSocket()
    }, delay)
  }

  function openSocket() {
    const token = getToken()
    if (!token) {
      return
    }

    socket = new WebSocket(buildWebSocketUrl(token))

    socket.addEventListener("open", () => {
      reconnectAttempt = 0
      setWsConnected(true)
      void queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "user" &&
          query.queryKey[1] === "servers" &&
          query.queryKey[3] === "metrics",
      })
    })

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as WebSocketMessage
        applyWebSocketMessage(queryClient, message)
      } catch {
        // ignore malformed messages
      }
    })

    socket.addEventListener("close", () => {
      setWsConnected(false)
      socket = null
      scheduleReconnect()
    })

    socket.addEventListener("error", () => {
      socket?.close()
    })
  }

  openSocket()

  return {
    close: () => {
      closedByUser = true
      clearReconnectTimer()
      setWsConnected(false)
      socket?.close()
      socket = null
    },
  }
}
