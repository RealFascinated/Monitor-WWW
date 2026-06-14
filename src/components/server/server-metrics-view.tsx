import { useMemo } from "react"

import { Callout } from "@/components/callout"
import { MetricsView } from "@/components/metrics/metrics-view"
import { useUserServer } from "@/hooks/use-user-server"
import type { ServerMetricsResponse } from "@/lib/api/user/metrics"
import { getMetricRangeOption, parseMetricRange } from "@/lib/metrics/range"
import { buildServerMetricSections } from "@/lib/metrics/sections/server/build"
import { overviewHasData } from "@/lib/metrics/sections/server/overview"
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
  const chartSections = useMemo(
    () =>
      buildServerMetricSections(metrics, timeGrid, server, {
        includeOverview: false,
      }),
    [metrics, timeGrid, server]
  )

  const hasChartData = chartSections.length > 0
  const showRangeCallout =
    !hasChartData && server?.status !== "PENDING"

  if (sections.length === 0 && !showRangeCallout) {
    return null
  }

  const rangeLabel = getMetricRangeOption(
    parseMetricRange(metrics.range)
  ).label
  const hasCurrentMetrics = overviewHasData(server)

  return (
    <div className="flex flex-col gap-6">
      {showRangeCallout ? (
        <Callout
          type={hasCurrentMetrics ? "info" : "warning"}
          title={
            hasCurrentMetrics
              ? "Not enough history yet"
              : "No metrics in this time range"
          }
        >
          <p>
            {hasCurrentMetrics
              ? `Metrics are being collected, but this server hasn't been monitored long enough to fill the ${rangeLabel.toLowerCase()}. Try a shorter range.`
              : `No chart data is available for the ${rangeLabel.toLowerCase()}. Try a shorter or more recent time range.`}
          </p>
        </Callout>
      ) : null}
      {sections.length > 0 ? <MetricsView sections={sections} /> : null}
    </div>
  )
}

export { ServerMetricsView }
