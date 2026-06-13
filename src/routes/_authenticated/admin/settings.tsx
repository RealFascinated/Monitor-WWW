import { useQuery } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

import { AdminSettingsHeader } from "@/components/admin/admin-settings-header"
import { AdminSettingsView } from "@/components/admin/admin-settings-view"
import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { adminSettingsQueryOptions } from "@/lib/api/admin/settings.queries"
import { useAuth } from "@/lib/auth"
import { ApiClientError } from "@/lib/auth/api"
import { pageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/admin/settings")({
  ssr: false,
  loader: ({ context: { queryClient } }) => {
    return queryClient.ensureQueryData(adminSettingsQueryOptions())
  },
  head: () => ({
    meta: [{ title: pageTitle("Admin Settings") }],
  }),
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const {
    data: settings,
    isPending,
    error,
  } = useQuery({
    ...adminSettingsQueryOptions(),
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
        ? "Failed to load admin settings"
        : null

  return (
    <section className="-mx-4 -mt-4 flex flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-6 lg:px-8">
      <AdminSettingsHeader />

      {errorMessage ? (
        <Callout type="danger" title="Could not load settings">
          {errorMessage}
        </Callout>
      ) : null}

      {isPending && !errorMessage ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner />
          <span>Loading settings…</span>
        </div>
      ) : null}

      {settings && !errorMessage ? (
        <AdminSettingsView settings={settings} />
      ) : null}
    </section>
  )
}
