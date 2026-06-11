import { useMutation } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { InviteMemberDialog } from "@/components/server/invite-member-dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  removeServerMember,
  revokeServerInvite,
} from "@/lib/api/user/access"
import type { ServerAccessListResponse } from "@/lib/api/user/access"
import { ApiClientError } from "@/lib/auth/api"
import { useAccessStore } from "@/stores/access-store"
import { formatDate } from "@/lib/formatter"

type ServerAccessViewProps = {
  serverId: number
  access: ServerAccessListResponse
  canManage: boolean
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
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold dark:text-white">Members</h3>
          {canManage ? <InviteMemberDialog serverId={serverId} /> : null}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              {canManage ? (
                <TableHead className="w-0">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow key={access.owner.id}>
              <TableCell className="font-bold">{access.owner.email}</TableCell>
              <TableCell>
                <RoleTag role="OWNER" />
              </TableCell>
              <TableCell className="text-neutral-500">—</TableCell>
              {canManage ? (
                <TableCell>
                  <span className="inline-flex size-7" aria-hidden />
                </TableCell>
              ) : null}
            </TableRow>
            {access.members.map((member) => (
              <TableRow key={member.userId}>
                <TableCell className="font-bold">{member.email}</TableCell>
                <TableCell>
                  <RoleTag role={member.role} />
                </TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(member.joinedAt)}
                </TableCell>
                {canManage ? (
                  <TableCell>
                    <RemoveMemberButton
                      serverId={serverId}
                      memberUserId={member.userId}
                      memberEmail={member.email}
                    />
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {canManage ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold dark:text-white">Pending invites</h3>

          {access.pendingInvites.length === 0 ? (
            <p className="text-neutral-500">No pending invites.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-0">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {access.pendingInvites.map((invite) => (
                  <TableRow key={invite.inviteId}>
                    <TableCell className="font-bold">{invite.email}</TableCell>
                    <TableCell>
                      <RoleTag role={invite.role} />
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(invite.createdAt)}
                    </TableCell>
                    <TableCell className="text-neutral-500">
                      {formatDate(invite.expiresAt)}
                    </TableCell>
                    <TableCell>
                      <RevokeInviteButton
                        serverId={serverId}
                        inviteId={invite.inviteId}
                        inviteEmail={invite.email}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { ServerAccessView }
