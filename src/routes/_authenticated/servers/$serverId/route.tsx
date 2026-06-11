import { Outlet, createFileRoute } from "@tanstack/react-router"

import { serverPageTitle } from "@/lib/page-title"
import { useServersStore } from "@/stores/servers-store"

export const Route = createFileRoute("/_authenticated/servers/$serverId")({
  ssr: false,
  loader: async ({ params }) => {
    const serverId = Number(params.serverId)
    return useServersStore.getState().ensureServer(serverId)
  },
  head: ({ loaderData }) => ({
    meta: [{ title: serverPageTitle(loaderData) }],
  }),
  component: ServerLayout,
})

function ServerLayout() {
  return <Outlet />
}
