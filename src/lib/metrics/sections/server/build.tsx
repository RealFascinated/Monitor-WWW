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
import type { ServerResponse } from "@/lib/api/user/servers"
import { TEMPERATURE_THRESHOLDS } from "@/lib/metrics/chart-thresholds"
import { createMetricsSectionBuilder } from "@/lib/metrics/sections/builder"
import {
  countChartsWithData,
  DISK_SECTION_CHART_COUNT,
  estimateChartsGridHeight,
  GPU_SECTION_CHART_COUNT,
  NETWORK_SECTION_CHART_COUNT,
  OVERVIEW_SECTION_MIN_HEIGHT,
  ZFS_POOL_SECTION_CHART_COUNT,
} from "@/lib/metrics/grid-height"
import { metricSectionId } from "@/lib/metrics/sections/id"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"
import {
  chartsHaveData,
  containerCharts,
  diskCharts,
  diskHasData,
  gpuCharts,
  gpuHasData,
  hostCpuCharts,
  hostMemoryCharts,
  hostProcessCharts,
  networkCharts,
  networkHasData,
  zfsPoolCharts,
  zfsPoolHasData,
} from "@/lib/metrics/sections/server/charts"
import { OverviewStats, overviewHasData } from "@/lib/metrics/sections/server/overview"
import { chartSeries } from "@/lib/metrics/series"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"
import { formatCelsius, formatCount, formatMemoryBytes, formatNumber } from "@/lib/formatter"

function buildServerMetricSections(
  metrics: ServerMetricsResponse,
  timeGrid: MetricsTimeGrid,
  server?: ServerResponse
): MetricsSectionNode[] {
  const host = metrics.host ?? {}
  const builder = createMetricsSectionBuilder()

  if (overviewHasData(server)) {
    builder.leaf({
      title: "Overview",
      icon: LayoutDashboard,
      contentMinHeight: OVERVIEW_SECTION_MIN_HEIGHT,
      render: () => <OverviewStats serverId={metrics.id} />,
    })
  }

  const cpuCharts = hostCpuCharts(host, metrics.cpuCores)
  if (chartsHaveData(cpuCharts)) {
    builder.leaf({
      title: "CPU",
      icon: Cpu,
      contentMinHeight: estimateChartsGridHeight(countChartsWithData(cpuCharts)),
      render: () => <MetricChartGrid timeGrid={timeGrid} charts={cpuCharts} />,
    })
  }

  const memoryCharts = hostMemoryCharts(host)
  if (chartsHaveData(memoryCharts)) {
    builder.leaf({
      title: "Memory",
      icon: MemoryStick,
      contentMinHeight: estimateChartsGridHeight(
        countChartsWithData(memoryCharts)
      ),
      render: () => (
        <MetricChartGrid timeGrid={timeGrid} charts={memoryCharts} />
      ),
    })
  }

  const processCharts = hostProcessCharts(host)
  if (chartsHaveData(processCharts)) {
    builder.leaf({
      title: "Processes",
      icon: Cog,
      contentMinHeight: estimateChartsGridHeight(
        countChartsWithData(processCharts)
      ),
      render: () => (
        <MetricChartGrid timeGrid={timeGrid} charts={processCharts} />
      ),
    })
  }

  builder.group({ id: "disks", title: "Disk", icon: HardDrive }, (group) => {
    for (const disk of metrics.disks ?? []) {
      if (!diskHasData(disk)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`disk-${disk.disk}`),
        title: `Disk ${disk.disk}`,
        navLabel: disk.disk,
        icon: HardDrive,
        contentMinHeight: estimateChartsGridHeight(DISK_SECTION_CHART_COUNT),
        render: () => (
          <MetricChartGrid timeGrid={timeGrid} charts={diskCharts(disk)} />
        ),
      })
    }
  })

  builder.group({ id: "networks", title: "Network", icon: Network }, (group) => {
    for (const network of metrics.networks ?? []) {
      if (!networkHasData(network)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`network-${network.interface}`),
        title: `Network ${network.interface}`,
        navLabel: network.interface,
        icon: Network,
        contentMinHeight: estimateChartsGridHeight(NETWORK_SECTION_CHART_COUNT),
        render: () => (
          <MetricChartGrid timeGrid={timeGrid} charts={networkCharts(network)} />
        ),
      })
    }
  })

  builder.group({ id: "gpus", title: "GPU", icon: Gpu }, (group) => {
    for (const gpu of metrics.gpus ?? []) {
      if (!gpuHasData(gpu)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`${gpu.gpu}-${gpu.deviceId}`),
        title: gpu.gpu,
        navLabel: gpu.gpu,
        icon: Gpu,
        description: `${gpu.vendor} · ${gpu.deviceId}`,
        contentMinHeight: estimateChartsGridHeight(GPU_SECTION_CHART_COUNT),
        render: () => (
          <MetricChartGrid timeGrid={timeGrid} charts={gpuCharts(gpu)} />
        ),
      })
    }
  })

  const containerChartConfigs = containerCharts(metrics.containers)
  if (chartsHaveData(containerChartConfigs)) {
    builder.leaf({
      title: "Docker",
      icon: Container,
      contentMinHeight: estimateChartsGridHeight(
        countChartsWithData(containerChartConfigs)
      ),
      render: () => (
        <MetricChartGrid timeGrid={timeGrid} charts={containerChartConfigs} />
      ),
    })
  }

  if ((metrics.temperatures ?? []).length > 0) {
    const temperatureCharts = [
      {
        title: "Sensors",
        series: (metrics.temperatures ?? []).map((sensor) =>
          chartSeries(sensor.sensor, sensor.temperatureCelsius)
        ),
        valueFormatter: formatCelsius,
        thresholds: TEMPERATURE_THRESHOLDS,
        showCurrentValues: false,
      },
    ]

    builder.leaf({
      title: "Temperature",
      icon: Thermometer,
      contentMinHeight: estimateChartsGridHeight(
        countChartsWithData(temperatureCharts)
      ),
      render: () => (
        <MetricChartGrid timeGrid={timeGrid} charts={temperatureCharts} />
      ),
    })
  }

  if (metrics.zfsArc) {
    const zfsArcCharts = [
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
    ]

    builder.leaf({
      title: "ZFS ARC",
      icon: Disc,
      contentMinHeight: estimateChartsGridHeight(
        countChartsWithData(zfsArcCharts)
      ),
      render: () => (
        <MetricChartGrid timeGrid={timeGrid} charts={zfsArcCharts} />
      ),
    })
  }

  builder.group({ id: "zfs-pools", title: "ZFS pool", icon: Database }, (group) => {
    for (const pool of metrics.zfsPools ?? []) {
      if (!zfsPoolHasData(pool)) {
        continue
      }

      group.leaf({
        id: metricSectionId(`zfs-pool-${pool.pool}`),
        title: `ZFS pool ${pool.pool}`,
        navLabel: pool.pool,
        icon: Database,
        description: `Health: ${pool.health} · Scan: ${pool.scanState}`,
        contentMinHeight: estimateChartsGridHeight(ZFS_POOL_SECTION_CHART_COUNT),
        render: () => (
          <MetricChartGrid timeGrid={timeGrid} charts={zfsPoolCharts(pool)} />
        ),
      })
    }
  })

  if ((metrics.tcpConnections ?? []).length > 0) {
    const tcpCharts = [
      {
        title: "Connections by state",
        series: (metrics.tcpConnections ?? []).map((tcp) =>
          chartSeries(tcp.state, tcp.connections)
        ),
        valueFormatter: formatCount,
        showCurrentValues: false,
      },
    ]

    builder.leaf({
      title: "TCP",
      icon: Cable,
      contentMinHeight: estimateChartsGridHeight(countChartsWithData(tcpCharts)),
      render: () => <MetricChartGrid timeGrid={timeGrid} charts={tcpCharts} />,
    })
  }

  return builder.build()
}

export { buildServerMetricSections }
