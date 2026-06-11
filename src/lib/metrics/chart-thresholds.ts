import type { ResolvedTheme } from "@/lib/theme/context"
import type uPlot from "uplot"

export type ChartThresholdLevel = "warning" | "critical"

export type ChartThreshold = {
  value: number
  level: ChartThresholdLevel
}

const THRESHOLD_COLORS: Record<
  ResolvedTheme,
  Record<ChartThresholdLevel, string>
> = {
  light: {
    warning: "#CA8A04",
    critical: "#DC2626",
  },
  dark: {
    warning: "#FADE2A",
    critical: "#F2495C",
  },
}

export const PERCENT_THRESHOLDS: ChartThreshold[] = [
  { value: 80, level: "warning" },
  { value: 95, level: "critical" },
]

export const TEMPERATURE_THRESHOLDS: ChartThreshold[] = [
  { value: 70, level: "warning" },
  { value: 85, level: "critical" },
]

function thresholdLabel(
  threshold: ChartThreshold,
  formatValue?: (value: number) => string
): string {
  if (formatValue) {
    return formatValue(threshold.value)
  }

  return String(threshold.value)
}

export function createThresholdDrawHook(
  thresholds: ChartThreshold[],
  theme: ResolvedTheme,
  formatValue?: (value: number) => string
): (u: uPlot) => void {
  return (u) => {
    if (thresholds.length === 0) {
      return
    }

    const { ctx, bbox } = u
    const xLeft = bbox.left
    const xRight = bbox.left + bbox.width
    const yTop = bbox.top
    const yBottom = bbox.top + bbox.height

    ctx.save()
    ctx.font =
      '11px "Inter Variable", Inter, ui-sans-serif, system-ui, sans-serif'
    ctx.textBaseline = "bottom"

    for (const threshold of thresholds) {
      const yPos = u.valToPos(threshold.value, "y", true)
      if (yPos < yTop || yPos > yBottom) {
        continue
      }

      const color = THRESHOLD_COLORS[theme][threshold.level]

      ctx.beginPath()
      ctx.setLineDash([5, 4])
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.moveTo(xLeft, yPos)
      ctx.lineTo(xRight, yPos)
      ctx.stroke()
      ctx.setLineDash([])

      const label = thresholdLabel(threshold, formatValue)
      ctx.fillStyle = color
      ctx.textAlign = "right"
      ctx.fillText(label, xRight - 2, yPos - 3)
    }

    ctx.restore()
  }
}
