import { MetricSection } from "@/components/metrics/metric-section"
import { MetricsSectionNav } from "@/components/metrics/metrics-section-nav"
import { flattenMetricSectionLeaves } from "@/lib/metrics/sections/flatten"
import type { MetricsSectionNode } from "@/lib/metrics/sections/types"

type MetricsViewProps = {
  sections: MetricsSectionNode[]
}

function MetricsView({ sections }: MetricsViewProps) {
  const leaves = flattenMetricSectionLeaves(sections)

  return (
    <div className="flex gap-4 lg:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {leaves.map((section) => (
          <MetricSection
            key={section.id}
            id={section.id}
            title={section.title}
            icon={section.icon}
            description={section.description}
            contentMinHeight={section.contentMinHeight}
            render={section.render}
          />
        ))}
      </div>

      <MetricsSectionNav sections={sections} />
    </div>
  )
}

export { MetricsView }
