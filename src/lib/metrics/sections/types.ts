import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

type MetricsSectionLeaf = {
  kind: "leaf"
  id: string
  title: string
  navLabel?: string
  icon: LucideIcon
  description?: string
  content: ReactNode
}

type MetricsSectionGroup = {
  kind: "group"
  id: string
  title: string
  icon: LucideIcon
  children: MetricsSectionLeaf[]
}

type MetricsSectionNode = MetricsSectionLeaf | MetricsSectionGroup

function isMetricsSectionGroup(
  node: MetricsSectionNode
): node is MetricsSectionGroup {
  return node.kind === "group"
}

function isMetricsSectionLeaf(
  node: MetricsSectionNode
): node is MetricsSectionLeaf {
  return node.kind === "leaf"
}

function metricsSectionNavLabel(section: MetricsSectionLeaf): string {
  return section.navLabel ?? section.title
}

export type {
  MetricsSectionGroup,
  MetricsSectionLeaf,
  MetricsSectionNode,
}
export {
  isMetricsSectionGroup,
  isMetricsSectionLeaf,
  metricsSectionNavLabel,
}
