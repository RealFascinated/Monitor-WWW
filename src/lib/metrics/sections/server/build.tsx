import {
  Cable,
  Container,
  Cpu,
  Database,
  Disc,
  Gpu,
  HardDrive,
  LayoutDashboard,
  MemoryStick,
  Network,
  Thermometer,
  Cog,
} from "lucide-react"

import { MetricChartGrid } from "@/components/metrics/metric-chart-grid"
import type { ServerMetricsResponse } from "@/lib/api/user/metrics"
import { TEMPERATURE_THRESHOLDS } from "@/lib/metrics/chart-thresholds"
import { createMetricsSectionBuilder } from "@/lib/metrics/sections/builder"
import { metricSectionId } from "@/lib/metrics/sections/id"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"
import {
  chartsHaveData,
  containerCharts,
  diskCharts,
  gpuCharts,
  hostCpuCharts,
  hostMemoryCharts,
  hostProcessCharts,
  networkCharts,
  zfsPoolCharts,
} from "@/lib/metrics/sections/server/charts"
import { OverviewStats, overviewHasData } from "@/lib/metrics/sections/server/overview"
import { chartSeries } from "@/lib/metrics/series"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"
import { formatCelsius, formatCount, formatMemoryBytes, formatNumber } from "@/lib/formatter"

function buildServerMetricSections(
  metrics: ServerMetricsResponse,
  timeGrid: MetricsTimeGrid
): MetricsSectionNode[] {
  const host = metrics.host ?? {}
  const builder = createMetricsSectionBuilder()

  if (overviewHasData(host, metrics.disks ?? undefined)) {
    builder.leaf({
      title: "Overview",
      icon: LayoutDashboard,
      content: (
        <OverviewStats host={host} disks={metrics.disks ?? undefined} />
      ),
    })
  }

  const cpuCharts = hostCpuCharts(host, metrics.cpuCores)
  if (chartsHaveData(cpuCharts)) {
    builder.leaf({
      title: "CPU",
      icon: Cpu,
      content: <MetricChartGrid timeGrid={timeGrid} charts={cpuCharts} />,
    })
  }

  const memoryCharts = hostMemoryCharts(host)
  if (chartsHaveData(memoryCharts)) {
    builder.leaf({
      title: "Memory",
      icon: MemoryStick,
      content: <MetricChartGrid timeGrid={timeGrid} charts={memoryCharts} />,
    })
  }

  const processCharts = hostProcessCharts(host)
  if (chartsHaveData(processCharts)) {
    builder.leaf({
      title: "Processes",
      icon: Cog,
      content: <MetricChartGrid timeGrid={timeGrid} charts={processCharts} />,
    })
  }

  builder.group({ id: "disks", title: "Disk", icon: HardDrive }, (group) => {
    for (const disk of metrics.disks ?? []) {
      const charts = diskCharts(disk)
      if (!chartsHaveData(charts)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`disk-${disk.disk}`),
        title: `Disk ${disk.disk}`,
        navLabel: disk.disk,
        icon: HardDrive,
        content: <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  })

  builder.group({ id: "networks", title: "Network", icon: Network }, (group) => {
    for (const network of metrics.networks ?? []) {
      const charts = networkCharts(network)
      if (!chartsHaveData(charts)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`network-${network.interface}`),
        title: `Network ${network.interface}`,
        navLabel: network.interface,
        icon: Network,
        content: <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  })

  builder.group({ id: "gpus", title: "GPU", icon: Gpu }, (group) => {
    for (const gpu of metrics.gpus ?? []) {
      const charts = gpuCharts(gpu)
      if (!chartsHaveData(charts)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`${gpu.gpu}-${gpu.deviceId}`),
        title: gpu.gpu,
        navLabel: gpu.gpu,
        icon: Gpu,
        description: `${gpu.vendor} · ${gpu.deviceId}`,
        content: <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  })

  if ((metrics.containers ?? []).length > 0) {
    builder.leaf({
      title: "Docker",
      icon: Container,
      content: (
        <MetricChartGrid
          timeGrid={timeGrid}
          charts={containerCharts(metrics.containers)}
        />
      ),
    })
  }

  if ((metrics.temperatures ?? []).length > 0) {
    builder.leaf({
      title: "Temperature",
      icon: Thermometer,
      content: (
        <MetricChartGrid
          timeGrid={timeGrid}
          charts={[
            {
              title: "Sensors",
              series: (metrics.temperatures ?? []).map((sensor) =>
                chartSeries(sensor.sensor, sensor.temperatureCelsius)
              ),
              valueFormatter: formatCelsius,
              thresholds: TEMPERATURE_THRESHOLDS,
              showCurrentValues: false,
            },
          ]}
        />
      ),
    })
  }

  if (metrics.zfsArc) {
    builder.leaf({
      title: "ZFS ARC",
      icon: Disc,
      content: (
        <MetricChartGrid
          timeGrid={timeGrid}
          charts={[
            {
              title: "ARC size",
              series: [
                chartSeries("Size", metrics.zfsArc.sizeBytes),
                chartSeries("Target", metrics.zfsArc.targetBytes),
                chartSeries("Max", metrics.zfsArc.maxBytes),
                chartSeries("Min", metrics.zfsArc.minBytes),
              ],
              valueFormatter: formatMemoryBytes,
            },
            {
              title: "ARC composition",
              series: [
                chartSeries("Data", metrics.zfsArc.dataBytes),
                chartSeries("Metadata", metrics.zfsArc.metadataBytes),
                chartSeries("L2ARC", metrics.zfsArc.l2arcSizeBytes),
              ],
              valueFormatter: formatMemoryBytes,
            },
            {
              title: "ARC efficiency",
              series: [
                chartSeries("Hit ratio", metrics.zfsArc.hitRatio),
                chartSeries("Misses/s", metrics.zfsArc.missesPerSecond),
              ],
              valueFormatter: formatNumber,
            },
          ]}
        />
      ),
    })
  }

  builder.group({ id: "zfs-pools", title: "ZFS pool", icon: Database }, (group) => {
    for (const pool of metrics.zfsPools ?? []) {
      const charts = zfsPoolCharts(pool)
      if (!chartsHaveData(charts)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`zfs-pool-${pool.pool}`),
        title: `ZFS pool ${pool.pool}`,
        navLabel: pool.pool,
        icon: Database,
        description: `Health: ${pool.health} · Scan: ${pool.scanState}`,
        content: <MetricChartGrid timeGrid={timeGrid} charts={charts} />,
      })
    }
  })

  if ((metrics.tcpConnections ?? []).length > 0) {
    builder.leaf({
      title: "TCP",
      icon: Cable,
      content: (
        <MetricChartGrid
          timeGrid={timeGrid}
          charts={[
            {
              title: "Connections by state",
              series: (metrics.tcpConnections ?? []).map((tcp) =>
                chartSeries(tcp.state, tcp.connections)
              ),
              valueFormatter: formatCount,
              showCurrentValues: false,
            },
          ]}
        />
      ),
    })
  }

  return builder.build()
}

export { buildServerMetricSections }
