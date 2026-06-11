import { createFileRoute } from "@tanstack/react-router"

import { ServersTable } from "@/components/user/servers-table"
import { useAuth } from "@/lib/auth"
import { pageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: pageTitle("Dashboard") }],
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <p className="mt-2 text-neutral-500">
          Signed in as{" "}
          <span className="font-bold text-monitor dark:text-warning">
            {user.email}
          </span>{" "}
          ({user.role})
        </p>
      </div>

      <ServersTable />
    </section>
  )
}
