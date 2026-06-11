import { createFileRoute } from "@tanstack/react-router"

import { UserPendingInvites } from "@/components/user/user-pending-invites"

export const Route = createFileRoute("/_authenticated/invites/")({
  component: InvitesPage,
})

function InvitesPage() {
  return (
    <section className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Invites</h1>
        <p className="mt-2 text-neutral-500">
          Server invites sent to your email address.
        </p>
      </div>

      <UserPendingInvites />
    </section>
  )
}
