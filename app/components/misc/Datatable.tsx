'use client'

import {
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  flexRender,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { ColumnDef, RowData } from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Pagination } from './Pagination'
import { IPagingInfo } from '@/types/pagination'

const features = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
})

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<typeof features, TData>[]
  data: TData[]
  meta?: IPagingInfo
  empty?: React.ReactNode
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  meta,
  empty,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
    enableColumnResizing: true,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
  })

  return (
    <>
      <div className="overflow-hidden rounded-md border dark:border-border">
        <Table className="w-full">
          <TableHeader className="bg-slate-50 dark:bg-navy-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="dark:hover:bg-navy-700">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-navy-800 dark:text-navy-100"
                      style={{ width: header.column.columnDef.size }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-white dark:bg-navy-700">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="dark:border-border dark:hover:bg-navy-600">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-navy-800 dark:text-navy-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {empty}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {meta?.size && (
        <div className="pt-4">
          <Pagination meta={meta} />
        </div>
      )}
    </>
  )
}
