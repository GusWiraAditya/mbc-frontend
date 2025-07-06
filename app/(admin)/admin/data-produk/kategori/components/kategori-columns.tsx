"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { MoreHorizontal, ArrowUpDown } from "lucide-react" // REVISI: Impor ikon ArrowUpDown
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"


export type Category = {
  id: number
  category_name: string
  description: string
  is_active: boolean
  slug: string
  image: string | null
  created_at: string
}

interface ColumnsProps {
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Category>[] => [
  {
    id: "no",
    header: "No.",
    cell: ({ row, table }) => {
      const { pageIndex, pageSize } = table.getState().pagination;
      return (pageIndex * pageSize) + row.index + 1;
    },
  },
  {
    accessorKey: "image",
    header: "Foto Kategori",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string | null;
      const categoryName = row.original.category_name;
      const publicImageUrl = imageUrl ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${imageUrl}` : "/placeholder.png";
      return <Image src={publicImageUrl} alt={categoryName} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
    },
    // Menonaktifkan sorting untuk kolom gambar
    enableSorting: false,
  },
  { 
    accessorKey: "category_name", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Kategori
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  { 
    accessorKey: "created_at", 
    // REVISI: Mengubah header menjadi fungsi yang merender Button
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dibuat Pada
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => new Date(row.getValue("created_at")).toLocaleDateString("id-ID") 
  },
   // --- REVISI: TAMBAHKAN KOLOM STATUS DI SINI ---
  {
    accessorKey: "is_active",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const isActive = row.getValue("is_active");

      return isActive ? (
        // Badge hijau untuk status "Aktif"
        <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-800/20 dark:text-emerald-400 hover:bg-emerald-100/80">
          Aktif
        </Badge>
      ) : (
        // Badge merah (bawaan 'destructive') untuk "Tidak Aktif"
        <Badge variant="destructive">
          Tidak Aktif
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const category = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(category)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(category)} className="text-red-600">Hapus</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
