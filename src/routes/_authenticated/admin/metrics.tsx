import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { AdminMetricsHeader } from "@/components/admin/admin-metrics-header"
import { AdminMetricsView } from "@/components/admin/admin-metrics-view"
import { Callout } from "@/components/callout"
import { LoadingState } from "@/components/loading-state"
import { adminMetricsQueryOptions } from "@/lib/api/admin/metrics.queries"
import { useMetricRefreshInterval } from "@/hooks/use-metric-refresh-interval"
import { ApiClientError } from "@/lib/auth/api"
import { pageTitle } from "@/lib/page-title"
import { metricRangeSearchSchema } from "@/lib/schemas/range"

const adminMetricsSearchSchema = metricRangeSearchSchema("24h")

export const Route = createFileRoute("/_authenticated/admin/metrics")({
  ssr: false,
  validateSearch: adminMetricsSearchSchema,
  loaderDeps: ({ search: { range } }) => ({ range }),
  loader: ({ context: { queryClient }, deps: { range } }) => {
    return queryClient.ensureQueryData(adminMetricsQueryOptions(range))
  },
  head: () => ({
    meta: [{ title: pageTitle("Admin Metrics") }],
  }),
  component: AdminMetricsPage,
})

function AdminMetricsPage() {
  const { range } = Route.useSearch()
  const { refreshInterval, setRefreshInterval } = useMetricRefreshInterval()

  const {
    data: metrics,
    isPending,
    isFetching,
    refetch,
    error,
  } = useQuery(adminMetricsQueryOptions(range, refreshInterval))

  const errorMessage =
    error instanceof ApiClientError
      ? error.message
      : error
        ? "Failed to load admin metrics"
        : null

  return (
    <section className="-mx-4 -mt-4 flex flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-6 lg:px-8">
      <AdminMetricsHeader
        range={range}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
      />

      {errorMessage ? (
        <Callout type="danger" title="Could not load metrics">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <LoadingState message="Loading metrics…" />
      ) : null}

      {metrics && !errorMessage ? <AdminMetricsView metrics={metrics} /> : null}
    </section>
  )
}
