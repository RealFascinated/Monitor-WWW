import { useNavigate } from "@tanstack/react-router"

import { ServerAccessView } from "@/components/server/server-access-view"
import { ServerIngestTokenSection } from "@/components/server/server-ingest-token-section"
import { SettingsPageContent } from "@/components/settings/settings-page-content"
import { SettingsSectionHeader } from "@/components/settings/settings-section-header"
import { DeleteServerButton } from "@/components/user/delete-server-button"
import { RenameServerForm } from "@/components/user/rename-server-form"
import { ServerFolderForm } from "@/components/user/server-folder-form"
import type { ServerAccessListResponse } from "@/lib/api/user/access"
import type { ServerResponse } from "@/lib/api/user/servers"

type ServerSettingsViewProps = {
  serverId: number
  server: ServerResponse
  access: ServerAccessListResponse
}

function ServerSettingsView({
  serverId,
  server,
  access,
}: ServerSettingsViewProps) {
  const navigate = useNavigate()
  const isOwner = server.role === "OWNER"

  return (
    <SettingsPageContent>
      {isOwner ? (
        <section className="flex flex-col gap-3">
          <SettingsSectionHeader
            title="General"
            description="Display name shown across the servers list and server pages."
          />
          <RenameServerForm
            serverId={serverId}
            currentName={server.serverName}
          />
        </section>
      ) : null}

      {isOwner ? (
        <section className="flex flex-col gap-3">
          <SettingsSectionHeader
            title="Monitor Agent"
            description="Connection status, ingest token, and install instructions."
          />
          <ServerIngestTokenSection
            serverId={serverId}
            status={server.status}
            agentVersion={server.agentVersion}
          />
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <SettingsSectionHeader
          title="Access"
          description="Manage who can view this server's metrics."
        />
        <ServerAccessView
          serverId={serverId}
          access={access}
          canManage={isOwner}
        />
      </section>

      {isOwner ? (
        <section className="flex flex-col gap-3">
          <SettingsSectionHeader
            title="Danger zone"
            description="Permanently delete this server and all stored metrics."
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-neutral-500">
              This action cannot be undone.
            </p>
            <DeleteServerButton
              serverId={serverId}
              serverName={server.serverName}
              variant="destructive"
              onDeleted={() => {
                void navigate({ to: "/" })
              }}
            />
          </div>
        </section>
      ) : null}
    </SettingsPageContent>
  )
}

export { ServerSettingsView }
