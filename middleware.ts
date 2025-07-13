import { NextRequest, NextResponse } from 'next/server';

// Tipe data untuk respons dari endpoint validasi sesi di Laravel.
interface AuthValidationResponse {
  authenticated: boolean;
  user?: {
    roles: string[];
  };
}

/**
 * Middleware ini adalah "penjaga gerbang" utama aplikasi Anda.
 * Ia berjalan di server sebelum halaman sampai ke browser untuk melindungi rute.
 *
 * Prinsip Kerja (Best Practice):
 * 1. SELALU VALIDASI KE BACKEND: Tidak pernah hanya memercayai keberadaan cookie.
 * Middleware selalu bertanya ke Laravel ("sumber kebenaran") untuk status sesi.
 * 2. BERBASIS PERAN: Keputusan pengalihan dibuat berdasarkan peran pengguna (admin vs. customer).
 * 3. SATU PINTU: Semua logika perlindungan rute terpusat di sini.
 */
export async function middleware(request: NextRequest) {
  // Ambil token sesi dari cookie yang dikirim oleh browser.
  const sessionToken = request.cookies.get('laravel_session')?.value;
  const { pathname } = request.nextUrl;

  /**
   * Fungsi helper untuk memvalidasi sesi ke backend Laravel.
   * @param token - Nilai dari cookie laravel_session.
   * @returns Data sesi jika valid, atau null jika tidak valid/error.
   */
  const getSessionData = async (token: string): Promise<AuthValidationResponse | null> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL;
      if (!apiUrl) throw new Error("NEXT_PUBLIC_LARAVEL_API_URL tidak terdefinisi di .env.local");

      // Lakukan panggilan API ke endpoint /check di Laravel.
      const response = await fetch(`${apiUrl}/check`, {
        headers: {
          // Kirim cookie sesi agar Laravel bisa mengidentifikasi pengguna.
          Cookie: `laravel_session=${token}`,
          // Header ini penting agar Laravel merespons sebagai API (JSON).
          'Accept': 'application/json',
        },
        // Selalu minta data terbaru dari server, jangan gunakan cache.
        cache: 'no-store',
      });

      // Jika respons berhasil (status 200 OK), kembalikan data JSON.
      if (response.ok) {
        return response.json();
      }
      // Jika respons gagal (misalnya, 401 Unauthorized), sesi tidak valid.
      return null;
    } catch (error) {
      console.error('Kesalahan validasi sesi di middleware:', error);
      return null;
    }
  };

  // Identifikasi jenis halaman yang sedang diakses untuk mempermudah logika.
  const isAdminPage = pathname.startsWith('/admin');
  const isCustomerLoginPage = pathname.startsWith('/auth/login');
  const isCustomerRegisterPage = pathname.startsWith('/auth/register');
  const isAdminLoginPage = pathname.startsWith('/auth/login-admin');
  const isProfilePage = pathname.startsWith('/profile');
  const isCheckoutPage = pathname.startsWith('/checkout');
  const isAnyLoginPage = isCustomerLoginPage || isAdminLoginPage || isCustomerRegisterPage;
  
  // Halaman yang memerlukan autentikasi (login)
  const isProtectedPage = isAdminPage || isProfilePage || isCheckoutPage;

  // --- LOGIKA UTAMA ---

  // 1. Jika pengguna adalah tamu (tidak punya cookie sesi sama sekali).
  if (!sessionToken) {
    // Jika tamu mencoba masuk ke area admin, paksa ke halaman login admin.
    if (isAdminPage) {
      return NextResponse.redirect(new URL('/auth/login-admin', request.url));
    }
    // Jika tamu mencoba masuk ke profile atau checkout, paksa ke halaman login customer.
    if (isProfilePage || isCheckoutPage) {
      // Tambahkan parameter redirect agar setelah login bisa kembali ke halaman yang dituju
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Selain itu, izinkan akses (misalnya, ke halaman login customer).
    return NextResponse.next();
  }

  // 2. Jika pengguna punya cookie, kita WAJIB validasi.
  const sessionData = await getSessionData(sessionToken);

  if (sessionData?.authenticated) {
    // --- PENGGUNA TERBUKTI LOGIN DAN SESI VALID ---
    const userRoles = sessionData.user?.roles || [];
    const isUserAdmin = userRoles.includes('admin') || userRoles.includes('super-admin');

    if (isUserAdmin) {
      // Jika ADMIN mencoba akses halaman login mana pun...
      if (isAnyLoginPage) {
        // ...arahkan ke dashboard admin.
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    } else {
      // Jika CUSTOMER (bukan admin) mencoba akses...
      if (isAdminPage) {
        // ...halaman admin, arahkan ke homepage. Ini adalah UX yang baik.
        return NextResponse.redirect(new URL('/', request.url));
      }
      if (isAnyLoginPage) {
        // ...halaman login mana pun, arahkan ke homepage.
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } else {
    // --- SESI TIDAK VALID (misalnya, setelah logout atau cookie basi) ---
    // Jika pengguna dengan sesi tidak valid mencoba masuk ke area admin...
    if (isAdminPage) {
      // ...paksa mereka ke halaman login admin.
      return NextResponse.redirect(new URL('/auth/login-admin', request.url));
    }
    // Jika pengguna dengan sesi tidak valid mencoba masuk ke profile atau checkout...
    if (isProfilePage || isCheckoutPage) {
      // ...paksa mereka ke halaman login customer dengan parameter redirect.
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Untuk semua kasus lain yang tidak cocok, izinkan akses.
  return NextResponse.next();
}

// Pastikan matcher mencakup semua rute yang perlu dilindungi/diperiksa.
export const config = {
  matcher: [
    '/admin/:path*', 
    '/auth/login-admin', 
    '/auth/login',
    '/auth/register',
    '/profile/:path*',
    '/checkout/:path*'
    
  ],
};