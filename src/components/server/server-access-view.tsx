import { useMutation } from "@tanstack/react-query"
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Trash2 } from "lucide-react"
import { useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { InviteMemberDialog } from "@/components/server/invite-member-dialog"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/ui/data-table"
import {
  removeServerMember,
  revokeServerInvite,
} from "@/lib/api/user/access"
import type {
  PendingServerInvite,
  ServerAccessListResponse,
} from "@/lib/api/user/access"
import type { ServerRole } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"
import { useAccessStore } from "@/stores/access-store"
import { formatDate } from "@/lib/formatter"

type ServerAccessViewProps = {
  serverId: number
  access: ServerAccessListResponse
  canManage: boolean
}

type AccessMemberRow = {
  id: number
  email: string
  role: ServerRole | "OWNER"
  joinedAt: string | null
  memberUserId: number | null
}

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function RoleTag({ role }: { role: string }) {
  return (
    <span className="px-2 py-1 text-xs font-bold text-neutral-500 bg-neutral-100 dark:bg-monitor-gray-100">
      {formatRole(role)}
    </span>
  )
}

function RemoveMemberButton({
  serverId,
  memberUserId,
  memberEmail,
}: {
  serverId: number
  memberUserId: number
  memberEmail: string
}) {
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => removeServerMember(serverId, memberUserId),
    onSuccess: async () => {
      await useAccessStore.getState().fetchAccess(serverId)
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiClientError
          ? mutationError.message
          : "Failed to remove member"
      )
    },
  })

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-neutral-400 hover:bg-transparent hover:text-red-600 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-red-400"
          aria-label={`Remove ${memberEmail}`}
        >
          <Trash2 className="size-4" />
        </Button>
      }
      title="Remove member"
      description={
        <>
          Remove <span className="font-bold">{memberEmail}</span> from this
          server? They will lose access immediately.
        </>
      }
      confirmLabel="Remove"
      confirmVariant="destructive"
      error={error}
      errorTitle="Could not remove member"
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
        }
      }}
      onConfirm={async () => {
        setError(null)
        await mutation.mutateAsync()
      }}
    />
  )
}

function RevokeInviteButton({
  serverId,
  inviteId,
  inviteEmail,
}: {
  serverId: number
  inviteId: number
  inviteEmail: string
}) {
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => revokeServerInvite(serverId, inviteId),
    onSuccess: async () => {
      useAccessStore.getState().removePendingInvite(serverId, inviteId)
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiClientError
          ? mutationError.message
          : "Failed to revoke invite"
      )
    },
  })

  return (
    <ConfirmDialog
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-neutral-400 hover:bg-transparent hover:text-red-600 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-red-400"
          aria-label={`Revoke invite for ${inviteEmail}`}
        >
          <Trash2 className="size-4" />
        </Button>
      }
      title="Revoke invite"
      description={
        <>
          Revoke the pending invite for{" "}
          <span className="font-bold">{inviteEmail}</span>?
        </>
      }
      confirmLabel="Revoke"
      confirmVariant="destructive"
      error={error}
      errorTitle="Could not revoke invite"
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
        }
      }}
      onConfirm={async () => {
        setError(null)
        await mutation.mutateAsync()
      }}
    />
  )
}

function ServerAccessView({
  serverId,
  access,
  canManage,
}: ServerAccessViewProps) {
  const [memberSorting, setMemberSorting] = useState<SortingState>([])
  const [inviteSorting, setInviteSorting] = useState<SortingState>([])

  const memberRows = useMemo<AccessMemberRow[]>(
    () => [
      {
        id: access.owner.id,
        email: access.owner.email,
        role: "OWNER",
        joinedAt: null,
        memberUserId: null,
      },
      ...access.members.map((member) => ({
        id: member.userId,
        email: member.email,
        role: member.role,
        joinedAt: member.joinedAt,
        memberUserId: member.userId,
      })),
    ],
    [access]
  )

  const memberColumns = useMemo<ColumnDef<AccessMemberRow>[]>(() => {
    const baseColumns: ColumnDef<AccessMemberRow>[] = [
      {
        accessorKey: "email",
        header: "Email",
        meta: { className: "font-bold" },
        cell: ({ row }) => row.original.email,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleTag role={row.original.role} />,
      },
      {
        accessorKey: "joinedAt",
        header: "Joined",
        meta: { className: "text-neutral-500" },
        cell: ({ row }) =>
          row.original.joinedAt ? formatDate(row.original.joinedAt) : "—",
      },
    ]

    if (!canManage) {
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
          if (row.original.memberUserId === null) {
            return <span className="inline-flex size-7" aria-hidden />
          }

          return (
            <RemoveMemberButton
              serverId={serverId}
              memberUserId={row.original.memberUserId}
              memberEmail={row.original.email}
            />
          )
        },
      },
    ]
  }, [canManage, serverId])

  const pendingInviteColumns = useMemo<ColumnDef<PendingServerInvite>[]>(
    () => [
      {
        accessorKey: "email",
        header: "Email",
        meta: { className: "font-bold" },
        cell: ({ row }) => row.original.email,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <RoleTag role={row.original.role} />,
      },
      {
        accessorKey: "createdAt",
        header: "Sent",
        meta: { className: "text-neutral-500" },
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "expiresAt",
        header: "Expires",
        meta: { className: "text-neutral-500" },
        cell: ({ row }) => formatDate(row.original.expiresAt),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        meta: { className: "w-0" },
        cell: ({ row }) => (
          <RevokeInviteButton
            serverId={serverId}
            inviteId={row.original.inviteId}
            inviteEmail={row.original.email}
          />
        ),
      },
    ],
    [serverId]
  )

  const membersTable = useReactTable({
    data: memberRows,
    columns: memberColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.id),
    state: { sorting: memberSorting },
    onSortingChange: setMemberSorting,
  })

  const pendingInvitesTable = useReactTable({
    data: access.pendingInvites,
    columns: pendingInviteColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => String(row.inviteId),
    state: { sorting: inviteSorting },
    onSortingChange: setInviteSorting,
  })

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold dark:text-white">Members</h3>
          {canManage ? <InviteMemberDialog serverId={serverId} /> : null}
        </div>

        <DataTable table={membersTable} />
      </div>

      {canManage ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold dark:text-white">Pending invites</h3>

          {access.pendingInvites.length === 0 ? (
            <p className="text-neutral-500">No pending invites.</p>
          ) : (
            <DataTable table={pendingInvitesTable} />
          )}
        </div>
      ) : null}
    </div>
  )
}

export { ServerAccessView }
