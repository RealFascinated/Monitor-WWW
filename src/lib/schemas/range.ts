import { z } from "zod"

import type { MetricTimeRange } from "@/lib/metrics/range"
import { METRIC_RANGES } from "@/lib/metrics/range"
import type { MetricTimeWindow } from "@/lib/metrics/time-window"

export function metricRangeSearchSchema(defaultRange: MetricTimeRange) {
  return z
    .object({
      range: z.enum(METRIC_RANGES).optional(),
      from: z.coerce.number().int().positive().optional(),
      to: z.coerce.number().int().positive().optional(),
    })
    .transform((search): MetricTimeWindow => {
      const { from, to, range } = search

      if (from != null && to != null && from < to) {
        return { kind: "custom", from, to }
      }

      return { kind: "preset", range: range ?? defaultRange }
    })
}
