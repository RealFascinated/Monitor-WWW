import { useCallback, useEffect, useState } from "react"

import {
  type MetricRefreshInterval,
  parseMetricRefreshInterval,
} from "@/lib/metrics/refresh-interval"

const METRIC_REFRESH_INTERVAL_STORAGE_KEY = "metric-refresh-interval"

export function useMetricRefreshInterval() {
  const [refreshInterval, setRefreshIntervalState] =
    useState<MetricRefreshInterval>("10s")

  useEffect(() => {
    const stored = localStorage.getItem(METRIC_REFRESH_INTERVAL_STORAGE_KEY)
    if (stored) {
      setRefreshIntervalState(parseMetricRefreshInterval(stored))
    }
  }, [])

  const setRefreshInterval = useCallback((value: MetricRefreshInterval) => {
    setRefreshIntervalState(value)
    localStorage.setItem(METRIC_REFRESH_INTERVAL_STORAGE_KEY, value)
  }, [])

  return {
    refreshInterval,
    setRefreshInterval,
  } as const
}
