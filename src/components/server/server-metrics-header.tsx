import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Users } from "lucide-react"

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
import { formatUptime } from "@/lib/formatter"
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
        "sticky top-14 z-30 -mx-4 mb-6 flex flex-col gap-4 border-b border-neutral-200 bg-gray-50/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8 dark:border-monitor-gray-200 dark:bg-base/95"
      )}
    >
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold dark:text-white">
              {server?.serverName ?? `Server ${serverId}`}
            </h1>
            {server ? <ServerStatusBadge status={server.status} /> : null}
          </div>
          {server ? (
            <p className="text-sm text-neutral-500">
              Uptime {formatUptime(server.uptimeSeconds)}
              {server.agentVersion ? ` · Agent ${server.agentVersion}` : null}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" size="sm" asChild>
            <Link
              to="/servers/$serverId/access"
              params={{ serverId: String(serverId) }}
            >
              <Users className="size-4" />
              Access
            </Link>
          </Button>

          <Select
            value={range}
            onValueChange={(value) => {
              navigate({
                to: "/servers/$serverId",
                params: { serverId: String(serverId) },
                search: { range: value as MetricTimeRange },
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
