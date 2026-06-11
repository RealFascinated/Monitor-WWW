import { apiFetch } from "@/lib/auth/api"

import type { ServerMemberRole } from "@/lib/api/user/access"

export type UserPendingInvite = {
  inviteId: number
  serverId: number
  serverName: string
  role: ServerMemberRole
  expiresAt: string
  createdAt: string
}

export type ServerInviteAcceptRequest = {
  token: string
}

export type ServerMemberResponse = {
  serverId: number
  serverName: string
  role: ServerMemberRole
  joinedAt: string
}

export function getUserPendingInvites(): Promise<UserPendingInvite[]> {
  return apiFetch<UserPendingInvite[]>("/v1/user/invites")
}

export function acceptServerInvite(
  request: ServerInviteAcceptRequest
): Promise<ServerMemberResponse> {
  return apiFetch<ServerMemberResponse>("/v1/user/invites/accept", {
    method: "POST",
    body: JSON.stringify(request),
  })
}
