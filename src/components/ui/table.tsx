"use client";
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
};

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  const table = useReactTable({ 
    data, 
    columns, 
    getCoreRowModel: getCoreRowModel() 
  });

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 shadow-card dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-900/50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
