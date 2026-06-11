import { Box, Clock, Cpu, Globe, MemoryStick } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ServerInventory, ServerResponse } from "@/lib/api/user/servers"
import { formatMemoryBytes, formatUptime } from "@/lib/formatter"
import { cn } from "@/lib/utils"

type ServerMetaSubtitleProps = {
  server: ServerResponse
  prefix?: string
  className?: string
}

type MetaItem = {
  key: string
  icon: LucideIcon
  label: string
  value: string
}

function formatOs(inventory: ServerInventory): string | null {
  const parts = [inventory.osName, inventory.osVersion].filter(Boolean)
  return parts.length > 0 ? parts.join(" ") : null
}

function pushMetaItem(
  items: MetaItem[],
  value: string | null | undefined,
  meta: Omit<MetaItem, "value">
) {
  if (value) {
    items.push({ ...meta, value })
  }
}

function ServerMetaSubtitle({ server, prefix, className }: ServerMetaSubtitleProps) {
  const inventory = server.inventory
  const items: MetaItem[] = []

  pushMetaItem(items, inventory?.ip, {
    key: "ip",
    icon: Globe,
    label: "IP address",
  })
  pushMetaItem(
    items,
    server.uptimeSeconds != null ? formatUptime(server.uptimeSeconds) : null,
    { key: "uptime", icon: Clock, label: "Uptime" }
  )
  pushMetaItem(items, inventory ? formatOs(inventory) : null, {
    key: "os",
    icon: Box,
    label: "Operating system",
  })
  pushMetaItem(items, inventory?.cpuModel, {
    key: "cpu",
    icon: Cpu,
    label: "CPU",
  })
  pushMetaItem(
    items,
    server.memMax != null ? formatMemoryBytes(server.memMax) : null,
    { key: "memory", icon: MemoryStick, label: "Memory" }
  )

  if (items.length === 0 && !prefix) {
    return null
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground",
        className
      )}
    >
      {prefix ? <span>{prefix}</span> : null}
      {prefix && items.length > 0 ? (
        <span className="text-muted-foreground/40" aria-hidden>
          |
        </span>
      ) : null}
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <span key={item.key} className="inline-flex items-center gap-2">
            {index > 0 ? (
              <span className="text-muted-foreground/40" aria-hidden>
                |
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span aria-label={item.label}>{item.value}</span>
            </span>
          </span>
        )
      })}
    </div>
  )
}

export { ServerMetaSubtitle }
