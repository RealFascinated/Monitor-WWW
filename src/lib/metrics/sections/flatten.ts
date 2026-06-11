import {
  isMetricsSectionGroup,
  type MetricsSectionLeaf,
  type MetricsSectionNode,
} from "@/lib/metrics/sections/types"

function flattenMetricSectionLeaves(
  nodes: MetricsSectionNode[]
): MetricsSectionLeaf[] {
  const leaves: MetricsSectionLeaf[] = []

  for (const node of nodes) {
    if (isMetricsSectionGroup(node)) {
      leaves.push(...node.children)
      continue
    }

    leaves.push(node)
  }

  return leaves
}

function findParentGroupId(
  nodes: MetricsSectionNode[],
  leafId: string
): string | undefined {
  for (const node of nodes) {
    if (!isMetricsSectionGroup(node)) {
      continue
    }

    if (node.children.some((child) => child.id === leafId)) {
      return node.id
    }
  }

  return undefined
}

function collectGroupIds(nodes: MetricsSectionNode[]): string[] {
  return nodes
    .filter(isMetricsSectionGroup)
    .map((group) => group.id)
}

function metricsSectionIdsKey(nodes: MetricsSectionNode[]): string {
  return flattenMetricSectionLeaves(nodes)
    .map((section) => section.id)
    .join("|")
}

export {
  collectGroupIds,
  findParentGroupId,
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
}
