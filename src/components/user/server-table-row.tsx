import { createContext, useContext, type ReactNode } from "react"
import type { Row } from "@tanstack/react-table"

import { TableCell } from "@/components/ui/table"
import type { ServerTableRow } from "@/components/user/server-table-columns"
import { useUserServer } from "@/hooks/use-user-server"
import type { ServerResponse } from "@/lib/api/user/servers"

const ServerTableRowContext = createContext<ServerResponse | null>(null)

export function ServerTableRowProvider({
  serverId,
  children,
}: {
  serverId: number
  children: ReactNode
}) {
  const { data: server } = useUserServer(serverId)

  return (
    <ServerTableRowContext.Provider value={server}>
      {children}
    </ServerTableRowContext.Provider>
  )
}

function useServerTableRow() {
  const server = useContext(ServerTableRowContext)
  if (!server) {
    throw new Error("useServerTableRow must be used within ServerTableRowProvider")
  }
  return server
}

export function ServerTableRowCells({ row }: { row: Row<ServerTableRow> }) {
  const server = useServerTableRow()

  return row.getVisibleCells().map((cell) => (
    <TableCell
      key={cell.id}
      className={cell.column.columnDef.meta?.className}
    >
      {cell.column.columnDef.meta?.renderServer?.(server)}
    </TableCell>
  ))
}
