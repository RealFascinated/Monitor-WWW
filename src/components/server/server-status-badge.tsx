import { SimpleTooltip } from "@/components/simple-tooltip"
import type { ServerStatus } from "@/lib/api/user/servers"
import { SERVER_STATUS_TOOLTIPS } from "@/lib/tooltips/copy"
import { cn } from "@/lib/utils"

const statusStyles: Record<ServerStatus, string> = {
  ONLINE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  OFFLINE: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
}

function ServerStatusBadge({ status }: { status: ServerStatus }) {
  return (
    <SimpleTooltip content={SERVER_STATUS_TOOLTIPS[status]}>
      <span
        className={cn(
          "inline-flex cursor-help items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
          statusStyles[status]
        )}
      >
        {status === "ONLINE" ? (
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-current status-pulse-dot"
          />
        ) : null}
        {status}
      </span>
    </SimpleTooltip>
  )
}

export { ServerStatusBadge }
