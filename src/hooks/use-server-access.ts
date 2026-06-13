import { useQuery } from "@tanstack/react-query"

import { serverAccessQueryOptions } from "@/lib/api/user/access.queries"

export function useServerAccess(serverId: number) {
  return useQuery(serverAccessQueryOptions(serverId))
}
