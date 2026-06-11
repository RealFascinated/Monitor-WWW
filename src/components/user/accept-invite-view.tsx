import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { acceptServerInvite } from "@/lib/api/user/invites"
import { userPendingInvitesQueryOptions } from "@/lib/api/user/invites.queries"
import { userServersQueryOptions } from "@/lib/api/user/servers.queries"
import { ApiClientError } from "@/lib/auth/api"

type AcceptInviteViewProps = {
  token: string
  email?: string
}

function AcceptInviteView({ token, email }: AcceptInviteViewProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const acceptMutation = useMutation({
    mutationFn: () => acceptServerInvite({ token }),
    onSuccess: async (member) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: userPendingInvitesQueryOptions.queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: userServersQueryOptions.queryKey,
        }),
      ])
      await navigate({
        to: "/servers/$serverId",
        params: { serverId: String(member.serverId) },
        search: { range: "7d" },
      })
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiClientError
          ? mutationError.message
          : "Failed to accept invite"
      )
    },
  })

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold dark:text-white">Server invite</h1>
        <p className="text-neutral-500">
          {email
            ? `You've been invited to join a server as a viewer. This invite was sent to ${email}.`
            : "You've been invited to join a server as a viewer."}
        </p>
      </div>

      {error ? (
        <Callout type="danger" title="Could not accept invite">
          {error}
        </Callout>
      ) : null}

      <Button
        type="button"
        variant="highlighted"
        className="w-full"
        disabled={acceptMutation.isPending}
        onClick={() => {
          setError(null)
          acceptMutation.mutate()
        }}
      >
        {acceptMutation.isPending ? <Spinner /> : null}
        Accept invite
      </Button>
    </div>
  )
}

export { AcceptInviteView }
