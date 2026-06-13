import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { LoadingState } from "@/components/loading-state"
import { Callout } from "@/components/callout"
import { ServerAgentSetupDialog } from "@/components/server/server-agent-setup-dialog"
import { ServerMetricsHeader } from "@/components/server/server-metrics-header"
import { ServerMetricsView } from "@/components/server/server-metrics-view"
import { useUserServer } from "@/hooks/use-user-server"
import { useMetricRefreshInterval } from "@/hooks/use-metric-refresh-interval"
import { userServerMetricsQueryOptions } from "@/lib/api/user/metrics.queries"
import { ApiClientError } from "@/lib/auth/api"
import { metricRangeSearchSchema } from "@/lib/schemas/range"

const serverMetricsSearchSchema = metricRangeSearchSchema("7d")

export const Route = createFileRoute("/_authenticated/servers/$serverId/")({
  validateSearch: serverMetricsSearchSchema,
  loaderDeps: ({ search: { range } }) => ({ range }),
  loader: ({ context: { queryClient }, params, deps: { range } }) => {
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
  const { refreshInterval, setRefreshInterval } = useMetricRefreshInterval()

  const {
    data: metrics,
    isPending,
    isFetching,
    refetch,
    error,
  } = useQuery(
    userServerMetricsQueryOptions(numericServerId, range, refreshInterval)
  )

  const { data: server } = useUserServer(numericServerId)

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? "Failed to load server metrics"
        : null

  return (
    <section className="-mx-4 -mt-4 flex flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-6 lg:px-8">
      <ServerMetricsHeader
        server={server}
        range={range}
        serverId={numericServerId}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
      />

      <div className="flex flex-col gap-6">
        {server?.status === "PENDING" && server.role === "OWNER" ? (
          <Callout type="info" title="Waiting for the agent">
            <div className="flex flex-col gap-3">
              <p>
                This server has not received metrics yet. Install the Monitor
                Agent on your host to start reporting.
              </p>
              <div>
                <ServerAgentSetupDialog
                  serverId={numericServerId}
                  serverName={server.serverName}
                />
              </div>
            </div>
          </Callout>
        ) : null}

        {errorMessage ? (
          <Callout type="danger" title="Could not load metrics">
            {errorMessage}
          </Callout>
        ) : null}

        {isPending && !errorMessage ? (
          <LoadingState message="Loading metrics…" />
        ) : null}

        {metrics && !errorMessage ? (
          <ServerMetricsView metrics={metrics} />
        ) : null}
      </div>
    </section>
  )
}
