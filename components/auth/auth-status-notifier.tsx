// components/auth/AuthStatusNotifier.tsx
"use client";

import { useEffect, useRef } from 'react'; // REVISI: Tambahkan useRef
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { showSuccess } from '@/lib/toast';

export default function AuthStatusNotifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  // REVISI: Gunakan useRef sebagai flag untuk memastikan toast hanya muncul sekali.
  const hasShownToast = useRef(false);

  useEffect(() => {
    const loginSuccess = searchParams.get('login_success');

    // REVISI: Tambahkan pengecekan flag sebelum menampilkan toast.
    if (loginSuccess === 'google' && !hasShownToast.current) {
      // 1. Tampilkan pesan sukses.
      showSuccess('Selamat datang! Anda berhasil login dengan Google.');
      
      // 2. Set flag menjadi true agar tidak muncul lagi.
      hasShownToast.current = true;
      
      // 3. Hapus query parameter dari URL.
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  // Komponen ini tidak merender UI apa pun
  return null;
}
