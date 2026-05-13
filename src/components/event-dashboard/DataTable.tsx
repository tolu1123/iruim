"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

// @ts-expect-error Missing types for multiColumnFilter
function multiColumnFilter(row, columnIds, filterValue) {
  const id = row.getValue("id")?.toString().toLowerCase() ?? "";
  const firstname = row.getValue("firstname")?.toString().toLowerCase() ?? "";
  const name = row.getValue("name")?.toString().toLowerCase() ?? "";

  const search = filterValue.toLowerCase();

  return (
    id.includes(search) || firstname.includes(search) || name.includes(search)
  );
}

// eslint-disable-next-line
export default function DataTable({  columns, data}: { columns: any[]; data: any[]}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [noOfPages, setNoOfPages] = useState(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: multiColumnFilter,
    state: {
      pagination,
      globalFilter,
      columnVisibility: {
        id: false, // HIDE this column
        qr: false
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  useEffect(() => {
    setNoOfPages(table.getPageCount());
  }, [table.getPageCount()]);

  return (
    <div className=''>
      <div className='flex items-center py-4'>
        <Input
          placeholder='Filter guest codes...'
          value={table.getState().globalFilter ?? ""}
          onChange={(e) => table.setGlobalFilter(String(e.target.value))}
          className='max-w-sm'
        />
      </div>
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex flex-wrap items-center justify-end gap-y-2 space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <div className='flex items-center justify-center gap-2'>
          {Array.from({ length: noOfPages }, (_, index) => (
            <Button
              key={index}
              variant={index === pagination.pageIndex ? "default" : "outline"}
              size='sm'
              onClick={() =>
                setPagination((state) => ({
                  ...state,
                  pageIndex: index,
                }))
              }
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
