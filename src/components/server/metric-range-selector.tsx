import { useEffect, useState } from "react"
import { Check, ChevronDown, Clock, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "@/components/ui/select"
import { SimpleTooltip } from "@/components/simple-tooltip"
import type { MetricTimeRange } from "@/lib/api/user/metrics"
import type { MetricRefreshInterval } from "@/lib/metrics/refresh-interval"
import {
  METRIC_REFRESH_INTERVAL_OPTIONS,
  getMetricRefreshIntervalOption,
} from "@/lib/metrics/refresh-interval"
import { METRIC_RANGE_GROUPS, METRIC_RANGE_OPTIONS } from "@/lib/metrics/range"
import {
  datetimeLocalToEpoch,
  defaultCustomMetricTimeWindow,
  epochToDatetimeLocal,
  formatMetricTimeWindow,
} from "@/lib/metrics/time-window"
import type { MetricTimeWindow } from "@/lib/metrics/time-window"
import { cn } from "@/lib/utils"

type MetricRangeSelectorProps = {
  value: MetricTimeWindow
  onChange: (value: MetricTimeWindow) => void
  refreshInterval: MetricRefreshInterval
  onRefreshIntervalChange: (value: MetricRefreshInterval) => void
  onRefresh: () => void
  isRefreshing?: boolean
  className?: string
}

function MetricRangeSelector({
  value,
  onChange,
  refreshInterval,
  onRefreshIntervalChange,
  onRefresh,
  isRefreshing = false,
  className,
}: MetricRangeSelectorProps) {
  const [open, setOpen] = useState(false)
  const activeRefreshInterval = getMetricRefreshIntervalOption(refreshInterval)
  const activeLabel = formatMetricTimeWindow(value)

  const initialCustomWindow =
    value.kind === "custom" ? value : defaultCustomMetricTimeWindow()
  const [fromValue, setFromValue] = useState(
    epochToDatetimeLocal(initialCustomWindow.from)
  )
  const [toValue, setToValue] = useState(
    epochToDatetimeLocal(initialCustomWindow.to)
  )
  const [customError, setCustomError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const nextWindow =
      value.kind === "custom" ? value : defaultCustomMetricTimeWindow()
    setFromValue(epochToDatetimeLocal(nextWindow.from))
    setToValue(epochToDatetimeLocal(nextWindow.to))
    setCustomError(null)
  }, [open, value])

  function applyPreset(range: MetricTimeRange) {
    onChange({ kind: "preset", range })
    setOpen(false)
  }

  function applyCustomRange() {
    const from = datetimeLocalToEpoch(fromValue)
    const to = datetimeLocalToEpoch(toValue)
    const now = Math.floor(Date.now() / 1000)

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      setCustomError("Enter valid start and end times.")
      return
    }

    if (from >= to) {
      setCustomError("Start must be before end.")
      return
    }

    if (to > now) {
      setCustomError("End time cannot be in the future.")
      return
    }

    onChange({ kind: "custom", from, to })
    setOpen(false)
  }

  return (
    <div
      className={cn("flex min-w-0 flex-1 items-center gap-px", className)}
      role="group"
      aria-label="Time range"
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={`Time range: ${activeLabel.label}`}
            className="flex h-7 max-w-56 min-w-0 shrink cursor-pointer items-center gap-1.5 rounded-sm bg-white px-2.5 text-xs font-medium text-monitor shadow-sm transition-colors hover:bg-white/90 dark:bg-monitor-gray-300 dark:text-warning dark:hover:bg-monitor-gray-300/90"
          >
            <Clock className="size-3.5 shrink-0" />
            <span className="truncate">{activeLabel.shortLabel}</span>
            <ChevronDown className="size-3.5 shrink-0 opacity-60" />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          className="w-[min(100vw-2rem,36rem)] animate-none bg-popover p-0 backdrop-blur-none"
        >
          <div className="relative">
            <section className="border-b border-border/60 p-2 sm:w-54 sm:border-r sm:border-b-0">
              <p className="py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Quick ranges
              </p>

              <div role="listbox" aria-label="Quick ranges" className="mt-2.5">
                {METRIC_RANGE_GROUPS.map((group) => {
                  const options = METRIC_RANGE_OPTIONS.filter(
                    (option) => option.group === group.id
                  )

                  if (options.length === 0) {
                    return null
                  }

                  return (
                    <div
                      key={group.id}
                      className="[&:not(:first-child)]:mt-2.5 [&:not(:first-child)]:border-t [&:not(:first-child)]:border-border/50 [&:not(:first-child)]:pt-2"
                    >
                      <p className="pb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {group.label}
                      </p>

                      <div className="flex flex-col gap-px">
                        {options.map((option) => {
                          const isActive =
                            value.kind === "preset" &&
                            value.range === option.value

                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              onClick={() => applyPreset(option.value)}
                              className={cn(
                                "flex w-full cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-xs transition-colors",
                                isActive
                                  ? "bg-foreground/10 font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                              )}
                            >
                              <span className="min-w-0 truncate">
                                {option.label}
                              </span>
                              <Check
                                aria-hidden={!isActive}
                                className={cn(
                                  "size-3.5 shrink-0 text-foreground/70",
                                  isActive ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="p-3 sm:absolute sm:top-0 sm:right-0 sm:left-54 sm:border-l sm:border-border/60">
              <p className="mb-2.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                Custom range
              </p>

              <div className="grid gap-2.5">
                <div className="grid gap-1">
                  <Label htmlFor="metric-range-from" className="text-xs">
                    From
                  </Label>
                  <Input
                    id="metric-range-from"
                    type="datetime-local"
                    value={fromValue}
                    onChange={(event) => {
                      setFromValue(event.target.value)
                      setCustomError(null)
                    }}
                    className="h-8 bg-background text-xs"
                  />
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="metric-range-to" className="text-xs">
                    To
                  </Label>
                  <Input
                    id="metric-range-to"
                    type="datetime-local"
                    value={toValue}
                    onChange={(event) => {
                      setToValue(event.target.value)
                      setCustomError(null)
                    }}
                    className="h-8 bg-background text-xs"
                  />
                </div>

                {customError ? (
                  <p className="text-xs text-destructive">{customError}</p>
                ) : null}
              </div>

              <Button
                type="button"
                size="sm"
                className="mt-3 h-8 w-full"
                onClick={applyCustomRange}
              >
                Apply range
              </Button>
            </section>
          </div>
        </PopoverContent>
      </Popover>

      <div className="my-1 w-px shrink-0 bg-border" aria-hidden />

      <Select
        value={refreshInterval}
        onValueChange={(next) =>
          onRefreshIntervalChange(next as MetricRefreshInterval)
        }
      >
        <SelectTrigger
          size="sm"
          aria-label={`Refresh interval: ${activeRefreshInterval.label}`}
          className="h-7 shrink-0 gap-1 rounded-sm border-0 bg-transparent px-2 text-xs font-medium text-muted-foreground shadow-none hover:bg-white/70 hover:text-foreground focus-visible:ring-1 dark:hover:bg-monitor-gray-300/60 dark:hover:text-white"
        >
          <span>{activeRefreshInterval.shortLabel}</span>
        </SelectTrigger>
        <SelectContent align="end" position="popper" className="min-w-36">
          <SelectGroup>
            <SelectLabel>Auto refresh</SelectLabel>
            {METRIC_REFRESH_INTERVAL_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <SimpleTooltip content="Refresh metrics">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh metrics"
          className={cn(
            "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-white/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-monitor-gray-300/60 dark:hover:text-white"
          )}
        >
          <RefreshCw
            className={cn("size-3.5", isRefreshing && "animate-spin")}
          />
        </button>
      </SimpleTooltip>
    </div>
  )
}

export { MetricRangeSelector }
