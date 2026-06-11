import type {
  DiskMetrics,
  GpuMetrics,
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
import type { ChartSeries } from "@/lib/metrics/series"
import type { ChartYRange } from "@/lib/metrics/uplot-theme"
import {
  formatCelsius,
  formatCount,
  formatDurationSeconds,
  formatMegahertz,
  formatMilliseconds,
  formatMemoryBytes,
  formatNetworkRate,
  formatNumber,
  formatPercentValue,
  formatRate,
  formatWatts,
} from "@/lib/formatter"

const PERCENT_Y_RANGE: ChartYRange = { max: 100 }

type MetricChartConfig = {
  title: string
  description?: string
  series: ChartSeries[]
  valueFormatter?: (value: number) => string
  yRange?: ChartYRange
  thresholds?: ChartThreshold[]
  showCurrentValues?: boolean
  mode?: "line" | "stack"
}

function chartsHaveData(charts: MetricChartConfig[]): boolean {
  return charts.some((chart) => hasSeriesData(chart.series))
}

function diskCharts(disk: DiskMetrics): MetricChartConfig[] {
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

function networkCharts(network: NetworkMetrics): MetricChartConfig[] {
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

function gpuCharts(gpu: GpuMetrics): MetricChartConfig[] {
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
): MetricChartConfig[] {
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

function zfsPoolCharts(pool: ZfsPoolMetrics): MetricChartConfig[] {
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

function hostCpuCharts(
  host: NonNullable<ServerMetricsResponse["host"]>,
  cpuCores: ServerMetricsResponse["cpuCores"]
): MetricChartConfig[] {
  return [
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
      series: (cpuCores ?? []).map((core) =>
        chartSeries(core.cpu, core.cpuCorePct)
      ),
      valueFormatter: formatPercentValue,
      yRange: PERCENT_Y_RANGE,
      thresholds: PERCENT_THRESHOLDS,
      showCurrentValues: false,
    },
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
}

function hostMemoryCharts(
  host: NonNullable<ServerMetricsResponse["host"]>
): MetricChartConfig[] {
  return [
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
}

function hostProcessCharts(
  host: NonNullable<ServerMetricsResponse["host"]>
): MetricChartConfig[] {
  return [
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
}

export type { MetricChartConfig }
export {
  chartsHaveData,
  containerCharts,
  diskCharts,
  gpuCharts,
  hostCpuCharts,
  hostMemoryCharts,
  hostProcessCharts,
  networkCharts,
  zfsPoolCharts,
}
