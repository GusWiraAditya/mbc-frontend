"use client";

import * as React from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from "xlsx";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileDown, SlidersHorizontal } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  // REVISI: Tambahkan prop untuk nama file ekspor agar bisa digunakan kembali
  exportFileName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  exportFileName = "data", // Nama file default
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // REVISI: Fungsi helper untuk mendapatkan data ekspor yang lebih cerdas
  const getExportData = () => {
    // Dapatkan header yang bisa dibaca manusia dari definisi kolom
    const headerLabels = table.getVisibleFlatColumns()
      .map(col => typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id)
      .filter(id => !['select', 'actions'].includes(id));

    const rows = table.getFilteredRowModel().rows.map(row => {
      const rowData: { [key: string]: any } = {};
      row.getVisibleCells().forEach(cell => {
        if (!['select', 'actions'].includes(cell.column.id)) {
          const header = typeof cell.column.columnDef.header === 'string' ? cell.column.columnDef.header : cell.column.id;
          rowData[header] = cell.getValue();
        }
      });
      return rowData;
    });
    return { headerLabels, rows };
  }

  // Fungsi helper untuk memicu download
  const triggerDownload = (blob: Blob, fileName: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Fungsi untuk mengekspor ke berbagai format
  const handleExport = (format: 'csv' | 'json' | 'pdf' | 'excel') => {
    const { headerLabels, rows } = getExportData();
    
    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      triggerDownload(new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' }), `${exportFileName}.csv`);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(rows, null, 2);
      triggerDownload(new Blob([jsonContent], { type: 'application/json;charset=utf-8;' }), `${exportFileName}.json`);
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [headerLabels],
        body: rows.map(row => Object.values(row)),
      });
      doc.save(`${exportFileName}.pdf`);
    } else if (format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
      XLSX.writeFile(workbook, `${exportFileName}.xlsx`);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 py-4">
        <Input
          placeholder="Cari semua kolom..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full max-w-sm md:w-auto"
        />
        <div className="flex w-full md:w-auto md:ml-auto gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline"><SlidersHorizontal className="mr-2 h-4 w-4" /> Kolom</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter(c => c.getCanHide()).map(c => (
                <DropdownMenuCheckboxItem key={c.id} className="capitalize" checked={c.getIsVisible()} onCheckedChange={v => c.toggleVisibility(!!v)}>
                  {c.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Ekspor</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Opsi Ekspor</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('csv')}>Ekspor sebagai CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('json')}>Ekspor sebagai JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>Ekspor sebagai PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>Ekspor sebagai Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-3 px-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">Tidak ada hasil.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col-reverse items-center justify-between gap-4 py-4 sm:flex-row">
        <div className="flex-1 text-sm text-muted-foreground self-center sm:self-auto">
          {table.getFilteredSelectedRowModel().rows.length} dari {table.getFilteredRowModel().rows.length} baris dipilih.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Baris per halaman</p>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={v => table.setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[70px]"><SelectValue /></SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(s => <SelectItem key={s} value={`${s}`}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Hal {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
            <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}