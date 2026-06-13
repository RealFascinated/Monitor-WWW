import { queryOptions } from "@tanstack/react-query"

import { getAdminMetrics } from "@/lib/api/admin/metrics"
import type { MetricTimeRange } from "@/lib/api/admin/metrics"

export function adminMetricsQueryOptions(range: MetricTimeRange) {
  return queryOptions({
    queryKey: ["admin", "metrics", range],
    queryFn: () => getAdminMetrics(range),
    refetchInterval: 60_000,
  })
}
