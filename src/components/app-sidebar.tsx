import { Link } from "@tanstack/react-router"
import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  Mail,
  Server,
  X,
} from "lucide-react"
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react"

import { CpuPercent, MemoryPercent } from "@/components/server/usage-percent"
import { MonitorLogo } from "@/components/monitor-logo"
import { Spinner } from "@/components/spinner"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { useSidebarDetailedMode } from "@/hooks/use-sidebar-detailed-mode"
import { useUserServers } from "@/hooks/use-user-servers"
import type { ServerStatus } from "@/lib/api/user/servers"
import type { User } from "@/lib/auth/types"
import { cn } from "@/lib/utils"

const MOBILE_SIDEBAR_WIDTH = 280

const navItems = [
  {
    to: "/" as const,
    label: "Dashboard",
    icon: LayoutDashboard,
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
}

function SidebarDetailedToggle({
  detailed,
  onToggle,
}: {
  detailed: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={detailed}
      aria-label="Detailed mode"
      onClick={onToggle}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
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
  )
}

function SidebarServerList({
  compact,
  onNavigate,
}: {
  compact: boolean
  onNavigate?: () => void
}) {
  const { data: servers, isPending } = useUserServers()
  const { detailed, toggleDetailed } = useSidebarDetailedMode()

  if (isPending) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1 text-neutral-500",
          compact && "justify-center"
        )}
      >
        <Spinner />
        {!compact ? <span className="text-xs">Loading servers…</span> : null}
      </div>
    )
  }

  if (!servers?.length) {
    return null
  }

  return (
    <>
      {!compact ? (
        <div className="mt-3 mb-1 flex items-center justify-between gap-2 px-2">
          <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
            Servers
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400">Detailed</span>
            <SidebarDetailedToggle detailed={detailed} onToggle={toggleDetailed} />
          </div>
        </div>
      ) : (
        <div className="my-2 border-t border-neutral-200 dark:border-monitor-gray-200" />
      )}
      <div className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
        {servers.map((server) => (
          <Link
            key={server.serverId}
            to="/servers/$serverId"
            params={{ serverId: String(server.serverId) }}
            search={{ range: "7d" }}
            onClick={onNavigate}
            title={compact ? server.serverName : undefined}
            className={cn(
              "flex w-full gap-3 rounded-sm px-2 py-1 text-sm text-neutral-500 transition-colors hover:bg-neutral-300 dark:text-neutral-400 dark:hover:bg-monitor-gray-100 dark:hover:text-white",
              "[&.active]:bg-neutral-200 [&.active]:text-black dark:[&.active]:bg-monitor-gray-200 dark:[&.active]:text-warning",
              compact ? "items-center justify-center px-0" : "items-center",
              detailed && !compact && "items-start py-1.5"
            )}
          >
            <span
              className={cn(
                "relative shrink-0",
                detailed && !compact && "mt-0.5"
              )}
            >
              <Server className="size-4" />
              <span
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 size-1.5 rounded-full ring-2 ring-white dark:ring-base",
                  statusDotStyles[server.status]
                )}
              />
            </span>
            {!compact ? (
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate">{server.serverName}</span>
                {detailed ? (
                  <span className="text-xs text-neutral-400">
                    CPU{" "}
                    <CpuPercent
                      value={server.cpuPercent}
                      className="font-medium"
                    />{" "}
                    · RAM{" "}
                    <MemoryPercent
                      usage={server.memUsage}
                      max={server.memMax}
                      className="font-medium"
                    />
                  </span>
                ) : null}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </>
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
          "fixed inset-y-0 left-0 z-50 flex w-[min(var(--mobile-sidebar-width),85vw)] flex-col border-r border-neutral-300 bg-white dark:border-monitor-gray-200 dark:bg-base lg:w-[length:var(--sidebar-inline-width)]",
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
        <MonitorLogo />
        {!compact ? (
          <p className="text-2xl font-bold tracking-wide text-black dark:text-white">
            Monitor
          </p>
        ) : null}
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
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleCollapsed}
          className="absolute -top-7 -right-3 z-10 hidden size-6 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-400 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-600 lg:flex dark:border-monitor-gray-300 dark:bg-monitor-gray-100 dark:text-neutral-400 dark:hover:bg-monitor-gray-200 dark:hover:text-white"
        >
          <ChevronLeft
            className={cn(
              "size-3.5 transition-transform",
              collapsed && "rotate-180"
            )}
          />
        </button>
        {navItems.map(({ to, label, icon: Icon, exact }) => (
          <Link
            key={to}
            to={to}
            onClick={handleNavigate}
            title={compact ? label : undefined}
            activeOptions={{ exact }}
            className={cn(
              "flex w-full items-center gap-3 rounded-sm px-2 py-1 text-sm text-neutral-500 transition-colors hover:bg-neutral-300 dark:text-neutral-400 dark:hover:bg-monitor-gray-100 dark:hover:text-white",
              "[&.active]:bg-neutral-200 [&.active]:text-black dark:[&.active]:bg-monitor-gray-200 dark:[&.active]:text-warning",
              compact && "justify-center px-0"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!compact ? <span className="truncate">{label}</span> : null}
          </Link>
        ))}
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
          "flex flex-col gap-2 border-t border-neutral-200 p-4 dark:border-monitor-gray-200",
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
        <Button
          type="button"
          variant="default"
          size={compact ? "icon-sm" : "default"}
          disabled={isLoggingOut}
          onClick={onLogout}
          title={compact ? "Sign out" : undefined}
          className={cn(compact && "w-full")}
        >
          {isLoggingOut ? <Spinner /> : compact ? <LogOut className="size-3.5" /> : null}
          {!compact ? "Sign out" : null}
        </Button>
      </div>
    </aside>
    </>
  )
}
