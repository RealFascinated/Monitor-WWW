import { useServersStore } from "@/stores/servers-store"

export function useUserServer(serverId: number) {
  const server = useServersStore((state) => state.servers[serverId])
  const isLoading = useServersStore((state) => state.isLoading)

  return {
    data: server,
    isLoading,
    isPending: isLoading && !server,
  }
}
