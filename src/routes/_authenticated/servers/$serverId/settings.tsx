import { createFileRoute } from "@tanstack/react-router"

import { Callout } from "@/components/callout"
import { LoadingState } from "@/components/loading-state"
import { ServerSettingsHeader } from "@/components/server/server-settings-header"
import { ServerSettingsView } from "@/components/server/server-settings-view"
import { useServerAccess } from "@/hooks/use-server-access"
import { useUserServer } from "@/hooks/use-user-server"
import { serverAccessQueryOptions } from "@/lib/api/user/access.queries"
import type { ServerResponse } from "@/lib/api/user/servers"
import { serverPageTitle } from "@/lib/page-title"

export const Route = createFileRoute(
  "/_authenticated/servers/$serverId/settings"
)({
  loader: ({ context, params }) => {
    const serverId = Number(params.serverId)
    return context.queryClient.ensureQueryData(
      serverAccessQueryOptions(serverId)
    )
  },
  head: ({ matches }) => {
    const servers = matches.find(
      (match) =>
        (match.routeId as string) === "/_authenticated/servers/$serverId"
    )?.loaderData as ServerResponse | undefined

    return {
      meta: [{ title: serverPageTitle(servers, "Settings") }],
    }
  },
  component: ServerSettingsPage,
})

function ServerSettingsPage() {
  const { serverId } = Route.useParams()
  const numericServerId = Number(serverId)

  const { data: access, isPending, error } = useServerAccess(numericServerId)
  const { data: server } = useUserServer(numericServerId)

  const errorMessage = error instanceof Error ? error.message : null

  return (
    <section className="-mx-4 -mt-4 flex flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-6 lg:px-8">
      <ServerSettingsHeader server={server} serverId={numericServerId} />

      {errorMessage ? (
        <Callout type="danger" title="Could not load settings">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <LoadingState message="Loading settings…" />
      ) : null}

      {!errorMessage && access && server ? (
        <ServerSettingsView
          serverId={numericServerId}
          server={server}
          access={access}
        />
      ) : null}
    </section>
  )
}
