import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type MetricsSectionNavItem = {
  id: string
  title: string
}

type MetricsSectionNavProps = {
  sections: MetricsSectionNavItem[]
}

function MetricsSectionNav({ sections }: MetricsSectionNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "")

  useEffect(() => {
    setActiveId(sections[0]?.id ?? "")
  }, [sections])

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null)

    if (elements.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) =>
              left.boundingClientRect.top - right.boundingClientRect.top
          )

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    )

    for (const element of elements) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [sections])

  if (sections.length <= 1) {
    return null
  }

  return (
    <nav
      className="hidden w-36 shrink-0 xl:block"
      aria-label="Metric sections"
    >
      <div className="sticky top-[calc(var(--metrics-header-offset)+1rem)] z-20 flex flex-col gap-0.5 border-l border-sidebar-border pl-3">
        {sections.map((section) => {
          const isActive = section.id === activeId

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                document.getElementById(section.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }}
              className={cn(
                "relative -ml-px rounded-r-sm py-1 pl-2.5 text-left text-xs leading-snug transition-colors",
                isActive
                  ? "border-l-2 border-monitor font-semibold text-foreground dark:border-warning"
                  : "border-l-2 border-transparent font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {section.title}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export { MetricsSectionNav }
export type { MetricsSectionNavItem }
