import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Ganti pengecekan ke session cookie, bukan XSRF-TOKEN
  //    Nama defaultnya adalah 'laravel_session'.
  const sessionToken = request.cookies.get('laravel_session')?.value

  const isAuthPage = request.nextUrl.pathname.startsWith('/auth/login-admin')

  // 2. Logika ini sekarang akan bekerja dengan benar
  // Jika tidak ada session (belum login) dan mencoba akses halaman admin
  if (!sessionToken && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/auth/login-admin', request.url))
  }

  // Jika ada session (sudah login) dan mencoba akses halaman login
  if (sessionToken && isAuthPage) {
    // Arahkan ke dashboard admin, bukan /admin/dashboard biasa jika berbeda
    return NextResponse.redirect(new URL('/admin/dashboard', request.url)) 
  }

  return NextResponse.next()
}

// Konfigurasi matcher Anda sudah benar dan efisien.
export const config = {
  matcher: ['/admin/:path*', '/auth/login-admin'],
}