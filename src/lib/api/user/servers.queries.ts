import { queryOptions } from "@tanstack/react-query"

import { getUserServer, getUserServers } from "@/lib/api/user/servers"

export const userServersQueryOptions = queryOptions({
  queryKey: ["user", "servers"],
  queryFn: getUserServers,
  refetchInterval: 30_000,
})

export function userServerQueryOptions(serverId: number) {
  return queryOptions({
    queryKey: ["user", "servers", serverId],
    queryFn: () => getUserServer(serverId),
    refetchInterval: 30_000,
  })
}
