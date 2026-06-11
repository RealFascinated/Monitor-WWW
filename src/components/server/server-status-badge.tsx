import type { ServerStatus } from "@/lib/api/user/servers"
import { cn } from "@/lib/utils"

const statusStyles: Record<ServerStatus, string> = {
  ONLINE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  OFFLINE:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
}

function ServerStatusBadge({ status }: { status: ServerStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-sm px-2 py-0.5 text-xs font-medium",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  )
}

export { ServerStatusBadge }
