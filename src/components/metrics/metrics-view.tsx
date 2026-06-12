import { useMemo } from "react"

import { MetricSection } from "@/components/metrics/metric-section"
import { MetricsSectionNav } from "@/components/metrics/metrics-section-nav"
import { useMetricsSectionVirtualizer } from "@/hooks/use-metrics-section-virtualizer"
import {
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
} from "@/lib/metrics/sections/flatten"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"

type MetricsViewProps = {
  sections: MetricsSectionNode[]
}

function MetricsView({ sections }: MetricsViewProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const leaves = useMemo(
    () => flattenMetricSectionLeaves(sections),
    [sectionIdsKey, sections]
  )
  const { listRef, virtualizer, activeId, scrollToSection } =
    useMetricsSectionVirtualizer(leaves, sectionIdsKey)
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex gap-4 lg:gap-6">
      <div ref={listRef} className="flex min-w-0 flex-1 flex-col">
        <div
          className="relative w-full"
          style={{ height: virtualizer.getTotalSize() }}
        >
          {virtualItems.map((virtualItem) => {
            const section = leaves[virtualItem.index]

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                className="absolute top-0 left-0 w-full"
                style={{
                  transform: `translateY(${
                    virtualItem.start - virtualizer.options.scrollMargin
                  }px)`,
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
          })}
        </div>
      </div>

      <MetricsSectionNav
        sections={sections}
        activeId={activeId}
        onScrollToSection={scrollToSection}
      />
    </div>
  )
}

export { MetricsView }
