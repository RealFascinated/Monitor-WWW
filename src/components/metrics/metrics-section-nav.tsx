import { useEffect, useMemo, useState } from "react"

import { cn } from "@/lib/utils"
import {
  flattenMetricSectionLeaves,
  metricsSectionIdsKey,
} from "@/lib/metrics/sections/flatten"
import {
  isMetricsSectionGroup,
  metricsSectionNavLabel,
  type MetricsSectionLeaf,
  type MetricsSectionNode,
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
      className={cn(
        "relative w-full rounded-r-sm py-1 text-left text-xs font-medium leading-snug transition-colors",
        nested ? "pl-5 pr-1" : "flex items-center gap-1.5 pl-2.5",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 bottom-1 left-0 w-0.5 rounded-full",
          isActive ? "bg-monitor dark:bg-warning" : "bg-transparent"
        )}
      />
      {nested ? (
        metricsSectionNavLabel(section)
      ) : (
        <>
          <section.icon className="size-3 shrink-0 opacity-70" aria-hidden />
          {metricsSectionNavLabel(section)}
        </>
      )}
    </button>
  )
}

function NavGroup({
  group,
  activeId,
}: {
  group: Extract<MetricsSectionNode, { kind: "group" }>
  activeId: string
}) {
  const GroupIcon = group.icon
  const hasActiveChild = group.children.some((child) => child.id === activeId)

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "relative flex w-full items-center gap-1.5 rounded-r-sm py-1 pl-2.5 text-xs font-medium leading-snug",
          hasActiveChild ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1 bottom-1 left-0 w-0.5 rounded-full",
            hasActiveChild ? "bg-monitor dark:bg-warning" : "bg-transparent"
          )}
        />
        <GroupIcon className="size-3 shrink-0 opacity-70" aria-hidden />
        {group.title}
      </div>

      <div className="flex flex-col gap-0.5">
        {group.children.map((child) => (
          <NavLeafButton
            key={child.id}
            section={child}
            isActive={child.id === activeId}
            nested
          />
        ))}
      </div>
    </div>
  )
}

function MetricsSectionNav({ sections }: MetricsSectionNavProps) {
  const sectionIdsKey = metricsSectionIdsKey(sections)
  const leaves = useMemo(
    () => flattenMetricSectionLeaves(sections),
    [sectionIdsKey]
  )

  const [activeId, setActiveId] = useState(leaves[0]?.id ?? "")

  useEffect(() => {
    setActiveId(leaves[0]?.id ?? "")
  }, [sectionIdsKey, leaves])

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

  if (leaves.length <= 1) {
    return null
  }

  return (
    <nav
      className="hidden w-36 shrink-0 xl:block"
      aria-label="Metric sections"
    >
      <div className="sticky top-[calc(var(--metrics-header-offset)+1rem)] z-20 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
        {sections.map((node) => {
          if (isMetricsSectionGroup(node)) {
            return (
              <NavGroup
                key={node.id}
                group={node}
                activeId={activeId}
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
    </nav>
  )
}

export { MetricsSectionNav }
