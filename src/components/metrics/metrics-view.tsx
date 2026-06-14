import { memo, useMemo } from "react"

import { MetricSection } from "@/components/metrics/metric-section"
import { MetricsSectionNav } from "@/components/metrics/metrics-section-nav"
import { useMetricsActiveSection } from "@/hooks/use-metrics-active-section"
import { MetricsChartSyncProvider } from "@/lib/metrics/chart-sync"
import {
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
} from "@/lib/metrics/sections/flatten"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"

type MetricsViewProps = {
  sections: MetricsSectionNode[]
}

const MemoizedMetricSection = memo(MetricSection)
const MemoizedMetricsSectionNav = memo(MetricsSectionNav)

function MetricsView({ sections }: MetricsViewProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const leaves = useMemo(
    () => flattenMetricSectionLeaves(sections),
    [sectionIdsKey, sections]
  )
  const { activeId, scrollToSection } = useMetricsActiveSection(
    leaves,
    sectionIdsKey
  )

  return (
    <MetricsChartSyncProvider>
      <div className="flex gap-4 lg:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {leaves.map((section) => (
            <MemoizedMetricSection
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              description={section.description}
              render={section.render}
            />
          ))}
        </div>

        <MemoizedMetricsSectionNav
          sections={sections}
          activeId={activeId}
          onScrollToSection={scrollToSection}
        />
      </div>
    </MetricsChartSyncProvider>
  )
}

export { MetricsView }
