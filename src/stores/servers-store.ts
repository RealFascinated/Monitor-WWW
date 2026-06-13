import { create } from "zustand"

import { getUserServer, getUserServers } from "@/lib/api/user/servers"
import type { ServerResponse } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"

type ServersState = {
  servers: Record<number, ServerResponse>
  serverIds: number[]
  isLoading: boolean
  error: string | null
  fetchServers: () => Promise<void>
  ensureServer: (serverId: number) => Promise<ServerResponse>
  upsertServer: (server: ServerResponse) => void
  upsertServers: (servers: ServerResponse[]) => void
  setServerFolderName: (serverId: number, folderName: string | null) => void
  setServersFolderName: (
    currentFolderName: string,
    nextFolderName: string | null
  ) => void
  removeServer: (serverId: number) => void
  reset: () => void
}

const initialState = {
  servers: {} as Record<number, ServerResponse>,
  serverIds: [] as number[],
  isLoading: false,
  error: null as string | null,
}

export const useServersStore = create<ServersState>((set, get) => ({
  ...initialState,

  fetchServers: async () => {
    set({ isLoading: true, error: null })
    try {
      const servers = await getUserServers()
      const serversById: Record<number, ServerResponse> = {}
      const serverIds: number[] = []
      for (const server of servers) {
        serversById[server.serverId] = server
        serverIds.push(server.serverId)
      }
      set({ servers: serversById, serverIds, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof ApiClientError
            ? error.message
            : "Failed to load servers",
      })
    }
  },

  ensureServer: async (serverId) => {
    const servers = get().servers
    if (serverId in servers) {
      return servers[serverId]
    }
    const server = await getUserServer(serverId)
    get().upsertServer(server)
    return server
  },

  upsertServer: (server) => {
    get().upsertServers([server])
  },

  upsertServers: (servers) => {
    if (servers.length === 0) {
      return
    }

    set((state) => {
      const nextServers = { ...state.servers }
      const nextServerIds = [...state.serverIds]

      for (const server of servers) {
        nextServers[server.serverId] = server
        if (!nextServerIds.includes(server.serverId)) {
          nextServerIds.push(server.serverId)
        }
      }

      return {
        servers: nextServers,
        serverIds: nextServerIds,
      }
    })
  },

  setServerFolderName: (serverId, folderName) => {
    set((state) => {
      const server = state.servers[serverId]
      if (server.folderName === folderName) {
        return state
      }

      return {
        servers: {
          ...state.servers,
          [serverId]: { ...server, folderName },
        },
      }
    })
  },

  setServersFolderName: (currentFolderName, nextFolderName) => {
    set((state) => {
      let changed = false
      const servers = { ...state.servers }

      for (const serverId of state.serverIds) {
        const server = state.servers[serverId]
        if (server.folderName === currentFolderName) {
          servers[serverId] = { ...server, folderName: nextFolderName }
          changed = true
        }
      }

      return changed ? { servers } : state
    })
  },

  removeServer: (serverId) => {
    set((state) => {
      const { [serverId]: removed, ...servers } = state.servers
      void removed
      return {
        servers,
        serverIds: state.serverIds.filter((id) => id !== serverId),
      }
    })
  },

  reset: () => {
    set(initialState)
  },
}))
