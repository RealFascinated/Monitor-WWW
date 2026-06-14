import { CountUp } from "@/components/count-up"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type MetricStatCardProps = {
  title: string
  value: number
  formatValue: (value: number) => string
  detail?: string
  valueClassName?: string
}

function MetricStatCard({
  title,
  value,
  formatValue,
  detail,
  valueClassName,
}: MetricStatCardProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0 dark:border-monitor-gray-300">
      <CardContent className="flex flex-col gap-1 px-4 py-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>
        <CountUp
          value={value}
          format={formatValue}
          className={cn(
            "font-mono text-3xl font-semibold text-foreground tabular-nums",
            valueClassName
          )}
        />
        {detail ? (
          <p className="text-sm text-muted-foreground">{detail}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export { MetricStatCard }
