"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  ShoppingBag
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavPengguna } from "@/components/nav-pengguna"
import { NavLaporan } from "@/components/nav-laporan"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],

   projects: [
    {
      name: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      // isActive: true,
      
    },
  ],
  pengguna: [
    {
      name: "Data Admin",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Data Pelanggan",
      url: "#",
      icon: LayoutDashboard,
    },
  ],

  navMain: [
    {
      title: "Data Produk",
      url: "#",
      icon: ShoppingBag,
      // isActive: true,
      items: [
        {
          title: "Kategori",
          url: "#",
        },
        {
          title: "Produk",
          url: "#",
        },
        {
          title: "Voucher",
          url: "#",
        },
      ],
    },
    {
      title: "Data Pesanan",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Pembayaran",
          url: "#",
        },
        {
          title: "Pengemasan",
          url: "#",
        },
        {
          title: "Pengiriman",
          url: "#",
        },
        {
          title: "Terkirim",
          url: "#",
        },
      ],
    },
  ],
  laporan: [
    {
      name: "Penjualan",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Produk Terlaris",
      url: "#",
      icon: LayoutDashboard,
    },
    {
      name: "Stok",
      url: "#",
      icon: LayoutDashboard,
    },
  ],
}

export function AppSidebar({
  user,
  ...props
}: { user?: { name: string; email: string; avatar?: string } } & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavPengguna projects={data.pengguna} />
        <NavMain items={data.navMain} />
        <NavLaporan projects={data.laporan} />

      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{
          name: user.name,
          email: user.email,
          avatar: user.avatar || "/avatars/default.jpg"
        }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
