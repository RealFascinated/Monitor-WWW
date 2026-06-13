import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
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
import { deleteServerFolder } from "@/lib/api/user/folders"
import type { ServerFolderResponse } from "@/lib/api/user/folders"
import { ApiClientError } from "@/lib/auth/api"
import { setFolderNameOnServers } from "@/lib/servers/folder-store"

type DeleteFolderButtonProps = {
  folderId: number
  folderName: string
}

function DeleteFolderButton({ folderId, folderName }: DeleteFolderButtonProps) {
  const [open, setOpen] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteServerFolder(folderId),
    onSuccess: () => {
      setFolderNameOnServers(folderName, null)
      queryClient.setQueryData<ServerFolderResponse[]>(
        ["user", "server-folders"],
        (current) => current?.filter((entry) => entry.id !== folderId) ?? []
      )
      setOpen(false)
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to delete folder"
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) {
      return
    }

    setOpen(nextOpen)

    if (nextOpen) {
      setApiError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Delete folder ${folderName}`}
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:bg-muted hover:text-error"
        >
          <Trash2 className="size-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border border-neutral-200 dark:border-monitor-gray-300">
        <DialogHeader>
          <DialogTitle>Delete folder</DialogTitle>
          <DialogDescription>
            Delete &ldquo;{folderName}&rdquo;? Servers in this folder will be
            ungrouped but not deleted.
          </DialogDescription>
        </DialogHeader>

        {apiError ? (
          <Callout type="danger" title="Could not delete folder">
            {apiError}
          </Callout>
        ) : null}

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
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? <Spinner /> : null}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { DeleteFolderButton }
