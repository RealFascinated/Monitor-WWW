export function formatDurationSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "—"
  }

  const days = Math.floor(seconds / 86_400)
  if (days >= 365) {
    const years = Math.floor(days / 365)
    const remDays = days % 365
    return remDays > 0 ? `${years}y ${remDays}d` : `${years}y`
  }

  return formatUptime(seconds)
}

export function formatUptime(seconds: number | null): string {
  if (seconds == null) {
    return "—"
  }

  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export function formatPercent(value: number | null): string {
  if (value == null) {
    return "—"
  }

  return formatPercentValue(value)
}

export function formatPercentValue(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`
}

export function formatUptimePercent30d(value: number | null): string {
  if (value == null) {
    return "—"
  }

  return formatPercentValue(value, 2)
}

export function formatBytes(value: number, fractionDigits?: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"]
  let size = value
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  const decimals = fractionDigits ?? (size >= 10 || unitIndex === 0 ? 0 : 1)
  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}

export function formatMemoryBytes(value: number): string {
  return formatBytes(value, 2)
}

export function formatRate(value: number): string {
  return `${formatBytes(value)}/s`
}

export function formatNetworkRate(bytesPerSecond: number): string {
  const bitsPerSecond = bytesPerSecond * 8
  const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"]
  let size = bitsPerSecond
  let unitIndex = 0

  while (size >= 1000 && unitIndex < units.length - 1) {
    size /= 1000
    unitIndex++
  }

  const decimals = size >= 10 || unitIndex === 0 ? 0 : 1
  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPerMinute(value: number): string {
  return `${formatCount(value)}/min`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatMegahertz(value: number): string {
  return `${formatNumber(value)} MHz`
}

export function formatWatts(value: number): string {
  return `${formatNumber(value)} W`
}

export function formatMilliseconds(value: number): string {
  return `${formatNumber(value)} ms`
}

export function formatCelsius(value: number): string {
  return `${formatNumber(value)} °C`
}

export function memoryUsagePercent(
  usage: number | null,
  max: number | null
): number | null {
  if (usage == null || max == null || max === 0) {
    return null
  }

  return (usage / max) * 100
}

export function formatMemoryUsage(
  usage: number | null,
  max: number | null
): string {
  return formatPercent(memoryUsagePercent(usage, max))
}

const RELATIVE_TIME_THRESHOLD_MS = 30 * 86_400 * 1000

function formatAbsoluteDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso))
}

function isWithinRelativeTimeThreshold(iso: string): boolean {
  return (
    Math.abs(new Date(iso).getTime() - Date.now()) < RELATIVE_TIME_THRESHOLD_MS
  )
}

export function formatDate(iso: string): string {
  if (isWithinRelativeTimeThreshold(iso)) {
    return formatRelativeTime(iso)
  }

  return formatAbsoluteDate(iso)
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 365 * 86_400 * 1000],
    ["month", 30 * 86_400 * 1000],
    ["day", 86_400 * 1000],
    ["hour", 3_600 * 1000],
    ["minute", 60 * 1000],
  ]

  for (const [unit, ms] of units) {
    if (Math.abs(diffMs) >= ms || unit === "minute") {
      return rtf.format(Math.round(diffMs / ms), unit)
    }
  }

  return rtf.format(0, "second")
}

export function formatDateWithRelative(iso: string): string {
  const absolute = formatAbsoluteDate(iso)

  if (isWithinRelativeTimeThreshold(iso)) {
    return absolute
  }

  return `${absolute} (${formatRelativeTime(iso)})`
}

export function formatUptimeDetailed(seconds: number | null): string | null {
  if (seconds == null) {
    return null
  }

  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  const parts: string[] = []

  if (days > 0) {
    parts.push(`${days} day${days === 1 ? "" : "s"}`)
  }

  if (hours > 0) {
    parts.push(`${hours} hour${hours === 1 ? "" : "s"}`)
  }

  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} minute${minutes === 1 ? "" : "s"}`)
  }

  return parts.join(", ")
}

export function formatChartTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp * 1000))
}
