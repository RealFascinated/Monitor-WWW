import { Link } from "@tanstack/react-router"
import {
  ChevronLeft,
  ChevronRight,
  Gauge,
  LogOut,
  Mail,
  Server,
  Settings,
  X,
} from "lucide-react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { CpuPercent, MemoryPercent } from "@/components/server/usage-percent"
import { MonitorLogo } from "@/components/monitor-logo"
import { SimpleTooltip } from "@/components/simple-tooltip"
import { Spinner } from "@/components/spinner"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { useSidebarDetailedMode } from "@/hooks/use-sidebar-detailed-mode"
import { useUserServers } from "@/hooks/use-user-servers"
import { userServerFoldersQueryOptions } from "@/lib/api/user/folders.queries"
import type { ServerResponse, ServerStatus } from "@/lib/api/user/servers"
import type { User } from "@/lib/auth/types"
import { groupServersByFolder } from "@/lib/servers/group-by-folder"
import { SERVER_STATUS_TOOLTIPS, SIDEBAR_TOOLTIPS } from "@/lib/tooltips/copy"
import { cn } from "@/lib/utils"

const MOBILE_SIDEBAR_WIDTH = 280

const navItems = [
  {
    to: "/" as const,
    label: "Servers",
    icon: Server,
    exact: true,
  },
  {
    to: "/invites" as const,
    label: "Invites",
    icon: Mail,
    exact: true,
  },
] as const

const statusDotStyles: Record<ServerStatus, string> = {
  ONLINE: "bg-green-500",
  OFFLINE: "bg-red-500",
  PENDING: "bg-amber-500",
}

function SidebarDetailedToggle({
  detailed,
  onToggle,
}: {
  detailed: boolean
  onToggle: () => void
}) {
  return (
    <SimpleTooltip content={SIDEBAR_TOOLTIPS.detailedMode}>
      <button
        type="button"
        role="switch"
        aria-checked={detailed}
        aria-label="Detailed mode"
        onClick={onToggle}
        className={cn(
          "relative h-5 w-9 shrink-0 cursor-help rounded-full transition-colors",
          detailed
            ? "bg-monitor dark:bg-warning"
            : "bg-neutral-200 dark:bg-monitor-gray-300"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
            detailed && "translate-x-4"
          )}
        />
      </button>
    </SimpleTooltip>
  )
}

function SidebarAdminLink({
  compact,
  onNavigate,
  to,
  search,
  icon: Icon,
  label,
  tooltip,
}: {
  compact: boolean
  onNavigate?: () => void
  to: "/admin/metrics" | "/admin/settings"
  search?: { range: "24h" }
  icon: typeof Gauge
  label: string
  tooltip: string
}) {
  const link = (
    <Link
      to={to}
      search={search}
      onClick={onNavigate}
      className={cn(
        "flex min-h-7 w-full items-center gap-3 rounded-sm px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
        "[&.active]:bg-neutral-200 [&.active]:text-black dark:[&.active]:bg-monitor-gray-200 dark:[&.active]:text-warning",
        compact && "justify-center px-0",
        compact && "cursor-help"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!compact ? <span className="truncate">{label}</span> : null}
    </Link>
  )

  if (compact) {
    return <SimpleTooltip content={tooltip}>{link}</SimpleTooltip>
  }

  return link
}

function SidebarAdminSection({
  compact,
  onNavigate,
}: {
  compact: boolean
  onNavigate?: () => void
}) {
  return (
    <div className="flex shrink-0 flex-col">
      {!compact ? (
        <p className="mt-3 mb-1 px-2 text-xs font-medium tracking-wide text-neutral-400 uppercase">
          Admin
        </p>
      ) : (
        <div className="my-2 shrink-0 border-t border-sidebar-border" />
      )}

      <SidebarAdminLink
        compact={compact}
        onNavigate={onNavigate}
        to="/admin/settings"
        icon={Settings}
        label="Settings"
        tooltip={SIDEBAR_TOOLTIPS.adminSettings}
      />
      <SidebarAdminLink
        compact={compact}
        onNavigate={onNavigate}
        to="/admin/metrics"
        search={{ range: "24h" }}
        icon={Gauge}
        label="Metrics"
        tooltip={SIDEBAR_TOOLTIPS.adminMetrics}
      />
    </div>
  )
}

const UNGROUPED_SIDEBAR_KEY = "Ungrouped"

function SidebarServerItem({
  server,
  compact,
  detailed,
  onNavigate,
  nested = false,
}: {
  server: ServerResponse
  compact: boolean
  detailed: boolean
  onNavigate?: () => void
  nested?: boolean
}) {
  const serverTooltip = `${server.serverName} — ${SERVER_STATUS_TOOLTIPS[server.status]}`

  return (
    <SimpleTooltip content={serverTooltip}>
      <Link
        to="/servers/$serverId"
        params={{ serverId: String(server.serverId) }}
        search={{ range: "7d" }}
        onClick={onNavigate}
        className={cn(
          "flex w-full shrink-0 cursor-help rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
          "[&.active]:bg-neutral-200 [&.active]:text-black dark:[&.active]:bg-monitor-gray-200 dark:[&.active]:text-warning",
          nested && !compact && "pl-4",
          compact
            ? "min-h-7 items-center justify-center gap-3 px-0 py-1"
            : detailed
              ? "items-center gap-2 px-2 py-1"
              : "min-h-7 items-center gap-3 px-2 py-1"
        )}
      >
        <span className="relative shrink-0">
          <Server className="size-4" />
          <SimpleTooltip content={SERVER_STATUS_TOOLTIPS[server.status]}>
            <span
              className={cn(
                "absolute -right-0.5 -bottom-0.5 size-1.5 cursor-help rounded-full ring-2 ring-white dark:ring-base",
                statusDotStyles[server.status]
              )}
            />
          </SimpleTooltip>
        </span>
        {!compact ? (
          <span
            className={cn(
              "flex min-w-0 flex-1 flex-col",
              detailed ? "gap-0 leading-tight" : "gap-0.5"
            )}
          >
            <span className="truncate leading-tight">{server.serverName}</span>
            {detailed ? (
              <span className="truncate text-[11px] leading-tight text-neutral-400">
                CPU{" "}
                <CpuPercent
                  value={server.cpuPercent}
                  status={server.status}
                  className="font-medium"
                />{" "}
                · RAM{" "}
                <MemoryPercent
                  usage={server.memUsage}
                  max={server.memMax}
                  status={server.status}
                  className="font-medium"
                />
              </span>
            ) : null}
          </span>
        ) : null}
      </Link>
    </SimpleTooltip>
  )
}

function SidebarFolderGroup({
  folderName,
  servers,
  compact,
  detailed,
  expanded,
  onToggle,
  onNavigate,
}: {
  folderName: string
  servers: ServerResponse[]
  compact: boolean
  detailed: boolean
  expanded: boolean
  onToggle: () => void
  onNavigate?: () => void
}) {
  if (compact) {
    return (
      <>
        {servers.map((server) => (
          <SidebarServerItem
            key={server.serverId}
            server={server}
            compact={compact}
            detailed={detailed}
            onNavigate={onNavigate}
          />
        ))}
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-0.5 pr-1">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-1 rounded-sm px-2 py-1 text-left text-xs leading-snug font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
        >
          <ChevronRight
            aria-hidden
            className={cn(
              "size-3 shrink-0 opacity-60 transition-transform duration-150",
              expanded && "rotate-90"
            )}
          />
          <span className="truncate">{folderName}</span>
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground tabular-nums">
            {servers.length}
          </span>
        </button>
      </div>

      {expanded ? (
        <div className="flex flex-col gap-px pb-0.5">
          {servers.map((server) => (
            <SidebarServerItem
              key={server.serverId}
              server={server}
              compact={compact}
              detailed={detailed}
              onNavigate={onNavigate}
              nested
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SidebarServerList({
  compact,
  onNavigate,
}: {
  compact: boolean
  onNavigate?: () => void
}) {
  const { data: servers } = useUserServers()
  const { data: folders = [] } = useQuery(userServerFoldersQueryOptions())
  const { detailed, toggleDetailed } = useSidebarDetailedMode()
  const { ungrouped } = useMemo(() => groupServersByFolder(servers), [servers])

  const serversByFolderName = useMemo(() => {
    const map = new Map<string, ServerResponse[]>()
    for (const server of servers) {
      if (!server.folderName) {
        continue
      }
      const list = map.get(server.folderName) ?? []
      list.push(server)
      map.set(server.folderName, list)
    }
    for (const [folderName, folderServers] of map) {
      map.set(
        folderName,
        folderServers.sort((a, b) => a.serverName.localeCompare(b.serverName))
      )
    }
    return map
  }, [servers])

  const folderNamesKey = [
    ...folders.map((folder) => folder.name),
    UNGROUPED_SIDEBAR_KEY,
  ].join("\0")
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const initial = new Set(folders.map((folder) => folder.name))
    initial.add(UNGROUPED_SIDEBAR_KEY)
    return initial
  })

  useEffect(() => {
    setExpandedFolders((current) => {
      const next = new Set(current)
      for (const folder of folders) {
        next.add(folder.name)
      }
      next.add(UNGROUPED_SIDEBAR_KEY)
      return next
    })
  }, [folderNamesKey, folders])

  function toggleFolder(folderName: string) {
    setExpandedFolders((current) => {
      const next = new Set(current)
      if (next.has(folderName)) {
        next.delete(folderName)
      } else {
        next.add(folderName)
      }
      return next
    })
  }

  if (!servers.length) {
    return null
  }

  const hasFolders = folders.length > 0
  const showGroupedSidebar = hasFolders && !compact

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!compact ? (
        <div className="mt-3 mb-1 flex shrink-0 items-center justify-between gap-2 px-2">
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            Servers
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Detailed</span>
            <SidebarDetailedToggle
              detailed={detailed}
              onToggle={toggleDetailed}
            />
          </div>
        </div>
      ) : (
        <div className="my-2 shrink-0 border-t border-sidebar-border" />
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {showGroupedSidebar
          ? folders.map((folder) => (
              <SidebarFolderGroup
                key={folder.id}
                folderName={folder.name}
                servers={serversByFolderName.get(folder.name) ?? []}
                compact={compact}
                detailed={detailed}
                expanded={expandedFolders.has(folder.name)}
                onToggle={() => toggleFolder(folder.name)}
                onNavigate={onNavigate}
              />
            ))
          : null}
        {showGroupedSidebar ? (
          <SidebarFolderGroup
            folderName={UNGROUPED_SIDEBAR_KEY}
            servers={ungrouped}
            compact={compact}
            detailed={detailed}
            expanded={expandedFolders.has(UNGROUPED_SIDEBAR_KEY)}
            onToggle={() => toggleFolder(UNGROUPED_SIDEBAR_KEY)}
            onNavigate={onNavigate}
          />
        ) : null}
        {(compact || !hasFolders ? servers : []).map((server) => (
          <SidebarServerItem
            key={server.serverId}
            server={server}
            compact={compact}
            detailed={detailed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  )
}

type AppSidebarProps = {
  user: User
  width: number
  compact: boolean
  collapsed: boolean
  isResizing: boolean
  mobileOpen: boolean
  onToggleCollapsed: () => void
  onResizeStart: (event: ReactPointerEvent<HTMLDivElement>) => void
  onMobileClose: () => void
  isLoggingOut: boolean
  onLogout: () => void
}

export function AppSidebar({
  user,
  width,
  compact,
  collapsed,
  isResizing,
  mobileOpen,
  onToggleCollapsed,
  onResizeStart,
  onMobileClose,
  isLoggingOut,
  onLogout,
}: AppSidebarProps) {
  function handleNavigate() {
    onMobileClose()
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={onMobileClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-150 ease-out lg:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      <aside
        style={
          {
            "--sidebar-inline-width": `${width}px`,
            "--mobile-sidebar-width": `${MOBILE_SIDEBAR_WIDTH}px`,
          } as CSSProperties
        }
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(var(--mobile-sidebar-width),85vw)] flex-col border-r border-sidebar-border bg-sidebar lg:w-[length:var(--sidebar-inline-width)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          !mobileOpen && "pointer-events-none lg:pointer-events-auto",
          "transition-transform duration-150 ease-out lg:duration-200 lg:ease-in-out",
          !isResizing && "lg:transition-[width,transform]"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 p-4",
            compact && "justify-center px-2"
          )}
        >
          <Link
            to="/"
            onClick={handleNavigate}
            aria-label="Servers"
            className="flex items-center gap-2"
          >
            <MonitorLogo />
            {!compact ? (
              <p className="text-2xl font-bold tracking-wide text-black dark:text-white">
                Monitor
              </p>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onMobileClose}
            className="ml-auto flex size-8 items-center justify-center rounded-sm text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-700 lg:hidden dark:hover:bg-monitor-gray-200 dark:hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-2">
          <SimpleTooltip
            content={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapsed}
              className="absolute -top-7 -right-3 z-10 hidden size-6 cursor-help items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-600 lg:flex dark:border-monitor-gray-300 dark:bg-monitor-gray-100 dark:text-neutral-400 dark:hover:bg-monitor-gray-200 dark:hover:text-white"
            >
              <ChevronLeft
                className={cn(
                  "size-3.5 transition-transform",
                  collapsed && "rotate-180"
                )}
              />
            </button>
          </SimpleTooltip>
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const link = (
              <Link
                to={to}
                onClick={handleNavigate}
                activeOptions={{ exact }}
                className={cn(
                  "flex min-h-7 w-full items-center gap-3 rounded-sm px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                  "[&.active]:bg-neutral-200 [&.active]:text-black dark:[&.active]:bg-monitor-gray-200 dark:[&.active]:text-warning",
                  compact && "justify-center px-0",
                  compact && "cursor-help"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!compact ? <span className="truncate">{label}</span> : null}
              </Link>
            )

            return compact ? (
              <SimpleTooltip key={to} content={label}>
                {link}
              </SimpleTooltip>
            ) : (
              <span key={to}>{link}</span>
            )
          })}
          {user.role === "ADMIN" ? (
            <SidebarAdminSection
              compact={compact}
              onNavigate={handleNavigate}
            />
          ) : null}
          <SidebarServerList compact={compact} onNavigate={handleNavigate} />
        </nav>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          onPointerDown={onResizeStart}
          className="absolute top-0 right-0 z-20 hidden h-full w-1 cursor-col-resize touch-none hover:bg-neutral-300/80 active:bg-neutral-400/80 lg:block dark:hover:bg-monitor-gray-300/80 dark:active:bg-monitor-gray-400/80"
        />

        <div
          className={cn(
            "flex flex-col gap-2 border-t border-sidebar-border p-4",
            compact && "items-center px-2"
          )}
        >
          {!compact ? (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">Theme</span>
              <ThemeSwitcher />
            </div>
          ) : (
            <ThemeSwitcher />
          )}
          {!compact ? (
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          ) : null}
          {compact ? (
            <SimpleTooltip content={SIDEBAR_TOOLTIPS.signOut}>
              <Button
                type="button"
                variant="default"
                size="icon-sm"
                disabled={isLoggingOut}
                onClick={onLogout}
                className="w-full cursor-help"
              >
                {isLoggingOut ? <Spinner /> : <LogOut className="size-3.5" />}
              </Button>
            </SimpleTooltip>
          ) : (
            <Button
              type="button"
              variant="default"
              disabled={isLoggingOut}
              onClick={onLogout}
            >
              {isLoggingOut ? <Spinner /> : null}
              Sign out
            </Button>
          )}
        </div>
      </aside>
    </>
  )
}
