// components/auth/CartSyncTrigger.tsx

"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store/useCartStore';

/**
 * REVISI TOTAL: Komponen "headless" ini bertanggung jawab untuk memicu
 * sinkronisasi keranjang pada saat yang tepat.
 * * Filosofinya: Komponen ini "bodoh", ia hanya tahu KAPAN harus memicu.
 * Semua logika tentang BAGAIMANA cara sinkronisasi (merge atau fetch)
 * sepenuhnya berada di dalam `useCartStore.initializeCart()`.
 */
export function CartSyncTrigger() {
  // 1. Ambil status dari kedua store
  const { isAuthenticated, isAuthLoading } = useAuthStore(); // Asumsi: AuthStore punya state loading
  const { initializeCart, isInitialized } = useCartStore();

  useEffect(() => {
    // 2. Buat "Pintu Gerbang": Jangan lakukan apapun jika...
    //    - Status autentikasi masih belum siap (loading), ATAU
    //    - Keranjang sudah pernah diinisialisasi sebelumnya.
    // Ini mencegah panggilan ganda yang tidak perlu.
    if (isAuthLoading || isInitialized) {
      return;
    }

    // 3. Pemicu Aksi:
    //    Jika status autentikasi sudah siap DAN keranjang belum diinisialisasi,
    //    maka inilah saat yang tepat untuk memanggil fungsi master.
    // console.log("Auth state is ready, cart is not. Initializing cart now...");
    initializeCart();

  }, [isAuthenticated, isAuthLoading, isInitialized, initializeCart]);
  // Dependensi ini memastikan effect berjalan kembali jika ada perubahan state krusial,
  // namun "Pintu Gerbang" di atas akan mencegah eksekusi yang tidak perlu.

  return null; // Komponen ini tidak me-render UI apapun.
}
