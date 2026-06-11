import { MetricStatCard } from "@/components/metrics/metric-stat-card"
import type { DiskMetrics, HostMetrics } from "@/lib/api/user/metrics"
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
  host: HostMetrics,
  disks: DiskMetrics[] | undefined
): boolean {
  const rootDisk = findRootDisk(disks)

  return (
    hasValues(host.cpuUsage) ||
    hasValues(host.memUsage) ||
    hasValues(rootDisk?.usagePercent)
  )
}

function OverviewStats({
  host,
  disks,
}: {
  host: HostMetrics
  disks?: DiskMetrics[]
}) {
  const cpuUsage = getLatestValue(host.cpuUsage)
  const memUsage = getLatestValue(host.memUsage)
  const memTotal = getLatestValue(host.memTotal)
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
