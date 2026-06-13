import { useServersStore } from "@/stores/servers-store"
import type { ServerResponse } from "@/lib/api/user/servers"

export function useUserServer(serverId: number): {
  data: ServerResponse
  isLoading: boolean
  isPending: boolean
} {
  const server = useServersStore(
    (state) => state.servers[serverId]
  )
  const isPending = useServersStore(
    (state) => state.isLoading && !(serverId in state.servers)
  )

  return {
    data: server,
    isLoading: isPending,
    isPending,
  }
}
