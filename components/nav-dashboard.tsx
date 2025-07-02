// --- File 2: components/nav-dashboard.tsx (REVISI FINAL) ---
// Mengintegrasikan logika active state ke dalam kode Anda.

"use client"

import { usePathname } from "next/navigation"; // REVISI: Import hook yang diperlukan
import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavDashboardProps {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}

export function NavDashboard({ projects }: NavDashboardProps) {
  const pathname = usePathname(); // REVISI: Dapatkan URL saat ini

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          // REVISI: Tentukan apakah item ini aktif dengan membandingkan URL
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.name}>
              {/* REVISI: Berikan prop 'isActive' ke tombol */}
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
