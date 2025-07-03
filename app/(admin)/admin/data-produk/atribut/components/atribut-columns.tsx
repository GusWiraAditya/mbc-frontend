"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Attribute } from "./AttributeTabs";
import { MoreHorizontal, ArrowUpDown } from "lucide-react"; // Impor ikon sorting
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ColumnHandlers {
  onEdit: (attr: Attribute) => void;
  onDelete: (attr: Attribute) => void;
}

// Helper function untuk membuat header yang bisa diurutkan, agar kode tidak berulang.
const createSortableHeader = (label: string) => {
  return ({ column }: { column: any }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

// Kolom "Aksi" tidak berubah, tetapi kita tambahkan header agar lebih rapi.
const actionColumn = (handlers: ColumnHandlers): ColumnDef<Attribute> => ({
  id: "actions",
  header: () => <div className="text-center">Aksi</div>,
  cell: ({ row }) => (
    <div className="text-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handlers.onEdit(row.original)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlers.onDelete(row.original)} className="text-red-600">Hapus</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  ),
});

// Kolom "No." yang dibuat secara dinamis.
const numberColumn = (): ColumnDef<Attribute> => ({
    id: "no",
    header: "No.",
    cell: ({ row, table }) => {
        const { pageIndex, pageSize } = table.getState().pagination;
        return (pageIndex * pageSize) + row.index + 1;
    },
    enableSorting: false, // Sorting tidak relevan untuk nomor baris
});

export const getColorColumns = (handlers: ColumnHandlers): ColumnDef<Attribute>[] => [
  numberColumn(),
  { 
    accessorKey: "name", 
    header: createSortableHeader("Nama Warna"),
  },
  { 
    accessorKey: "hex_code", 
    header: createSortableHeader("Preview"),
    cell: ({ row }) => {
      const hexCode = row.original.hex_code;
      return (
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: hexCode || '#ffffff' }} />
          <span>{hexCode}</span>
        </div>
      )
    }
  },
  actionColumn(handlers),
];

export const getSizeColumns = (handlers: ColumnHandlers): ColumnDef<Attribute>[] => [
  numberColumn(),
  { 
    accessorKey: "name", 
    header: createSortableHeader("Nama Ukuran"),
  },
  { 
    accessorKey: "code", 
    header: createSortableHeader("Kode (S, M, L)"),
  },
  // { 
  //    accessorKey: "description", 
  //   header: "Deskripsi",
  // },
  actionColumn(handlers),
];

export const getMaterialColumns = (handlers: ColumnHandlers): ColumnDef<Attribute>[] => [
  numberColumn(),
  { 
    accessorKey: "name", 
    header: createSortableHeader("Nama Bahan"),
  },
  // { 
  //   accessorKey: "description", 
  //   header: "Deskripsi",
  // },
  actionColumn(handlers),
];