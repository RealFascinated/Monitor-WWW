import { useWindowVirtualizer } from "@tanstack/react-virtual"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import {
  METRIC_SECTION_HEADER_HEIGHT,
  METRICS_SECTION_GAP,
  METRICS_SECTION_SCROLL_PADDING,
} from "@/lib/metrics/grid-height"
import type { MetricsSectionLeaf } from "@/lib/metrics/sections/types"

function computeActiveSectionId(
  leaves: MetricsSectionLeaf[],
  scrollOffset: number,
  virtualItems: Array<{ index: number; start: number }>
): string | null {
  if (virtualItems.length === 0) {
    return null
  }

  const scrollLine = scrollOffset + METRICS_SECTION_SCROLL_PADDING
  let activeIndex = virtualItems[0].index

  for (const item of virtualItems) {
    if (item.start <= scrollLine + 1) {
      activeIndex = item.index
    }
  }

  if (virtualItems[0].start > scrollLine && virtualItems[0].index > 0) {
    activeIndex = virtualItems[0].index - 1
  }

  return leaves[activeIndex]?.id ?? null
}

function useMetricsSectionVirtualizer(
  leaves: MetricsSectionLeaf[],
  sectionIdsKey: string
) {
  const listRef = useRef<HTMLDivElement>(null)
  const activeIdRef = useRef(leaves[0]?.id ?? "")
  const leavesRef = useRef(leaves)
  const isProgrammaticScrollRef = useRef(false)
  const programmaticScrollTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "")

  leavesRef.current = leaves

  const updateScrollMargin = useCallback(() => {
    const element = listRef.current
    if (!element) {
      return
    }

    const next = element.getBoundingClientRect().top + window.scrollY
    setScrollMargin((current) => (current === next ? current : next))
  }, [])

  useLayoutEffect(() => {
    updateScrollMargin()
    window.addEventListener("resize", updateScrollMargin, { passive: true })

    return () => {
      window.removeEventListener("resize", updateScrollMargin)
    }
  }, [updateScrollMargin, sectionIdsKey])

  const virtualizer = useWindowVirtualizer({
    count: leaves.length,
    estimateSize: (index) =>
      METRIC_SECTION_HEADER_HEIGHT + leaves[index].contentMinHeight,
    overscan: 2,
    gap: METRICS_SECTION_GAP,
    scrollMargin,
    scrollPaddingStart: METRICS_SECTION_SCROLL_PADDING,
    getItemKey: (index) => leaves[index].id,
    useCachedMeasurements: true,
  })

  const virtualizerRef = useRef(virtualizer)
  virtualizerRef.current = virtualizer

  const syncActiveSection = useCallback(() => {
    if (isProgrammaticScrollRef.current) {
      return
    }

    const instance = virtualizerRef.current
    const nextId = computeActiveSectionId(
      leavesRef.current,
      instance.scrollOffset ?? 0,
      instance.getVirtualItems()
    )

    if (!nextId || nextId === activeIdRef.current) {
      return
    }

    activeIdRef.current = nextId
    setActiveId(nextId)
  }, [])

  useEffect(() => {
    let rafId = 0

    const onScroll = () => {
      if (isProgrammaticScrollRef.current) {
        if (programmaticScrollTimerRef.current) {
          clearTimeout(programmaticScrollTimerRef.current)
        }

        programmaticScrollTimerRef.current = setTimeout(() => {
          programmaticScrollTimerRef.current = null
          isProgrammaticScrollRef.current = false
        }, 150)
        return
      }

      if (rafId) {
        return
      }

      rafId = requestAnimationFrame(() => {
        rafId = 0
        syncActiveSection()
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    syncActiveSection()

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current)
      }
    }
  }, [syncActiveSection, sectionIdsKey])

  useEffect(() => {
    const firstId = leaves[0]?.id ?? ""
    activeIdRef.current = firstId
    setActiveId(firstId)
  }, [sectionIdsKey, leaves])

  const measureElement = useCallback((node: HTMLElement | null) => {
    virtualizerRef.current.measureElement(node)
  }, [])

  const scrollToSection = useCallback(
    (id: string, behavior: ScrollBehavior = "smooth") => {
      const index = leaves.findIndex((section) => section.id === id)
      if (index < 0) {
        return
      }

      if (programmaticScrollTimerRef.current) {
        clearTimeout(programmaticScrollTimerRef.current)
        programmaticScrollTimerRef.current = null
      }

      isProgrammaticScrollRef.current = true
      activeIdRef.current = id
      setActiveId(id)
      virtualizerRef.current.scrollToIndex(index, {
        align: "start",
        behavior,
      })
    },
    [leaves]
  )

  return { listRef, virtualizer, measureElement, activeId, scrollToSection }
}

export { useMetricsSectionVirtualizer }
