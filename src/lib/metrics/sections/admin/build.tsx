import {
  Coffee,
  Database,
  Globe,
  LayoutDashboard,
  Monitor,
  Package,
  Server,
  Upload,
} from "lucide-react"

import { MetricChartGrid } from "@/components/metrics/metric-chart-grid"
import type { AdminMetricsResponse } from "@/lib/api/admin/metrics"
import {
  countChartsWithData,
  estimateChartsGridHeight,
} from "@/lib/metrics/grid-height"
import { createMetricsSectionBuilder } from "@/lib/metrics/sections/builder"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"
import {
  chartsHaveData,
  createPlatformChartContext,
  fleetCharts,
  fleetHasData,
  fleetOsCharts,
  fleetVersionCharts,
  httpCharts,
  httpHasData,
  ingestCharts,
  ingestHasData,
  jvmCharts,
  jvmHasData,
  overviewCharts,
  overviewHasData,
  parseFleetOsEntries,
  parseFleetVersionEntries,
  parseHttpEntries,
  vmCharts,
  vmHasData,
} from "@/lib/metrics/sections/admin/charts"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"

function buildAdminMetricSections(
  metrics: AdminMetricsResponse,
  timeGrid: MetricsTimeGrid
): MetricsSectionNode[] {
  const builder = createMetricsSectionBuilder()
  const overview = metrics.overview
  const fleet = metrics.fleet
  const chartContext = createPlatformChartContext(metrics)

  if (overview && overviewHasData(overview)) {
    const charts = overviewCharts(overview)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "Overview",
        icon: LayoutDashboard,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  if (fleet && fleetHasData(fleet)) {
    const charts = fleetCharts(fleet)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "Fleet",
        icon: Server,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const osEntries = parseFleetOsEntries(fleet)
  if (osEntries.length > 0) {
    const charts = fleetOsCharts(osEntries)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "OS breakdown",
        icon: Monitor,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const versionEntries = parseFleetVersionEntries(fleet)
  if (versionEntries.length > 0) {
    const charts = fleetVersionCharts(versionEntries)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "Agent versions",
        icon: Package,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const ingest = metrics.ingest
  if (ingest && ingestHasData(ingest)) {
    const charts = ingestCharts(ingest, chartContext)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "Ingest",
        icon: Upload,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const jvm = metrics.jvm
  if (jvm && jvmHasData(jvm)) {
    const charts = jvmCharts(jvm)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "JVM",
        icon: Coffee,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const vm = metrics.vm
  if (vm && vmHasData(vm)) {
    const charts = vmCharts(vm, chartContext)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "VictoriaMetrics",
        icon: Database,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  const httpEntries = parseHttpEntries(metrics.http, chartContext)
  if (httpHasData(metrics.http)) {
    const charts = httpCharts(httpEntries, chartContext)
    if (chartsHaveData(charts)) {
      builder.leaf({
        title: "HTTP",
        icon: Globe,
        contentMinHeight: estimateChartsGridHeight(countChartsWithData(charts)),
        render: () => <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  }

  return builder.build()
}

export { buildAdminMetricSections }
