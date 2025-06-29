// --- File 3: app/(admin)/admin/dashboard/page.tsx (REVISI FINAL - Disederhanakan) ---
'use client'

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { DataTableDemo } from "./data-table";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { StatCard, StatCardSkeleton } from "./StatCard";
import { useAuthStore } from '@/lib/store';
import api from "@/lib/api";
import { th } from "zod/v4/locales";

interface DashboardStats {
  total_products: number;
}

const getDashboardData = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data.data;
  } catch (error) {
    // console.error("Failed to fetch dashboard data:", error);
    throw error;
  }
}

/**
 * REVISI: Halaman ini sekarang menjadi sangat sederhana dan bersih.
 * Ia tidak lagi dibungkus 'withAdminAuth' karena layout induknya sudah melindunginya.
 * Tugasnya hanya menampilkan konten dashboard.
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setStats(data);
      } catch (error) {
        // console.error("Error setting dashboard data");
        throw new Error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
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
        <div className="mb-6">
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Admin'}!</h1>
            <p className="text-muted-foreground">Here's a summary of your store's activity.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatCard title="Total Products" value={stats.total_products} icon={Package} description="Items available in store" />
              <StatCard title="Total Orders" value={"-"} icon={ShoppingCart} description="-" />
              <StatCard title="Items Sold" value={"-"} icon={Users} description="-" />
              <StatCard title="Today's Revenue" value={"-"} icon={DollarSign} description="-" />
            </>
          ) : (
            <p className="col-span-4 text-center">Could not load dashboard data.</p>
          )}
        </div>
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
            <DataTableDemo />
        </div>
      </main>
    </SidebarInset>
  )
}
