import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
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
import { serverAccessQueryOptions } from "@/lib/api/user/access.queries"
import { ApiClientError } from "@/lib/auth/api"

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

function InviteMemberDialog({ serverId }: InviteMemberDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (request: { email: string }) =>
      inviteServerMember(serverId, request),
    onSuccess: async (invite) => {
      await queryClient.invalidateQueries({
        queryKey: serverAccessQueryOptions(serverId).queryKey,
      })
      setOpen(false)
      resetForm()
      await navigate({
        to: "/invites/accept",
        search: { token: invite.token, email: invite.email },
      })
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="highlighted" size="sm">
          <Plus />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border border-neutral-200 sm:max-w-lg dark:border-monitor-gray-300">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Invite member</DialogTitle>
            <DialogDescription>
              Send an invite by email. They will receive viewer access once they
              accept.
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
      </DialogContent>
    </Dialog>
  )
}

export { InviteMemberDialog }
