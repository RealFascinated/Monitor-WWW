import type uPlot from "uplot"

import type { ResolvedTheme } from "@/lib/theme/context"

const TOOLTIP_OFFSET_X = 12
const TOOLTIP_OFFSET_Y = 12
const VIEWPORT_PADDING = 8

function formatCursorTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000))
}

type CreateCursorTooltipHandlerParams = {
  tooltip: HTMLDivElement
  labels: string[]
  colors: string[]
  getData: () => uPlot.AlignedData
  formatValue: (value: number) => string
  theme: ResolvedTheme
}

export function createCursorTooltipHandler({
  tooltip,
  labels,
  colors,
  getData,
  formatValue,
  theme,
}: CreateCursorTooltipHandlerParams) {
  const isDark = theme === "dark"
  tooltip.className = [
    "pointer-events-none fixed z-50 hidden max-w-xs rounded-sm border px-2.5 py-2 text-xs shadow-md",
    isDark
      ? "border-monitor-gray-300 bg-monitor-gray-100 text-white"
      : "border-neutral-200 bg-white text-black",
  ].join(" ")

  return (u: uPlot) => {
    const { idx, left, top } = u.cursor

    if (idx == null || left == null || top == null) {
      tooltip.style.display = "none"
      return
    }

    const data = getData()
    const timestamp = data[0][idx]

    const entries: { value: number; label: string; color: string }[] = []
    for (let seriesIndex = 0; seriesIndex < labels.length; seriesIndex++) {
      const value = (data[seriesIndex + 1] as (number | null)[])[idx]
      if (value == null) {
        continue
      }

      entries.push({
        value,
        label: labels[seriesIndex],
        color: colors[seriesIndex % colors.length],
      })
    }

    entries.sort((a, b) => b.value - a.value)

    const rows = entries.map(
      (entry) =>
        `<div class="flex items-center gap-2 py-0.5">` +
        `<span class="size-2 shrink-0 rounded-full" style="background:${entry.color}"></span>` +
        `<span class="truncate text-neutral-500 dark:text-neutral-400">${entry.label}</span>` +
        `<span class="ml-auto pl-3 font-medium whitespace-nowrap">${formatValue(entry.value)}</span>` +
        `</div>`
    )

    if (rows.length === 0) {
      tooltip.style.display = "none"
      return
    }

    tooltip.innerHTML =
      `<div class="mb-1 font-medium">${formatCursorTime(timestamp)}</div>` +
      rows.join("")

    const chartRect = u.root.getBoundingClientRect()
    const cursorX = chartRect.left + left
    const cursorY = chartRect.top + top

    tooltip.style.display = "block"
    tooltip.style.transform = "none"
    tooltip.style.maxHeight = ""

    tooltip.style.left = "0"
    tooltip.style.top = "0"
    const tooltipWidth = tooltip.offsetWidth
    const tooltipHeight = tooltip.offsetHeight

    let x = cursorX + TOOLTIP_OFFSET_X
    if (x + tooltipWidth > window.innerWidth - VIEWPORT_PADDING) {
      x = cursorX - tooltipWidth - TOOLTIP_OFFSET_X
    }
    x = Math.max(
      VIEWPORT_PADDING,
      Math.min(x, window.innerWidth - tooltipWidth - VIEWPORT_PADDING)
    )

    let y = cursorY + TOOLTIP_OFFSET_Y
    if (y + tooltipHeight > window.innerHeight - VIEWPORT_PADDING) {
      y = cursorY - tooltipHeight - TOOLTIP_OFFSET_Y
    }
    y = Math.max(
      VIEWPORT_PADDING,
      Math.min(y, window.innerHeight - tooltipHeight - VIEWPORT_PADDING)
    )

    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y}px`
  }
}
