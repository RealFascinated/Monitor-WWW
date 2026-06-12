import { CalendarRange } from "lucide-react"

import { SimpleTooltip } from "@/components/simple-tooltip"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select"
import type { MetricTimeRange } from "@/lib/api/user/metrics"
import {
  METRIC_RANGE_GROUPS,
  METRIC_RANGE_OPTIONS,
  METRIC_RANGE_QUICK_PICKS,
  getMetricRangeOption,
} from "@/lib/metrics/range"
import { cn } from "@/lib/utils"

type MetricRangeSelectorProps = {
  value: MetricTimeRange
  onChange: (value: MetricTimeRange) => void
  className?: string
}

function MetricRangeSelector({
  value,
  onChange,
  className,
}: MetricRangeSelectorProps) {
  const activeOption = getMetricRangeOption(value)
  const isQuickPick = METRIC_RANGE_QUICK_PICKS.includes(value)

  return (
    <div
      className={cn("flex min-w-0 flex-1 items-center gap-px", className)}
      role="group"
      aria-label="Time range"
    >
      <div className="flex min-w-0 flex-1 scrollbar-none items-center gap-px overflow-x-auto sm:flex-initial sm:overflow-visible">
        {METRIC_RANGE_QUICK_PICKS.map((range) => {
          const option = getMetricRangeOption(range)
          const isActive = value === range

          return (
            <SimpleTooltip key={range} content={option.label}>
              <button
                type="button"
                onClick={() => onChange(range)}
                aria-pressed={isActive}
                className={cn(
                  "flex h-7 shrink-0 cursor-pointer items-center justify-center rounded-sm px-2.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-white text-monitor shadow-sm dark:bg-monitor-gray-300 dark:text-warning"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-monitor-gray-300/60 dark:hover:text-white"
                )}
              >
                {option.shortLabel}
              </button>
            </SimpleTooltip>
          )
        })}
      </div>

      <Select
        value={value}
        onValueChange={(next) => onChange(next as MetricTimeRange)}
      >
        <SelectTrigger
          size="sm"
          aria-label={
            isQuickPick
              ? "More time ranges"
              : `Time range: ${activeOption.label}`
          }
          className={cn(
            "h-7 shrink-0 gap-1 rounded-sm border-0 bg-transparent px-2 shadow-none focus-visible:ring-1",
            isQuickPick
              ? "text-muted-foreground hover:bg-white/70 hover:text-foreground dark:hover:bg-monitor-gray-300/60 dark:hover:text-white"
              : "bg-white text-monitor shadow-sm dark:bg-monitor-gray-300 dark:text-warning"
          )}
        >
          {isQuickPick ? (
            <CalendarRange className="size-3.5" />
          ) : (
            <span className="font-medium">{activeOption.shortLabel}</span>
          )}
        </SelectTrigger>
        <SelectContent align="end" position="popper" className="min-w-44">
          {METRIC_RANGE_GROUPS.map((group) => {
            const options = METRIC_RANGE_OPTIONS.filter(
              (option) => option.group === group.id
            )

            return (
              <SelectGroup key={group.id}>
                <SelectLabel>{group.label}</SelectLabel>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}

export { MetricRangeSelector }
