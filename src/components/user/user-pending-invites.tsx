import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef, SortingState } from "@tanstack/react-table"
import { useState } from "react"
import { Callout } from "@/components/callout"
import { LoadingState } from "@/components/loading-state"
import { SimpleTooltip, TableHeaderTooltip } from "@/components/simple-tooltip"
import { DataTable } from "@/components/ui/data-table"
import { useUserInvites } from "@/hooks/use-user-invites"
import type { UserPendingInvite } from "@/lib/api/user/invites"
import { formatDate, formatDateWithRelative } from "@/lib/formatter"
import {
  INVITE_EXPIRY_TOOLTIP,
  SERVER_ROLE_TOOLTIPS,
} from "@/lib/tooltips/copy"

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

const columns: ColumnDef<UserPendingInvite>[] = [
  {
    accessorKey: "serverName",
    header: "Server",
    meta: { className: "font-medium" },
    cell: ({ row }) => row.original.serverName,
  },
  {
    accessorKey: "role",
    header: () => (
      <TableHeaderTooltip label="Role" tooltip={SERVER_ROLE_TOOLTIPS.VIEWER} />
    ),
    cell: ({ row }) => (
      <SimpleTooltip content={SERVER_ROLE_TOOLTIPS.VIEWER}>
        <span className="cursor-help">{formatRole(row.original.role)}</span>
      </SimpleTooltip>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <TableHeaderTooltip
        label="Received"
        tooltip="When the invite was sent to your account."
      />
    ),
    meta: { className: "text-neutral-500" },
    cell: ({ row }) => (
      <SimpleTooltip content={formatDateWithRelative(row.original.createdAt)}>
        <span className="cursor-help">
          {formatDate(row.original.createdAt)}
        </span>
      </SimpleTooltip>
    ),
  },
  {
    accessorKey: "expiresAt",
    header: () => (
      <TableHeaderTooltip
        label="Expires"
        tooltip="Accept the invite before this time."
      />
    ),
    meta: { className: "text-neutral-500" },
    cell: ({ row }) => (
      <SimpleTooltip
        content={`${INVITE_EXPIRY_TOOLTIP} ${formatDateWithRelative(row.original.expiresAt)}`}
      >
        <span className="cursor-help">
          {formatDate(row.original.expiresAt)}
        </span>
      </SimpleTooltip>
    ),
  },
]

function UserPendingInvites() {
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: invites = [], isPending, error } = useUserInvites()

  const table = useReactTable({
    data: invites,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.inviteId),
    state: { sorting },
    onSortingChange: setSorting,
  })

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? (
        <Callout type="danger" title="Could not load invites">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <LoadingState message="Loading invites…" />
      ) : null}

      {invites.length === 0 ? (
        <p className="text-neutral-500">No pending invites.</p>
      ) : null}

      {invites.length > 0 ? <DataTable table={table} /> : null}
    </div>
  )
}

export { UserPendingInvites }
