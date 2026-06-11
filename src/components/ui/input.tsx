import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "monitor-input block w-full rounded-sm border-0 bg-white px-3 py-1.5 text-sm text-black placeholder:text-neutral-300 read-only:bg-neutral-200 read-only:text-neutral-500 focus-visible:outline-none disabled:bg-neutral-200 disabled:text-neutral-500 dark:bg-monitor-gray-100 dark:text-white dark:placeholder:text-neutral-700 dark:read-only:bg-monitor-gray-100/40 dark:read-only:text-neutral-500 dark:disabled:bg-monitor-gray-100/40",
        type === "password" && "pr-10",
        className
      )}
      {...props}
    />
  )
}

export { Input }
