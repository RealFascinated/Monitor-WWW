import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { AdminMetricsHeader } from "@/components/admin/admin-metrics-header"
import { AdminMetricsView } from "@/components/admin/admin-metrics-view"
import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { adminMetricsQueryOptions } from "@/lib/api/admin/metrics.queries"
import { useAuth } from "@/lib/auth"
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
  const { user } = useAuth()
  const navigate = useNavigate()
  const { range } = Route.useSearch()

  const {
    data: metrics,
    isPending,
    isFetching,
    refetch,
    error,
  } = useQuery({
    ...adminMetricsQueryOptions(range),
    enabled: user?.role === "ADMIN",
  })

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      void navigate({ to: "/" })
    }
  }, [user, navigate])

  if (!user || user.role !== "ADMIN") {
    return null
  }

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
        onRefresh={() => void refetch()}
        isRefreshing={isFetching}
      />

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

      {metrics && !errorMessage ? <AdminMetricsView metrics={metrics} /> : null}
    </section>
  )
}
