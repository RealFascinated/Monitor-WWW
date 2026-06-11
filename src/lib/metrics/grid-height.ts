import type { MetricChartConfig } from "@/lib/metrics/sections/server/charts"
import { hasSeriesData } from "@/lib/metrics/series"

const OVERVIEW_SECTION_MIN_HEIGHT = 108
const CHART_CARD_APPROX_HEIGHT = 280
const CHART_GRID_GAP = 16
const CHART_GRID_COLUMNS = 2
const METRIC_SECTION_HEADER_HEIGHT = 56
const METRICS_SECTION_GAP = 16
const METRICS_SECTION_SCROLL_PADDING = 128

const DISK_SECTION_CHART_COUNT = 8
const NETWORK_SECTION_CHART_COUNT = 3
const GPU_SECTION_CHART_COUNT = 4
const ZFS_POOL_SECTION_CHART_COUNT = 5

function estimateChartsGridHeight(chartCount: number): number {
  if (chartCount <= 0) {
    return 0
  }

  const rows = Math.ceil(chartCount / CHART_GRID_COLUMNS)
  return rows * CHART_CARD_APPROX_HEIGHT + Math.max(0, rows - 1) * CHART_GRID_GAP
}

function countChartsWithData(charts: MetricChartConfig[]): number {
  let count = 0

  for (const chart of charts) {
    if (hasSeriesData(chart.series)) {
      count++
    }
  }

  return count
}

export {
  CHART_CARD_APPROX_HEIGHT,
  DISK_SECTION_CHART_COUNT,
  countChartsWithData,
  estimateChartsGridHeight,
  GPU_SECTION_CHART_COUNT,
  METRIC_SECTION_HEADER_HEIGHT,
  METRICS_SECTION_GAP,
  METRICS_SECTION_SCROLL_PADDING,
  NETWORK_SECTION_CHART_COUNT,
  OVERVIEW_SECTION_MIN_HEIGHT,
  ZFS_POOL_SECTION_CHART_COUNT,
}
