import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import type { ServerResponse } from "@/lib/api/user/servers"
import { ServerMetaSubtitle } from "@/components/server/server-meta-subtitle"

type ServerSettingsHeaderProps = {
  server: ServerResponse | undefined
  serverId: number
}

function ServerSettingsHeader({ server, serverId }: ServerSettingsHeaderProps) {
  return (
    <div className="z-30 mb-6 flex flex-col gap-2.5 border-b border-sidebar-border bg-background/95 py-3 backdrop-blur-sm lg:sticky lg:top-0">
      <Breadcrumb
        items={[
          { label: "Servers", to: "/" },
          {
            label: server?.serverName ?? `Server ${serverId}`,
            to: "/servers/$serverId",
            params: { serverId: String(serverId) },
            search: { range: "7d" },
          },
          { label: "Settings", current: true },
        ]}
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-monitor dark:text-warning" />
          <h1 className="text-xl">Settings</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
