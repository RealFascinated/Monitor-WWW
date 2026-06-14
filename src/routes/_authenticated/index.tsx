import { createFileRoute } from "@tanstack/react-router"

import { ServersTable } from "@/components/user/servers-table"
import { pageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: pageTitle("Servers") }],
  }),
  component: ServersPage,
})

function ServersPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1>Servers</h1>
      </div>

      <ServersTable />
    </section>
  )
}
