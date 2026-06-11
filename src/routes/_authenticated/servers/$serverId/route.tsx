import { Outlet, createFileRoute } from "@tanstack/react-router"

import { userServerQueryOptions } from "@/lib/api/user/servers.queries"
import { serverPageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/servers/$serverId")({
  loader: ({ context: { queryClient }, params }) => {
    if (typeof window === "undefined") {
      return
    }

    const serverId = Number(params.serverId)
    return queryClient.ensureQueryData(userServerQueryOptions(serverId))
  },
  head: ({ loaderData }) => ({
    meta: [{ title: serverPageTitle(loaderData) }],
  }),
  component: ServerLayout,
})

function ServerLayout() {
  return <Outlet />
}
