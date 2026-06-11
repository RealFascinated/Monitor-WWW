import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"
import { useState } from "react"

import { CreateServerDialog } from "@/components/user/create-server-dialog"
import { DeleteServerButton } from "@/components/user/delete-server-button"
import { RenameServerDialog } from "@/components/user/rename-server-dialog"
import { CpuPercent, MemoryPercent } from "@/components/server/usage-percent"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useUserServers } from "@/hooks/use-user-servers"
import {
  formatDate,
  formatUptime,
} from "@/lib/formatter"

function ServersTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const {
    data: servers,
    isPending,
    error,
  } = useUserServers()

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredServers =
    servers?.filter((server) => {
      if (!normalizedSearch) {
        return true
      }
      return (
        server.serverName.toLowerCase().includes(normalizedSearch) ||
        server.status.toLowerCase().includes(normalizedSearch) ||
        (server.agentVersion?.toLowerCase().includes(normalizedSearch) ?? false)
      )
    }) ?? []

  const errorMessage = error ?? null

  const hasOwnedServers = filteredServers.some(
    (server) => server.role === "OWNER"
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold dark:text-white">Servers</h2>
        <CreateServerDialog />
      </div>

      {servers && servers.length > 0 ? (
        <div className="relative max-w-sm">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search servers…"
            aria-label="Search servers"
            className="pl-9"
          />
        </div>
      ) : null}

      {errorMessage ? (
        <Callout type="danger" title="Could not load servers">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner />
          <span>Loading servers…</span>
        </div>
      ) : null}

      {servers?.length === 0 ? (
        <p className="text-neutral-500">No servers registered yet.</p>
      ) : null}

      {servers && servers.length > 0 && filteredServers.length === 0 ? (
        <p className="text-neutral-500">No servers match your search.</p>
      ) : null}

      {filteredServers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uptime</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Created</TableHead>
              {hasOwnedServers ? (
                <TableHead className="w-0">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServers.map((server) => (
              <TableRow key={server.serverId}>
                <TableCell className="font-medium">
                  <Link
                    to="/servers/$serverId"
                    params={{ serverId: String(server.serverId) }}
                    search={{ range: "7d" }}
                    className="text-monitor hover:underline dark:text-warning"
                  >
                    {server.serverName}
                  </Link>
                </TableCell>
                <TableCell>
                  <ServerStatusBadge status={server.status} />
                </TableCell>
                <TableCell>{formatUptime(server.uptimeSeconds)}</TableCell>
                <TableCell>
                  <CpuPercent value={server.cpuPercent} />
                </TableCell>
                <TableCell>
                  <MemoryPercent
                    usage={server.memUsage}
                    max={server.memMax}
                  />
                </TableCell>
                <TableCell>{server.agentVersion ?? "—"}</TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(server.createdAt)}
                </TableCell>
                {server.role === "OWNER" ? (
                  <TableCell>
                    <div className="flex items-center">
                      <RenameServerDialog
                        serverId={server.serverId}
                        currentName={server.serverName}
                      />
                      <DeleteServerButton
                        serverId={server.serverId}
                        serverName={server.serverName}
                      />
                    </div>
                  </TableCell>
                ) : hasOwnedServers ? (
                  <TableCell />
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}

export { ServersTable }
