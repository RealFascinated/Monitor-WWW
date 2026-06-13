import { queryOptions } from "@tanstack/react-query"

import { getUserServerMetrics } from "@/lib/api/user/metrics"
import type { MetricTimeRange } from "@/lib/api/user/metrics"

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
    refetchInterval: 60_000,
  })
}
