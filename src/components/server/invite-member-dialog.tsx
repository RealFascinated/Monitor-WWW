import { useMutation } from "@tanstack/react-query"
import { Check, Copy, Plus } from "lucide-react"
import { useState } from "react"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { inviteServerMember } from "@/lib/api/user/access"
import type { ServerInviteCreatedResponse } from "@/lib/api/user/access"
import { ApiClientError } from "@/lib/auth/api"
import { useAccessStore } from "@/stores/access-store"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type InviteMemberDialogProps = {
  serverId: number
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim()

  if (!trimmed) {
    return "Email is required"
  }

  if (!EMAIL_PATTERN.test(trimmed)) {
    return "Enter a valid email address"
  }

  return null
}

function buildInviteUrl(invite: ServerInviteCreatedResponse): string {
  const params = new URLSearchParams({
    token: invite.token,
    email: invite.email,
  })

  return `${window.location.origin}/invites/accept?${params.toString()}`
}

function InviteMemberDialog({ serverId }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [createdInvite, setCreatedInvite] =
    useState<ServerInviteCreatedResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const mutation = useMutation({
    mutationFn: (request: { email: string }) =>
      inviteServerMember(serverId, request),
    onSuccess: async (invite) => {
      useAccessStore.getState().addPendingInvite(serverId, {
        inviteId: invite.inviteId,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
        createdAt: new Date().toISOString(),
      })
      setCreatedInvite(invite)
      setCopied(false)
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to send invite"
      )
    },
  })

  function resetForm() {
    setEmail("")
    setFieldError(null)
    setApiError(null)
    setCreatedInvite(null)
    setCopied(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) {
      return
    }

    setOpen(nextOpen)

    if (!nextOpen) {
      resetForm()
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateEmail(email)
    if (error) {
      setFieldError(error)
      return
    }

    setFieldError(null)
    setApiError(null)
    mutation.mutate({ email: email.trim() })
  }

  async function handleCopyInviteUrl() {
    if (!createdInvite) {
      return
    }

    await navigator.clipboard.writeText(buildInviteUrl(createdInvite))
    setCopied(true)
  }

  const inviteUrl = createdInvite ? buildInviteUrl(createdInvite) : null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="highlighted" size="sm">
          <Plus />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border border-neutral-200 sm:max-w-lg dark:border-monitor-gray-300">
        {createdInvite && inviteUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Invite created</DialogTitle>
              <DialogDescription>
                Share this link with {createdInvite.email}. They will receive
                viewer access once they accept.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-url">Invite link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-url"
                  type="url"
                  value={inviteUrl}
                  readOnly
                  className="min-w-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => void handleCopyInviteUrl()}
                >
                  {copied ? <Check /> : <Copy />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <DialogFooter className="border-t border-neutral-200 pt-3 dark:border-monitor-gray-200">
              <Button
                type="button"
                variant="highlighted"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite member</DialogTitle>
              <DialogDescription>
                Send an invite by email. They will receive viewer access once
                they accept.
              </DialogDescription>
            </DialogHeader>

            {apiError ? (
              <Callout type="danger" title="Could not send invite">
                {apiError}
              </Callout>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={fieldError ? true : undefined}
                disabled={mutation.isPending}
                required
                autoFocus
                placeholder="bob@gmail.com"
              />
              {fieldError ? (
                <p className="text-xs font-bold text-error">{fieldError}</p>
              ) : null}
            </div>

            <DialogFooter className="border-t border-neutral-200 pt-3 dark:border-monitor-gray-200">
              <Button
                type="button"
                variant="default"
                disabled={mutation.isPending}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="highlighted"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? <Spinner /> : null}
                Send invite
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { InviteMemberDialog }
