import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import type { Row } from "@tanstack/react-table"
import { GripVertical } from "lucide-react"

import { TableCell, TableRow } from "@/components/ui/table"
import type { ServerTableRow } from "@/components/user/server-table-columns"
import { useUserServer } from "@/hooks/use-user-server"
import type { ServerResponse } from "@/lib/api/user/servers"
import { SERVER_DRAG_MIME } from "@/lib/servers/drag"
import { cn } from "@/lib/utils"

const ServerTableRowContext = createContext<ServerResponse | null>(null)

type ServerRowDragConfig = {
  draggingRowId: string | null
  getServerId: (row: Row<ServerTableRow>) => number
  getServerLabel: (row: Row<ServerTableRow>) => string
  onDragStart: (rowId: string) => void
  onDragEnd: () => void
}

export function ServerTableRowProvider({
  serverId,
  children,
}: {
  serverId: number
  children: ReactNode
}) {
  const { data: server } = useUserServer(serverId)

  if (!server) {
    return null
  }

  return (
    <ServerTableRowContext.Provider value={server}>
      {children}
    </ServerTableRowContext.Provider>
  )
}

function useServerTableRow() {
  const server = useContext(ServerTableRowContext)
  if (!server) {
    throw new Error(
      "useServerTableRow must be used within ServerTableRowProvider"
    )
  }
  return server
}

export function ServerTableDataRow({
  row,
  rowDrag,
}: {
  row: Row<ServerTableRow>
  rowDrag?: ServerRowDragConfig
}) {
  return (
    <TableRow
      className={cn(rowDrag?.draggingRowId === row.id && "opacity-40")}
    >
      {rowDrag ? (
        <TableCell className="w-0 px-2">
          <button
            type="button"
            draggable
            aria-label={`Move ${rowDrag.getServerLabel(row)}`}
            className="flex cursor-grab items-center text-neutral-400 hover:text-neutral-600 active:cursor-grabbing dark:hover:text-neutral-300"
            onDragStart={(event) => {
              const serverId = rowDrag.getServerId(row)
              event.dataTransfer.effectAllowed = "move"
              event.dataTransfer.setData(SERVER_DRAG_MIME, String(serverId))
              event.dataTransfer.setData("text/plain", String(serverId))
              rowDrag.onDragStart(row.id)
            }}
            onDragEnd={rowDrag.onDragEnd}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        </TableCell>
      ) : null}
      <ServerTableRowCells row={row} />
    </TableRow>
  )
}

export function ServerTableRowCells({ row }: { row: Row<ServerTableRow> }) {
  const server = useServerTableRow()

  return row.getVisibleCells().map((cell) => (
    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
      {cell.column.columnDef.meta?.renderServer?.(server)}
    </TableCell>
  ))
}
