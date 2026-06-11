import { useMemo } from "react"

import { useServersStore } from "@/stores/servers-store"

export function useUserServers() {
  const serverIds = useServersStore((state) => state.serverIds)
  const serversById = useServersStore((state) => state.servers)
  const isLoading = useServersStore((state) => state.isLoading)
  const error = useServersStore((state) => state.error)

  const servers = useMemo(
    () => serverIds.map((id) => serversById[id]).filter(Boolean),
    [serverIds, serversById]
  )

  return {
    data: servers,
    isLoading,
    isPending: isLoading,
    error,
  }
}
