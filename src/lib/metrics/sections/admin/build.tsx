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

import type { AdminMetricsResponse } from "@/lib/api/admin/metrics"
import { createMetricsSectionBuilder } from "@/lib/metrics/sections/builder"
import { addChartSection } from "@/lib/metrics/sections/chart-section"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"
import {
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

  if (overview && overviewHasData(overview)) {
    addChartSection(builder, {
      title: "Overview",
      icon: LayoutDashboard,
      charts: overviewCharts(overview),
      timeGrid,
    })
  }

  if (fleet && fleetHasData(fleet)) {
    addChartSection(builder, {
      title: "Fleet",
      icon: Server,
      charts: fleetCharts(fleet),
      timeGrid,
    })
  }

  const osEntries = parseFleetOsEntries(fleet)
  if (osEntries.length > 0) {
    addChartSection(builder, {
      title: "OS breakdown",
      icon: Monitor,
      charts: fleetOsCharts(osEntries),
      timeGrid,
    })
  }

  const versionEntries = parseFleetVersionEntries(fleet)
  if (versionEntries.length > 0) {
    addChartSection(builder, {
      title: "Agent versions",
      icon: Package,
      charts: fleetVersionCharts(versionEntries),
      timeGrid,
    })
  }

  const ingest = metrics.ingest
  if (ingest && ingestHasData(ingest)) {
    addChartSection(builder, {
      title: "Ingest",
      icon: Upload,
      charts: ingestCharts(ingest),
      timeGrid,
    })
  }

  const jvm = metrics.jvm
  if (jvm && jvmHasData(jvm)) {
    addChartSection(builder, {
      title: "JVM",
      icon: Coffee,
      charts: jvmCharts(jvm),
      timeGrid,
    })
  }

  const vm = metrics.vm
  if (vm && vmHasData(vm)) {
    addChartSection(builder, {
      title: "VictoriaMetrics",
      icon: Database,
      charts: vmCharts(vm),
      timeGrid,
    })
  }

  const httpEntries = parseHttpEntries(metrics.http)
  if (httpHasData(metrics.http)) {
    addChartSection(builder, {
      title: "HTTP",
      icon: Globe,
      charts: httpCharts(httpEntries),
      timeGrid,
    })
  }

  return builder.build()
}

export { buildAdminMetricSections }
