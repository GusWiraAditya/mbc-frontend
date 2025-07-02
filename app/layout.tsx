// --- File 2: app/(admin)/layout.tsx (REVISI FINAL - Menjadi Penjaga Utama) ---
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store";
import logoPrim from "@/public/logo/mbc-primary.png";
import Image from "next/image";

// Komponen UI untuk ditampilkan saat otentikasi sedang diverifikasi.
const AdminLoadingScreen = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <div className="flex flex-col items-center gap-2">
      <Image
        src={logoPrim}
        alt="MBC Logo"
        width={120}
        height={120}
        className="mb-2"
        priority
      />
      <div
        className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"
        role="status"
        aria-label="loading"
      />
      {/* <p className="text-sm text-muted-foreground">Verifying authentication...</p> */}
    </div>
  </div>
);

/**
 * Ini adalah implementasi BEST PRACTICE.
 * AdminLayout sekarang bertindak sebagai "penjaga gerbang" utama untuk seluruh
 * area admin. Ia memeriksa status autentikasi SEBELUM merender UI admin.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isAuthLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 1. Jangan lakukan apa-apa selagi proses pengecekan awal berjalan.
    if (isAuthLoading) {
      return;
    }

    // 2. Setelah selesai, jika user tidak sah (tidak login ATAU bukan admin), redirect.
    if (
      !isAuthenticated ||
      !user?.roles?.includes("admin") ||
      !user?.roles?.includes("super-admin")
    ) {
      router.push("/auth/login-admin");
    }
  }, [isAuthenticated, user, isAuthLoading, router]);

  // 3. Selama pengecekan auth awal, tampilkan UI loading layar penuh.
  if (isAuthLoading) {
    return <AdminLoadingScreen />;
  }

  // 4. Hanya render layout admin lengkap jika user adalah admin yang sah.
  if (
    isAuthenticated &&
    (user?.roles?.includes("admin") || user?.roles?.includes("super-admin"))
  ) {
    return (
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    );
  }

  // 5. Jika tidak, jangan render apa-apa selagi proses redirect berjalan.
  return null;
}
