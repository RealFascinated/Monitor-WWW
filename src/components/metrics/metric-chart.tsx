import { useEffect, useLayoutEffect, useMemo, useRef } from "react"
import uPlot from "uplot"
import "uplot/dist/uPlot.min.css"

import {
  bindChartInteractionDismiss,
  createChartTooltipElement,
  createCursorTooltipHandler,
  destroyChartTooltipElement,
} from "@/lib/metrics/chart-tooltip"
import { createThresholdDrawHook } from "@/lib/metrics/chart-thresholds"
import type { ChartThreshold } from "@/lib/metrics/chart-thresholds"
import { stackAlignedData } from "@/lib/metrics/series"
import { buildUPlotOptions, getChartColors } from "@/lib/metrics/uplot-theme"
import type { ChartYRange } from "@/lib/metrics/uplot-theme"
import { useTheme } from "@/lib/theme"

export type MetricChartMode = "line" | "stack"

type MetricChartProps = {
  data: uPlot.AlignedData
  labels: string[]
  negated?: boolean[]
  height?: number
  valueFormatter?: (value: number) => string
  yRange?: ChartYRange
  thresholds?: ChartThreshold[]
  mode?: MetricChartMode
}

function destroyChart(chart: uPlot) {
  try {
    chart.destroy()
  } catch {
    // Chart DOM may already be detached during React unmount.
  }
}

function MetricChart({
  data,
  labels,
  negated = [],
  height = 200,
  valueFormatter,
  yRange,
  thresholds,
  mode = "line",
}: MetricChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<uPlot | null>(null)
  const valueFormatterRef = useRef(valueFormatter)
  const dataRef = useRef(data)
  const { resolvedTheme } = useTheme()
  const yMax = yRange?.max ?? null
  const labelsKey = labels.join("\0")
  const negatedKey = negated.map(String).join("\0")
  const thresholdsKey =
    thresholds?.map((entry) => `${entry.level}:${entry.value}`).join("|") ?? ""
  const stacked = mode === "stack"
  const bidirectional = negated.some(Boolean)

  const prepared = useMemo(() => {
    if (!stacked) {
      return { data, bands: undefined }
    }

    const result = stackAlignedData(data)
    return { data: result.data, bands: result.bands }
  }, [data, stacked])

  valueFormatterRef.current = valueFormatter
  dataRef.current = data

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let disposed = false
    let chart: uPlot | null = null
    let resizeObserver: ResizeObserver | null = null
    let unbindInteractionDismiss: (() => void) | null = null
    let tooltip: HTMLDivElement | null = null

    const frame = requestAnimationFrame(() => {
      if (disposed) {
        return
      }

      tooltip = createChartTooltipElement(resolvedTheme)

      const options = buildUPlotOptions({
        theme: resolvedTheme,
        labels,
        height,
        valueFormatter: (value) =>
          valueFormatterRef.current?.(value) ?? String(value),
        yRange,
        stacked,
        bands: prepared.bands,
        bidirectional,
        negated,
      })

      const colors = getChartColors(resolvedTheme)
      const formatValue = (value: number, seriesIndex: number) => {
        const display = negated[seriesIndex] ? Math.abs(value) : value
        return valueFormatterRef.current?.(display) ?? String(display)
      }
      const hooks: uPlot.Hooks.Arrays = {
        setCursor: [
          createCursorTooltipHandler({
            tooltip,
            labels,
            colors,
            getData: () => dataRef.current,
            formatValue,
            theme: resolvedTheme,
          }),
        ],
      }

      if (thresholds && thresholds.length > 0) {
        hooks.drawAxes = [createThresholdDrawHook(thresholds, resolvedTheme)]
      }

      options.hooks = hooks

      chart = new uPlot(
        { ...options, width: Math.max(container.clientWidth, 1) },
        prepared.data,
        container
      )
      chartRef.current = chart

      resizeObserver = new ResizeObserver(() => {
        const width = container.clientWidth
        if (width > 0) {
          chart?.setSize({ width, height })
        }
      })
      resizeObserver.observe(container)
      unbindInteractionDismiss = bindChartInteractionDismiss(chart, tooltip)
    })

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      unbindInteractionDismiss?.()
      resizeObserver?.disconnect()
      if (tooltip) {
        destroyChartTooltipElement(tooltip)
      }
      if (chart) {
        destroyChart(chart)
      }
      chartRef.current = null
    }
  }, [
    resolvedTheme,
    labelsKey,
    height,
    yMax,
    thresholdsKey,
    stacked,
    bidirectional,
    negatedKey,
    prepared.bands,
    thresholds,
  ])

  useLayoutEffect(() => {
    chartRef.current?.setData(prepared.data)
  }, [prepared.data])

  return (
    <div className="relative w-full overflow-visible">
      <div ref={containerRef} className="w-full overflow-visible" />
    </div>
  )
}

export { MetricChart }
