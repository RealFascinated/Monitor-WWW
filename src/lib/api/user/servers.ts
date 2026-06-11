import { apiFetch } from "@/lib/auth/api"

export type ServerStatus = "ONLINE" | "OFFLINE"

export type ServerResponse = {
  serverId: number
  serverName: string
  status: ServerStatus
  uptimeSeconds: number | null
  agentVersion: string | null
  createdAt: string
  cpuPercent: number | null
  memUsage: number | null
  memMax: number | null
}

export type ServerCreateRequest = {
  name: string
}

export type ServerRenameRequest = {
  name: string
}

export function getUserServers(): Promise<ServerResponse[]> {
  return apiFetch<ServerResponse[]>("/v1/user/servers")
}

export function createServer(request: ServerCreateRequest): Promise<void> {
  return apiFetch<void>("/v1/servers/create", {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function renameServer(
  serverId: number,
  request: ServerRenameRequest
): Promise<void> {
  return apiFetch<void>(`/v1/servers/${serverId}/rename`, {
    method: "POST",
    body: JSON.stringify(request),
  })
}

export function deleteServer(serverId: number): Promise<void> {
  return apiFetch<void>(`/v1/servers/${serverId}`, {
    method: "DELETE",
  })
}
