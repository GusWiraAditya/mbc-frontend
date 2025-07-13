"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export type Voucher = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: "fixed_transaction"
    | "percent_transaction"
    | "fixed_item"
    | "percent_item"
    | "free_shipping";
  stacking_group: "transaction_discount" | "item_discount" | "shipping_discount" | "unique"; // New field for stacking group
  value: number;
  max_discount: number | null;
  min_purchase: number | null;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  times_used: number;
  usage_limit_per_user: number | null;
  is_active: boolean;
  products: { id: number; product_name: string }[];
  categories: { id: number; category_name: string }[];
};

const formatVoucherType = (type: Voucher["type"]) => {
  const types = {
    fixed_transaction: "Potongan Harga (Transaksi)",
    percent_transaction: "Potongan Persen (Transaksi)",
    fixed_item: "Potongan Harga (per Item)",
    percent_item: "Potongan Persen (per Item)",
    free_shipping: "Gratis Ongkir",
  };
  return types[type] || "Tidak Diketahui";
};

const formatVoucherValue = (voucher: Voucher) => {
  if (voucher.type.includes("percent")) return `${voucher.value}%`;
  if (voucher.type === "free_shipping") return "Penuh";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(voucher.value);
};

const getVoucherStatus = (
  voucher: Voucher
): {
  text: string;
  variant: "default" | "destructive" | "outline" | "secondary";
  priority: number; // For sorting
} => {
  const now = new Date();
  const startDate = voucher.start_date ? new Date(voucher.start_date) : null;
  const endDate = voucher.end_date ? new Date(voucher.end_date) : null;
  
  if (!voucher.is_active) 
    return { text: "Nonaktif", variant: "destructive", priority: 0 };
  if (endDate && endDate < now)
    return { text: "Kedaluwarsa", variant: "secondary", priority: 1 };
  if (startDate && startDate > now)
    return { text: "Dijadwalkan", variant: "outline", priority: 2 };
  return { text: "Aktif", variant: "default", priority: 3 };
};

// Helper function to get sorting value for validity period
const getValiditySortValue = (voucher: Voucher): number => {
  if (!voucher.start_date || !voucher.end_date) return 0;
  
  const startDate = new Date(voucher.start_date);
  const endDate = new Date(voucher.end_date);
  const now = new Date();
  
  // Priority: Active vouchers first, then scheduled, then expired
  if (startDate <= now && endDate >= now) {
    // Active vouchers - sort by end date (soonest to expire first)
    return endDate.getTime() + 3000000000000; // Add offset to prioritize active
  } else if (startDate > now) {
    // Scheduled vouchers - sort by start date
    return startDate.getTime() + 2000000000000; // Add offset to prioritize scheduled
  } else {
    // Expired vouchers - sort by end date (most recently expired first)
    return endDate.getTime() + 1000000000000; // Add offset but lowest priority
  }
};

interface ColumnsProps {
  onEdit: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

export const getVoucherColumns = ({
  onEdit,
  onDelete,
}: ColumnsProps): ColumnDef<Voucher>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Kode <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge className="font-mono bg-primary/20 text-primary">
        {row.original.code}
      </Badge>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nama Voucher <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Tipe <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm">{formatVoucherType(row.original.type)}</div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nilai <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-semibold">{formatVoucherValue(row.original)}</div>
    ),
  },
  {
    id: "validity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Masa Berlaku <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => getValiditySortValue(row),
    sortingFn: (rowA, rowB) => {
      const valueA = getValiditySortValue(rowA.original);
      const valueB = getValiditySortValue(rowB.original);
      return valueA - valueB;
    },
    cell: ({ row }) => {
      if (!row.original.start_date || !row.original.end_date)
        return <span className="text-muted-foreground">-</span>;
      
      const startDate = format(new Date(row.original.start_date), "d MMM yy", {
        locale: id,
      });
      const endDate = format(new Date(row.original.end_date), "d MMM yy", {
        locale: id,
      });
      
      const now = new Date();
      const start = new Date(row.original.start_date);
      const end = new Date(row.original.end_date);
      
      // Add visual indicator for different validity states
      let className = "text-sm";
      if (end < now) {
        className += " text-muted-foreground line-through"; // Expired
      } else if (start > now) {
        className += " text-blue-800 dark:text-blue-400"; // Scheduled
      } else {
        className += " text-green-800 dark:text-green-400"; // Active
      }
      
      return <span className={className}>{`${startDate} - ${endDate}`}</span>;
    },
  },
  {
    accessorKey: "usage_limit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Batas Penggunaan <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-sm text-center">
        {row.original.times_used > 0
          ? row.original.times_used.toLocaleString("id-ID")
          : "-"}{" "} / {" "}
        {row.original.usage_limit !== null
          ? row.original.usage_limit.toLocaleString("id-ID") 
          : "-"}
      </div>
    ),
  },
  {
    accessorKey: "usage_limit_per_user",
    header: "Batas Per User",
    cell: ({ row }) => (
      <div className="text-sm text-center">
        {row.original.usage_limit_per_user !== null
          ? row.original.usage_limit_per_user.toLocaleString("id-ID")
          : "-"}
      </div>
    ),
  },
  {
    id: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    accessorFn: (row) => getVoucherStatus(row).priority,
    sortingFn: (rowA, rowB) => {
      const statusA = getVoucherStatus(rowA.original);
      const statusB = getVoucherStatus(rowB.original);
      return statusB.priority - statusA.priority; // Descending: Active > Scheduled > Expired > Inactive
    },
    cell: ({ row }) => {
      const status = getVoucherStatus(row.original);
      const badgeClass =
        status.variant === "default"
          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400 border-transparent hover:bg-emerald-100"
          : "";
      return (
        <Badge variant={status.variant} className={badgeClass}>
          {status.text}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="align-middle flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="text-destructive focus:text-destructive"
            >
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];