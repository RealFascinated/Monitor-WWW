import { Link } from "@tanstack/react-router"
import type { ColumnDef } from "@tanstack/react-table"

import { DeleteServerButton } from "@/components/user/delete-server-button"
import { RenameServerDialog } from "@/components/user/rename-server-dialog"
import {
  CpuPercent,
  DiskPercent,
  MemoryPercent,
} from "@/components/server/usage-percent"
import { ServerStatusBadge } from "@/components/server/server-status-badge"
import { SimpleTooltip, TableHeaderTooltip } from "@/components/simple-tooltip"
import {
  formatDate,
  formatDateWithRelative,
  formatUptime,
  formatUptimeDetailed,
  formatUptimePercent30d,
} from "@/lib/formatter"
import type { ServerResponse } from "@/lib/api/user/servers"
import {
  pendingOnlyTooltip,
  SERVER_TABLE_COLUMN_TOOLTIPS,
} from "@/lib/tooltips/copy"
import { cn } from "@/lib/utils"

const unknownStatClassName = "text-neutral-500"

export function getServerTableColumns(
  hasOwnedServers: boolean
): ColumnDef<ServerResponse>[] {
  const baseColumns: ColumnDef<ServerResponse>[] = [
    {
      accessorKey: "serverName",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            to="/servers/$serverId"
            params={{ serverId: String(row.original.serverId) }}
            search={{ range: "7d" }}
            className="text-monitor hover:underline dark:text-warning"
          >
            {row.original.serverName}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <TableHeaderTooltip
          label="Status"
          tooltip="Whether the Monitor Agent is reporting metrics for this server."
        />
      ),
      cell: ({ row }) => <ServerStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "uptimeSeconds",
      header: () => (
        <TableHeaderTooltip
          label="Uptime"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.uptime}
        />
      ),
      cell: ({ row }) => {
        const formatted = formatUptime(row.original.uptimeSeconds)
        const detailed = formatUptimeDetailed(row.original.uptimeSeconds)
        const tooltip = detailed ?? pendingOnlyTooltip(row.original.status)
        const className = cn(
          row.original.uptimeSeconds == null && unknownStatClassName
        )

        if (!tooltip) {
          return <span className={className}>{formatted}</span>
        }

        return (
          <SimpleTooltip content={tooltip}>
            <span className={cn("cursor-help", className)}>{formatted}</span>
          </SimpleTooltip>
        )
      },
    },
    {
      accessorKey: "uptimePercent30d",
      header: () => (
        <TableHeaderTooltip
          label="Uptime (30d)"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.uptime30d}
        />
      ),
      cell: ({ row }) => {
        const formatted = formatUptimePercent30d(row.original.uptimePercent30d)
        const tooltip = pendingOnlyTooltip(row.original.status)
        const className = cn(
          row.original.uptimePercent30d == null && unknownStatClassName
        )

        if (row.original.uptimePercent30d != null || !tooltip) {
          return <span className={className}>{formatted}</span>
        }

        return (
          <SimpleTooltip content={tooltip}>
            <span className={cn("cursor-help", className)}>{formatted}</span>
          </SimpleTooltip>
        )
      },
    },
    {
      id: "cpu",
      accessorFn: (row) => row.cpuPercent,
      header: () => (
        <TableHeaderTooltip
          label="CPU"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.cpu}
        />
      ),
      cell: ({ row }) => (
        <CpuPercent
          value={row.original.cpuPercent}
          status={row.original.status}
        />
      ),
    },
    {
      id: "memory",
      accessorFn: (row) =>
        row.memUsage != null && row.memMax ? row.memUsage / row.memMax : null,
      header: () => (
        <TableHeaderTooltip
          label="Memory"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.memory}
        />
      ),
      cell: ({ row }) => (
        <MemoryPercent
          usage={row.original.memUsage}
          max={row.original.memMax}
          status={row.original.status}
        />
      ),
    },
    {
      id: "disk",
      accessorFn: (row) =>
        row.diskUsage != null && row.diskMax
          ? row.diskUsage / row.diskMax
          : null,
      header: () => (
        <TableHeaderTooltip
          label="Root Disk"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.rootDisk}
        />
      ),
      cell: ({ row }) => (
        <DiskPercent
          usage={row.original.diskUsage}
          max={row.original.diskMax}
          status={row.original.status}
        />
      ),
    },
    {
      accessorKey: "agentVersion",
      header: () => (
        <TableHeaderTooltip
          label="Agent"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.agent}
        />
      ),
      cell: ({ row }) => row.original.agentVersion ?? "—",
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <TableHeaderTooltip
          label="Created"
          tooltip={SERVER_TABLE_COLUMN_TOOLTIPS.created}
        />
      ),
      meta: { className: "text-neutral-500" },
      cell: ({ row }) => (
        <SimpleTooltip
          content={formatDateWithRelative(row.original.createdAt)}
        >
          <span className="cursor-help">
            {formatDate(row.original.createdAt)}
          </span>
        </SimpleTooltip>
      ),
    },
  ]

  if (!hasOwnedServers) {
    return baseColumns
  }

  return [
    ...baseColumns,
    {
      id: "actions",
      enableSorting: false,
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: "w-0" },
      cell: ({ row }) => {
        if (row.original.role !== "OWNER") {
          return null
        }

        return (
          <div className="flex items-center">
            <RenameServerDialog
              serverId={row.original.serverId}
              currentName={row.original.serverName}
            />
            <DeleteServerButton
              serverId={row.original.serverId}
              serverName={row.original.serverName}
            />
          </div>
        )
      },
    },
  ]
}

export function filterServersBySearch(
  servers: ServerResponse[],
  searchQuery: string
): ServerResponse[] {
  const search = searchQuery.trim().toLowerCase()
  if (!search) {
    return servers
  }

  return servers.filter(
    (server) =>
      server.serverName.toLowerCase().includes(search) ||
      server.status.toLowerCase().includes(search) ||
      (server.agentVersion?.toLowerCase().includes(search) ?? false)
  )
}
