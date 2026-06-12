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

function readMetricsSectionHash(): string {
  const raw = window.location.hash.slice(1)
  return raw ? decodeURIComponent(raw) : ""
}

function writeMetricsSectionHash(id: string) {
  if (readMetricsSectionHash() === id) {
    return
  }

  const next = `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`
  window.history.replaceState(window.history.state, "", next)
}

function useMetricsSectionVirtualizer(
  leaves: MetricsSectionLeaf[],
  sectionIdsKey: string
) {
  const listRef = useRef<HTMLDivElement>(null)
  const hashRestoreKeyRef = useRef<string | null>(null)
  const hashRestoreRetryKeyRef = useRef<string | null>(null)
  const isRestoringHashRef = useRef(false)
  const hashWriteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [scrollMargin, setScrollMargin] = useState(0)
  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "")

  const queueMetricsSectionHash = useCallback((id: string) => {
    if (hashWriteTimerRef.current) {
      clearTimeout(hashWriteTimerRef.current)
    }

    hashWriteTimerRef.current = setTimeout(() => {
      hashWriteTimerRef.current = null
      writeMetricsSectionHash(id)
    }, 150)
  }, [])

  const commitMetricsSectionHash = useCallback((id: string) => {
    if (hashWriteTimerRef.current) {
      clearTimeout(hashWriteTimerRef.current)
      hashWriteTimerRef.current = null
    }

    writeMetricsSectionHash(id)
  }, [])

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
      METRIC_SECTION_HEADER_HEIGHT + leaves[index].contentMinHeight,
    overscan: 2,
    gap: METRICS_SECTION_GAP,
    scrollMargin,
    scrollPaddingStart: METRICS_SECTION_SCROLL_PADDING,
    getItemKey: (index) => leaves[index].id,
    onChange: (instance) => {
      const items = instance.getVirtualItems()
      if (items.length === 0) {
        return
      }

      const scrollLine =
        (instance.scrollOffset ?? 0) + METRICS_SECTION_SCROLL_PADDING
      let activeIndex = items[0].index

      for (const item of items) {
        if (item.start <= scrollLine + 1) {
          activeIndex = item.index
        }
      }

      if (items[0].start > scrollLine && items[0].index > 0) {
        activeIndex = items[0].index - 1
      }

      const nextId = leaves[activeIndex]?.id
      if (!nextId) {
        return
      }

      setActiveId((current) => {
        if (current === nextId) {
          return current
        }

        if (!isRestoringHashRef.current) {
          queueMetricsSectionHash(nextId)
        }

        return nextId
      })
    },
  })

  const virtualizerRef = useRef(virtualizer)
  virtualizerRef.current = virtualizer

  const scrollToHashSection = useCallback(
    (hashId: string, behavior: ScrollBehavior = "auto") => {
      const index = leaves.findIndex((section) => section.id === hashId)
      if (index < 0) {
        return false
      }

      isRestoringHashRef.current = true
      setActiveId(hashId)
      virtualizerRef.current.scrollToIndex(index, {
        align: "start",
        behavior,
      })
      requestAnimationFrame(() => {
        isRestoringHashRef.current = false
      })
      return true
    },
    [leaves]
  )

  useLayoutEffect(() => {
    if (hashRestoreKeyRef.current === sectionIdsKey) {
      return
    }

    const listElement = listRef.current
    if (!listElement) {
      return
    }

    const hashId = readMetricsSectionHash()
    const hashIndex = hashId
      ? leaves.findIndex((section) => section.id === hashId)
      : -1

    if (hashIndex < 0) {
      hashRestoreKeyRef.current = sectionIdsKey
      setActiveId(leaves[0]?.id ?? "")
      return
    }

    const measuredMargin =
      listElement.getBoundingClientRect().top + window.scrollY
    if (scrollMargin === 0 && measuredMargin > 0) {
      return
    }

    if (!scrollToHashSection(hashId)) {
      return
    }

    hashRestoreKeyRef.current = sectionIdsKey
  }, [leaves, scrollMargin, scrollToHashSection, sectionIdsKey])

  useEffect(() => {
    if (hashRestoreKeyRef.current !== sectionIdsKey) {
      return
    }

    if (hashRestoreRetryKeyRef.current === sectionIdsKey) {
      return
    }

    const hashId = readMetricsSectionHash()
    if (!hashId) {
      return
    }

    hashRestoreRetryKeyRef.current = sectionIdsKey

    let cancelled = false
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) {
          scrollToHashSection(hashId)
        }
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [scrollToHashSection, sectionIdsKey])

  const scrollToSection = useCallback(
    (id: string, behavior: ScrollBehavior = "smooth") => {
      const index = leaves.findIndex((section) => section.id === id)
      if (index < 0) {
        return
      }

      commitMetricsSectionHash(id)
      setActiveId(id)
      virtualizer.scrollToIndex(index, {
        align: "start",
        behavior,
      })
    },
    [commitMetricsSectionHash, leaves, virtualizer]
  )

  useEffect(() => {
    return () => {
      if (hashWriteTimerRef.current) {
        clearTimeout(hashWriteTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function handleHashChange() {
      const hashId = readMetricsSectionHash()
      if (!hashId) {
        return
      }

      scrollToHashSection(hashId, "auto")
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [scrollToHashSection])

  return { listRef, virtualizer, activeId, scrollToSection }
}

export { useMetricsSectionVirtualizer }
