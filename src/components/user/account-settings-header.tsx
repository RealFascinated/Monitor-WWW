import { User } from "lucide-react"

import { Breadcrumb } from "@/components/breadcrumb"

function AccountSettingsHeader() {
  return (
    <div className="z-30 mb-6 flex flex-col gap-2.5 border-b border-sidebar-border bg-background/95 py-3 backdrop-blur-sm lg:sticky lg:top-0">
      <Breadcrumb
        items={[
          { label: "Servers", to: "/" },
          { label: "Account", current: true },
        ]}
      />

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <User className="size-4 text-monitor dark:text-warning" />
          <h1 className="text-xl">Account</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Your profile and personal preferences.
        </p>
      </div>
    </div>
  )
}

export { AccountSettingsHeader }
