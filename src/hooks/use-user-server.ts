import { useQuery } from "@tanstack/react-query"

import { userServerQueryOptions } from "@/lib/api/user/servers.queries"

export function useUserServer(serverId: number) {
  return useQuery(userServerQueryOptions(serverId))
}
