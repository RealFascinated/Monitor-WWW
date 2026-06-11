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
    const existing = get().servers[serverId]
    if (existing) {
      return existing
    }
    const server = await getUserServer(serverId)
    get().upsertServer(server)
    return server
  },

  upsertServer: (server) => {
    set((state) => ({
      servers: { ...state.servers, [server.serverId]: server },
      serverIds: state.serverIds.includes(server.serverId)
        ? state.serverIds
        : [...state.serverIds, server.serverId],
    }))
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
