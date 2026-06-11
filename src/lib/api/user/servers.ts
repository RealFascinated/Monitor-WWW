import { apiFetch } from "@/lib/auth/api"

export type ServerStatus = "ONLINE" | "OFFLINE" | "PENDING"

export type ServerRole = "OWNER" | "VIEWER"

export type ServerInventory = {
  ip: string | null
  coreCount: number | null
  threadCount: number | null
  cpuModel: string | null
  socketCount: number | null
  osName: string | null
  osVersion: string | null
}

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
  role: ServerRole
  inventory: ServerInventory | null
}

export type ServerCreateRequest = {
  name: string
}

export type CreatedServerResponse = {
  serverId: number
  serverName: string
  ingestToken: string
}

export type IngestTokenResponse = {
  serverId: number
  ingestToken: string
}

export type ServerRenameRequest = {
  name: string
}

export function getUserServers(): Promise<ServerResponse[]> {
  return apiFetch<ServerResponse[]>("/v1/user/servers")
}

export function getUserServer(serverId: number): Promise<ServerResponse> {
  return apiFetch<ServerResponse>(`/v1/servers/${serverId}`)
}

export function createServer(
  request: ServerCreateRequest
): Promise<CreatedServerResponse> {
  return apiFetch<CreatedServerResponse>("/v1/servers/create", {
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

export function rotateIngestToken(
  serverId: number
): Promise<IngestTokenResponse> {
  return apiFetch<IngestTokenResponse>(
    `/v1/servers/${serverId}/ingest-token/rotate`,
    { method: "POST" }
  )
}

export function deleteServer(serverId: number): Promise<void> {
  return apiFetch<void>(`/v1/servers/${serverId}`, {
    method: "DELETE",
  })
}
