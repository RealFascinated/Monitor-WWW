import { useMemo } from "react"

import { MetricsView } from "@/components/metrics/metrics-view"
import type { AdminMetricsResponse } from "@/lib/api/admin/metrics"
import { buildAdminMetricSections } from "@/lib/metrics/sections/admin/build"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"

type AdminMetricsViewProps = {
  metrics: AdminMetricsResponse
}

function AdminMetricsView({ metrics }: AdminMetricsViewProps) {
  const timeGrid = useMemo(() => buildMetricsTimeGrid(metrics), [metrics])
  const sections = useMemo(
    () => buildAdminMetricSections(metrics, timeGrid),
    [metrics, timeGrid]
  )

  return <MetricsView sections={sections} />
}

export { AdminMetricsView }
