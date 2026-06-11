import type uPlot from "uplot"

import type { ResolvedTheme } from "@/lib/theme/context"

const TOOLTIP_OFFSET_X = 12
const TOOLTIP_PADDING = 8
const VIEWPORT_PADDING = 8
const HIDDEN_CURSOR_POS = -10

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
  formatValue: (value: number, seriesIndex: number) => string
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
    "pointer-events-none fixed z-50 max-w-xs rounded-sm border px-2.5 py-2 text-xs shadow-md",
    isDark
      ? "border-monitor-gray-300 bg-monitor-gray-100 text-white"
      : "border-neutral-200 bg-white text-black",
  ].join(" ")

  return (u: uPlot) => {
    const { idx, left } = u.cursor

    if (idx == null || left == null) {
      tooltip.style.display = "none"
      return
    }

    const data = getData()
    const timestamp = data[0][idx]

    const entries: {
      value: number
      label: string
      color: string
      seriesIndex: number
    }[] = []
    for (let seriesIndex = 0; seriesIndex < labels.length; seriesIndex++) {
      const value = (data[seriesIndex + 1] as (number | null)[])[idx]
      if (value == null) {
        continue
      }

      entries.push({
        value,
        label: labels[seriesIndex],
        color: colors[seriesIndex % colors.length],
        seriesIndex,
      })
    }

    entries.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))

    const rows = entries.map(
      (entry) =>
        `<div class="flex items-center gap-2 py-0.5">` +
        `<span class="size-2 shrink-0 rounded-full" style="background:${entry.color}"></span>` +
        `<span class="truncate text-neutral-500 dark:text-neutral-400">${entry.label}</span>` +
        `<span class="ml-auto pl-3 font-medium whitespace-nowrap">${formatValue(entry.value, entry.seriesIndex)}</span>` +
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
    const plotLeft = chartRect.left + u.bbox.left
    const plotTop = chartRect.top + u.bbox.top
    const plotRight = plotLeft + u.bbox.width
    const cursorX = chartRect.left + left

    tooltip.style.display = "block"
    tooltip.style.transform = "none"
    tooltip.style.maxHeight = ""

    tooltip.style.left = "0"
    tooltip.style.top = "0"
    const tooltipWidth = tooltip.offsetWidth
    const tooltipHeight = tooltip.offsetHeight

    let x = cursorX + TOOLTIP_OFFSET_X
    if (x + tooltipWidth > plotRight - TOOLTIP_PADDING) {
      x = cursorX - tooltipWidth - TOOLTIP_OFFSET_X
    }
    x = Math.max(
      plotLeft + TOOLTIP_PADDING,
      Math.min(x, plotRight - tooltipWidth - TOOLTIP_PADDING)
    )

    // Grafana-style: track crosshair on X, anchor to top of plot on Y.
    let y = plotTop + TOOLTIP_PADDING
    y = Math.max(
      VIEWPORT_PADDING,
      Math.min(y, window.innerHeight - tooltipHeight - VIEWPORT_PADDING)
    )

    tooltip.style.left = `${x}px`
    tooltip.style.top = `${y}px`
  }
}

export function createChartTooltipElement(theme: ResolvedTheme): HTMLDivElement {
  const tooltip = document.createElement("div")
  const isDark = theme === "dark"
  tooltip.className = [
    "pointer-events-none fixed z-50 max-w-xs rounded-sm border px-2.5 py-2 text-xs shadow-md",
    isDark
      ? "border-monitor-gray-300 bg-monitor-gray-100 text-white"
      : "border-neutral-200 bg-white text-black",
  ].join(" ")
  tooltip.style.display = "none"
  document.body.appendChild(tooltip)
  return tooltip
}

export function destroyChartTooltipElement(tooltip: HTMLDivElement) {
  tooltip.style.display = "none"
  tooltip.remove()
}

export function dismissChartInteraction(
  chart: uPlot,
  tooltip: HTMLDivElement
) {
  tooltip.style.display = "none"
  chart.setCursor(
    { left: HIDDEN_CURSOR_POS, top: HIDDEN_CURSOR_POS },
    true
  )
  chart.setSelect({ left: 0, top: 0, width: 0, height: 0 }, false)
}

function collectScrollTargets(element: HTMLElement): EventTarget[] {
  const targets = new Set<EventTarget>([window, document])

  let node: HTMLElement | null = element.parentElement
  while (node) {
    const style = getComputedStyle(node)
    if (
      /(auto|scroll|overlay)/.test(
        `${style.overflow} ${style.overflowX} ${style.overflowY}`
      )
    ) {
      targets.add(node)
    }
    node = node.parentElement
  }

  return [...targets]
}

export function bindChartInteractionDismiss(
  chart: uPlot,
  tooltip: HTMLDivElement
): () => void {
  const dismiss = () => dismissChartInteraction(chart, tooltip)
  const scrollOptions: AddEventListenerOptions = {
    passive: true,
    capture: true,
  }
  const wheelOptions: AddEventListenerOptions = { passive: true }
  const scrollTargets = collectScrollTargets(chart.root)

  chart.over.addEventListener("wheel", dismiss, wheelOptions)

  for (const target of scrollTargets) {
    target.addEventListener("scroll", dismiss, scrollOptions)
  }

  return () => {
    chart.over.removeEventListener("wheel", dismiss, wheelOptions)
    for (const target of scrollTargets) {
      target.removeEventListener("scroll", dismiss, scrollOptions)
    }
  }
}
