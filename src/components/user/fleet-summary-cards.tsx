import { MetricStatCard } from "@/components/metrics/metric-stat-card"
import type { ServerResponse } from "@/lib/api/user/servers"
import { formatPercent } from "@/lib/formatter"
import { percentLevelColorClass } from "@/lib/metrics/percent-level"
import { computeFleetSummary } from "@/lib/servers/fleet-summary"
import { cn } from "@/lib/utils"

function FleetSummaryCards({ servers }: { servers: ServerResponse[] }) {
  const summary = computeFleetSummary(servers)

  function onlineMetricDetail(
    avg: number | null,
    count: number,
    noDataLabel: string
  ): string {
    if (summary.online === 0) {
      return "No online servers"
    }

    if (avg == null) {
      return noDataLabel
    }

    return `Across ${count} online server${count === 1 ? "" : "s"}`
  }

  const attentionCount = summary.needsAttentionCount
  const attentionDetail =
    attentionCount === 0
      ? "No issues detected"
      : "Offline or high CPU, memory, or disk"

  return (
    <div className="metric-stat-grid">
      <MetricStatCard
        title="Fleet status"
        value={`${summary.online} online`}
        detail={`${summary.offline} offline · ${summary.pending} pending`}
        valueClassName={cn(
          summary.online > 0 && summary.offline === 0
            ? "text-[#2E9470] dark:text-green-400"
            : summary.online === 0
              ? "text-[#C44E4E] dark:text-error"
              : undefined
        )}
      />
      <MetricStatCard
        title="Avg CPU"
        value={formatPercent(summary.avgCpuPercent)}
        detail={onlineMetricDetail(
          summary.avgCpuPercent,
          summary.onlineWithCpuCount,
          "No CPU data yet"
        )}
        valueClassName={percentLevelColorClass(summary.avgCpuPercent)}
      />
      <MetricStatCard
        title="Avg memory"
        value={formatPercent(summary.avgMemPercent)}
        detail={onlineMetricDetail(
          summary.avgMemPercent,
          summary.onlineWithMemCount,
          "No memory data yet"
        )}
        valueClassName={percentLevelColorClass(summary.avgMemPercent)}
      />
      <MetricStatCard
        title="Needs attention"
        value={String(attentionCount)}
        detail={attentionDetail}
        valueClassName={cn(
          attentionCount === 0
            ? "text-[#2E9470] dark:text-green-400"
            : "text-[#B8870A] dark:text-warning"
        )}
      />
    </div>
  )
}

export { FleetSummaryCards }
