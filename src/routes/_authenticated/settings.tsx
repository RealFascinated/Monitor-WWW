import { createFileRoute } from "@tanstack/react-router"

import { AccountSettingsHeader } from "@/components/user/account-settings-header"
import { AccountSettingsView } from "@/components/user/account-settings-view"
import { useAuth } from "@/lib/auth"
import { pageTitle } from "@/lib/page-title"

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [{ title: pageTitle("Account") }],
  }),
  component: AccountSettingsPage,
})

function AccountSettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <section className="-mx-4 -mt-4 flex flex-col px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-mt-6 lg:px-8">
      <AccountSettingsHeader />
      <AccountSettingsView user={user} />
    </section>
  )
}
