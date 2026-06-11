import { MetricsView } from "@/components/metrics/metrics-view"
import type { ServerMetricsResponse } from "@/lib/api/user/metrics"
import { buildServerMetricSections } from "@/lib/metrics/sections/server/build"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"

type ServerMetricsViewProps = {
  metrics: ServerMetricsResponse
}

function ServerMetricsView({ metrics }: ServerMetricsViewProps) {
  const timeGrid = buildMetricsTimeGrid(metrics)
  const sections = buildServerMetricSections(metrics, timeGrid)

  return <MetricsView sections={sections} />
}

export { ServerMetricsView }
