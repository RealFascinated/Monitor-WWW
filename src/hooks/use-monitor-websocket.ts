import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { connectMonitorWebSocket } from "@/lib/ws/client"

export function useMonitorWebSocket(enabled: boolean): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handle = connectMonitorWebSocket(queryClient)
    return () => {
      handle.close()
    }
  }, [enabled, queryClient])
}
