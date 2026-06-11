import type { MetricValues, ServerMetricsResponse } from "@/lib/api/user/metrics"
import {
  METRIC_RANGE_LOOKBACK_SECONDS,
  parseMetricRange,
} from "@/lib/metrics/range"

export type MetricsTimeGrid = {
  gridTimestamps: number[]
  sourceTimestamps: number[] | null
}

function buildWindowTimestamps(
  lookbackSeconds: number,
  stepSeconds: number
): number[] {
  const end = Math.floor(Date.now() / 1000)
  const start = end - lookbackSeconds
  const alignedStart = start - (start % stepSeconds)
  const timestamps: number[] = []

  for (let timestamp = alignedStart; timestamp <= end; timestamp += stepSeconds) {
    timestamps.push(timestamp)
  }

  return timestamps
}

function normalizeValue(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value)) {
    return null
  }

  return value
}

function isDenseGrid(apiTimestamps: number[], fullGrid: number[]): boolean {
  if (apiTimestamps.length === 0 || fullGrid.length === 0) {
    return false
  }

  return apiTimestamps.length >= fullGrid.length * 0.9
}

export function buildMetricsTimeGrid(
  metrics: ServerMetricsResponse
): MetricsTimeGrid {
  const step = metrics.step && metrics.step > 0 ? metrics.step : 300
  const range = parseMetricRange(metrics.range)
  const lookback = METRIC_RANGE_LOOKBACK_SECONDS[range]
  const fullGrid = buildWindowTimestamps(lookback, step)
  const apiTimestamps = metrics.timestamps

  if (apiTimestamps && apiTimestamps.length > 0) {
    const dense = isDenseGrid(apiTimestamps, fullGrid)

    return {
      gridTimestamps: dense ? apiTimestamps : fullGrid,
      sourceTimestamps: apiTimestamps,
    }
  }

  return {
    gridTimestamps: fullGrid,
    sourceTimestamps: null,
  }
}

export function alignValuesToTimestamps(
  gridTimestamps: number[],
  sourceTimestamps: number[] | null,
  values: MetricValues
): (number | null)[] | null {
  if (!values || values.length === 0) {
    return null
  }

  if (values.length === gridTimestamps.length) {
    return values.map((value) => normalizeValue(value))
  }

  if (
    sourceTimestamps &&
    sourceTimestamps.length === values.length &&
    sourceTimestamps.length > 0
  ) {
    const byTimestamp = new Map<number, number | null>()

    for (let index = 0; index < values.length; index++) {
      byTimestamp.set(
        sourceTimestamps[index],
        normalizeValue(values[index])
      )
    }

    return gridTimestamps.map(
      (timestamp) => byTimestamp.get(timestamp) ?? null
    )
  }

  if (values.length < gridTimestamps.length) {
    const padding = gridTimestamps.length - values.length

    return [
      ...Array.from({ length: padding }, () => null),
      ...values.map((value) => normalizeValue(value)),
    ]
  }

  return values
    .slice(values.length - gridTimestamps.length)
    .map((value) => normalizeValue(value))
}
