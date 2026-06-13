import { queryOptions } from "@tanstack/react-query"

import { getAdminMetrics } from "@/lib/api/admin/metrics"
import type { MetricTimeRange } from "@/lib/api/admin/metrics"
import type { MetricRefreshInterval } from "@/lib/metrics/refresh-interval"
import { getMetricRefreshIntervalMs } from "@/lib/metrics/refresh-interval"

export function adminMetricsQueryOptions(
  range: MetricTimeRange,
  refreshInterval: MetricRefreshInterval = "10s"
) {
  return queryOptions({
    queryKey: ["admin", "metrics", range],
    queryFn: () => getAdminMetrics(range),
    refetchInterval: getMetricRefreshIntervalMs(refreshInterval),
  })
}
