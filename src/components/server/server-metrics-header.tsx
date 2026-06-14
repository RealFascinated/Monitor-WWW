import { Link, useNavigate } from "@tanstack/react-router"
import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { serverBreadcrumbItems } from "@/components/server/server-breadcrumb-items"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
import { SimpleTooltip } from "@/components/simple-tooltip"
import { Button } from "@/components/ui/button"
import type { ServerResponse } from "@/lib/api/user/servers"
import type { MetricRefreshInterval } from "@/lib/metrics/refresh-interval"
import { metricTimeWindowToSearch } from "@/lib/metrics/time-window"
import type { MetricTimeWindow } from "@/lib/metrics/time-window"
import { ServerMetaSubtitle } from "@/components/server/server-meta-subtitle"
import { cn } from "@/lib/utils"

type ServerMetricsHeaderProps = {
  server: ServerResponse | undefined
  timeWindow: MetricTimeWindow
  serverId: number
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing?: boolean
}

const metricRangeShellClassName =
  "inline-flex w-full shrink-0 items-stretch gap-0.5 overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100/80 p-1 sm:w-auto dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60"

type ServerMetricsToolbarProps = {
  serverId: number
  timeWindow: MetricTimeWindow
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing: boolean
  onTimeWindowChange: (value: MetricTimeWindow) => void
  showSettings?: boolean
}

function ServerMetricsToolbar({
  serverId,
  timeWindow,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing,
  onTimeWindowChange,
  showSettings = true,
}: ServerMetricsToolbarProps) {
  return (
    <div
      className={metricRangeShellClassName}
      role="toolbar"
      aria-label="Server actions"
    >
      {showSettings ? (
        <SimpleTooltip content="Server settings">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1.5 rounded-sm border-0 px-2 text-xs hover:bg-white/70 dark:hover:bg-monitor-gray-300/60"
            asChild
          >
            <Link
              to="/servers/$serverId/settings"
              params={{ serverId: String(serverId) }}
            >
              <Settings className="size-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </Button>
        </SimpleTooltip>
      ) : null}

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

function ServerMetricsHeader({
  server,
  timeWindow,
  serverId,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing = false,
}: ServerMetricsHeaderProps) {
  const navigate = useNavigate()

  function handleTimeWindowChange(nextWindow: MetricTimeWindow) {
    navigate({
      to: "/servers/$serverId",
      params: { serverId: String(serverId) },
      search: metricTimeWindowToSearch(nextWindow),
      resetScroll: false,
    })
  }

  const toolbarProps = {
    serverId,
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
        <Breadcrumb items={serverBreadcrumbItems(server, serverId)} />

        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="text-xl">
                {server?.serverName ?? `Server ${serverId}`}
              </h1>
              {server ? <ServerStatusBadge status={server.status} /> : null}
            </div>

            <div className="hidden shrink-0 lg:block">
              <ServerMetricsToolbar {...toolbarProps} />
            </div>

            <div className="shrink-0 lg:hidden">
              <SimpleTooltip content="Server settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 shrink-0 rounded-sm border border-neutral-200 bg-neutral-100/80 px-2.5 text-xs hover:bg-white/70 dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60 dark:hover:bg-monitor-gray-300/60"
                  asChild
                >
                  <Link
                    to="/servers/$serverId/settings"
                    params={{ serverId: String(serverId) }}
                  >
                    <Settings className="size-3.5" />
                    <span className="hidden sm:inline">Settings</span>
                  </Link>
                </Button>
              </SimpleTooltip>
            </div>
          </div>

          {server ? <ServerMetaSubtitle server={server} /> : null}
        </div>
      </div>

      <div
        className={cn(
          "sticky top-14 z-30 mt-2.5 mb-6 w-full self-start border-b border-sidebar-border bg-background/95 py-1.5 backdrop-blur-sm lg:hidden"
        )}
      >
        <ServerMetricsToolbar {...toolbarProps} showSettings={false} />
      </div>
    </>
  )
}

export { ServerMetricsHeader }
