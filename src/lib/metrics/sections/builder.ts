import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { metricSectionId } from "@/lib/metrics/sections/id"
import type {
  MetricsSectionLeaf,
  MetricsSectionNode,
} from "@/lib/metrics/sections/types"

type LeafInput = {
  id?: string
  title: string
  navLabel?: string
  navPercent?: number | null
  navPercentTooltip?: string
  icon: LucideIcon
  description?: string
  contentMinHeight: number
  render: () => ReactNode
}

type GroupInput = {
  id: string
  title: string
  icon: LucideIcon
}

class MetricsSectionGroupBuilder {
  private children: MetricsSectionLeaf[] = []

  leaf(input: LeafInput) {
    this.children.push({
      kind: "leaf",
      id: input.id ?? metricSectionId(input.title),
      title: input.title,
      navLabel: input.navLabel,
      navPercent: input.navPercent,
      navPercentTooltip: input.navPercentTooltip,
      icon: input.icon,
      description: input.description,
      contentMinHeight: input.contentMinHeight,
      render: input.render,
    })
  }

  build(): MetricsSectionLeaf[] {
    return this.children
  }
}

class MetricsSectionBuilder {
  private nodes: MetricsSectionNode[] = []

  leaf(input: LeafInput) {
    this.nodes.push({
      kind: "leaf",
      id: input.id ?? metricSectionId(input.title),
      title: input.title,
      navLabel: input.navLabel,
      navPercent: input.navPercent,
      navPercentTooltip: input.navPercentTooltip,
      icon: input.icon,
      description: input.description,
      contentMinHeight: input.contentMinHeight,
      render: input.render,
    })
  }

  group(
    input: GroupInput,
    buildChildren: (group: MetricsSectionGroupBuilder) => void
  ) {
    const groupBuilder = new MetricsSectionGroupBuilder()
    buildChildren(groupBuilder)
    const children = groupBuilder.build()

    if (children.length === 0) {
      return
    }

    if (children.length === 1) {
      this.nodes.push(children[0])
      return
    }

    this.nodes.push({
      kind: "group",
      id: input.id,
      title: input.title,
      icon: input.icon,
      children,
    })
  }

  build(): MetricsSectionNode[] {
    return this.nodes
  }
}

function createMetricsSectionBuilder() {
  return new MetricsSectionBuilder()
}

export { createMetricsSectionBuilder }
export type { LeafInput, GroupInput }
