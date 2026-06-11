import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { ServerMetricsHeader } from "@/components/server/server-metrics-header"
import { ServerMetricsView } from "@/components/server/server-metrics-view"
import { useUserServers } from "@/hooks/use-user-servers"
import { userServerMetricsQueryOptions } from "@/lib/api/user/metrics.queries"
import { ApiClientError } from "@/lib/auth/api"

const serverMetricsSearchSchema = z.object({
  range: z
    .enum(["24h", "3d", "7d", "2w", "1mo", "3mo", "1y", "2y"])
    .default("7d"),
})

export const Route = createFileRoute("/_authenticated/servers/$serverId/")({
  validateSearch: serverMetricsSearchSchema,
  loaderDeps: ({ search: { range } }) => ({ range }),
  loader: ({ context: { queryClient }, params, deps: { range } }) => {
    if (typeof window === "undefined") {
      return
    }

    const serverId = Number(params.serverId)
    return queryClient.ensureQueryData(
      userServerMetricsQueryOptions(serverId, range)
    )
  },
  component: ServerMetricsPage,
})

function ServerMetricsPage() {
  const { serverId } = Route.useParams()
  const { range } = Route.useSearch()
  const numericServerId = Number(serverId)

  const {
    data: metrics,
    isPending,
    error,
  } = useQuery(userServerMetricsQueryOptions(numericServerId, range))

  const { data: servers } = useUserServers()
  const server = servers?.find((entry) => entry.serverId === numericServerId)

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? "Failed to load server metrics"
        : null

  return (
    <section className="flex flex-col">
      <ServerMetricsHeader
        server={server}
        range={range}
        serverId={numericServerId}
      />

      <div className="flex flex-col gap-6">
        {errorMessage ? (
          <Callout type="danger" title="Could not load metrics">
            {errorMessage}
          </Callout>
        ) : null}

        {isPending && !errorMessage ? (
          <div className="flex items-center gap-2 text-neutral-500">
            <Spinner />
            <span>Loading metrics…</span>
          </div>
        ) : null}

        {metrics && !errorMessage ? (
          <ServerMetricsView metrics={metrics} />
        ) : null}
      </div>
    </section>
  )
}
