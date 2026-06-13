import { useNavigate } from "@tanstack/react-router"
import { Gauge } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
import type { MetricTimeRange } from "@/lib/api/admin/metrics"

type AdminMetricsHeaderProps = {
  range: MetricTimeRange
}

function AdminMetricsHeader({ range }: AdminMetricsHeaderProps) {
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Gauge className="size-4 shrink-0 text-monitor dark:text-warning" />
            <h1 className="text-xl">Admin Metrics</h1>
          </div>

          <div
            className="inline-flex shrink-0 items-stretch overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100/80 p-0.5 dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60"
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
