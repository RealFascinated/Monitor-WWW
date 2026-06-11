import { cn } from "@/lib/utils"

type MetricSectionProps = {
  id: string
  title: string
  description?: string
  children: React.ReactNode
}

function MetricSection({ id, title, description, children }: MetricSectionProps) {
  return (
    <section
      id={id}
      className="flex scroll-mt-[calc(var(--metrics-header-offset)+1rem)] flex-col gap-4"
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
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
        </div>
        {description ? (
          <p className="ml-3 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export { MetricSection }
