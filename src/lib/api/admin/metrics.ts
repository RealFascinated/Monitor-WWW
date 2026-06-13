import type { MetricTimeRange, MetricValues } from "@/lib/api/user/metrics"
import { apiFetch } from "@/lib/auth/api"

export type { MetricTimeRange, MetricValues }

export type FleetOsMetrics = {
  os: string
  serversByOs: MetricValues
}

export type FleetVersionMetrics = {
  version: string
  serversByAgentVersion: MetricValues
}

export type OverviewMetrics = {
  activeSessions?: MetricValues
  databaseSizeBytes?: MetricValues
  users?: MetricValues
  usersNew24h?: MetricValues
  websocketConnections?: MetricValues
}

export type FleetMetrics = {
  serversNew24h?: MetricValues
  serversOffline?: MetricValues
  serversOnline?: MetricValues
  serversPending?: MetricValues
  serversTotal?: MetricValues
  [key: string]: MetricValues | FleetOsMetrics | FleetVersionMetrics | undefined
}

export type HttpMetricsEntry = {
  method: string
  path: string
  status: string
  httpRequestsTotal: MetricValues
}

export type HttpMetrics = Record<string, HttpMetricsEntry>

export type IngestMetrics = {
  ingestAuthFailuresTotal?: MetricValues
  ingestDurationSeconds?: MetricValues
  ingestPayloadBytes?: MetricValues
  ingestsTotal?: MetricValues
}

export type JvmMetrics = {
  jvmHeapMaxBytes?: MetricValues
  jvmHeapUsedBytes?: MetricValues
  jvmNonheapUsedBytes?: MetricValues
  jvmProcessCpuLoad?: MetricValues
  jvmProcessRssBytes?: MetricValues
  jvmThreadCount?: MetricValues
  jvmUptimeSeconds?: MetricValues
}

export type VmMetrics = {
  vmQueriesTotal?: MetricValues
  vmQueryDurationSeconds?: MetricValues
  vmQueryErrorsTotal?: MetricValues
  vmWriteDurationSeconds?: MetricValues
  vmWriteErrorsTotal?: MetricValues
  vmWritesTotal?: MetricValues
}

export type AdminMetricsResponse = {
  range: string
  step: number | null
  timestamps: number[] | null
  overview?: OverviewMetrics | null
  fleet?: FleetMetrics | null
  http?: HttpMetrics | null
  ingest?: IngestMetrics | null
  jvm?: JvmMetrics | null
  vm?: VmMetrics | null
}

export function getAdminMetrics(
  range: MetricTimeRange
): Promise<AdminMetricsResponse> {
  const params = new URLSearchParams({ range })
  return apiFetch<AdminMetricsResponse>(`/v1/admin/metrics?${params}`)
}
