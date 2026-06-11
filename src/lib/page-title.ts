import type { ServerResponse } from "@/lib/api/user/servers"

export const APP_NAME = "Server Monitor"

export function pageTitle(...segments: string[]) {
  const parts = segments.filter(Boolean)
  if (parts.length === 0) {
    return APP_NAME
  }

  return [...parts, APP_NAME].join(" · ")
}

export function serverPageTitle(
  servers: ServerResponse[] | undefined,
  serverId: string | number,
  ...extra: string[]
) {
  const name =
    servers?.find((entry) => entry.serverId === Number(serverId))?.serverName ??
    `Server ${serverId}`

  return pageTitle(...extra, name)
}
