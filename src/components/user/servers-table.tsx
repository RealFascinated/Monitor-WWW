import type { SortingState } from "@tanstack/react-table"
import { Search } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { CreateFolderDialog } from "@/components/user/create-folder-dialog"
import { CreateServerDialog } from "@/components/user/create-server-dialog"
import {
  filterServersBySearch,
  getServerTableColumns,
} from "@/components/user/server-table-columns"
import { ServersFolderTable } from "@/components/user/servers-folder-table"
import { Callout } from "@/components/callout"
import { Spinner } from "@/components/spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useMoveServerToFolder } from "@/hooks/use-move-server-to-folder"
import { useReorderServerFolders } from "@/hooks/use-reorder-server-folders"
import { useUserServers } from "@/hooks/use-user-servers"
import { userServerFoldersQueryOptions } from "@/lib/api/user/folders.queries"
import type { ServerResponse } from "@/lib/api/user/servers"
import { ApiClientError } from "@/lib/auth/api"
import { computeReorderedFolderIds } from "@/lib/servers/drag"
import { groupServersByFolder } from "@/lib/servers/group-by-folder"

function ServersTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null)
  const [draggingFolderId, setDraggingFolderId] = useState<number | null>(null)
  const [activeDropTargetKey, setActiveDropTargetKey] = useState<string | null>(
    null
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const { data: servers, isPending, error } = useUserServers()
  const { data: folders = [], isPending: foldersPending } = useQuery(
    userServerFoldersQueryOptions()
  )
  const moveServer = useMoveServerToFolder()
  const reorderFolders = useReorderServerFolders()

  const hasOwnedServers = servers.some((server) => server.role === "OWNER")
  const columns = useMemo(
    () => getServerTableColumns(hasOwnedServers),
    [hasOwnedServers]
  )

  const serversById = useMemo(
    () => new Map(servers.map((server) => [server.serverId, server])),
    [servers]
  )

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
    return map
  }, [servers])

  const filteredUngrouped = useMemo(
    () => filterServersBySearch(ungrouped, searchQuery),
    [ungrouped, searchQuery]
  )

  const folderSections = useMemo(
    () =>
      folders.map((folder) => ({
        folder,
        servers: filterServersBySearch(
          serversByFolderName.get(folder.name) ?? [],
          searchQuery
        ),
      })),
    [folders, serversByFolderName, searchQuery]
  )

  const visibleSectionCount =
    folderSections.filter((section) => section.servers.length > 0).length +
    (filteredUngrouped.length > 0 ? 1 : 0)
  const hasEmptyFolderSections =
    searchQuery.trim() === "" &&
    folderSections.some((section) => section.servers.length === 0)

  const errorMessage = error ?? null
  const isLoading = (isPending || foldersPending) && !errorMessage
  const hasContent = servers.length > 0 || folders.length > 0
  const canOrganize = folders.length > 0 && servers.length > 0
  const canReorderFolders = folders.length > 1

  const draggingServerId =
    draggingRowId != null ? Number(draggingRowId) : null
  const draggedServerFolderName =
    draggingServerId != null
      ? (serversById.get(draggingServerId)?.folderName ?? null)
      : null

  function canAcceptServerDrop(targetFolderName: string | null) {
    return draggedServerFolderName !== targetFolderName
  }

  useEffect(() => {
    if (!editMode) {
      setDraggingRowId(null)
      setDraggingFolderId(null)
      setActiveDropTargetKey(null)
    }
  }, [editMode])

  function handleEditModeToggle() {
    setEditMode((current) => !current)
    setActionError(null)
  }

  const handleServerDragStart = useCallback((rowId: string) => {
    setDraggingRowId(rowId)
    setActionError(null)
  }, [])

  const handleServerDragEnd = useCallback(() => {
    setDraggingRowId(null)
    setActiveDropTargetKey(null)
  }, [])

  const handleFolderDragStart = useCallback((folderId: number) => {
    setDraggingFolderId(folderId)
    setActionError(null)
  }, [])

  const handleFolderDragEnd = useCallback(() => {
    setDraggingFolderId(null)
    setActiveDropTargetKey(null)
  }, [])

  const handleMoveServer = useCallback(
    (serverId: number, folderName: string | null) => {
      const server = serversById.get(serverId)
      if (!server) {
        return
      }

      const currentFolder = server.folderName ?? null
      if (currentFolder === folderName) {
        return
      }

      setActionError(null)
      setDraggingRowId(null)
      setActiveDropTargetKey(null)
      moveServer.mutate(
        { serverId, folderName },
        {
          onError: (moveErr) => {
            setActionError(
              moveErr instanceof ApiClientError
                ? moveErr.message
                : "Failed to move server"
            )
          },
        }
      )
    },
    [moveServer, serversById]
  )

  const handleReorderFolder = useCallback(
    (draggedFolderId: number, targetFolderId: number) => {
      const folderIds = folders.map((folder) => folder.id)
      const nextFolderIds = computeReorderedFolderIds(
        folderIds,
        draggedFolderId,
        targetFolderId
      )

      if (nextFolderIds == null) {
        return
      }

      setActionError(null)
      setDraggingFolderId(null)
      setActiveDropTargetKey(null)
      reorderFolders.mutate(
        { folderIds: nextFolderIds },
        {
          onError: (reorderErr) => {
            setActionError(
              reorderErr instanceof ApiClientError
                ? reorderErr.message
                : "Failed to reorder folders"
            )
          },
        }
      )
    },
    [folders, reorderFolders]
  )

  const folderTableProps = useMemo(
    () => ({
      editMode,
      columns,
      sorting,
      onSortingChange: setSorting,
      draggingServerId,
      draggingFolderId,
      onServerDragStart: handleServerDragStart,
      onServerDragEnd: handleServerDragEnd,
      onFolderDragStart: handleFolderDragStart,
      onFolderDragEnd: handleFolderDragEnd,
      onDropTargetChange: setActiveDropTargetKey,
      onMoveServer: handleMoveServer,
      onReorderFolder: handleReorderFolder,
    }),
    [
      editMode,
      columns,
      sorting,
      draggingServerId,
      draggingFolderId,
      handleServerDragStart,
      handleServerDragEnd,
      handleFolderDragStart,
      handleFolderDragEnd,
      handleMoveServer,
      handleReorderFolder,
    ]
  )

  const showEditMode =
    !isLoading && (folders.length > 0 || servers.length > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        {hasContent ? (
          <div className="relative min-w-0 max-w-sm flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search servers…"
              aria-label="Search servers"
              className="pl-9"
            />
          </div>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-2">
          {showEditMode ? (
            <Button
              type="button"
              variant={editMode ? "highlighted" : "default"}
              size="sm"
              onClick={handleEditModeToggle}
            >
              {editMode ? "Done" : "Edit"}
            </Button>
          ) : null}
          <CreateFolderDialog />
          <CreateServerDialog />
        </div>
      </div>

      {editMode && (canOrganize || canReorderFolders) ? (
        <p className="text-xs text-neutral-500">
          {canOrganize && canReorderFolders
            ? "Drag servers into folders, or drag folder headers to reorder."
            : canOrganize
              ? "Drag servers by the grip handle into a folder to organize them."
              : "Drag folder headers to reorder them."}
        </p>
      ) : null}

      {actionError ? (
        <Callout type="danger" title="Could not update folders">
          {actionError}
        </Callout>
      ) : null}

      {errorMessage ? (
        <Callout type="danger" title="Could not load servers">
          {errorMessage}
        </Callout>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-2 text-neutral-500">
          <Spinner />
          <span>Loading servers…</span>
        </div>
      ) : null}

      {!isLoading && servers.length === 0 && folders.length === 0 ? (
        <p className="text-neutral-500">No servers registered yet.</p>
      ) : null}

      {!isLoading &&
      hasContent &&
      searchQuery.trim() !== "" &&
      visibleSectionCount === 0 &&
      !hasEmptyFolderSections ? (
        <p className="text-neutral-500">No servers match your search.</p>
      ) : null}

      {!isLoading &&
      (folderSections.some(
        ({ servers: folderServers }) =>
          searchQuery.trim() === "" || folderServers.length > 0
      ) ||
        filteredUngrouped.length > 0 ||
        folders.length > 0) ? (
        <div className="flex flex-col">
          {folderSections
            .filter(
              ({ servers: folderServers }) =>
                searchQuery.trim() === "" || folderServers.length > 0
            )
            .map(({ folder, servers: folderServers }) => (
              <ServersFolderTable
                key={folder.id}
                title={folder.name}
                folderId={folder.id}
                folderName={folder.name}
                dropTargetKey={`folder:${folder.id}`}
                isDropTarget={activeDropTargetKey === `folder:${folder.id}`}
                canAcceptServerDrop={canAcceptServerDrop(folder.name)}
                servers={folderServers}
                {...folderTableProps}
              />
            ))}
          {filteredUngrouped.length > 0 || folders.length > 0 ? (
            <ServersFolderTable
              title="Ungrouped"
              folderName={null}
              dropTargetKey="ungrouped"
              isDropTarget={activeDropTargetKey === "ungrouped"}
              canAcceptServerDrop={canAcceptServerDrop(null)}
              servers={filteredUngrouped}
              {...folderTableProps}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export { ServersTable }
