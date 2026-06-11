import { Outlet, createFileRoute } from "@tanstack/react-router"

import { userServersQueryOptions } from "@/lib/api/user/servers.queries"
import { serverPageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/servers/$serverId")({
  loader: ({ context: { queryClient } }) => {
    if (typeof window === "undefined") {
      return
    }

    return queryClient.ensureQueryData(userServersQueryOptions)
  },
  head: ({ loaderData, params }) => ({
    meta: [{ title: serverPageTitle(loaderData, params.serverId) }],
  }),
  component: ServerLayout,
})

function ServerLayout() {
  return <Outlet />
}
