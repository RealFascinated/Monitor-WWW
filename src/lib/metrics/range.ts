import type { MetricTimeRange } from "@/lib/api/user/metrics"

/** Lookback durations in seconds — must match API MetricTimeRange. */
export const METRIC_RANGE_LOOKBACK_SECONDS: Record<MetricTimeRange, number> = {
  "24h": 86_400,
  "3d": 259_200,
  "7d": 604_800,
  "2w": 1_209_600,
  "1mo": 2_592_000,
  "3mo": 7_776_000,
  "1y": 31_536_000,
  "2y": 63_072_000,
}

const METRIC_RANGES: MetricTimeRange[] = [
  "24h",
  "3d",
  "7d",
  "2w",
  "1mo",
  "3mo",
  "1y",
  "2y",
]

export const METRIC_RANGE_OPTIONS: {
  value: MetricTimeRange
  label: string
}[] = [
  { value: "24h", label: "24h" },
  { value: "3d", label: "3d" },
  { value: "7d", label: "7d" },
  { value: "2w", label: "2w" },
  { value: "1mo", label: "1mo" },
  { value: "3mo", label: "3mo" },
  { value: "1y", label: "1y" },
  { value: "2y", label: "2y" },
]

export function parseMetricRange(value: unknown): MetricTimeRange {
  if (
    typeof value === "string" &&
    METRIC_RANGES.includes(value as MetricTimeRange)
  ) {
    return value as MetricTimeRange
  }

  return "7d"
}
