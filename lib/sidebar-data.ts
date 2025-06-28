import {
  Bot,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingBag,
  LucideIcon,
  AudioWaveform,
  Command,
} from "lucide-react";

// Mendefinisikan tipe untuk item navigasi agar konsisten
interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavMainItem {
    title: string;
    url: string; 
    icon: LucideIcon;
    items: { title: string; url: string }[];
}

// Mengekspor tipe data agar bisa digunakan di tempat lain jika perlu
export type SidebarData = {
    teams: { name: string; logo: LucideIcon; plan: string }[];
    projects: NavItem[];
    pengguna: NavItem[];
    navMain: NavMainItem[];
    laporan: NavItem[];
};

// Mengekspor objek data itu sendiri
export const sidebarData: SidebarData = {
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
  projects: [
    { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  ],
  pengguna: [
    { name: "Data Admin", url: "#", icon: LayoutDashboard },
    { name: "Data Pelanggan", url: "#", icon: LayoutDashboard },
  ],
  navMain: [
    {
      title: "Data Produk",
      url: "#", 
      icon: ShoppingBag,
      items: [
        { title: "Kategori", url: "#" },
        { title: "Produk", url: "#" },
        { title: "Voucher", url: "#" },
      ],
    },
    {
      title: "Data Pesanan",
      url: "#", 
      icon: Bot,
      items: [
        { title: "Pembayaran", url: "#" },
        { title: "Pengiriman", url: "#" },
      ],
    },
  ],
  laporan: [{ name: "Penjualan", url: "#", icon: LayoutDashboard }],
};
