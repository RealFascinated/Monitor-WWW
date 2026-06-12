import { create } from "zustand"

import { getServerAccess } from "@/lib/api/user/access"
import type {
  PendingServerInvite,
  ServerAccessListResponse,
} from "@/lib/api/user/access"
import { ApiClientError } from "@/lib/auth/api"

type AccessState = {
  accessByServerId: Record<number, ServerAccessListResponse>
  loadingByServerId: Record<number, boolean>
  errorByServerId: Record<number, string | null>
  fetchAccess: (serverId: number) => Promise<void>
  setAccess: (serverId: number, access: ServerAccessListResponse) => void
  addPendingInvite: (serverId: number, invite: PendingServerInvite) => void
  removePendingInvite: (serverId: number, inviteId: number) => void
  clearAccess: (serverId: number) => void
  reset: () => void
}

const initialState = {
  accessByServerId: {} as Record<number, ServerAccessListResponse>,
  loadingByServerId: {} as Record<number, boolean>,
  errorByServerId: {} as Record<number, string | null>,
}

export const useAccessStore = create<AccessState>((set, get) => ({
  ...initialState,

  fetchAccess: async (serverId) => {
    set((state) => ({
      loadingByServerId: { ...state.loadingByServerId, [serverId]: true },
      errorByServerId: { ...state.errorByServerId, [serverId]: null },
    }))
    try {
      const access = await getServerAccess(serverId)
      set((state) => ({
        accessByServerId: { ...state.accessByServerId, [serverId]: access },
        loadingByServerId: { ...state.loadingByServerId, [serverId]: false },
      }))
    } catch (error) {
      set((state) => ({
        loadingByServerId: { ...state.loadingByServerId, [serverId]: false },
        errorByServerId: {
          ...state.errorByServerId,
          [serverId]:
            error instanceof ApiClientError
              ? error.message
              : "Failed to load access",
        },
      }))
    }
  },

  setAccess: (serverId, access) => {
    set((state) => ({
      accessByServerId: { ...state.accessByServerId, [serverId]: access },
    }))
  },

  addPendingInvite: (serverId, invite) => {
    const { accessByServerId } = get()
    if (!(serverId in accessByServerId)) {
      return
    }
    const access = accessByServerId[serverId]
    if (access.pendingInvites.some((row) => row.inviteId === invite.inviteId)) {
      return
    }
    set((state) => ({
      accessByServerId: {
        ...state.accessByServerId,
        [serverId]: {
          ...access,
          pendingInvites: [...access.pendingInvites, invite],
        },
      },
    }))
  },

  removePendingInvite: (serverId, inviteId) => {
    const { accessByServerId } = get()
    if (!(serverId in accessByServerId)) {
      return
    }
    const access = accessByServerId[serverId]
    set((state) => ({
      accessByServerId: {
        ...state.accessByServerId,
        [serverId]: {
          ...access,
          pendingInvites: access.pendingInvites.filter(
            (invite) => invite.inviteId !== inviteId
          ),
        },
      },
    }))
  },

  clearAccess: (serverId) => {
    set((state) => {
      const { [serverId]: removedAccess, ...accessByServerId } =
        state.accessByServerId
      const { [serverId]: removedLoading, ...loadingByServerId } =
        state.loadingByServerId
      const { [serverId]: removedError, ...errorByServerId } =
        state.errorByServerId
      void removedAccess
      void removedLoading
      void removedError
      return { accessByServerId, loadingByServerId, errorByServerId }
    })
  },

  reset: () => {
    set(initialState)
  },
}))
