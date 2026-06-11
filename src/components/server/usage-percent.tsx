import {
  formatPercent,
  memoryUsagePercent,
} from "@/lib/formatter"
import { percentLevelColorClass } from "@/lib/metrics/percent-level"

function ColoredPercent({
  value,
  className,
}: {
  value: number | null
  className?: string
}) {
  return (
    <span className={percentLevelColorClass(value, className)}>
      {formatPercent(value)}
    </span>
  )
}

function CpuPercent({
  value,
  className,
}: {
  value: number | null
  className?: string
}) {
  return <ColoredPercent value={value} className={className} />
}

function UsagePercent({
  usage,
  max,
  className,
}: {
  usage: number | null
  max: number | null
  className?: string
}) {
  return (
    <ColoredPercent
      value={memoryUsagePercent(usage, max)}
      className={className}
    />
  )
}

function MemoryPercent({
  usage,
  max,
  className,
}: {
  usage: number | null
  max: number | null
  className?: string
}) {
  return <UsagePercent usage={usage} max={max} className={className} />
}

function DiskPercent({
  usage,
  max,
  className,
}: {
  usage: number | null
  max: number | null
  className?: string
}) {
  return <UsagePercent usage={usage} max={max} className={className} />
}

export { CpuPercent, DiskPercent, MemoryPercent }
