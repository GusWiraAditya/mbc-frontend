"use client";

import * as React from "react";

// REVISI: Mengimpor data dari file terpisah
import { sidebarData } from "@/lib/sidebar-data";
import { NavData } from "@/components/nav-data";
import { NavDashboard } from "@/components/nav-dashboard";
import { NavPengguna } from "@/components/nav-pengguna";
import { NavLaporan } from "@/components/nav-laporan";
import { NavUser } from "@/components/nav-user";

// import { TeamSwitcher } from "@/components/team-switcher";
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

          {/* <span>Admin Dashboard</span> */}
         {isAuthenticated && <NavUser />}
      </SidebarHeader>
      <hr />
      
      <SidebarContent>
        {/* Menggunakan data yang diimpor */}
        <NavDashboard projects={sidebarData.dashboard} />
        <NavPengguna projects={sidebarData.pengguna} />
   
        <NavData items={sidebarData.navData} />
        <NavLaporan projects={sidebarData.laporan} />
      </SidebarContent>
      {/* <SidebarFooter>
       
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
