import { queryOptions } from "@tanstack/react-query"

import { getUserPendingInvites } from "@/lib/api/user/invites"

export const userPendingInvitesQueryOptions = queryOptions({
  queryKey: ["user", "invites"],
  queryFn: getUserPendingInvites,
})
