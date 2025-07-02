"use client"; // Menjadikan ini Client Component untuk mengatasi error

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// Menggunakan path alias untuk impor yang lebih rapi
import logoPrim from "@/public/logo/mbc-primary.png";
import background from "@/public/background/background.jpeg";
import Footer from "@/components/user/Footer";

// CATATAN: Metadata ini tidak akan lagi berfungsi setelah menambahkan "use client"
// export const metadata: Metadata = {
//   title: "Authentication - MadeByCan",
//   description: "Login or register to access your account.",
// };

// Ini adalah layout yang akan membungkus halaman login dan register Anda.
// Perhatikan bahwa props seperti 'title' dan 'type' tidak lagi ada di sini.
// Logika tersebut sekarang berada di dalam halaman masing-masing (login/page.tsx, etc.)
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Kita tidak membutuhkan tag <html> atau <body> di sini karena
    // layout ini akan dibungkus oleh root layout (app/layout.tsx)
    <div className="bg-white">
      {/* NAVBAR SEDERHANA UNTUK AUTH */}
      <nav className="px-10 md:px-20 py-3 flex items-center justify-between z-10 relative border-b">
        <Link href="/" className="w-2/6 md:w-2/12 lg:w-1/12">
          <Image src={logoPrim} alt="MadeByCan Logo" priority />
        </Link>
        <Link href="/contact" className="text-primary hover:underline">
          Butuh Bantuan?
        </Link>
      </nav>

      {/* BACKGROUND DENGAN FORM DI TENGAH */}
      <div
        className="relative py-16 bg-fixed bg-center bg-cover flex items-center justify-center min-h-[calc(100vh-80px)]" // 80px adalah perkiraan tinggi navbar
        style={{
          backgroundImage: `linear-gradient(rgba(109,78,46,0.8), rgba(109,78,46,0.8)), url(${background.src})`,
        }}
      >
        {/*
          'children' adalah tempat di mana konten dari 
          login/page.tsx atau register/page.tsx akan dirender.
          Form, judul, dan link "Don't have an account?" akan berada di dalam {children}.
        */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md px-8 py-8 shadow-2xl rounded-lg bg-card"
        >
          {children}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
