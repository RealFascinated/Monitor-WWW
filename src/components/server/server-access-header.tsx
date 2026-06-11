import { Link } from "@tanstack/react-router"
import { ArrowLeft, Users } from "lucide-react"

import type { ServerResponse } from "@/lib/api/user/servers"
import { cn } from "@/lib/utils"

type ServerAccessHeaderProps = {
  server: ServerResponse | undefined
  serverId: number
}

function ServerAccessHeader({ server, serverId }: ServerAccessHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-14 z-30 -mx-4 mb-6 flex flex-col gap-4 border-b border-neutral-200 bg-gray-50/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8 dark:border-monitor-gray-200 dark:bg-base/95"
      )}
    >
      <Link
        to="/servers/$serverId"
        params={{ serverId: String(serverId) }}
        search={{ range: "7d" }}
        className="inline-flex w-fit items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-black dark:hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to metrics
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-neutral-500" />
          <h1 className="text-2xl font-bold dark:text-white">
            {server?.serverName ?? `Server ${serverId}`} — Access
          </h1>
        </div>
        <p className="text-sm text-neutral-500">
          Manage who can view this server&apos;s metrics.
        </p>
      </div>
    </div>
  )
}

export { ServerAccessHeader }
