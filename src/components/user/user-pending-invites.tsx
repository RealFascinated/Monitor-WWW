import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { useState } from "react"
import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { DataTable } from "@/components/ui/data-table"
import { useUserInvites } from "@/hooks/use-user-invites"
import type { UserPendingInvite } from "@/lib/api/user/invites"
import { formatDate } from "@/lib/formatter"

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
    header: "Role",
    cell: ({ row }) => formatRole(row.original.role),
  },
  {
    accessorKey: "createdAt",
    header: "Received",
    meta: { className: "text-neutral-500" },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    meta: { className: "text-neutral-500" },
    cell: ({ row }) => formatDate(row.original.expiresAt),
  },
]

function UserPendingInvites() {
  const [sorting, setSorting] = useState<SortingState>([])
  const { data: invites, isPending, error } = useUserInvites()

  const table = useReactTable({
    data: invites ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.inviteId),
    state: { sorting },
    onSortingChange: setSorting,
  })

  const errorMessage = error ?? null

  return (
    <div className="flex flex-col gap-3">
      {errorMessage ? (
        <Callout type="danger" title="Could not load invites">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner />
          <span>Loading invites…</span>
        </div>
      ) : null}

      {invites?.length === 0 ? (
        <p className="text-neutral-500">No pending invites.</p>
      ) : null}

      {invites && invites.length > 0 ? <DataTable table={table} /> : null}
    </div>
  )
}

export { UserPendingInvites }
