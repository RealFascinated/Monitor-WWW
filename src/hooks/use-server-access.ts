import { useAccessStore } from "@/stores/access-store"

export function useServerAccess(serverId: number) {
  const access = useAccessStore((state) => state.accessByServerId[serverId])
  const isPending = useAccessStore(
    (state) => state.loadingByServerId[serverId] ?? false
  )
  const error = useAccessStore((state) => state.errorByServerId[serverId] ?? null)

  return {
    data: access,
    isPending,
    error,
  }
}
