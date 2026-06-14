import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { acceptServerInvite } from "@/lib/api/user/invites"
import { defaultMetricRangeSearch } from "@/lib/metrics/default-range"
import { userInvitesQueryKey } from "@/lib/api/user/invites.queries"
import { userServersQueryKey } from "@/lib/api/user/servers.queries"
import { toastMutationError } from "@/lib/toast"

type AcceptInviteViewProps = {
  token: string
  email?: string
}

function AcceptInviteView({ token, email }: AcceptInviteViewProps) {
  const navigate = useNavigate()

  const queryClient = useQueryClient()

  const acceptMutation = useMutation({
    mutationFn: () => acceptServerInvite({ token }),
    onSuccess: async (member) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userServersQueryKey }),
        queryClient.invalidateQueries({ queryKey: userInvitesQueryKey }),
      ])
      await navigate({
        to: "/servers/$serverId",
        params: { serverId: String(member.serverId) },
        search: defaultMetricRangeSearch(),
      })
    },
    onError: (mutationError) => {
      toastMutationError(
        "Could not accept invite",
        mutationError,
        "Failed to accept invite"
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

      <Button
        type="button"
        variant="highlighted"
        className="w-full"
        disabled={acceptMutation.isPending}
        onClick={() => {
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
