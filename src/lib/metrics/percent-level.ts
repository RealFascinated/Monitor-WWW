import type { ChartThresholdLevel } from "@/lib/metrics/chart-thresholds"
import { PERCENT_THRESHOLDS } from "@/lib/metrics/chart-thresholds"
import { cn } from "@/lib/utils"

export type PercentLevel = ChartThresholdLevel | "normal" | "unknown"

export function getPercentLevel(value: number): PercentLevel {
  let level: PercentLevel = "normal"

  for (const threshold of PERCENT_THRESHOLDS) {
    if (value >= threshold.value) {
      level = threshold.level
    }
  }

  return level
}

const percentLevelColorClasses: Record<PercentLevel, string> = {
  unknown: "text-neutral-500",
  normal: "text-green-700 dark:text-green-400",
  warning: "text-yellow-700 dark:text-warning",
  critical: "text-red-700 dark:text-error",
}

export function percentLevelColorClass(
  value: number | null,
  className?: string
): string {
  const level = value == null ? "unknown" : getPercentLevel(value)
  return cn(percentLevelColorClasses[level], className)
}
