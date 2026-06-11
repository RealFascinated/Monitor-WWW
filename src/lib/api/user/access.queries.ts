import { queryOptions } from "@tanstack/react-query"

import { getServerAccess } from "@/lib/api/user/access"

export function serverAccessQueryOptions(serverId: number) {
  return queryOptions({
    queryKey: ["servers", serverId, "access"],
    queryFn: () => getServerAccess(serverId),
  })
}
