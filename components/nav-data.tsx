"use client"

import { useState, useEffect } from "react"; // REVISI: Impor hook yang diperlukan
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavData({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();
  
  // REVISI: State untuk mengontrol status buka/tutup setiap grup secara dinamis
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  // REVISI: useEffect untuk menginisialisasi dan memperbarui status buka/tutup
  // setiap kali URL berubah.
  useEffect(() => {
    const newOpenState: Record<string, boolean> = {};
    for (const item of items) {
      // Grup akan terbuka jika salah satu sub-itemnya cocok dengan URL saat ini.
      const isGroupActive = item.items?.some(
        (subItem) => pathname === subItem.url
      );
      newOpenState[item.title] = !!isGroupActive;
    }
    setOpenState(newOpenState);
  }, [pathname, items]);

  // Fungsi untuk menangani perubahan status buka/tutup secara manual
  const handleOpenChange = (title: string, isOpen: boolean) => {
    setOpenState(prevState => ({
      ...prevState,
      [title]: isOpen,
    }));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Manajemen Data</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            // REVISI: Menggunakan state yang terkontrol, bukan defaultOpen
            open={openState[item.title] || false}
            onOpenChange={(isOpen) => handleOpenChange(item.title, isOpen)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => {
                    const isActive = pathname === subItem.url;
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isActive}>
                          <Link href={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}