import { isMetricsSectionGroup } from "@/lib/metrics/sections/types"
import type {
  MetricsSectionLeaf,
  MetricsSectionNode,
} from "@/lib/metrics/sections/types"

function flattenMetricSectionLeaves(
  nodes: MetricsSectionNode[]
): MetricsSectionLeaf[] {
  const leaves: MetricsSectionLeaf[] = []

  for (const node of nodes) {
    if (isMetricsSectionGroup(node)) {
      leaves.push(...flattenMetricSectionLeaves(node.children))
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

    const nested = findParentGroupId(node.children, leafId)
    if (nested) {
      return nested
    }
  }

  return undefined
}

function collectGroupIds(nodes: MetricsSectionNode[]): string[] {
  const groupIds: string[] = []

  for (const node of nodes) {
    if (!isMetricsSectionGroup(node)) {
      continue
    }

    groupIds.push(node.id, ...collectGroupIds(node.children))
  }

  return groupIds
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
