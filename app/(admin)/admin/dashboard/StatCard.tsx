"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api"; // Asumsi path client API Anda
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  LayoutGrid,
  Ticket,
  Users,
  Shield,
  AlertCircle,
} from "lucide-react";

// Tipe data untuk statistik
interface StatsData {
  totalOrders: number;
  totalCategories: number;
  totalProducts: number;
  dailyincome: number;
  totalUsers: number;
  totalAdmins: number;
}

// Komponen sub-elemen untuk kartu statistik (agar lebih rapi)
const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className={`h-4 w-4 text-muted-foreground ${color}`} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

// Komponen utama halaman Dashboard
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Panggil endpoint API yang sudah dibuat di Laravel
        const response = await api.get("/admin/dashboard/stats");
        setStats(response.data.data);
      } catch (err: any) {
        console.error("Failed to fetch dashboard stats:", err);
        setError(
          err.response?.status === 403
            ? "You do not have permission to view this page."
            : "Failed to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Tampilan saat loading
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tampilan jika terjadi error
  if (error) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-red-600">Access Denied</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  // Tampilan utama jika data berhasil dimuat
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pesanan"
          value={stats?.totalOrders}
          icon={ShoppingCart}
          color="text-blue-500"
        />
        <StatCard
          title="Total Kategori"
          value={stats?.totalCategories}
          icon={LayoutGrid}
          color="text-green-500"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts}
          icon={Ticket}
          color="text-orange-500"
        />
        <StatCard
          title="Daily Income"
          value={stats?.dailyincome}
          icon={Ticket}
          color="text-orange-500"
        />
      </div>
    </div>
  );
}