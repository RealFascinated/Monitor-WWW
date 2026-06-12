import type { ResolvedTheme } from "@/lib/theme/context"

// Grafana-style classic palette — distinct hues for multi-series charts.
const GRAFANA_PALETTE_LIGHT = [
  "#5794F2", // blue
  "#73BF69", // green
  "#FF9830", // orange
  "#F2495C", // red
  "#B877D9", // purple
  "#FADE2A", // yellow
  "#6ED0E0", // cyan
  "#1F78C1", // dark blue
  "#BA43A9", // magenta
  "#705DA0", // violet
  "#508642", // dark green
  "#EAB839", // gold
] as const

const GRAFANA_PALETTE_DARK = [
  "#5794F2",
  "#73BF69",
  "#FF9830",
  "#F2495C",
  "#B877D9",
  "#FADE2A",
  "#6ED0E0",
  "#1F78C1",
  "#BA43A9",
  "#705DA0",
  "#56A64B",
  "#E0B400",
] as const

export function getChartColors(theme: ResolvedTheme = "light"): string[] {
  return theme === "dark"
    ? [...GRAFANA_PALETTE_DARK]
    : [...GRAFANA_PALETTE_LIGHT]
}

export function getChartColor(
  index: number,
  theme: ResolvedTheme = "light"
): string {
  const palette = getChartColors(theme)
  return palette[index % palette.length]
}
