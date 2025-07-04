// app/admin/produk/produk-columns.ts

"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
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

// --- DEFINISI TIPE DATA SINKRON DENGAN BACKEND LARAVEL ---

export type Category = {
  id: number;
  category_name: string;
};

export type Color = {
  id: number;
  name: string;
  hex_code: string;
};

export type Size = {
  id: number;
  name: string;
  code: string;
  description:string

};

export type Material = {
  id: number;
  name: string;
  description:string
};

export type ProductImage = {
  id: number;
  path: string;
};

export type ProductVariant = {
  id: number;
  price: number;
  stock: number;
  sku: string;
  color: Color;
  size: Size;
  material: Material;
  images: ProductImage[];
  // Properti frontend-only untuk form
  newImages?: File[];
  deletedImageIds?: number[];
};

export type Product = {
  id: number;
  product_name: string;
  category: Category;
  slug: string;
  min_price:number;
  max_price:number;
  created_at: string;
  description?: string;
  gender: 'men' | 'women' | 'unisex';
  is_active: boolean;
  variants: ProductVariant[];
};


// --- FUNGSI HELPER & DEFINISI KOLOM ---

const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
}).format(amount);

interface ColumnsProps {
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const getProductColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<Product>[] => [
  {
    id: "no",
    header: "No.",
    cell: ({ row, table }) => (table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + row.index + 1,
  },
  {
    accessorKey: "variants",
    header: "Gambar",
    cell: ({ row }) => {
      const firstImage = row.original.variants[0]?.images[0]?.path;
      const productName = row.original.product_name;
      const imageUrl = firstImage ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${firstImage}` : "/placeholder.png";
      return <Image src={imageUrl} alt={productName} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
    },
  },
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Nama Produk <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
    cell: ({ row }) => <Badge variant="outline">{row.original.category?.category_name || 'N/A'}</Badge>,
  },
  {
    id: "price",
    header: "Harga (Varian)",
    cell: ({ row }) => {
      const prices = row.original.variants.map(v => v.price);
      if (prices.length === 0) return <div className="text-left font-medium">N/A</div>;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const displayPrice = minPrice === maxPrice ? formatCurrency(minPrice) : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
      return <div className="text-left font-medium">{displayPrice}</div>
    },
  },
  {
    id: "stock",
    header: "Stok (Total)",
    cell: ({ row }) => row.original.variants.reduce((sum, v) => sum + v.stock, 0),
  },
  {
    id: "variantsCount",
    header: "Varian",
    cell: ({ row }) => {
      const count = row.original.variants.length;
      const colors = row.original.variants.map(v => v.color?.hex_code || '#cccccc');
      return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary">{count} Varian</Badge>
            <div className="flex -space-x-2">
                {colors.slice(0, 3).map((color, index) => (
                    <div key={index} style={{ backgroundColor: color }} className="h-5 w-5 rounded-full border-2 border-white dark:border-slate-800" title={row.original.variants[index].color.name}/>
                ))}
            </div>
        </div>
      )
    },
  },
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
      const product = row.original;
      return (
        <div className="text-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Buka menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(product)}>Edit Produk & Varian</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600">Hapus Produk</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
]