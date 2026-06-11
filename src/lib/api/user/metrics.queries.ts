import { queryOptions } from "@tanstack/react-query"

import { getUserServerMetrics } from "@/lib/api/user/metrics"
import type { MetricTimeRange } from "@/lib/api/user/metrics"

export function userServerMetricsQueryOptions(
  serverId: number,
  range: MetricTimeRange
) {
  return queryOptions({
    queryKey: ["user", "servers", serverId, "metrics", range],
    queryFn: () => getUserServerMetrics(serverId, range),
    refetchInterval: 30_000
  })
}
