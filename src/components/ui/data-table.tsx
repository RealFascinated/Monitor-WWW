import { flexRender, type Table as TanStackTable } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableProps<TData> = {
  table: TanStackTable<TData>
}

function SortIndicator({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <ArrowUp className="size-3.5 shrink-0" aria-hidden />
  }

  if (direction === "desc") {
    return <ArrowDown className="size-3.5 shrink-0" aria-hidden />
  }

  return <ArrowUpDown className="size-3.5 shrink-0 opacity-40" aria-hidden />
}

function DataTable<TData>({ table }: DataTableProps<TData>) {
  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort()
              const sortDirection = header.column.getIsSorted()

              return (
                <TableHead
                  key={header.id}
                  className={header.column.columnDef.meta?.className}
                  aria-sort={
                    sortDirection === "asc"
                      ? "ascending"
                      : sortDirection === "desc"
                        ? "descending"
                        : canSort
                          ? "none"
                          : undefined
                  }
                >
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      className={cn(
                        "-mx-1 flex items-center gap-1.5 px-1 hover:text-neutral-900 dark:hover:text-white",
                        sortDirection && "text-neutral-900 dark:text-white"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      <SortIndicator direction={sortDirection} />
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cell.column.columnDef.meta?.className}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export { DataTable }
