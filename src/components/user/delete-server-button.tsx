import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
import { useState } from "react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { deleteServer } from "@/lib/api/user/servers"
import { userServersQueryOptions } from "@/lib/api/user/servers.queries"
import { ApiClientError } from "@/lib/auth/api"

type DeleteServerButtonProps = {
  serverId: number
  serverName: string
  onDeleted?: () => void
  variant?: "icon" | "destructive"
}

function DeleteServerButton({
  serverId,
  serverName,
  onDeleted,
  variant = "icon",
}: DeleteServerButtonProps) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => deleteServer(serverId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userServersQueryOptions.queryKey,
      })
      onDeleted?.()
    },
    onError: (mutationError) => {
      setError(
        mutationError instanceof ApiClientError
          ? mutationError.message
          : "Failed to delete server"
      )
    },
  })

  return (
    <ConfirmDialog
      trigger={
        variant === "destructive" ? (
          <Button type="button" variant="destructive" size="sm">
            <Trash2 className="size-4" />
            Delete server
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-neutral-400 hover:bg-transparent hover:text-red-600 dark:text-neutral-500 dark:hover:bg-transparent dark:hover:text-red-400"
            aria-label={`Delete ${serverName}`}
          >
            <Trash2 className="size-4" />
          </Button>
        )
      }
      title="Delete server"
      description={
        <>
          Are you sure you want to delete{" "}
          <span className="font-bold">{serverName}</span>? This cannot be
          undone.
        </>
      }
      confirmLabel="Delete"
      confirmVariant="destructive"
      error={error}
      errorTitle="Could not delete server"
      onOpenChange={(open) => {
        if (!open) {
          setError(null)
        }
      }}
      onConfirm={async () => {
        setError(null)
        await mutation.mutateAsync()
      }}
    />
  )
}

export { DeleteServerButton }
