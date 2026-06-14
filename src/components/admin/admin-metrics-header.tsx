import { useNavigate } from "@tanstack/react-router"
import { Gauge } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
import type { MetricRefreshInterval } from "@/lib/metrics/refresh-interval"
import { metricTimeWindowToSearch } from "@/lib/metrics/time-window"
import type { MetricTimeWindow } from "@/lib/metrics/time-window"
import { cn } from "@/lib/utils"

type AdminMetricsHeaderProps = {
  timeWindow: MetricTimeWindow
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

const metricRangeShellClassName =
  "inline-flex w-full shrink-0 items-stretch overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100/80 p-1 sm:w-auto dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60"

type AdminMetricsToolbarProps = {
  timeWindow: MetricTimeWindow
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing: boolean
  onTimeWindowChange: (value: MetricTimeWindow) => void
}

function AdminMetricsToolbar({
  timeWindow,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing,
  onTimeWindowChange,
}: AdminMetricsToolbarProps) {
  return (
    <div
      className={metricRangeShellClassName}
      role="toolbar"
      aria-label="Time range"
    >
      <MetricRangeSelector
        value={timeWindow}
        onChange={onTimeWindowChange}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={onRefreshIntervalChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />
    </div>
  )
}

function AdminMetricsHeader({
  timeWindow,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing = false,
}: AdminMetricsHeaderProps) {
  const navigate = useNavigate()

  function handleTimeWindowChange(nextWindow: MetricTimeWindow) {
    navigate({
      to: "/admin/metrics",
      search: metricTimeWindowToSearch(nextWindow),
      resetScroll: false,
    })
  }

  const toolbarProps = {
    timeWindow,
    refreshInterval,
    onRefreshIntervalChange,
    onRefresh,
    isRefreshing,
    onTimeWindowChange: handleTimeWindowChange,
  }

  return (
    <>
      <div className="flex flex-col gap-2.5 pt-3 lg:mb-6">
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

            <div className="hidden lg:block">
              <AdminMetricsToolbar {...toolbarProps} />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Platform-wide metrics for fleet health, ingest, JVM, VictoriaMetrics,
            and HTTP traffic.
          </p>
        </div>
      </div>

      <div
        className={cn(
          "sticky top-14 z-30 mt-2.5 mb-6 w-full self-start border-b border-sidebar-border bg-background/95 py-1.5 backdrop-blur-sm lg:hidden"
        )}
      >
        <AdminMetricsToolbar {...toolbarProps} />
      </div>
    </>
  )
}

export { AdminMetricsHeader }
