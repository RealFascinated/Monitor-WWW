import { useQuery } from "@tanstack/react-query"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { userPendingInvitesQueryOptions } from "@/lib/api/user/invites.queries"
import { ApiClientError } from "@/lib/auth/api"
import { formatDate } from "@/lib/formatter"

function formatRole(role: string): string {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function UserPendingInvites() {
  const {
    data: invites,
    isPending,
    error,
  } = useQuery(userPendingInvitesQueryOptions)

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? "Failed to load invites"
        : null

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

      {invites && invites.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Server</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invite) => (
              <TableRow key={invite.inviteId}>
                <TableCell className="font-medium">
                  {invite.serverName}
                </TableCell>
                <TableCell>{formatRole(invite.role)}</TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(invite.createdAt)}
                </TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(invite.expiresAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </div>
  )
}

export { UserPendingInvites }
