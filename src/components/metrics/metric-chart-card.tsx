import { memo, useMemo } from "react"

import { SimpleTooltip } from "@/components/simple-tooltip"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MetricChart } from "@/components/metrics/metric-chart"
import { useChartHydration } from "@/hooks/use-chart-hydration"
import { formatChartTimestamp } from "@/lib/formatter"
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
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme"

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
  const chartHeight = height ?? 200
  const isHydrated = useChartHydration()
  const built = useMemo(() => {
    if (!isHydrated || !hasSeriesData(series)) {
      return null
    }

    return buildMultiSeriesData(
      timeGrid.gridTimestamps,
      timeGrid.sourceTimestamps,
      series
    )
  }, [isHydrated, timeGrid, series])
  const { resolvedTheme } = useTheme()
  const shouldShowCurrentValues = showCurrentValues ?? series.length <= 4
  const latestTimestamp = timeGrid.gridTimestamps.at(-1)
  const latestTimestampLabel = latestTimestamp
    ? formatChartTimestamp(latestTimestamp)
    : null

  if (!hasSeriesData(series)) {
    return null
  }

  const titleNode = (
    <CardTitle
      className={cn(
        "text-sm font-bold text-foreground",
        description && "cursor-help"
      )}
    >
      {title}
    </CardTitle>
  )

  return (
    <Card className="gap-0 overflow-hidden py-0 dark:border-monitor-gray-300">
      <CardHeader className="gap-2 border-b border-border bg-neutral-100/90 px-4 py-3 dark:border-monitor-gray-300 dark:bg-monitor-gray-200/60">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {description ? (
              <SimpleTooltip content={description}>{titleNode}</SimpleTooltip>
            ) : (
              titleNode
            )}
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

                const valueTooltip = latestTimestampLabel
                  ? `Latest value as of ${latestTimestampLabel}`
                  : "Latest value"

                return (
                  <SimpleTooltip
                    key={entry.label}
                    content={valueTooltip}
                  >
                    <span className="inline-flex cursor-help items-center gap-1.5 text-xs">
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: getChartColor(index, resolvedTheme),
                        }}
                      />
                      {series.length > 1 ? (
                        <span className="text-muted-foreground">
                          {entry.label}
                        </span>
                      ) : null}
                      <span className="font-mono text-sm font-medium tabular-nums text-foreground">
                        {formatted}
                      </span>
                    </span>
                  </SimpleTooltip>
                )
              })}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="px-3 pt-2 pb-3">
        <div className="w-full" style={{ minHeight: chartHeight }}>
          {built ? (
            <MetricChart
              data={built.data}
              labels={built.labels}
              negated={built.negated}
              height={chartHeight}
              valueFormatter={valueFormatter}
              yRange={yRange}
              thresholds={thresholds}
              mode={mode}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

const MemoizedMetricChartCard = memo(MetricChartCard)

export { MemoizedMetricChartCard as MetricChartCard }
