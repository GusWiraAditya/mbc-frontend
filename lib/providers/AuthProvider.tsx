"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";

/**
 * Komponen ini bertanggung jawab untuk mengambil status autentikasi pengguna
 * hanya sekali saat aplikasi dimuat, dan menyediakannya untuk seluruh aplikasi.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fungsi ini akan berjalan sekali untuk menginisialisasi state auth.
    const initializeAuth = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.error("Initialization auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUser]);

  // Selama pengecekan, kita bisa menampilkan loading state global
  // atau tidak menampilkan apa-apa untuk mencegah "kedipan" UI.
  if (isLoading) {
    return null; 
  }

  // Setelah selesai, tampilkan sisa aplikasi.
  return <>{children}</>;
}
