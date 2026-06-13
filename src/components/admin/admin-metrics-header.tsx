import { useNavigate } from "@tanstack/react-router"
import { Gauge } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
import type { MetricTimeRange } from "@/lib/api/admin/metrics"
import type { MetricRefreshInterval } from "@/lib/metrics/refresh-interval"

type AdminMetricsHeaderProps = {
  range: MetricTimeRange
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

function AdminMetricsHeader({
  range,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing = false,
}: AdminMetricsHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="z-30 mb-6 flex flex-col gap-2.5 border-b border-sidebar-border bg-background/95 py-3 backdrop-blur-sm lg:sticky lg:top-0">
      <Breadcrumb
        items={[
          { label: "Servers", to: "/" },
          { label: "Admin Metrics", current: true },
        ]}
      />

      <div className="flex flex-col gap-1">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Gauge className="size-4 shrink-0 text-monitor dark:text-warning" />
            <h1 className="text-xl">Admin Metrics</h1>
          </div>

          <div
            className="inline-flex w-full shrink-0 items-stretch overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100/80 p-0.5 sm:w-auto dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60"
            role="toolbar"
            aria-label="Metrics range"
          >
            <MetricRangeSelector
              value={range}
              onChange={(nextRange) => {
                navigate({
                  to: "/admin/metrics",
                  search: { range: nextRange },
                  resetScroll: false,
                })
              }}
              refreshInterval={refreshInterval}
              onRefreshIntervalChange={onRefreshIntervalChange}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Platform-wide metrics for fleet health, ingest, JVM, VictoriaMetrics,
          and HTTP traffic.
        </p>
      </div>
    </div>
  )
}

export { AdminMetricsHeader }
