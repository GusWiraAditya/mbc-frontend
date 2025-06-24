// app/layout.tsx

// import "./globals.css"
// import { Toaster } from "sonner"
// import type { Metadata } from "next"

// export const metadata: Metadata = {
//   title: "Made By Can",
//   description: "E-Commerce Penjualan Tas Lokal",
// }

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="id">
//       <body>
//         {children}
//       </body>
//     </html>
//   )
// }
import type { Metadata } from "next";
import { Inter } from "next/font/google";
// import "./globals.css";

// Asumsikan path komponen ini sudah benar menggunakan alias
import Navbar from "@/components/user/Navbar";
import Footer from "@/components/user/Footer";
// import { Toaster } from "@/components/ui/sonner";

// Konfigurasi font default dari Google Fonts
const inter = Inter({ subsets: ["latin"] });

// Metadata untuk SEO, akan muncul di tab browser
export const metadata: Metadata = {
  title: "MadeByCan | Handcrafted Leather Goods",
  description: "High-quality genuine leather products, handcrafted with passion.",
};

export default function CustomerLayout({
  children,
}:{
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* <Toaster richColors position="top-center" /> */}

        {/* Navbar akan selalu tampil di bagian atas semua halaman */}
        <Navbar />
        
        {/* 'children' adalah tempat di mana halaman (seperti HomePage) akan dirender */}
        {/* <main> */}
          {children}
        {/* </main> */}
        
        {/* Footer akan selalu tampil di bagian bawah semua halaman */}
        <Footer />
      </body>
    </html>
  );
}
