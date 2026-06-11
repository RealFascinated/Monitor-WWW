import { useEffect, useState } from "react"

import { enqueueChartHydration } from "@/lib/metrics/chart-hydration-queue"

function useChartHydration() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false

    const dequeue = enqueueChartHydration(() => {
      if (!cancelled) {
        setHydrated(true)
      }
    })

    return () => {
      cancelled = true
      dequeue()
    }
  }, [])

  return hydrated
}

export { useChartHydration }
