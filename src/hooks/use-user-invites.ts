import { useInvitesStore } from "@/stores/invites-store"

export function useUserInvites() {
  const invites = useInvitesStore((state) => state.invites)
  const isPending = useInvitesStore((state) => state.isLoading)
  const error = useInvitesStore((state) => state.error)

  return {
    data: invites,
    isPending,
    error,
  }
}
