import type { ServerResponse } from "@/lib/api/user/servers"
import { formatUptime } from "@/lib/formatter"

type ServerMetaSubtitleProps = {
  server: ServerResponse
  prefix?: string
}

function ServerMetaSubtitle({ server, prefix }: ServerMetaSubtitleProps) {
  const meta = [
    `Uptime ${formatUptime(server.uptimeSeconds)}`,
    server.agentVersion ? `Agent ${server.agentVersion}` : null,
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <p className="text-sm text-muted-foreground">
      {prefix ? `${prefix} · ${meta}` : meta}
    </p>
  )
}

export { ServerMetaSubtitle }
