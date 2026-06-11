import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import type { ServerResponse } from "@/lib/api/user/servers"
import { ServerMetaSubtitle } from "@/components/server/server-meta-subtitle"
import { cn } from "@/lib/utils"

type ServerSettingsHeaderProps = {
  server: ServerResponse | undefined
  serverId: number
}

function ServerSettingsHeader({ server, serverId }: ServerSettingsHeaderProps) {
  return (
    <div
      className={cn(
        "z-30 -mx-4 mb-8 flex flex-col gap-4 border-b border-sidebar-border bg-background/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:sticky lg:top-0 lg:-mx-8 lg:px-8"
      )}
    >
      <Breadcrumb
        items={[
          { label: "Dashboard", to: "/" },
          {
            label: server?.serverName ?? `Server ${serverId}`,
            to: "/servers/$serverId",
            params: { serverId: String(serverId) },
            search: { range: "7d" },
          },
          { label: "Settings", current: true },
        ]}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Settings className="size-5 text-monitor dark:text-warning" />
          <h1>Settings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-foreground">
            {server?.serverName ?? `Server ${serverId}`}
          </span>
          {server ? <ServerStatusBadge status={server.status} /> : null}
        </div>
        {server ? (
          <ServerMetaSubtitle server={server} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Server configuration, agent, and access.
          </p>
        )}
      </div>
    </div>
  )
}

export { ServerSettingsHeader }
