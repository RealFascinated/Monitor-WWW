import { queryOptions } from "@tanstack/react-query"

import { getUserServers } from "@/lib/api/user/servers"

export const userServersQueryOptions = queryOptions({
  queryKey: ["user", "servers"],
  queryFn: getUserServers,
  refetchInterval: 30_000,
})
