// app/admin/orders/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Tipe data untuk satu baris pesanan di tabel
export type OrderColumn = {
  id: number;
  order_number: string;
  customer_name: string;
  total: string;
  status: 'pending_payment' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'failed';
  date: string;
};

// Konfigurasi warna untuk badge status
const statusConfig: Record<string, string> = {
    pending_payment: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100",
    processing: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100",
    shipped: "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-100",
    completed: "bg-green-100 text-green-800 border-green-300 hover:bg-green-100",
    cancelled: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
    failed: "bg-red-100 text-red-800 border-red-300 hover:bg-red-100",
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "order_number",
    header: "Order #",
    cell: ({ row }) => (
      // Link ke halaman detail pesanan admin
      <Link href={`/admin/orders/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.order_number}
      </Link>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer",
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => <div className="text-right font-medium">{row.original.total}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.original.status;
        const config = statusConfig[status] ?? "bg-gray-100 text-gray-800 border-gray-300";
        // Mengganti underscore dengan spasi dan membuat huruf besar di awal kata
        const formattedStatus = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return <Badge variant="outline" className={cn("font-semibold", config)}>{formattedStatus}</Badge>;
    }
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const orderId = row.original.id;
      return (
        <div className="text-center">
            <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem asChild><Link href={`/admin/orders/${orderId}`}>View Details & Update</Link></DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];