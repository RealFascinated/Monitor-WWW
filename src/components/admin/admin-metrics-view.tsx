import { useMemo } from "react"

import { MetricsView } from "@/components/metrics/metrics-view"
import type { AdminMetricsResponse } from "@/lib/api/admin/metrics"
import type { MetricsDataWindow } from "@/lib/metrics/chart-zoom"
import { buildAdminMetricSections } from "@/lib/metrics/sections/admin/build"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"

type AdminMetricsViewProps = {
  metrics: AdminMetricsResponse
  dataWindow: MetricsDataWindow
  onZoomToRange: (from: number, to: number) => void
  zoomDisabled?: boolean
}

function AdminMetricsView({
  metrics,
  dataWindow,
  onZoomToRange,
  zoomDisabled = false,
}: AdminMetricsViewProps) {
  const timeGrid = useMemo(() => buildMetricsTimeGrid(metrics), [metrics])
  const sections = useMemo(
    () => buildAdminMetricSections(metrics, timeGrid),
    [metrics, timeGrid]
  )

  return (
    <MetricsView
      sections={sections}
      dataWindow={dataWindow}
      onZoomToRange={onZoomToRange}
      zoomDisabled={zoomDisabled}
    />
  )
}

export { AdminMetricsView }
