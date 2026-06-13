import type {
  AdminMetricsResponse,
  FleetMetrics,
  FleetOsMetrics,
  FleetVersionMetrics,
  HttpMetrics,
  HttpMetricsEntry,
  IngestMetrics,
  JvmMetrics,
  OverviewMetrics,
  VmMetrics,
} from "@/lib/api/admin/metrics"
import type { MetricValues } from "@/lib/api/user/metrics"
import {
  formatCount,
  formatDurationSeconds,
  formatMemoryBytes,
  formatMilliseconds,
  formatPerMinute,
  formatPercentValue,
} from "@/lib/formatter"
import {
  counterRatePerMinute,
  histogramIntervalAverage,
  resolveMetricStep,
} from "@/lib/metrics/platform/transforms"
import type { MetricChartConfig } from "@/lib/metrics/sections/server/charts"
import { chartsHaveData } from "@/lib/metrics/sections/server/charts"
import {
  chartSeries,
  getLatestValue,
  hasAnyValues,
  hasValues,
} from "@/lib/metrics/series"

export type PlatformChartContext = {
  stepSeconds: number
  timestamps: number[] | null
}

export function createPlatformChartContext(
  metrics: AdminMetricsResponse
): PlatformChartContext {
  return {
    stepSeconds: resolveMetricStep(metrics.step, metrics.timestamps),
    timestamps: metrics.timestamps,
  }
}

function counterPerMinute(
  values: MetricValues,
  context: PlatformChartContext
): MetricValues {
  return counterRatePerMinute(values, context.timestamps, context.stepSeconds)
}

function isFleetOsMetrics(value: unknown): value is FleetOsMetrics {
  return (
    typeof value === "object" &&
    value != null &&
    "os" in value &&
    "serversByOs" in value
  )
}

function isFleetVersionMetrics(value: unknown): value is FleetVersionMetrics {
  return (
    typeof value === "object" &&
    value != null &&
    "version" in value &&
    "serversByAgentVersion" in value
  )
}

function parseFleetOsEntries(
  fleet: FleetMetrics | null | undefined
): FleetOsMetrics[] {
  if (!fleet) {
    return []
  }

  const entries: FleetOsMetrics[] = []

  for (const value of Object.values(fleet)) {
    if (isFleetOsMetrics(value) && hasValues(value.serversByOs)) {
      entries.push(value)
    }
  }

  return entries.sort((left, right) => left.os.localeCompare(right.os))
}

function parseFleetVersionEntries(
  fleet: FleetMetrics | null | undefined
): FleetVersionMetrics[] {
  if (!fleet) {
    return []
  }

  const entries: FleetVersionMetrics[] = []

  for (const value of Object.values(fleet)) {
    if (
      isFleetVersionMetrics(value) &&
      hasValues(value.serversByAgentVersion)
    ) {
      entries.push(value)
    }
  }

  return entries.sort((left, right) =>
    left.version.localeCompare(right.version)
  )
}

function parseHttpEntries(
  http: HttpMetrics | null | undefined,
  context: PlatformChartContext
): HttpMetricsEntry[] {
  if (!http) {
    return []
  }

  return Object.values(http)
    .filter((entry) => hasValues(entry.httpRequestsTotal))
    .sort((left, right) => {
      const leftRate =
        getLatestValue(counterPerMinute(left.httpRequestsTotal, context)) ?? 0
      const rightRate =
        getLatestValue(counterPerMinute(right.httpRequestsTotal, context)) ?? 0
      return rightRate - leftRate
    })
}

function overviewHasData(
  overview: OverviewMetrics | null | undefined
): boolean {
  if (!overview) {
    return false
  }

  return hasAnyValues(
    overview.activeSessions,
    overview.databaseSizeBytes,
    overview.users,
    overview.usersNew24h,
    overview.websocketConnections
  )
}

function fleetHasData(fleet: FleetMetrics | null | undefined): boolean {
  if (!fleet) {
    return false
  }

  return (
    hasAnyValues(
      fleet.serversNew24h,
      fleet.serversOffline,
      fleet.serversOnline,
      fleet.serversPending,
      fleet.serversTotal
    ) ||
    parseFleetOsEntries(fleet).length > 0 ||
    parseFleetVersionEntries(fleet).length > 0
  )
}

function ingestHasData(ingest: IngestMetrics | null | undefined): boolean {
  if (!ingest) {
    return false
  }

  return hasAnyValues(
    ingest.ingestsTotal,
    ingest.ingestAuthFailuresTotal,
    ingest.ingestDurationSecondsCount,
    ingest.ingestDurationSecondsSum,
    ingest.ingestPayloadBytesCount,
    ingest.ingestPayloadBytesSum
  )
}

function jvmHasData(jvm: JvmMetrics | null | undefined): boolean {
  if (!jvm) {
    return false
  }

  return hasAnyValues(
    jvm.jvmHeapMaxBytes,
    jvm.jvmHeapUsedBytes,
    jvm.jvmNonheapUsedBytes,
    jvm.jvmProcessCpuLoad,
    jvm.jvmProcessRssBytes,
    jvm.jvmThreadCount,
    jvm.jvmUptimeSeconds
  )
}

function vmHasData(vm: VmMetrics | null | undefined): boolean {
  if (!vm) {
    return false
  }

  return hasAnyValues(
    vm.vmQueriesTotal,
    vm.vmQueryDurationSecondsCount,
    vm.vmQueryDurationSecondsSum,
    vm.vmQueryErrorsTotal,
    vm.vmWriteDurationSecondsCount,
    vm.vmWriteDurationSecondsSum,
    vm.vmWriteErrorsTotal,
    vm.vmWritesTotal
  )
}

function httpHasData(http: HttpMetrics | null | undefined): boolean {
  if (!http) {
    return false
  }

  return Object.values(http).some((entry) => hasValues(entry.httpRequestsTotal))
}

function overviewCharts(overview: OverviewMetrics): MetricChartConfig[] {
  return [
    {
      title: "Users",
      description:
        "Total registered users and users created in the last 24 hours.",
      series: [
        chartSeries("Users", overview.users),
        chartSeries("New (24h)", overview.usersNew24h),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Sessions and connections",
      description: "Active user sessions and open WebSocket connections.",
      series: [
        chartSeries("Sessions", overview.activeSessions),
        chartSeries("WebSockets", overview.websocketConnections),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "Database size",
      description: "Total database storage used by Monitor.",
      series: [chartSeries("Size", overview.databaseSizeBytes)],
      valueFormatter: formatMemoryBytes,
    },
  ]
}

function fleetCharts(fleet: FleetMetrics): MetricChartConfig[] {
  return [
    {
      title: "Server status",
      description:
        "Current online, offline, pending, and total registered servers.",
      series: [
        chartSeries("Online", fleet.serversOnline),
        chartSeries("Offline", fleet.serversOffline),
        chartSeries("Pending", fleet.serversPending),
        chartSeries("Total", fleet.serversTotal),
      ],
      valueFormatter: formatCount,
    },
    {
      title: "New servers (24h)",
      description: "Servers registered in the last 24 hours.",
      series: [chartSeries("New (24h)", fleet.serversNew24h)],
      valueFormatter: formatCount,
    },
  ]
}

function fleetOsCharts(entries: FleetOsMetrics[]): MetricChartConfig[] {
  return [
    {
      title: "Servers by OS",
      description: "Registered servers grouped by operating system.",
      series: entries.map((entry) => chartSeries(entry.os, entry.serversByOs)),
      valueFormatter: formatCount,
      showCurrentValues: false,
    },
  ]
}

function fleetVersionCharts(
  entries: FleetVersionMetrics[]
): MetricChartConfig[] {
  return [
    {
      title: "Servers by agent version",
      description: "Registered servers grouped by Monitor Agent version.",
      series: entries.map((entry) =>
        chartSeries(entry.version, entry.serversByAgentVersion)
      ),
      valueFormatter: formatCount,
      showCurrentValues: false,
    },
  ]
}

function ingestCharts(
  ingest: IngestMetrics,
  context: PlatformChartContext
): MetricChartConfig[] {
  const avgDuration = histogramIntervalAverage(
    ingest.ingestDurationSecondsSum,
    ingest.ingestDurationSecondsCount
  )
  const avgPayload = histogramIntervalAverage(
    ingest.ingestPayloadBytesSum,
    ingest.ingestPayloadBytesCount
  )

  return [
    {
      title: "Ingests per minute",
      description: "Metric ingest requests received per minute (counter rate).",
      series: [
        chartSeries("Ingests", counterPerMinute(ingest.ingestsTotal, context)),
      ],
      valueFormatter: formatPerMinute,
    },
    {
      title: "Auth failures per minute",
      description:
        "Ingest requests rejected due to invalid authentication, per minute.",
      series: [
        chartSeries(
          "Failures",
          counterPerMinute(ingest.ingestAuthFailuresTotal, context)
        ),
      ],
      valueFormatter: formatPerMinute,
    },
    {
      title: "Ingest duration",
      description: "Mean time to process an ingest request per interval.",
      series: [chartSeries("Duration", avgDuration)],
      valueFormatter: (value) => formatMilliseconds(value * 1000),
    },
    {
      title: "Ingest payload size",
      description: "Mean ingest payload size per interval.",
      series: [chartSeries("Payload", avgPayload)],
      valueFormatter: formatMemoryBytes,
    },
  ]
}

function jvmCharts(jvm: JvmMetrics): MetricChartConfig[] {
  const charts: MetricChartConfig[] = [
    {
      title: "Heap memory",
      description: "JVM heap used, max, and non-heap memory.",
      series: [
        chartSeries("Used", jvm.jvmHeapUsedBytes),
        chartSeries("Max", jvm.jvmHeapMaxBytes),
        chartSeries("Non-heap", jvm.jvmNonheapUsedBytes),
      ],
      valueFormatter: formatMemoryBytes,
    },
    {
      title: "CPU load",
      description: "JVM process CPU utilization (0–100%).",
      series: [chartSeries("CPU", jvm.jvmProcessCpuLoad)],
      valueFormatter: (value) => formatPercentValue(value * 100),
    },
    {
      title: "Threads",
      description: "Live JVM thread count.",
      series: [chartSeries("Threads", jvm.jvmThreadCount)],
      valueFormatter: formatCount,
    },
    {
      title: "Uptime",
      description: "Time since the Monitor backend JVM started.",
      series: [chartSeries("Uptime", jvm.jvmUptimeSeconds)],
      valueFormatter: formatDurationSeconds,
    },
  ]

  if (hasValues(jvm.jvmProcessRssBytes)) {
    charts.splice(1, 0, {
      title: "Process RSS",
      description: "Resident set size of the Monitor backend process.",
      series: [chartSeries("RSS", jvm.jvmProcessRssBytes)],
      valueFormatter: formatMemoryBytes,
    })
  }

  return charts
}

function vmCharts(
  vm: VmMetrics,
  context: PlatformChartContext
): MetricChartConfig[] {
  const avgQueryDuration = histogramIntervalAverage(
    vm.vmQueryDurationSecondsSum,
    vm.vmQueryDurationSecondsCount
  )
  const avgWriteDuration = histogramIntervalAverage(
    vm.vmWriteDurationSecondsSum,
    vm.vmWriteDurationSecondsCount
  )

  return [
    {
      title: "Queries and writes per minute",
      description: "VictoriaMetrics query and write operations per minute.",
      series: [
        chartSeries("Queries", counterPerMinute(vm.vmQueriesTotal, context)),
        chartSeries("Writes", counterPerMinute(vm.vmWritesTotal, context)),
      ],
      valueFormatter: formatPerMinute,
    },
    {
      title: "Errors per minute",
      description: "VictoriaMetrics query and write errors per minute.",
      series: [
        chartSeries(
          "Query errors",
          counterPerMinute(vm.vmQueryErrorsTotal, context)
        ),
        chartSeries(
          "Write errors",
          counterPerMinute(vm.vmWriteErrorsTotal, context)
        ),
      ],
      valueFormatter: formatPerMinute,
    },
    {
      title: "Query duration",
      description: "Mean VictoriaMetrics query latency per interval.",
      series: [chartSeries("Duration", avgQueryDuration)],
      valueFormatter: (value) => formatMilliseconds(value * 1000),
    },
    {
      title: "Write duration",
      description: "Mean VictoriaMetrics write latency per interval.",
      series: [chartSeries("Duration", avgWriteDuration)],
      valueFormatter: (value) => formatMilliseconds(value * 1000),
    },
  ]
}

function httpCharts(
  entries: HttpMetricsEntry[],
  context: PlatformChartContext
): MetricChartConfig[] {
  return [
    {
      title: "Requests per minute",
      description:
        "HTTP request rate by method, path, and status (counter rate).",
      series: entries.map((entry) =>
        chartSeries(
          `${entry.method} ${entry.path} (${entry.status})`,
          counterPerMinute(entry.httpRequestsTotal, context)
        )
      ),
      valueFormatter: formatPerMinute,
      showCurrentValues: false,
    },
  ]
}

export type { MetricChartConfig }
export {
  chartsHaveData,
  fleetCharts,
  fleetHasData,
  fleetOsCharts,
  fleetVersionCharts,
  httpCharts,
  httpHasData,
  ingestCharts,
  ingestHasData,
  jvmCharts,
  jvmHasData,
  overviewCharts,
  overviewHasData,
  parseFleetOsEntries,
  parseFleetVersionEntries,
  parseHttpEntries,
  vmCharts,
  vmHasData,
}
