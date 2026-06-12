import { ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { SimpleTooltip } from "@/components/simple-tooltip"
import { cn } from "@/lib/utils"
import {
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
} from "@/lib/metrics/sections/flatten"
import {
  isMetricsSectionGroup,
  metricsSectionNavLabel,
} from "@/lib/metrics/sections/types"
import type {
  MetricsSectionLeaf,
  MetricsSectionNode,
} from "@/lib/metrics/sections/types"

type MetricsSectionNavProps = {
  sections: MetricsSectionNode[]
  activeId: string
  onScrollToSection: (id: string) => void
}

const navItemClassName = (isActive: boolean, nested = false) =>
  cn(
    "flex w-full items-center gap-1 rounded-sm py-1 text-left text-xs leading-snug transition-colors",
    nested ? "pr-2 pl-6" : "px-2",
    isActive
      ? "bg-neutral-200/90 font-medium text-foreground dark:bg-monitor-gray-200 dark:text-warning"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
  )

function sectionNavTooltip(section: MetricsSectionLeaf): string {
  if (section.description) {
    return `${section.title} — ${section.description}`
  }

  return section.title
}

function NavLeafButton({
  section,
  isActive,
  onScrollToSection,
  nested = false,
}: {
  section: MetricsSectionLeaf
  isActive: boolean
  onScrollToSection: (id: string) => void
  nested?: boolean
}) {
  return (
    <SimpleTooltip content={sectionNavTooltip(section)}>
      <button
        type="button"
        onClick={() => onScrollToSection(section.id)}
        className={cn(navItemClassName(isActive, nested), "cursor-help")}
      >
        <span className="truncate">{metricsSectionNavLabel(section)}</span>
      </button>
    </SimpleTooltip>
  )
}

function NavGroup({
  group,
  activeId,
  expanded,
  onToggle,
  onScrollToSection,
}: {
  group: Extract<MetricsSectionNode, { kind: "group" }>
  activeId: string
  expanded: boolean
  onToggle: () => void
  onScrollToSection: (id: string) => void
}) {
  const hasActiveChild = group.children.some((child) => child.id === activeId)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-2 py-1 text-left text-xs leading-snug font-medium transition-colors",
          hasActiveChild
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        )}
      >
        <ChevronRight
          aria-hidden
          className={cn(
            "size-3 shrink-0 opacity-60 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="truncate">{group.title}</span>
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground tabular-nums">
          {group.children.length}
        </span>
      </button>

      {expanded ? (
        <div className="flex flex-col gap-px pb-0.5">
          {group.children.map((child) => (
            <NavLeafButton
              key={child.id}
              section={child}
              isActive={child.id === activeId}
              onScrollToSection={onScrollToSection}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MetricsSectionNav({
  sections,
  activeId,
  onScrollToSection,
}: MetricsSectionNavProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const groupIds = useMemo(
    () => sections.filter(isMetricsSectionGroup).map((group) => group.id),
    [sectionIdsKey, sections]
  )

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groupIds)
  )

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = new Set(current)

      for (const groupId of groupIds) {
        next.add(groupId)
      }

      return next
    })
  }, [groupIds])

  useEffect(() => {
    const activeGroup = sections.find(
      (node): node is Extract<MetricsSectionNode, { kind: "group" }> =>
        isMetricsSectionGroup(node) &&
        node.children.some((child) => child.id === activeId)
    )

    if (!activeGroup) {
      return
    }

    setExpandedGroups((current) => {
      if (current.has(activeGroup.id)) {
        return current
      }

      const next = new Set(current)
      next.add(activeGroup.id)
      return next
    })
  }, [activeId, sections])

  function toggleGroup(groupId: string) {
    setExpandedGroups((current) => {
      const next = new Set(current)

      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }

      return next
    })
  }

  const leafCount = useMemo(
    () => flattenMetricSectionLeaves(sections).length,
    [sectionIdsKey, sections]
  )

  if (leafCount <= 1) {
    return null
  }

  return (
    <nav
      className="hidden w-44 shrink-0 lg:block xl:w-48"
      aria-label="Metric sections"
    >
      <div className="sticky top-[calc(var(--metrics-header-offset)+1rem)] z-20 flex max-h-[calc(100svh-var(--metrics-header-offset)-2rem)] flex-col overflow-hidden rounded-sm border border-sidebar-border bg-sidebar shadow-sm">
        <div className="border-b border-sidebar-border px-3 py-2">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
            Sections
          </p>
        </div>

        <div className="flex flex-col gap-px overflow-y-auto p-1.5">
          {sections.map((node) => {
            if (isMetricsSectionGroup(node)) {
              return (
                <NavGroup
                  key={node.id}
                  group={node}
                  activeId={activeId}
                  expanded={expandedGroups.has(node.id)}
                  onToggle={() => toggleGroup(node.id)}
                  onScrollToSection={onScrollToSection}
                />
              )
            }

            return (
              <NavLeafButton
                key={node.id}
                section={node}
                isActive={node.id === activeId}
                onScrollToSection={onScrollToSection}
              />
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export { MetricsSectionNav }
