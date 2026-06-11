import { useMemo } from "react"

import { MetricsView } from "@/components/metrics/metrics-view"
import { useUserServer } from "@/hooks/use-user-server"
import type { ServerMetricsResponse } from "@/lib/api/user/metrics"
import { buildServerMetricSections } from "@/lib/metrics/sections/server/build"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"

type ServerMetricsViewProps = {
  metrics: ServerMetricsResponse
}

function ServerMetricsView({ metrics }: ServerMetricsViewProps) {
  const { data: server } = useUserServer(metrics.id)
  const timeGrid = useMemo(() => buildMetricsTimeGrid(metrics), [metrics])
  const sections = useMemo(
    () => buildServerMetricSections(metrics, timeGrid, server),
    [metrics, timeGrid, server]
  )

  return <MetricsView sections={sections} />
}

export { ServerMetricsView }
