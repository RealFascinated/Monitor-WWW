import { useMemo } from "react"

import type { ServerFolderLayout } from "@/lib/servers/group-by-folder"
import { partitionServerIdsByFolder } from "@/lib/servers/group-by-folder"
import { useServersStore } from "@/stores/servers-store"

function selectFolderLayoutKey(state: {
  serverIds: number[]
  servers: Record<number, { folderName: string | null; serverName: string }>
}) {
  return state.serverIds
    .map(
      (id) =>
        `${id}:${state.servers[id].folderName}:${state.servers[id].serverName}`
    )
    .join("|")
}

export function useServerFolderLayout(): ServerFolderLayout {
  const layoutKey = useServersStore(selectFolderLayoutKey)

  return useMemo(() => {
    const state = useServersStore.getState()
    return partitionServerIdsByFolder(
      state.serverIds,
      (id) => state.servers[id],
      { sortServers: true }
    )
  }, [layoutKey])
}

export function useServerIds() {
  return useServersStore((state) => state.serverIds)
}

function selectServerSearchIndexKey(state: {
  serverIds: number[]
  servers: Record<
    number,
    {
      serverName: string
      status: string
      agentVersion: string | null
    }
  >
}) {
  return state.serverIds
    .map((id) => {
      const server = state.servers[id]
      return `${id}:${server.serverName}:${server.status}:${server.agentVersion ?? ""}`
    })
    .join("|")
}

export function useServerSearchIndexKey() {
  return useServersStore(selectServerSearchIndexKey)
}

function selectServerRolesKey(state: {
  serverIds: number[]
  servers: Record<number, { role: string } | undefined>
}) {
  return state.serverIds
    .map((id) => `${id}:${state.servers[id]?.role ?? ""}`)
    .join("|")
}

export function useServerRolesKey() {
  return useServersStore(selectServerRolesKey)
}
