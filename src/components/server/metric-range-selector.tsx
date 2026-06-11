import { CalendarRange } from "lucide-react"

import { SimpleTooltip } from "@/components/simple-tooltip"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
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
}

function MetricRangeSelector({ value, onChange }: MetricRangeSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="inline-flex max-w-full items-center overflow-x-auto rounded-sm border border-neutral-200 bg-white p-0.5 dark:border-monitor-gray-300 dark:bg-monitor-gray-100"
        role="group"
        aria-label="Quick time ranges"
      >
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
                  "cursor-help rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-monitor text-white dark:bg-monitor-100"
                    : "text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-monitor-gray-200 dark:hover:text-white"
                )}
              >
                {option.shortLabel}
              </button>
            </SimpleTooltip>
          )
        })}
      </div>

      <Select value={value} onValueChange={(next) => onChange(next as MetricTimeRange)}>
        <SelectTrigger
          size="sm"
          className="min-w-[9.5rem] border-neutral-200 bg-white dark:border-monitor-gray-300 dark:bg-monitor-gray-100"
          aria-label="Time range"
        >
          <CalendarRange className="size-3.5 text-muted-foreground" />
          <SelectValue placeholder="Time range" />
        </SelectTrigger>
        <SelectContent align="end" className="min-w-[11rem]">
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
