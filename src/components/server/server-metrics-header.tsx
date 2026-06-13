import { Link, useNavigate } from "@tanstack/react-router"
import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
import { SimpleTooltip } from "@/components/simple-tooltip"
import { Button } from "@/components/ui/button"
import type { ServerResponse } from "@/lib/api/user/servers"
import type { MetricTimeRange } from "@/lib/api/user/metrics"
import { ServerMetaSubtitle } from "@/components/server/server-meta-subtitle"

type ServerMetricsHeaderProps = {
  server: ServerResponse | undefined
  range: MetricTimeRange
  serverId: number
}

function ServerMetricsHeader({
  server,
  range,
  serverId,
}: ServerMetricsHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="z-30 mb-6 flex flex-col gap-2.5 border-b border-sidebar-border bg-background/95 py-3 backdrop-blur-sm lg:sticky lg:top-0">
      <Breadcrumb
        items={[
          { label: "Servers", to: "/" },
          {
            label: server?.serverName ?? `Server ${serverId}`,
            current: true,
          },
        ]}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-xl">
              {server?.serverName ?? `Server ${serverId}`}
            </h1>
            {server ? <ServerStatusBadge status={server.status} /> : null}
          </div>

          <div
            className="inline-flex shrink-0 items-stretch overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100/80 p-0.5 dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60"
            role="toolbar"
            aria-label="Server actions"
          >
            <SimpleTooltip content="Server settings">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 rounded-sm border-0 px-2.5 text-xs hover:bg-white/70 dark:hover:bg-monitor-gray-300/60"
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

            <div
              className="my-1 w-px shrink-0 bg-neutral-200 dark:bg-monitor-gray-300"
              aria-hidden
            />

            <MetricRangeSelector
              value={range}
              onChange={(nextRange) => {
                navigate({
                  to: "/servers/$serverId",
                  params: { serverId: String(serverId) },
                  search: { range: nextRange },
                  resetScroll: false,
                })
              }}
            />
          </div>
        </div>

        {server ? <ServerMetaSubtitle server={server} /> : null}
      </div>
    </div>
  )
}

export { ServerMetricsHeader }
