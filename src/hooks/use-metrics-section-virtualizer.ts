import { useWindowVirtualizer } from "@tanstack/react-virtual"
import { useCallback, useLayoutEffect, useRef, useState } from "react"

import {
  METRIC_SECTION_HEADER_HEIGHT,
  METRICS_SECTION_GAP,
  METRICS_SECTION_SCROLL_PADDING,
} from "@/lib/metrics/grid-height"
import type { MetricsSectionLeaf } from "@/lib/metrics/sections/types"

function useMetricsSectionVirtualizer(
  leaves: MetricsSectionLeaf[],
  sectionIdsKey: string
) {
  const listRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "")

  const updateScrollMargin = useCallback(() => {
    const element = listRef.current
    if (!element) {
      return
    }

    const rect = element.getBoundingClientRect()
    setScrollMargin(rect.top + window.scrollY)
  }, [])

  useLayoutEffect(() => {
    updateScrollMargin()

    const element = listRef.current
    if (!element) {
      return
    }

    const observer = new ResizeObserver(updateScrollMargin)
    observer.observe(element)
    window.addEventListener("resize", updateScrollMargin, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", updateScrollMargin)
    }
  }, [updateScrollMargin, sectionIdsKey])

  const virtualizer = useWindowVirtualizer({
    count: leaves.length,
    estimateSize: (index) =>
      METRIC_SECTION_HEADER_HEIGHT + leaves[index]!.contentMinHeight,
    overscan: 2,
    gap: METRICS_SECTION_GAP,
    scrollMargin,
    scrollPaddingStart: METRICS_SECTION_SCROLL_PADDING,
    getItemKey: (index) => leaves[index]!.id,
    onChange: (instance) => {
      const items = instance.getVirtualItems()
      if (items.length === 0) {
        return
      }

      const scrollLine =
        (instance.scrollOffset ?? 0) + METRICS_SECTION_SCROLL_PADDING
      let activeIndex = items[0]!.index

      for (const item of items) {
        if (item.start <= scrollLine + 1) {
          activeIndex = item.index
        }
      }

      if (items[0]!.start > scrollLine && items[0]!.index > 0) {
        activeIndex = items[0]!.index - 1
      }

      const nextId = leaves[activeIndex]?.id
      if (!nextId) {
        return
      }

      setActiveId((current) => (current === nextId ? current : nextId))
    },
  })

  useLayoutEffect(() => {
    setActiveId(leaves[0]?.id ?? "")
  }, [sectionIdsKey, leaves])

  const scrollToSection = useCallback(
    (id: string) => {
      const index = leaves.findIndex((section) => section.id === id)
      if (index >= 0) {
        virtualizer.scrollToIndex(index, {
          align: "start",
          behavior: "smooth",
        })
      }
    },
    [leaves, virtualizer]
  )

  return { listRef, virtualizer, activeId, scrollToSection }
}

export { useMetricsSectionVirtualizer }
