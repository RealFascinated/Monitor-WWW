import type { QueryClient } from "@tanstack/react-query"
import { queryOptions } from "@tanstack/react-query"

import { getUserServerMetrics } from "@/lib/api/user/metrics"
import type { MetricTimeRange } from "@/lib/api/user/metrics"
import { isWsConnected } from "@/lib/ws/state"

export const userServerMetricsQueryKey = {
  all: ["user", "servers"] as const,
  server: (serverId: number) =>
    ["user", "servers", serverId, "metrics"] as const,
  detail: (serverId: number, range: MetricTimeRange) =>
    ["user", "servers", serverId, "metrics", range] as const,
}

export function userServerMetricsQueryOptions(
  serverId: number,
  range: MetricTimeRange
) {
  return queryOptions({
    queryKey: userServerMetricsQueryKey.detail(serverId, range),
    queryFn: () => getUserServerMetrics(serverId, range),
    refetchInterval: () => (isWsConnected() ? false : 60_000),
  })
}

export function invalidateUserServerMetrics(
  queryClient: QueryClient,
  serverIds: number[]
) {
  for (const serverId of serverIds) {
    void queryClient.invalidateQueries({
      queryKey: userServerMetricsQueryKey.server(serverId),
    })
  }
}

export function invalidateAllUserServerMetrics(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: userServerMetricsQueryKey.all,
  })
}
