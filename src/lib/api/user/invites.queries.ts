import { queryOptions } from "@tanstack/react-query"

import { getUserPendingInvites } from "@/lib/api/user/invites"

export const userInvitesQueryKey = ["user", "invites"] as const

export function userInvitesQueryOptions() {
  return queryOptions({
    queryKey: userInvitesQueryKey,
    queryFn: getUserPendingInvites,
  })
}
