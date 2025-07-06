import SettingsData from "./components/data-pengaturan";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

// Komponen Skeleton untuk fallback Suspense saat routing
const PageLevelSkeleton = () => (
    <div className="p-4 lg:p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-72" />
            </div>
            <Skeleton className="h-10 w-36" />
        </div>
        <Separator/>
        <div className="space-y-8 mt-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
        </div>
    </div>
);

export default function SettingsPage() {
  return (
    <SidebarInset>
      {/* Header Utama yang Konsisten dengan Halaman Lain */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/admin/dashboard">Admin Panel</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Pengaturan Toko</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* Area Konten Utama */}
      <main className="flex-1 flex-col gap-4 p-4 lg:p-6">
        <Suspense fallback={<PageLevelSkeleton />}>
          <SettingsData />
        </Suspense>
      </main>
    </SidebarInset>
  )
}