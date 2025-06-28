import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/lib/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MadeByCan | Handcrafted Leather Goods",
  description: "High-quality genuine leather products, handcrafted with passion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/*
          AuthProvider membungkus seluruh aplikasi untuk menginisialisasi
          status autentikasi hanya sekali.
        */}
        <AuthProvider>
          <Toaster richColors position="bottom-right" theme="light" />
          {/* Tidak ada Navbar atau Footer di sini */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
