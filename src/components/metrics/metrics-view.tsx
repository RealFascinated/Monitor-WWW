import { memo, useMemo } from "react"

import { MetricSection } from "@/components/metrics/metric-section"
import { MetricsSectionNav } from "@/components/metrics/metrics-section-nav"
import { useMetricsSectionVirtualizer } from "@/hooks/use-metrics-section-virtualizer"
import {
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
} from "@/lib/metrics/sections/flatten"
import type {
  MetricsSectionLeaf,
  MetricsSectionNode,
} from "@/lib/metrics/sections/types"

type MetricsViewProps = {
  sections: MetricsSectionNode[]
}

type VirtualMetricRowProps = {
  index: number
  start: number
  scrollMargin: number
  section: MetricsSectionLeaf
  measureElement: (node: HTMLElement | null) => void
}

const VirtualMetricRow = memo(function VirtualMetricRow({
  index,
  start,
  scrollMargin,
  section,
  measureElement,
}: VirtualMetricRowProps) {
  return (
    <div
      data-index={index}
      ref={measureElement}
      className="absolute top-0 left-0 w-full"
      style={{
        transform: `translateY(${start - scrollMargin}px)`,
      }}
    >
      <MetricSection
        id={section.id}
        title={section.title}
        icon={section.icon}
        description={section.description}
        contentMinHeight={section.contentMinHeight}
        render={section.render}
      />
    </div>
  )
})

const MemoizedMetricsSectionNav = memo(MetricsSectionNav)

function MetricsView({ sections }: MetricsViewProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const leaves = useMemo(
    () => flattenMetricSectionLeaves(sections),
    [sectionIdsKey, sections]
  )
  const { listRef, virtualizer, measureElement, activeId, scrollToSection } =
    useMetricsSectionVirtualizer(leaves, sectionIdsKey)
  const virtualItems = virtualizer.getVirtualItems()
  const scrollMargin = virtualizer.options.scrollMargin

  return (
    <div className="flex gap-4 lg:gap-6">
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          ref={listRef}
          className="pointer-events-none h-0 w-full shrink-0"
          aria-hidden
        />
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualItem) => {
            const section = leaves[virtualItem.index]

            return (
              <VirtualMetricRow
                key={virtualItem.key}
                index={virtualItem.index}
                start={virtualItem.start}
                scrollMargin={scrollMargin}
                section={section}
                measureElement={measureElement}
              />
            )
          })}
        </div>
      </div>

      <MemoizedMetricsSectionNav
        sections={sections}
        activeId={activeId}
        onScrollToSection={scrollToSection}
      />
    </div>
  )
}

export { MetricsView }
