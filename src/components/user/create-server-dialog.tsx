import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useState } from "react"

import { AgentInstallPanel } from "@/components/server/agent-install-panel"
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
import type { CreatedServerResponse } from "@/lib/api/user/servers"
import { defaultMetricRangeSearch } from "@/lib/metrics/default-range"
import { MAX_SERVER_NAME_LENGTH, validateServerName } from "@/lib/server-name"
import { toastMutationError } from "@/lib/toast"

function CreateServerDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [createdServer, setCreatedServer] =
    useState<CreatedServerResponse | null>(null)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createServer,
    onSuccess: async (server) => {
      await queryClient.invalidateQueries({ queryKey: userServersQueryKey })
      setCreatedServer(server)
    },
    onError: (error) => {
      toastMutationError(
        "Could not create server",
        error,
        "Failed to create server"
      )
    },
  })

  function resetForm() {
    setName("")
    setFieldError(null)
    setCreatedServer(null)
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
      <DialogContent className="rounded-sm border border-neutral-200 sm:max-w-2xl dark:border-monitor-gray-300">
        {createdServer ? (
          <>
            <DialogHeader>
              <DialogTitle>Install the Monitor Agent</DialogTitle>
              <DialogDescription>
                <span className="font-medium text-foreground">
                  {createdServer.serverName}
                </span>{" "}
                was created. Install the agent on your host to start sending
                metrics. Status will show as PENDING until the first report
                arrives.
              </DialogDescription>
            </DialogHeader>

            <AgentInstallPanel ingestToken={createdServer.ingestToken} />

            <DialogFooter className="border-t border-neutral-200 pt-3 dark:border-monitor-gray-200">
              <Button
                type="button"
                variant="default"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
              <Button type="button" variant="highlighted" asChild>
                <Link
                  to="/servers/$serverId"
                  params={{ serverId: String(createdServer.serverId) }}
                  search={defaultMetricRangeSearch()}
                  onClick={() => handleOpenChange(false)}
                >
                  View server
                </Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create server</DialogTitle>
              <DialogDescription>
                Register a new server to monitor. After creation you will
                receive an ingest token and install instructions for the Monitor
                Agent.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="server-name">Name</Label>
              <Input
                id="server-name"
                value={name}
                maxLength={MAX_SERVER_NAME_LENGTH}
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
        )}
      </DialogContent>
    </Dialog>
  )
}

export { CreateServerDialog }
