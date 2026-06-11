import { MetricChartCard } from "@/components/metrics/metric-chart-card"
import { LazySection } from "@/components/metrics/lazy-section"
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
import { chartSeries, hasSeriesData } from "@/lib/metrics/series"
import { buildMetricsTimeGrid } from "@/lib/metrics/timestamps"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"
import type { ChartSeries } from "@/lib/metrics/series"
import {
  formatBytes,
  formatCelsius,
  formatCount,
  formatDurationSeconds,
  formatMegahertz,
  formatMilliseconds,
  formatNetworkRate,
  formatNumber,
  formatPercentValue,
  formatRate,
  formatWatts,
} from "@/lib/formatter"
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

function EntitySection({
  timeGrid,
  title,
  description,
  charts,
}: {
  timeGrid: MetricsTimeGrid
  title: string
  description?: string
  charts: ChartConfig[]
}) {
  if (!charts.some((chart) => hasSeriesData(chart.series))) {
    return null
  }

  return (
    <LazySection title={title} description={description}>
      <ChartGrid timeGrid={timeGrid} charts={charts} />
    </LazySection>
  )
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
      valueFormatter: formatBytes,
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
      valueFormatter: formatBytes,
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
      valueFormatter: formatBytes,
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
      valueFormatter: formatBytes,
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

function ServerMetricsView({ metrics }: ServerMetricsViewProps) {
  const timeGrid = buildMetricsTimeGrid(metrics)
  const host: HostMetrics = metrics.host ?? {}

  const overviewCharts: ChartConfig[] = [
    {
      title: "CPU usage",
      series: [chartSeries("CPU", host.cpuUsage)],
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
    },
    {
      title: "Memory used",
      series: [chartSeries("Used", host.memUsage)],
      valueFormatter: formatBytes,
    },
    {
      title: "Load average",
      series: [
        chartSeries("1m", host.load1),
        chartSeries("5m", host.load5),
        chartSeries("15m", host.load15),
      ],
      valueFormatter: formatNumber,
    },
  ]

  const hasOverview = overviewCharts.some((chart) =>
    hasSeriesData(chart.series)
  )

  return (
    <div className="flex flex-col gap-8">
      {hasOverview ? (
        <LazySection title="Overview">
          <ChartGrid timeGrid={timeGrid} charts={overviewCharts} />
        </LazySection>
      ) : null}

      {sectionHasCharts([
        {
          title: "CPU breakdown",
          series: [
            chartSeries("User", host.cpuUserPct),
            chartSeries("System", host.cpuSystemPct),
            chartSeries("IO wait", host.cpuIowaitPct),
            chartSeries("Steal", host.cpuStealPct),
          ],
        },
        {
          title: "Per-core usage",
          series: (metrics.cpuCores ?? []).map((core) =>
            chartSeries(core.cpu, core.cpuCorePct)
          ),
        },
      ]) ? (
        <LazySection title="CPU">
          <ChartGrid
            timeGrid={timeGrid}
            charts={[
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
          ]}
          />
        </LazySection>
      ) : null}

      {sectionHasCharts([
        {
          title: "Memory bytes",
          series: [
            chartSeries("Used", host.memUsage),
            chartSeries("Available", host.memAvailable),
            chartSeries("Total", host.memTotal),
          ],
        },
        {
          title: "Memory cache",
          series: [
            chartSeries("Buffers", host.memBuffers),
            chartSeries("Cached", host.memCached),
          ],
        },
        {
          title: "Swap",
          series: [
            chartSeries("Used", host.swapUsed),
            chartSeries("Total", host.swapTotal),
          ],
        },
      ]) ? (
        <LazySection title="Memory">
          <ChartGrid
            timeGrid={timeGrid}
            charts={[
            {
              title: "Memory bytes",
              series: [
                chartSeries("Used", host.memUsage),
                chartSeries("Available", host.memAvailable),
                chartSeries("Total", host.memTotal),
              ],
              valueFormatter: formatBytes,
            },
            {
              title: "Memory cache",
              series: [
                chartSeries("Buffers", host.memBuffers),
                chartSeries("Cached", host.memCached),
              ],
              valueFormatter: formatBytes,
            },
            {
              title: "Swap",
              series: [
                chartSeries("Used", host.swapUsed),
                chartSeries("Total", host.swapTotal),
              ],
              valueFormatter: formatBytes,
            },
          ]}
          />
        </LazySection>
      ) : null}

      {sectionHasCharts([
        {
          title: "Processes",
          series: [
            chartSeries("Total", host.processCount),
            chartSeries("Running", host.runningProcesses),
          ],
        },
        {
          title: "Kernel activity",
          series: [
            chartSeries("Context switches/s", host.ctxSwitchesPerSecond),
            chartSeries("Interrupts/s", host.interruptsPerSecond),
          ],
        },
      ]) ? (
        <LazySection title="Processes">
          <ChartGrid
            timeGrid={timeGrid}
            charts={[
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
          ]}
          />
        </LazySection>
      ) : null}

      {sectionHasCharts([
        {
          title: "CPU clock",
          series: [chartSeries("MHz", host.cpuClockMhz)],
        },
        {
          title: "CPU power",
          series: [chartSeries("Watts", host.cpuPowerWatts)],
        },
      ]) ? (
        <LazySection title="Power">
          <ChartGrid
            timeGrid={timeGrid}
            charts={[
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
          ]}
          />
        </LazySection>
      ) : null}

      {(metrics.disks ?? []).map((disk) => (
        <EntitySection
          key={disk.disk}
          timeGrid={timeGrid}
          title={`Disk ${disk.disk}`}
          charts={diskCharts(disk)}
        />
      ))}

      {(metrics.networks ?? []).map((network) => (
        <EntitySection
          key={network.interface}
          timeGrid={timeGrid}
          title={`Network ${network.interface}`}
          charts={networkCharts(network)}
        />
      ))}

      {(metrics.gpus ?? []).map((gpu) => (
        <EntitySection
          key={`${gpu.gpu}-${gpu.deviceId}`}
          timeGrid={timeGrid}
          title={gpu.gpu}
          description={`${gpu.vendor} · ${gpu.deviceId}`}
          charts={gpuCharts(gpu)}
        />
      ))}

      {(metrics.containers ?? []).length > 0 ? (
        <LazySection title="Containers">
          <ChartGrid
            timeGrid={timeGrid}
            charts={containerCharts(metrics.containers)}
          />
        </LazySection>
      ) : null}

      {(metrics.temperatures ?? []).length > 0 ? (
        <LazySection title="Temperature">
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
        </LazySection>
      ) : null}

      {metrics.zfsArc ? (
        <LazySection title="ZFS ARC">
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
                valueFormatter: formatBytes,
              },
              {
                title: "ARC composition",
                series: [
                  chartSeries("Data", metrics.zfsArc.dataBytes),
                  chartSeries("Metadata", metrics.zfsArc.metadataBytes),
                  chartSeries("L2ARC", metrics.zfsArc.l2arcSizeBytes),
                ],
                valueFormatter: formatBytes,
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
        </LazySection>
      ) : null}

      {(metrics.zfsPools ?? []).map((pool) => (
        <EntitySection
          key={pool.pool}
          timeGrid={timeGrid}
          title={`ZFS pool ${pool.pool}`}
          description={`Health: ${pool.health} · Scan: ${pool.scanState}`}
          charts={zfsPoolCharts(pool)}
        />
      ))}

      {(metrics.tcpConnections ?? []).length > 0 ? (
        <LazySection title="TCP">
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
        </LazySection>
      ) : null}
    </div>
  )
}

export { ServerMetricsView }
