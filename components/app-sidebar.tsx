"use client";

import * as React from "react";

// REVISI: Mengimpor data dari file terpisah
import { sidebarData } from "@/lib/sidebar-data";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavPengguna } from "@/components/nav-pengguna";
import { NavLaporan } from "@/components/nav-laporan";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { isAuthenticated } = useAuthStore();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* Menggunakan data yang diimpor */}
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {/* Menggunakan data yang diimpor */}
        <NavProjects projects={sidebarData.projects} />
        <NavPengguna projects={sidebarData.pengguna} />
        <NavMain items={sidebarData.navMain} />
        <NavLaporan projects={sidebarData.laporan} />
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated && <NavUser />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
