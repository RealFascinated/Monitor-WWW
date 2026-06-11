import { Link, useNavigate } from "@tanstack/react-router"
import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ServerResponse } from "@/lib/api/user/servers"
import type { MetricTimeRange } from "@/lib/api/user/metrics"
import { METRIC_RANGE_OPTIONS } from "@/lib/metrics/range"
import { ServerMetaSubtitle } from "@/components/server/server-meta-subtitle"
import { cn } from "@/lib/utils"

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
    <div
      className={cn(
        "z-30 -mx-4 -mt-4 mb-8 flex flex-col gap-4 border-b border-sidebar-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:sticky lg:top-0 lg:-mx-8 lg:-mt-6 lg:min-h-[var(--metrics-header-offset)] lg:px-8"
      )}
    >
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/" },
          {
            label: server?.serverName ?? `Server ${serverId}`,
            current: true,
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1>{server?.serverName ?? `Server ${serverId}`}</h1>
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

          <Select
            value={range}
            onValueChange={(value) => {
              navigate({
                to: "/servers/$serverId",
                params: { serverId: String(serverId) },
                search: { range: value as MetricTimeRange },
                resetScroll: false,
              })
            }}
          >
            <SelectTrigger
              size="sm"
              className="min-w-[6.5rem] border-neutral-200 bg-white dark:border-monitor-gray-300 dark:bg-monitor-gray-100"
              aria-label="Timeframe"
            >
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent align="end">
              {METRIC_RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

export { ServerMetricsHeader }
