import type { ServerAccessListResponse } from "@/lib/api/user/access"
import type { UserPendingInvite } from "@/lib/api/user/invites"
import type { ServerResponse } from "@/lib/api/user/servers"

export const WebSocketCommand = {
  SERVERS_UPDATE: "SERVERS_UPDATE",
  SERVER_CREATED: "SERVER_CREATED",
  SERVER_DELETED: "SERVER_DELETED",
  SERVER_METRICS_UPDATED: "SERVER_METRICS_UPDATED",
  MEMBER_CHANGE: "MEMBER_CHANGE",
  INVITE_CREATED: "INVITE_CREATED",
  INVITE_REVOKED: "INVITE_REVOKED",
} as const

export type WebSocketCommandName =
  (typeof WebSocketCommand)[keyof typeof WebSocketCommand]

export type WebSocketMessage = {
  command: WebSocketCommandName
  data: unknown
}

export type ServersUpdateData = {
  servers: ServerResponse[]
}

export type ServerMetricsUpdatedData = {
  serverIds: number[]
}

export type ServerIdData = {
  serverId: number
}

export type MemberChangeData = {
  serverId: number
  access: ServerAccessListResponse
}

export type InviteCreatedOwnerData = {
  serverId: number
  invite: ServerAccessListResponse["pendingInvites"][number]
}

export type InviteCreatedInviteeData = {
  invite: UserPendingInvite
}

export type InviteRevokedOwnerData = {
  serverId: number
  inviteId: number
}

export type InviteRevokedInviteeData = {
  inviteId: number
}

export type ServerWebSocketData =
  | ServersUpdateData
  | ServerResponse
  | ServerMetricsUpdatedData
  | ServerIdData
  | MemberChangeData
  | InviteCreatedOwnerData
  | InviteCreatedInviteeData
  | InviteRevokedOwnerData
  | InviteRevokedInviteeData
