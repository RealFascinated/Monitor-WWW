import { MetricSection } from "@/components/metrics/metric-section"
import { MetricChartCard } from "@/components/metrics/metric-chart-card"
import { MetricStatCard } from "@/components/metrics/metric-stat-card"
import { MetricsSectionNav } from "@/components/metrics/metrics-section-nav"
import type {
  DiskMetrics,
  GpuMetrics,
  HostMetrics,
  NetworkMetrics,
  ServerMetricsResponse,
  ZfsPoolMetrics,
} from "@/lib/api/user/metrics"
import {
  PERCENT_THRESHOLDS,
  TEMPERATURE_THRESHOLDS,
} from "@/lib/metrics/chart-thresholds"
import type { ChartThreshold } from "@/lib/metrics/chart-thresholds"
import {
  chartSeries,
  getLatestValue,
  hasSeriesData,
  hasValues,
} from "@/lib/metrics/series"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"
import type { ChartSeries } from "@/lib/metrics/series"
import {
  formatMemoryBytes,
  formatCelsius,
  formatCount,
  formatDurationSeconds,
  formatMegahertz,
  formatMemoryUsage,
  formatMilliseconds,
  formatNetworkRate,
  formatNumber,
  formatPercentValue,
  formatRate,
  formatWatts,
  memoryUsagePercent,
} from "@/lib/formatter"
import { percentLevelColorClass } from "@/lib/metrics/percent-level"
import type { ChartYRange } from "@/lib/metrics/uplot-theme"

const PERCENT_Y_RANGE: ChartYRange = { max: 100 }

type ChartConfig = {
  title: string
  description?: string
  series: ChartSeries[]
  valueFormatter?: (value: number) => string
  yRange?: ChartYRange
  thresholds?: ChartThreshold[]
  showCurrentValues?: boolean
  mode?: "line" | "stack"
}

function ChartGrid({
  timeGrid,
  charts,
}: {
  timeGrid: MetricsTimeGrid
  charts: ChartConfig[]
}) {
  const visibleCharts = charts.filter((chart) => hasSeriesData(chart.series))

  if (visibleCharts.length === 0) {
    return null
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {visibleCharts.map((chart) => (
        <MetricChartCard
          key={chart.title}
          timeGrid={timeGrid}
          title={chart.title}
          description={chart.description}
          series={chart.series}
          valueFormatter={chart.valueFormatter}
          yRange={chart.yRange}
          thresholds={chart.thresholds}
          showCurrentValues={chart.showCurrentValues}
          mode={chart.mode}
        />
      ))}
    </div>
  )
}

type MetricSection = {
  id: string
  title: string
  description?: string
  content: React.ReactNode
}

function metricSectionId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function diskCharts(disk: DiskMetrics): ChartConfig[] {
  return [
    {
      title: "Usage",
      series: [chartSeries("Usage", disk.usagePercent)],
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
    },
    {
      title: "Capacity",
      series: [
        chartSeries("Used", disk.usedBytes),
        chartSeries("Total", disk.totalBytes),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "ETA until full",
      description: "Free space divided by daily growth rate",
      series: [chartSeries("ETA", disk.etaUntilFull)],
      valueFormatter: formatDurationSeconds,
    },
    {
      title: "Throughput",
      series: [
        chartSeries("Read", disk.ioReadBps),
        chartSeries("Write", disk.ioWriteBps),
      ],
      valueFormatter: formatRate,
    },
    {
      title: "I/O",
      series: [
        chartSeries("Usage", disk.ioUsagePct),
        chartSeries("Wait", disk.ioWaitMs),
      ],
      valueFormatter: formatNumber,
    },
    {
      title: "Inodes",
      series: [
        chartSeries("Used", disk.inodeUsed),
        chartSeries("Total", disk.inodeTotal),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "IOPS",
      series: [
        chartSeries("Read", disk.readIops),
        chartSeries("Write", disk.writeIops),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Latency",
      series: [
        chartSeries("Read", disk.readLatencyMs),
        chartSeries("Write", disk.writeLatencyMs),
      ],
      valueFormatter: formatMilliseconds,
    },
  ]
}

function networkCharts(network: NetworkMetrics): ChartConfig[] {
  return [
    {
      title: "Throughput",
      series: [
        chartSeries("RX", network.rxBps),
        chartSeries("TX", network.txBps),
      ],
      valueFormatter: formatNetworkRate,
    },
    {
      title: "Packets",
      series: [
        chartSeries("RX", network.rxPacketsPerSecond),
        chartSeries("TX", network.txPacketsPerSecond),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Errors",
      series: [
        chartSeries("RX", network.rxErrorsPerSecond),
        chartSeries("TX", network.txErrorsPerSecond),
      ],
      valueFormatter: formatCount,
    },
  ]
}

function gpuCharts(gpu: GpuMetrics): ChartConfig[] {
  return [
    {
      title: "Usage",
      series: [chartSeries("Usage", gpu.usagePercent)],
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
    },
    {
      title: "Memory",
      series: [
        chartSeries("Used", gpu.memoryUsedBytes),
        chartSeries("Total", gpu.memoryTotalBytes),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "Temperature",
      series: [chartSeries("°C", gpu.temperatureCelsius)],
      valueFormatter: formatCelsius,
      thresholds: TEMPERATURE_THRESHOLDS,
    },
    {
      title: "Power",
      series: [chartSeries("Watts", gpu.powerWatts)],
      valueFormatter: formatWatts,
    },
  ]
}

function containerCharts(
  containers: ServerMetricsResponse["containers"]
): ChartConfig[] {
  const items = containers ?? []

  return [
    {
      title: "CPU",
      mode: "stack",
      series: items.map((container) =>
        chartSeries(container.container, container.cpuUsage)
      ),
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
      showCurrentValues: false,
    },
    {
      title: "Memory",
      mode: "stack",
      series: items.map((container) =>
        chartSeries(container.container, container.memoryUsage)
      ),
      valueFormatter: formatMemoryBytes,
      showCurrentValues: false,
    },
  ]
}

function zfsPoolCharts(pool: ZfsPoolMetrics): ChartConfig[] {
  return [
    {
      title: "Capacity",
      series: [
        chartSeries("Capacity", pool.capacityPercent),
        chartSeries("Fragmentation", pool.fragmentationPercent),
        chartSeries("Scan", pool.scanPercent),
      ],
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
    },
    {
      title: "Space",
      series: [
        chartSeries("Allocated", pool.allocatedBytes),
        chartSeries("Free", pool.freeBytes),
        chartSeries("Total", pool.totalBytes),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "I/O",
      series: [
        chartSeries("Read", pool.readBps),
        chartSeries("Write", pool.writeBps),
      ],
      valueFormatter: formatRate,
    },
    {
      title: "IOPS",
      series: [
        chartSeries("Read", pool.readIops),
        chartSeries("Write", pool.writeIops),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Checksum errors",
      series: [chartSeries("Errors", pool.checksumErrors)],
      valueFormatter: formatCount,
    },
  ]
}

type ServerMetricsViewProps = {
  metrics: ServerMetricsResponse
}

function sectionHasCharts(charts: ChartConfig[]): boolean {
  return charts.some((chart) => hasSeriesData(chart.series))
}

function pushSection(
  sections: MetricSection[],
  {
    id,
    title,
    description,
    content,
  }: {
    id?: string
    title: string
    description?: string
    content: React.ReactNode
  }
) {
  sections.push({
    id: id ?? metricSectionId(title),
    title,
    description,
    content,
  })
}

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

  return (
    <div className="grid gap-4 sm:grid-cols-3">{stats}</div>
  )
}

function buildMetricSections(
  metrics: ServerMetricsResponse,
  timeGrid: MetricsTimeGrid
): MetricSection[] {
  const host: HostMetrics = metrics.host ?? {}
  const sections: MetricSection[] = []

  if (overviewHasData(host, metrics.disks ?? undefined)) {
    pushSection(sections, {
      title: "Overview",
      content: <OverviewStats host={host} disks={metrics.disks ?? undefined} />,
    })
  }

  const cpuCharts: ChartConfig[] = [
    {
      title: "CPU breakdown",
      series: [
        chartSeries("User", host.cpuUserPct),
        chartSeries("System", host.cpuSystemPct),
        chartSeries("IO wait", host.cpuIowaitPct),
        chartSeries("Steal", host.cpuStealPct),
      ],
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
    },
    {
      title: "Per-core usage",
      series: (metrics.cpuCores ?? []).map((core) =>
        chartSeries(core.cpu, core.cpuCorePct)
      ),
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
      showCurrentValues: false,
    },
  ]

  if (sectionHasCharts(cpuCharts)) {
    pushSection(sections, {
      title: "CPU",
      content: <ChartGrid timeGrid={timeGrid} charts={cpuCharts} />,
    })
  }

  const memoryCharts: ChartConfig[] = [
    {
      title: "Memory bytes",
      series: [
        chartSeries("Used", host.memUsage),
        chartSeries("Available", host.memAvailable),
        chartSeries("Total", host.memTotal),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "Memory cache",
      series: [
        chartSeries("Buffers", host.memBuffers),
        chartSeries("Cached", host.memCached),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "Swap",
      series: [
        chartSeries("Used", host.swapUsed),
        chartSeries("Total", host.swapTotal),
      ],
      valueFormatter: formatMemoryBytes,
    },
  ]

  if (sectionHasCharts(memoryCharts)) {
    pushSection(sections, {
      title: "Memory",
      content: <ChartGrid timeGrid={timeGrid} charts={memoryCharts} />,
    })
  }

  const processCharts: ChartConfig[] = [
    {
      title: "Processes",
      series: [
        chartSeries("Total", host.processCount),
        chartSeries("Running", host.runningProcesses),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Kernel activity",
      series: [
        chartSeries("Context switches/s", host.ctxSwitchesPerSecond),
        chartSeries("Interrupts/s", host.interruptsPerSecond),
      ],
      valueFormatter: formatCount,
    },
  ]

  if (sectionHasCharts(processCharts)) {
    pushSection(sections, {
      title: "Processes",
      content: <ChartGrid timeGrid={timeGrid} charts={processCharts} />,
    })
  }

  const powerCharts: ChartConfig[] = [
    {
      title: "CPU clock",
      series: [chartSeries("MHz", host.cpuClockMhz)],
      valueFormatter: formatMegahertz,
    },
    {
      title: "CPU power",
      series: [chartSeries("Watts", host.cpuPowerWatts)],
      valueFormatter: formatWatts,
    },
  ]

  if (sectionHasCharts(powerCharts)) {
    pushSection(sections, {
      title: "Power",
      content: <ChartGrid timeGrid={timeGrid} charts={powerCharts} />,
    })
  }

  for (const disk of metrics.disks ?? []) {
    const charts = diskCharts(disk)
    if (!sectionHasCharts(charts)) {
      continue
    }

    const title = `Disk ${disk.disk}`
    pushSection(sections, {
      title,
      content: <ChartGrid timeGrid={timeGrid} charts={charts} />,
    })
  }

  for (const network of metrics.networks ?? []) {
    const charts = networkCharts(network)
    if (!sectionHasCharts(charts)) {
      continue
    }

    const title = `Network ${network.interface}`
    pushSection(sections, {
      title,
      content: <ChartGrid timeGrid={timeGrid} charts={charts} />,
    })
  }

  for (const gpu of metrics.gpus ?? []) {
    const charts = gpuCharts(gpu)
    if (!sectionHasCharts(charts)) {
      continue
    }

    pushSection(sections, {
      id: metricSectionId(`${gpu.gpu}-${gpu.deviceId}`),
      title: gpu.gpu,
      description: `${gpu.vendor} · ${gpu.deviceId}`,
      content: <ChartGrid timeGrid={timeGrid} charts={charts} />,
    })
  }

  if ((metrics.containers ?? []).length > 0) {
    pushSection(sections, {
      title: "Containers",
      content: (
        <ChartGrid
          timeGrid={timeGrid}
          charts={containerCharts(metrics.containers)}
        />
      ),
    })
  }

  if ((metrics.temperatures ?? []).length > 0) {
    pushSection(sections, {
      title: "Temperature",
      content: (
        <ChartGrid
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
    pushSection(sections, {
      title: "ZFS ARC",
      content: (
        <ChartGrid
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

  for (const pool of metrics.zfsPools ?? []) {
    const charts = zfsPoolCharts(pool)
    if (!sectionHasCharts(charts)) {
      continue
    }

    const title = `ZFS pool ${pool.pool}`
    pushSection(sections, {
      title,
      description: `Health: ${pool.health} · Scan: ${pool.scanState}`,
      content: <ChartGrid timeGrid={timeGrid} charts={charts} />,
    })
  }

  if ((metrics.tcpConnections ?? []).length > 0) {
    pushSection(sections, {
      title: "TCP",
      content: (
        <ChartGrid
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

  return sections
}

function ServerMetricsView({ metrics }: ServerMetricsViewProps) {
  const timeGrid = buildMetricsTimeGrid(metrics)
  const sections = buildMetricSections(metrics, timeGrid)

  return (
    <div className="flex gap-6 xl:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {sections.map((section) => (
          <MetricSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
          >
            {section.content}
          </MetricSection>
        ))}
      </div>

      <MetricsSectionNav
        sections={sections.map(({ id, title }) => ({ id, title }))}
      />
    </div>
  )
}

export { ServerMetricsView }
