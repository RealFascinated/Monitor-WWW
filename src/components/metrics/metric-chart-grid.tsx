import { MetricChartCard } from "@/components/metrics/metric-chart-card"
import type { MetricChartConfig } from "@/lib/metrics/chart-config"
import { hasSeriesData } from "@/lib/metrics/series"
import type { MetricsTimeGrid } from "@/lib/metrics/timestamps"

type MetricChartGridProps = {
  timeGrid: MetricsTimeGrid
  charts: MetricChartConfig[]
}

function MetricChartGrid({ timeGrid, charts }: MetricChartGridProps) {
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

export { MetricChartGrid }
