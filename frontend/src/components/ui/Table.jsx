import React from 'react';
import { flexRender } from '@tanstack/react-table';

export function Table({ table, isLoading }) {
  return (
    <div className="w-full overflow-x-auto rounded-md border border-[var(--color-border-main)] bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f8fafc] text-[var(--color-text-muted)] text-[13px] uppercase border-b border-[var(--color-border-main)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--color-border-main)]">
                {table.getAllColumns().map((col, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr 
                key={row.id}
                className="border-b border-[var(--color-border-main)] bg-white hover:bg-[#f8fafc] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-[var(--color-text-dark)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={table.getAllColumns().length} 
                className="px-4 py-8 text-center text-[var(--color-text-muted)]"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
