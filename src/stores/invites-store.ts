import { create } from "zustand"

import { getUserPendingInvites } from "@/lib/api/user/invites"
import type { UserPendingInvite } from "@/lib/api/user/invites"
import { ApiClientError } from "@/lib/auth/api"

type InvitesState = {
  invites: UserPendingInvite[]
  isLoading: boolean
  error: string | null
  fetchInvites: () => Promise<void>
  addInvite: (invite: UserPendingInvite) => void
  removeInvite: (inviteId: number) => void
  reset: () => void
}

const initialState = {
  invites: [] as UserPendingInvite[],
  isLoading: false,
  error: null as string | null,
}

export const useInvitesStore = create<InvitesState>((set, get) => ({
  ...initialState,

  fetchInvites: async () => {
    set({ isLoading: true, error: null })
    try {
      const invites = await getUserPendingInvites()
      set({ invites, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof ApiClientError
            ? error.message
            : "Failed to load invites",
      })
    }
  },

  addInvite: (invite) => {
    const invites = get().invites
    if (invites.some((row) => row.inviteId === invite.inviteId)) {
      return
    }
    set({ invites: [...invites, invite] })
  },

  removeInvite: (inviteId) => {
    set((state) => ({
      invites: state.invites.filter((invite) => invite.inviteId !== inviteId),
    }))
  },

  reset: () => {
    set(initialState)
  },
}))
