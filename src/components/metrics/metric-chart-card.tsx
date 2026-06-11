import { useMemo } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MetricChart } from "@/components/metrics/metric-chart"
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
  const shouldShowCurrentValues = showCurrentValues ?? series.length <= 4

  if (!built) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          {shouldShowCurrentValues ? (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {series.map((entry) => {
                const value = getLatestValue(entry.values)
                if (value == null) {
                  return null
                }

                return (
                  <span key={entry.label} className="text-neutral-500">
                    {series.length > 1 ? (
                      <span>{entry.label}: </span>
                    ) : null}
                    <span className="font-medium text-black dark:text-white">
                      {valueFormatter ? valueFormatter(value) : value}
                    </span>
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="pt-2">
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
