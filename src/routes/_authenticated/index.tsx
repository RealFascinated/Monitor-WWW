import { createFileRoute } from "@tanstack/react-router"

import { SimpleTooltip } from "@/components/simple-tooltip"
import { ServersTable } from "@/components/user/servers-table"
import { useAuth } from "@/lib/auth"
import { pageTitle } from "@/lib/page-title"
import { USER_ROLE_TOOLTIPS } from "@/lib/tooltips/copy"

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: pageTitle("Servers") }],
  }),
  component: ServersPage,
})

function ServersPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1>Servers</h1>
        <p className="mt-2 text-muted-foreground">
          Signed in as{" "}
          <span className="font-bold text-monitor dark:text-warning">
            {user.email}
          </span>{" "}
          (
          <SimpleTooltip content={USER_ROLE_TOOLTIPS[user.role]}>
            <span className="cursor-help">{user.role}</span>
          </SimpleTooltip>
          )
        </p>
      </div>

      <ServersTable />
    </section>
  )
}
