import * as React from "react"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border-2 bg-clip-padding text-sm font-medium normal-case whitespace-nowrap transition-colors outline-none select-none min-w-fit disabled:cursor-not-allowed disabled:border-transparent disabled:bg-transparent disabled:text-neutral-300 disabled:hover:bg-transparent dark:disabled:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-monitor focus-visible:ring-offset-2 dark:focus-visible:ring-warning dark:focus-visible:ring-offset-base aria-invalid:border-error aria-invalid:ring-error/20 dark:aria-invalid:border-error/50 dark:aria-invalid:ring-error/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-neutral-200 bg-white text-black hover:bg-neutral-100 hover:text-black dark:border-monitor-gray-300 dark:bg-monitor-gray-100 dark:text-white dark:hover:bg-monitor-gray-200 dark:hover:text-white",
        highlighted:
          "border-monitor bg-monitor-50 text-monitor-200 hover:bg-monitor hover:text-white dark:border-monitor-100 dark:bg-monitor/20 dark:text-white dark:hover:bg-monitor-100 dark:hover:text-white",
        destructive:
          "border-red-300 bg-red-50 text-red-800 hover:bg-red-300 hover:text-white dark:border-red-800 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-800 dark:hover:text-white",
        outline:
          "border-neutral-200 bg-white text-black hover:bg-neutral-100 dark:border-monitor-gray-300 dark:bg-monitor-gray-100 dark:text-white dark:hover:bg-monitor-gray-200",
        secondary:
          "border-neutral-200 bg-neutral-100 text-black hover:bg-neutral-200 dark:border-monitor-gray-300 dark:bg-monitor-gray-200 dark:text-white dark:hover:bg-monitor-gray-300",
        ghost:
          "border-transparent bg-transparent text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-monitor-gray-100",
        link: "h-auto border-transparent bg-transparent p-0 text-monitor underline-offset-4 hover:underline dark:text-warning",
      },
      size: {
        default:
          "h-8 px-2 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
