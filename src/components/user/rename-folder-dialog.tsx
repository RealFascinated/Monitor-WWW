import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Pencil } from "lucide-react"
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
import { renameServerFolder } from "@/lib/api/user/folders"
import type { ServerFolderResponse } from "@/lib/api/user/folders"
import { ApiClientError } from "@/lib/auth/api"
import {
  MAX_FOLDER_NAME_LENGTH,
  validateFolderName,
} from "@/lib/folder-name"
import { setFolderNameOnServers } from "@/lib/servers/folder-store"

type RenameFolderDialogProps = {
  folderId: number
  currentName: string
}

function RenameFolderDialog({ folderId, currentName }: RenameFolderDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (nextName: string) =>
      renameServerFolder(folderId, { name: nextName }),
    onSuccess: (folder) => {
      setFolderNameOnServers(currentName, folder.name)
      queryClient.setQueryData<ServerFolderResponse[]>(
        ["user", "server-folders"],
        (current) =>
          current?.map((entry) =>
            entry.id === folder.id ? folder : entry
          ) ?? [folder]
      )
      setOpen(false)
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to rename folder"
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (mutation.isPending) {
      return
    }

    setOpen(nextOpen)

    if (nextOpen) {
      setName(currentName)
      setFieldError(null)
      setApiError(null)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateFolderName(name)
    if (error) {
      setFieldError(error)
      return
    }

    const trimmedName = name.trim()
    if (trimmedName === currentName) {
      setOpen(false)
      return
    }

    setFieldError(null)
    setApiError(null)
    mutation.mutate(trimmedName)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Rename folder ${currentName}`}
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-neutral-400 transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="size-3" />
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-sm border border-neutral-200 dark:border-monitor-gray-300">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
            <DialogDescription>
              Rename &ldquo;{currentName}&rdquo; for all servers assigned to
              this folder.
            </DialogDescription>
          </DialogHeader>

          {apiError ? (
            <Callout type="danger" title="Could not rename folder">
              {apiError}
            </Callout>
          ) : null}

          <div className="flex flex-col gap-2">
            <Label htmlFor={`rename-folder-${folderId}`}>Name</Label>
            <Input
              id={`rename-folder-${folderId}`}
              value={name}
              maxLength={MAX_FOLDER_NAME_LENGTH}
              onChange={(event) => {
                setName(event.target.value)
                setFieldError(null)
                setApiError(null)
              }}
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { RenameFolderDialog }
