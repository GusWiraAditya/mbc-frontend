// components/auth/CartSyncTrigger.tsx

"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { useCartStore } from '@/lib/store/useCartStore';

export function CartSyncTrigger() {
  const { isAuthLoading } = useAuthStore();
  const { isInitialized, initializeCart, mergeAndSyncCart } = useCartStore();
  
  // useRef untuk memastikan logika hanya berjalan sekali per siklus render awal
  const hasRun = useRef(false);

  useEffect(() => {
    // Jangan lakukan apa-apa jika proses autentikasi masih berjalan
    if (isAuthLoading) {
      return;
    }

    // Jangan jalankan lagi jika sudah pernah dijalankan pada siklus ini
    if (hasRun.current) {
        return;
    }

    // Cek apakah ada "pesan" di URL dari redirect Google Login
    const params = new URLSearchParams(window.location.search);
    const shouldMerge = params.get('merge_cart') === 'true';

    // --- Skenario 1: Pengguna baru saja login via Google ---
    if (shouldMerge) {
      console.log("Merge trigger detected from URL. Merging cart...");
      hasRun.current = true; // Tandai sudah dijalankan
      
      // Hapus parameter dari URL agar tidak berjalan lagi saat di-refresh
      window.history.replaceState({}, '', window.location.pathname);

      // Panggil fungsi merge yang spesifik
      mergeAndSyncCart();

    // --- Skenario 2: Pengguna membuka tab baru / refresh halaman (bukan dari redirect) ---
    } else if (!isInitialized) {
        console.log("Standard initialization trigger. Initializing cart...");
        hasRun.current = true; // Tandai sudah dijalankan
        
        // Panggil fungsi inisialisasi yang sederhana
        initializeCart();
    }

  }, [isAuthLoading, isInitialized, initializeCart, mergeAndSyncCart]);

  return null; // Komponen ini tidak me-render apapun
}