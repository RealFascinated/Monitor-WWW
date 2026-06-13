import type { QueryClient } from "@tanstack/react-query"

import { WebSocketCommand } from "@/lib/ws/messages"
import type {
  InviteCreatedInviteeData,
  InviteCreatedOwnerData,
  InviteRevokedInviteeData,
  InviteRevokedOwnerData,
  MemberChangeData,
  ServerIdData,
  ServerMetricsUpdatedData,
  ServersUpdateData,
  WebSocketMessage,
} from "@/lib/ws/messages"
import type { ServerResponse } from "@/lib/api/user/servers"
import { invalidateUserServerMetrics } from "@/lib/api/user/metrics.queries"
import { useAccessStore } from "@/stores/access-store"
import { useInvitesStore } from "@/stores/invites-store"
import { useServersStore } from "@/stores/servers-store"

export function applyWebSocketMessage(
  queryClient: QueryClient,
  message: WebSocketMessage
): void {
  switch (message.command) {
    case WebSocketCommand.SERVERS_UPDATE: {
      const { servers } = message.data as ServersUpdateData
      useServersStore.getState().upsertServers(servers)
      break
    }
    case WebSocketCommand.SERVER_CREATED:
      useServersStore
        .getState()
        .upsertServers([message.data as ServerResponse])
      break
    case WebSocketCommand.SERVER_DELETED: {
      const { serverId } = message.data as ServerIdData
      useServersStore.getState().removeServer(serverId)
      useAccessStore.getState().clearAccess(serverId)
      break
    }
    case WebSocketCommand.SERVER_METRICS_UPDATED: {
      const { serverIds } = message.data as ServerMetricsUpdatedData
      invalidateUserServerMetrics(queryClient, serverIds)
      break
    }
    case WebSocketCommand.MEMBER_CHANGE: {
      const { serverId, access } = message.data as MemberChangeData
      useAccessStore.getState().setAccess(serverId, access)
      break
    }
    case WebSocketCommand.INVITE_CREATED: {
      const data = message.data as
        | InviteCreatedOwnerData
        | InviteCreatedInviteeData
      if ("serverId" in data) {
        useAccessStore.getState().addPendingInvite(data.serverId, data.invite)
      } else {
        useInvitesStore.getState().addInvite(data.invite)
      }
      break
    }
    case WebSocketCommand.INVITE_REVOKED: {
      const data = message.data as
        | InviteRevokedOwnerData
        | InviteRevokedInviteeData
      if ("serverId" in data) {
        useAccessStore
          .getState()
          .removePendingInvite(data.serverId, data.inviteId)
      } else {
        useInvitesStore.getState().removeInvite(data.inviteId)
      }
      break
    }
  }
}
