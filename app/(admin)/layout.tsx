import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // Tetap perlukan CSS global untuk utilitas
import AuthProvider from "@/lib/providers/AuthProvider"; // Perlu AuthProvider sendiri untuk validasi sesi
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import * as React from "react"; // Import React untuk menggunakan tipenya


export const metadata: Metadata = {
  title: "Admin Panel - MadeByCan",
  description: "Admin dashboard for managing the store.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Memiliki <html> dan <body> sendiri untuk isolasi total
   
        <AuthProvider>
          <SidebarProvider>
            {/* <div className="flex h-screen bg-gray-100"> */}
              <AppSidebar />
              {/* {children} akan menjadi halaman dashboard admin */}
              {children} 
            {/* </div> */}
          </SidebarProvider>
        </AuthProvider>
  
  );
}
