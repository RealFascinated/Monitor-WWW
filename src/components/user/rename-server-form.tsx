import { useMutation } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { renameServer } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"
import { useServersStore } from "@/stores/servers-store"
import {
  MAX_SERVER_NAME_LENGTH,
  validateServerName,
} from "@/lib/server-name"

type RenameServerFormProps = {
  serverId: number
  currentName: string
}

function RenameServerForm({ serverId, currentName }: RenameServerFormProps) {
  const [name, setName] = useState(currentName)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const inputId = `rename-server-name-${serverId}`

  useEffect(() => {
    setName(currentName)
    setFieldError(null)
    setApiError(null)
  }, [currentName])

  const mutation = useMutation({
    mutationFn: (nextName: string) =>
      renameServer(serverId, { name: nextName }),
    onSuccess: (server) => {
      useServersStore.getState().upsertServer(server)
      setFieldError(null)
      setApiError(null)
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to rename server"
      )
    },
  })

  const trimmedName = name.trim()
  const isUnchanged = trimmedName === currentName
  const validationError = validateServerName(name)
  const canSave =
    !mutation.isPending && !isUnchanged && validationError === null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const error = validateServerName(name)
    if (error) {
      setFieldError(error)
      return
    }

    if (trimmedName === currentName) {
      return
    }

    setFieldError(null)
    setApiError(null)
    mutation.mutate(trimmedName)
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-2">
      <Label htmlFor={inputId}>Name</Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          value={name}
          maxLength={MAX_SERVER_NAME_LENGTH}
          onChange={(event) => {
            setName(event.target.value)
            setFieldError(null)
            setApiError(null)
          }}
          aria-invalid={fieldError ? true : undefined}
          disabled={mutation.isPending}
          required
          className="min-w-0 flex-1"
        />
        <Button
          type="submit"
          variant="highlighted"
          size="sm"
          className="shrink-0"
          disabled={!canSave}
        >
          {mutation.isPending ? <Spinner /> : null}
          Save
        </Button>
      </div>
      {fieldError ? (
        <p className="text-xs font-bold text-error">{fieldError}</p>
      ) : null}
      {apiError ? (
        <Callout type="danger" title="Could not rename server">
          {apiError}
        </Callout>
      ) : null}
    </form>
  )
}

export { RenameServerForm }
