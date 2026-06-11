import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { ServerAccessHeader } from "@/components/server/server-access-header"
import { ServerAccessView } from "@/components/server/server-access-view"
import { useUserServers } from "@/hooks/use-user-servers"
import { serverAccessQueryOptions } from "@/lib/api/user/access.queries"
import type { ServerResponse } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"
import { serverPageTitle } from "@/lib/page-title"

export const Route = createFileRoute(
  "/_authenticated/servers/$serverId/access"
)({
  loader: ({ context: { queryClient }, params }) => {
    if (typeof window === "undefined") {
      return
    }

    const serverId = Number(params.serverId)
    return queryClient.ensureQueryData(serverAccessQueryOptions(serverId))
  },
  head: ({ matches, params }) => {
    const servers = matches.find(
      (match) =>
        (match.routeId as string) === "/_authenticated/servers/$serverId"
    )?.loaderData as ServerResponse[] | undefined

    return {
      meta: [{ title: serverPageTitle(servers, params.serverId, "Access") }],
    }
  },
  component: ServerAccessPage,
})

function ServerAccessPage() {
  const { serverId } = Route.useParams()
  const numericServerId = Number(serverId)

  const {
    data: access,
    isPending,
    error,
  } = useQuery(serverAccessQueryOptions(numericServerId))

  const { data: servers } = useUserServers()
  const server = servers?.find((entry) => entry.serverId === numericServerId)

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? "Failed to load server access"
        : null

  return (
    <section className="flex flex-col">
      <ServerAccessHeader server={server} serverId={numericServerId} />

      {errorMessage ? (
        <Callout type="danger" title="Could not load access">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner />
          <span>Loading access…</span>
        </div>
      ) : null}

      {access && !errorMessage ? (
        <ServerAccessView serverId={numericServerId} access={access} />
      ) : null}
    </section>
  )
}
