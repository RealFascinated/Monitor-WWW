import type { MetricValues } from "@/lib/api/user/metrics"
import { alignValuesToTimestamps } from "@/lib/metrics/timestamps"
import type uPlot from "uplot"

export type ChartSeries = {
  label: string
  values: MetricValues
  negate?: boolean
}

export function chartSeries(
  label: string,
  values: MetricValues,
  options?: { negate?: boolean }
): ChartSeries {
  return { label, values: values ?? null, negate: options?.negate }
}

export function hasAnyValues(...fields: (MetricValues | undefined)[]): boolean {
  for (const field of fields) {
    if (hasValues(field)) {
      return true
    }
  }

  return false
}

export function hasValues(values: MetricValues): boolean {
  if (!values || values.length === 0) {
    return false
  }

  for (let index = values.length - 1; index >= 0; index--) {
    const value = values[index]
    if (value != null && Number.isFinite(value)) {
      return true
    }
  }

  return false
}

export function hasSeriesData(series: ChartSeries[]): boolean {
  return series.some((entry) => hasValues(entry.values))
}

export function getLatestValue(values: MetricValues): number | null {
  if (!values) {
    return null
  }

  for (let index = values.length - 1; index >= 0; index--) {
    const value = values[index]
    if (value != null && Number.isFinite(value)) {
      return value
    }
  }

  return null
}

export function buildMultiSeriesData(
  gridTimestamps: number[],
  sourceTimestamps: number[] | null,
  series: ChartSeries[]
): { data: uPlot.AlignedData; labels: string[]; negated: boolean[] } | null {
  const activeSeries = series.filter((entry) => hasValues(entry.values))

  if (activeSeries.length === 0 || gridTimestamps.length === 0) {
    return null
  }

  const data: uPlot.AlignedData = [gridTimestamps]
  const labels: string[] = []
  const negated: boolean[] = []

  for (const entry of activeSeries) {
    const aligned = alignValuesToTimestamps(
      gridTimestamps,
      sourceTimestamps,
      entry.values
    )
    if (!aligned) {
      continue
    }

    data.push(
      entry.negate
        ? aligned.map((value) => (value == null ? null : -value))
        : aligned
    )
    labels.push(entry.label)
    negated.push(entry.negate ?? false)
  }

  if (labels.length === 0) {
    return null
  }

  return { data, labels, negated }
}

export function stackAlignedData(data: uPlot.AlignedData): {
  data: uPlot.AlignedData
  bands: uPlot.Band[]
} {
  const pointCount = data[0].length
  const accum = new Array<number>(pointCount).fill(0)
  const stackedSeries: (number | null)[][] = []

  for (let seriesIndex = 1; seriesIndex < data.length; seriesIndex++) {
    const series = data[seriesIndex] as (number | null)[]
    const cumulative: (number | null)[] = []

    for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
      const value = series[pointIndex]
      if (value == null) {
        cumulative.push(accum[pointIndex] === 0 ? null : accum[pointIndex])
      } else {
        accum[pointIndex] += value
        cumulative.push(accum[pointIndex])
      }
    }

    stackedSeries.push(cumulative)
  }

  const bands: uPlot.Band[] = []
  for (let index = 1; index < data.length; index++) {
    bands.push({
      series: [data.length - index - 1, data.length - index],
    })
  }

  return {
    data: [data[0], ...stackedSeries],
    bands,
  }
}
