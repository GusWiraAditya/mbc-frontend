'use client'

import { useEffect, useState } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from '@/lib/store';
import api from "@/lib/api";
import { th } from "zod/v4/locales";

import { columns, Payment } from "./columns" // Import kolom dan tipe data
import { DataTable } from "../components/data-table" // Import komponen utama
import StatCard  from "./StatCard";
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
              <BreadcrumbPage>Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
     <main className="flex-1 flex-col gap-4 p-4 lg:p-6">
      <StatCard />
      </main>
    </SidebarInset>
  )
}
