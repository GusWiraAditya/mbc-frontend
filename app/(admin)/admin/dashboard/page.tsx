// --- File 3: app/(admin)/admin/dashboard/page.tsx (REVISI FINAL - Disederhanakan) ---
'use client'

import { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from '@/lib/store';
import api from "@/lib/api";
import { th } from "zod/v4/locales";

import { columns, Payment } from "./columns" // Import kolom dan tipe data
import { DataTable } from "../data-table" // Import komponen utama
// ... sisa impor ...

// Buat data mock untuk ditampilkan. Nanti ini akan datang dari API Anda.
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    { id: "728ed52f", amount: 100000, status: "pending", email: "m@example.com" },
    { id: "489e1d42", amount: 125000, status: "processing", email: "a@example.com" },
    { id: "f9d8b1c3", amount: 250000, status: "success", email: "b@example.com" },
    { id: "a2c4e6f8", amount: 75000, status: "failed", email: "c@example.com" },
  ]
}
/**
 * REVISI: Halaman ini sekarang menjadi sangat sederhana dan bersih.
 * Ia tidak lagi dibungkus 'withAdminAuth' karena layout induknya sudah melindunginya.
 * Tugasnya hanya menampilkan konten dashboard.
 */
export default function KategoriPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    getData().then(setData);
  }, []);

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/dashboard">Admin Panel</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Data Produk</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Kategori</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
     <main className="flex-1 flex-col gap-4 p-4 lg:p-6">
        {/* ... kode kartu statistik ... */}
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            {/* Ganti DataTableDemo dengan DataTable yang baru */}
            <DataTable columns={columns} data={data} />
        </div>
      </main>
    </SidebarInset>
  )
}
