import { Settings } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"

function AdminSettingsHeader() {
  return (
    <div className="z-30 mb-6 flex flex-col gap-2.5 border-b border-sidebar-border bg-background/95 py-3 backdrop-blur-sm lg:sticky lg:top-0">
      <Breadcrumb
        items={[
          { label: "Servers", to: "/" },
          { label: "Admin Settings", current: true },
        ]}
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings className="size-4 text-monitor dark:text-warning" />
          <h1 className="text-xl">Admin Settings</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Platform-wide configuration for authentication and registration.
        </p>
      </div>
    </div>
  )
}

export { AdminSettingsHeader }
