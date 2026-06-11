import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MetricChart } from "@/components/metrics/metric-chart"
import { getChartColor } from "@/lib/metrics/chart-colors"
import {
  buildMultiSeriesData,
  getLatestValue,
  hasSeriesData,
} from "@/lib/metrics/series"
import type { ChartSeries } from "@/lib/metrics/series"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"
import type { MetricChartMode } from "@/components/metrics/metric-chart"
import type { ChartThreshold } from "@/lib/metrics/chart-thresholds"
import type { ChartYRange } from "@/lib/metrics/uplot-theme"
import { useTheme } from "@/lib/theme"

function seriesCacheKey(timeGrid: MetricsTimeGrid, series: ChartSeries[]): string {
  return [
    timeGrid.gridTimestamps.join(","),
    timeGrid.sourceTimestamps?.join(",") ?? "",
    ...series.map((entry) => {
      const values = entry.values?.join(",") ?? ""
      return `${entry.label}|${values}`
    }),
  ].join(";")
}

type MetricChartCardProps = {
  timeGrid: MetricsTimeGrid
  title: string
  description?: string
  series: ChartSeries[]
  height?: number
  valueFormatter?: (value: number) => string
  yRange?: ChartYRange
  thresholds?: ChartThreshold[]
  showCurrentValues?: boolean
  mode?: MetricChartMode
}

function MetricChartCard({
  timeGrid,
  title,
  description,
  series,
  height,
  valueFormatter,
  yRange,
  thresholds,
  showCurrentValues,
  mode,
}: MetricChartCardProps) {
  const cacheKey = seriesCacheKey(timeGrid, series)
  const built = useMemo(
    () =>
      hasSeriesData(series)
        ? buildMultiSeriesData(
            timeGrid.gridTimestamps,
            timeGrid.sourceTimestamps,
            series
          )
        : null,
    [cacheKey, timeGrid, series]
  )
  const { resolvedTheme } = useTheme()
  const shouldShowCurrentValues = showCurrentValues ?? series.length <= 4

  if (!built) {
    return null
  }

  return (
    <Card className="gap-0 overflow-hidden py-0 dark:border-monitor-gray-300">
      <CardHeader className="gap-2 border-b border-border bg-neutral-100/90 px-4 py-3 dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0 flex flex-col gap-0.5">
            <CardTitle className="text-sm font-bold text-foreground">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="text-xs leading-snug">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {shouldShowCurrentValues ? (
            <div className="flex flex-wrap justify-end gap-x-3 gap-y-1.5">
              {series.map((entry, index) => {
                const value = getLatestValue(entry.values)
                if (value == null) {
                  return null
                }

                const formatted = valueFormatter
                  ? valueFormatter(value)
                  : String(value)

                return (
                  <span
                    key={entry.label}
                    className="inline-flex items-center gap-1.5 text-xs"
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{
                        backgroundColor: getChartColor(index, resolvedTheme),
                      }}
                    />
                    {series.length > 1 ? (
                      <span className="text-muted-foreground">{entry.label}</span>
                    ) : null}
                    <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                      {formatted}
                    </span>
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-2 pb-3">
        <MetricChart
          data={built.data}
          labels={built.labels}
          height={height}
          valueFormatter={valueFormatter}
          yRange={yRange}
          thresholds={thresholds}
          mode={mode}
        />
      </CardContent>
    </Card>
  )
}

export { MetricChartCard }
