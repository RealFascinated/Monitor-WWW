import { useMutation } from "@tanstack/react-query"
import { useState } from "react"

import { Callout } from "@/components/callout"
import { AgentInstallPanel } from "@/components/server/agent-install-panel"
import { SimpleTooltip } from "@/components/simple-tooltip"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { SETTINGS_TOOLTIPS } from "@/lib/tooltips/copy"
import { rotateIngestToken } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"

type ServerIngestTokenSectionProps = {
  serverId: number
}

function ServerIngestTokenSection({ serverId }: ServerIngestTokenSectionProps) {
  const [ingestToken, setIngestToken] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => rotateIngestToken(serverId),
    onSuccess: (response) => {
      setIngestToken(response.ingestToken)
      setApiError(null)
    },
    onError: (error) => {
      setApiError(
        error instanceof ApiClientError
          ? error.message
          : "Failed to rotate ingest token"
      )
    },
  })

  function handleRotate() {
    setApiError(null)
    mutation.mutate()
  }

  return (
    <div className="flex flex-col gap-4">
      {apiError ? (
        <Callout type="danger" title="Could not rotate ingest token">
          {apiError}
        </Callout>
      ) : ingestToken ? null : (
        <Callout type="warning" title="This invalidates the current token">
          Rotating the ingest token revokes the previous one. Update the agent
          configuration on your host with the new token.
        </Callout>
      )}

      {ingestToken ? (
        <AgentInstallPanel ingestToken={ingestToken} />
      ) : (
        <SimpleTooltip content={SETTINGS_TOOLTIPS.rotateIngestToken}>
          <Button
            type="button"
            variant="highlighted"
            size="sm"
            className="cursor-help self-start"
            disabled={mutation.isPending}
            onClick={handleRotate}
          >
            {mutation.isPending ? <Spinner /> : null}
            Rotate ingest token
          </Button>
        </SimpleTooltip>
      )}
    </div>
  )
}

export { ServerIngestTokenSection }
