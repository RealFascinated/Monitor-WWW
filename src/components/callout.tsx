import type * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const calloutVariants = cva(
  "relative flex gap-3 rounded-sm border p-3 text-sm",
  {
    variants: {
      type: {
        warning:
          "border-warning-300 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/30",
        danger:
          "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/30",
        info: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/30",
        success:
          "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/30",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
)

const titleVariants = cva("text-sm font-bold", {
  variants: {
    type: {
      warning: "text-warning-800 dark:text-warning-300",
      danger: "text-red-800 dark:text-red-300",
      info: "text-blue-800 dark:text-blue-300",
      success: "text-green-800 dark:text-green-300",
    },
  },
  defaultVariants: {
    type: "info",
  },
})

const bodyVariants = cva("mt-1 text-sm", {
  variants: {
    type: {
      warning: "text-warning-700 dark:text-warning-200",
      danger: "text-red-700 dark:text-red-200",
      info: "text-blue-700 dark:text-blue-200",
      success: "text-green-700 dark:text-green-200",
    },
  },
  defaultVariants: {
    type: "info",
  },
})

type CalloutProps = React.ComponentProps<"div"> &
  VariantProps<typeof calloutVariants> & {
    title: string
    children?: React.ReactNode
  }

function Callout({
  className,
  type = "info",
  title,
  children,
  ...props
}: CalloutProps) {
  return (
    <div className={cn(calloutVariants({ type }), className)} {...props}>
      <p className={titleVariants({ type })}>{title}</p>
      {children ? (
        <div className={bodyVariants({ type })}>{children}</div>
      ) : null}
    </div>
  )
}

export { Callout }
