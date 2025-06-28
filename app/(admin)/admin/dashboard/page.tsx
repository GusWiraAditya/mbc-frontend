'use client'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DataTableDemo } from "./data-table"
import { useAuthStore } from '@/lib/store'
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardPage() {
  // Mengambil data user dari store. Perlindungan rute sudah ditangani oleh middleware.
  const { user } = useAuthStore();

  // 'SidebarProvider' dan 'AppSidebar' sudah dirender oleh layout (app/(admin)/layout.tsx).
  // Komponen halaman ini hanya perlu merender konten yang masuk ke dalam {children} di layout.
  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Admin Panel
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-4">
        {/* REVISI: Menambahkan optional chaining (?.) untuk mencegah error saat user masih null */}
        {/* <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1> */}
        <DataTableDemo />
      </div>
    </SidebarInset>

        // <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1> 
  )
}
