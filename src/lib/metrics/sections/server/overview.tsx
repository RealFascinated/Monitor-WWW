import { MetricStatCard } from "@/components/metrics/metric-stat-card"
import { useUserServer } from "@/hooks/use-user-server"
import type { DiskMetrics } from "@/lib/api/user/metrics"
import type { ServerResponse } from "@/lib/api/user/servers"
import {
  formatMemoryBytes,
  formatMemoryUsage,
  formatPercentValue,
  memoryUsagePercent,
} from "@/lib/formatter"
import { getLatestValue, hasValues } from "@/lib/metrics/series"
import { percentLevelColorClass } from "@/lib/metrics/percent-level"

function findRootDisk(disks: DiskMetrics[] | undefined): DiskMetrics | undefined {
  return disks?.find((disk) => disk.disk === "/")
}

function overviewHasData(
  server: Pick<ServerResponse, "cpuPercent" | "memUsage"> | undefined,
  disks: DiskMetrics[] | undefined
): boolean {
  const rootDisk = findRootDisk(disks)

  return (
    server?.cpuPercent != null ||
    server?.memUsage != null ||
    hasValues(rootDisk?.usagePercent)
  )
}

function OverviewStats({
  serverId,
  disks,
}: {
  serverId: number
  disks?: DiskMetrics[]
}) {
  const { data: server } = useUserServer(serverId)
  const cpuUsage = server.cpuPercent ?? null
  const memUsage = server.memUsage ?? null
  const memTotal = server.memMax ?? null
  const memPercent = memoryUsagePercent(memUsage, memTotal)

  const rootDisk = findRootDisk(disks)
  const diskPercent = getLatestValue(rootDisk?.usagePercent)
  const diskUsed = getLatestValue(rootDisk?.usedBytes)
  const diskTotal = getLatestValue(rootDisk?.totalBytes)

  const stats = [
    cpuUsage != null ? (
      <MetricStatCard
        key="cpu"
        title="CPU"
        value={formatPercentValue(cpuUsage)}
        valueClassName={percentLevelColorClass(cpuUsage)}
      />
    ) : null,
    memUsage != null ? (
      <MetricStatCard
        key="memory"
        title="Memory"
        value={formatMemoryUsage(memUsage, memTotal)}
        detail={
          memTotal != null
            ? `${formatMemoryBytes(memUsage)} of ${formatMemoryBytes(memTotal)}`
            : formatMemoryBytes(memUsage)
        }
        valueClassName={percentLevelColorClass(memPercent)}
      />
    ) : null,
    diskPercent != null ? (
      <MetricStatCard
        key="disk"
        title="Disk /"
        value={formatPercentValue(diskPercent)}
        detail={
          diskUsed != null && diskTotal != null
            ? `${formatMemoryBytes(diskUsed)} of ${formatMemoryBytes(diskTotal)}`
            : undefined
        }
        valueClassName={percentLevelColorClass(diskPercent)}
      />
    ) : null,
  ].filter(Boolean)

  if (stats.length === 0) {
    return null
  }

  return <div className="grid gap-4 sm:grid-cols-3">{stats}</div>
}

export { OverviewStats, overviewHasData }
