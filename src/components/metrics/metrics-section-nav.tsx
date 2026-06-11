import { ChevronRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  })
}

const navItemClassName = (isActive: boolean, nested = false) =>
  cn(
    "flex w-full items-center gap-1 rounded-sm py-1 text-left text-xs leading-snug transition-colors",
    nested ? "pl-6 pr-2" : "px-2",
    isActive
      ? "bg-neutral-200/90 font-medium text-foreground dark:bg-monitor-gray-200 dark:text-warning"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
  )

function NavLeafButton({
  section,
  isActive,
  nested = false,
}: {
  section: MetricsSectionLeaf
  isActive: boolean
  nested?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => scrollToSection(section.id)}
      className={navItemClassName(isActive, nested)}
    >
      <span className="truncate">{metricsSectionNavLabel(section)}</span>
    </button>
  )
}

function NavGroup({
  group,
  activeId,
  expanded,
  onToggle,
}: {
  group: Extract<MetricsSectionNode, { kind: "group" }>
  activeId: string
  expanded: boolean
  onToggle: () => void
}) {
  const hasActiveChild = group.children.some((child) => child.id === activeId)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className={cn(
          "flex w-full items-center gap-1 rounded-sm px-2 py-1 text-left text-xs font-medium leading-snug transition-colors",
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
        <span className="ml-auto shrink-0 text-[10px] tabular-nums text-muted-foreground">
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
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function MetricsSectionNav({ sections }: MetricsSectionNavProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const leaves = useMemo(
    () => flattenMetricSectionLeaves(sections),
    [sectionIdsKey]
  )
  const groupIds = useMemo(
    () =>
      sections
        .filter(isMetricsSectionGroup)
        .map((group) => group.id),
    [sectionIdsKey, sections]
  )

  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(groupIds)
  )

  useEffect(() => {
    setActiveId(leaves[0]?.id ?? "")
  }, [sectionIdsKey, leaves])

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

  useEffect(() => {
    const elements = leaves
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const visibility = new Map<string, boolean>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting)
        }

        const visibleLeaves = leaves.filter((leaf) => visibility.get(leaf.id))

        if (visibleLeaves.length === 0) {
          return
        }

        const topLeaf = visibleLeaves.reduce((current, candidate) => {
          const currentTop =
            document.getElementById(current.id)?.getBoundingClientRect().top ??
            Number.POSITIVE_INFINITY
          const candidateTop =
            document.getElementById(candidate.id)?.getBoundingClientRect().top ??
            Number.POSITIVE_INFINITY

          return candidateTop < currentTop ? candidate : current
        })

        setActiveId(topLeaf.id)
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [sectionIdsKey, leaves])

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

  if (leaves.length <= 1) {
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
                />
              )
            }

            return (
              <NavLeafButton
                key={node.id}
                section={node}
                isActive={node.id === activeId}
              />
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export { MetricsSectionNav }
