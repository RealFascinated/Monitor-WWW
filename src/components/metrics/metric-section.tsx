import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type MetricSectionProps = {
  id: string
  title: string
  icon: LucideIcon
  description?: string
  contentMinHeight: number
  render: () => ReactNode
}

function MetricSection({
  id,
  title,
  icon: Icon,
  description,
  contentMinHeight,
  render,
}: MetricSectionProps) {
  return (
    <section
      data-section-id={id}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={cn(
              "h-4 w-0.5 shrink-0 rounded-full bg-monitor",
              "dark:bg-warning"
            )}
          />
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            {title}
          </h2>
        </div>
        {description ? (
          <p className="ml-3 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="w-full" style={{ minHeight: contentMinHeight }}>
        {render()}
      </div>
    </section>
  )
}

export { MetricSection }
