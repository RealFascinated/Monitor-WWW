import { useEffect, useRef, useState } from "react"

import { enqueueChartHydration } from "@/lib/metrics/chart-hydration-queue"

const HYDRATION_ROOT_MARGIN = "120px 0px"

function useChartHydration() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) {
      return
    }

    const element = containerRef.current
    if (!element) {
      return
    }

    let cancelled = false
    let dequeue: (() => void) | undefined

    const observer = new IntersectionObserver(
      (entries) => {
        if (cancelled || !entries.some((entry) => entry.isIntersecting)) {
          return
        }

        observer.disconnect()
        dequeue = enqueueChartHydration(() => {
          if (!cancelled) {
            setHydrated(true)
          }
        })
      },
      { rootMargin: HYDRATION_ROOT_MARGIN }
    )

    observer.observe(element)

    return () => {
      cancelled = true
      observer.disconnect()
      dequeue?.()
    }
  }, [hydrated])

  return { hydrated, containerRef }
}

export { useChartHydration }
