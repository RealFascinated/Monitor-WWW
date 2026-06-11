import { Link, useNavigate } from "@tanstack/react-router"
import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { MetricRangeSelector } from "@/components/server/metric-range-selector"
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
          { label: "Dashboard", to: "/" },
          {
            label: server?.serverName ?? `Server ${serverId}`,
            current: true,
          },
        ]}
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl">
              {server?.serverName ?? `Server ${serverId}`}
            </h1>
            {server ? <ServerStatusBadge status={server.status} /> : null}
          </div>
          {server ? <ServerMetaSubtitle server={server} /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" asChild>
            <Link
              to="/servers/$serverId/settings"
              params={{ serverId: String(serverId) }}
            >
              <Settings className="size-4" />
              Settings
            </Link>
          </Button>

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
    </div>
  )
}

export { ServerMetricsHeader }
