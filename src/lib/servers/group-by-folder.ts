import type { ServerResponse } from "@/lib/api/user/servers"

export type ServerFolderGroup = {
  folderName: string
  servers: ServerResponse[]
}

export function groupServersByFolder(servers: ServerResponse[]): {
  folders: ServerFolderGroup[]
  ungrouped: ServerResponse[]
} {
  const folderMap = new Map<string, ServerResponse[]>()
  const ungrouped: ServerResponse[] = []

  for (const server of servers) {
    if (server.folderName) {
      const list = folderMap.get(server.folderName) ?? []
      list.push(server)
      folderMap.set(server.folderName, list)
    } else {
      ungrouped.push(server)
    }
  }

  const folders = [...folderMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([folderName, folderServers]) => ({
      folderName,
      servers: folderServers.sort((a, b) =>
        a.serverName.localeCompare(b.serverName)
      ),
    }))

  ungrouped.sort((a, b) => a.serverName.localeCompare(b.serverName))

  return { folders, ungrouped }
}
