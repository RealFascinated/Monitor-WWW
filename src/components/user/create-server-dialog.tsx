import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { createServer } from "@/lib/api/user/servers"
import { userServersQueryOptions } from "@/lib/api/user/servers.queries"
import { ApiClientError } from "@/lib/auth/api"

const MAX_NAME_LENGTH = 20

function validateServerName(name: string): string | null {
  const trimmed = name.trim()

  if (!trimmed) {
    return "Name must not be empty"
  }

  if (trimmed.length > MAX_NAME_LENGTH) {
    return "Name must be at most 20 characters"
  }

  return null
}

function CreateServerDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: createServer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userServersQueryOptions.queryKey,
      })
      setOpen(false)
      resetForm()
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to create server"
      )
    },
  })

  function resetForm() {
    setName("")
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

    const error = validateServerName(name)
    if (error) {
      setFieldError(error)
      return
    }

    setFieldError(null)
    setApiError(null)
    mutation.mutate({ name: name.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="highlighted" size="sm">
          <Plus />
          Create server
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border border-neutral-200 sm:max-w-lg dark:border-monitor-gray-300">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create server</DialogTitle>
            <DialogDescription>
              Register a new server to monitor. The name can be up to{" "}
              {MAX_NAME_LENGTH} characters.
            </DialogDescription>
          </DialogHeader>

          {apiError ? (
            <Callout type="danger" title="Could not create server">
              {apiError}
            </Callout>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor="server-name">Name</Label>
            <Input
              id="server-name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={fieldError ? true : undefined}
              disabled={mutation.isPending}
              required
              autoFocus
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
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { CreateServerDialog }
