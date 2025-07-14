// app/admin/orders/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  VisibilityState,
  Row,
} from "@tanstack/react-table";
import { format } from "date-fns";
import api from "@/lib/api";

// Impor untuk Ekspor
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Impor Komponen UI & Kolom
import { DataTable } from "./data-table"; // Pastikan path ini benar
import { OrderColumn, columns } from "./columns"; // Pastikan path ini benar
import PageSkeleton from "../../components/skeleton"; // Pastikan path ini benar
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  FileDown,
  SlidersHorizontal,
} from "lucide-react";

// Tipe data untuk pagination dari Laravel API
interface PaginatedResponse {
  data: any[];
  current_page: number;
  last_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State untuk data dan UI
  const [data, setData] = useState<OrderColumn[]>([]);
  const [pagination, setPagination] = useState<Omit<
    PaginatedResponse,
    "data"
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const memoizedColumns = useMemo(() => columns, []);

  // Mengambil data dari server setiap kali ada perubahan di URL
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const query = new URLSearchParams(
        Array.from(searchParams.entries())
      ).toString();
      try {
        const response = await api.get(`/admin/orders?${query}`);
        const paginatedData: PaginatedResponse = response.data;

        const formattedData: OrderColumn[] = paginatedData.data.map(
          (order: any) => ({
            id: order.id,
            order_number: order.order_number,
            customer_name: order.user.name,
            total: new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
            }).format(order.grand_total),
            status: order.order_status,
            date: format(new Date(order.created_at), "dd MMM yyyy"),
          })
        );

        setData(formattedData);
        const { data, ...paginationInfo } = paginatedData;
        setPagination(paginationInfo);
      } catch (error) {
        console.error("Failed to fetch admin orders:", error);
        setData([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [searchParams]);

  // Instance tabel sekarang dibuat di sini
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination?.last_page ?? 0,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
  });

  // Fungsi untuk memperbarui URL
  const handleUrlChange = (key: string, value: string | number | null) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (
      value === null ||
      String(value).toLowerCase() === "all" ||
      String(value) === ""
    ) {
      current.delete(key);
    } else {
      current.set(key, String(value));
    }
    if (key !== "page") {
      current.set("page", "1");
    }
    const search = current.toString();
    router.push(`/admin/orders?${search ? `?${search}` : ""}`);
  };

  // --- REVISI: Logika Ekspor Data Diperbaiki dan Disatukan ---
  const handleExport = (format: "pdf" | "excel") => {
    // Fungsi untuk mengambil dan memformat data
    const getExportData = () => {
      const headerLabels = table
        .getVisibleFlatColumns()
        .map((col) => {
          if (typeof col.columnDef.header === "string")
            return col.columnDef.header;
          // Mengambil nama dari accessorKey jika header bukan string
          return col.id
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        })
        .filter((id) => !["actions"].includes(id.toLowerCase()));

      const dataRows = table.getRowModel().rows.map((row) => {
        const rowData: { [key: string]: any } = {};
        row.getVisibleCells().forEach((cell) => {
          const columnId = cell.column.id;
          if (!["actions"].includes(columnId.toLowerCase())) {
            const header =
              typeof cell.column.columnDef.header === "string"
                ? cell.column.columnDef.header
                : columnId
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase());
            rowData[header] = cell.getValue();
          }
        });
        return rowData;
      });
      return { headerLabels, dataRows };
    };

    const { headerLabels, dataRows } = getExportData();
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `orders_export_${timestamp}`;

    if (format === "excel") {
      const worksheet = XLSX.utils.json_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } else if (format === "pdf") {
      const doc = new jsPDF();
      autoTable(doc, {
        head: [headerLabels],
        body: dataRows.map((row) => Object.values(row)),
      });
      doc.save(`${fileName}.pdf`);
    }
  };
  // --- Akhir Revisi Logika Ekspor ---

  if (isLoading && data.length === 0) {
    return <PageSkeleton />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders.
        </p>
      </div>

      {/* Toolbar dengan semua kontrol */}
      <div className="flex flex-wrap items-center gap-4 py-4">
        <Input
          placeholder="Search by order # or customer..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(event) => {
            const timer = setTimeout(
              () => handleUrlChange("search", event.target.value),
              500
            );
            return () => clearTimeout(timer);
          }}
          className="w-full max-w-sm"
        />
        <Select
          value={searchParams.get("status") || "all"}
          onValueChange={(value) => handleUrlChange("status", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_payment">Pending Payment</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {isLoading && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((c) => (
                  <DropdownMenuCheckboxItem
                    key={c.id}
                    className="capitalize"
                    checked={c.getIsVisible()}
                    onCheckedChange={(v) => c.toggleVisibility(!!v)}
                  >
                    {String(c.id).replace(/_/g, " ")}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DataTable table={table} columns={memoizedColumns} />

      {/* Pagination Controls */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pagination.from ?? 0} to {pagination.to ?? 0} of{" "}
            {pagination.total} orders.
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUrlChange("page", 1)}
              disabled={pagination.current_page === 1 || isLoading}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleUrlChange("page", pagination.current_page - 1)
              }
              disabled={pagination.current_page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleUrlChange("page", pagination.current_page + 1)
              }
              disabled={
                pagination.current_page === pagination.last_page || isLoading
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUrlChange("page", pagination.last_page)}
              disabled={
                pagination.current_page === pagination.last_page || isLoading
              }
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
