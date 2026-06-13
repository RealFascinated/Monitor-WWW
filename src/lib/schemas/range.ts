import { z } from "zod"

import type { MetricTimeRange } from "@/lib/api/user/metrics"
import { METRIC_RANGES } from "@/lib/metrics/range"

export function metricRangeSearchSchema(defaultRange: MetricTimeRange) {
  return z.object({
    range: z.enum(METRIC_RANGES).default(defaultRange),
  })
}
