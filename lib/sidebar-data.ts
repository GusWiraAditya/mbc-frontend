import {
  Bot,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingBag,
  LucideIcon,
  AudioWaveform,
  Command,
  Palette, // 
} from "lucide-react";

// Mendefinisikan tipe untuk item navigasi agar konsisten
interface NavItem {
  name: string;
  url: string;
  isActive?: boolean; // Menandakan apakah item ini aktif
  icon: LucideIcon;
}

interface NavDataItem {
    title: string;
    url: string; 
    icon: LucideIcon;
    isActive?: boolean; // Menandakan apakah item ini aktif
    items: { title: string; url: string;}[];
}

// Mengekspor tipe data agar bisa digunakan di tempat lain jika perlu
export type SidebarData = {
    // title?: string; // Judul opsional untuk sidebar
    // logo: StaticImageData; // URL atau path ke logo
    teams: { name: string; logo: LucideIcon; plan: string }[];
    dashboard: NavItem[];
    pengguna: NavItem[];
    navData: NavDataItem[];
    laporan: NavItem[];
};

// Mengekspor objek data itu sendiri
export const sidebarData: SidebarData = {
  // title: "Admin Dashboard",
  // logo: logoPrim,
  teams: [
    { name: "Acme Inc", logo: GalleryVerticalEnd, plan: "Enterprise" },
    { name: "Acme Corp.", logo: AudioWaveform, plan: "Startup" },
    { name: "Evil Corp.", logo: Command, plan: "Free" },
  ],
  dashboard: [
    { name: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard, isActive: true },
  ],
  pengguna: [
    { name: "Data Admin", url: "#", icon: LayoutDashboard },
    { name: "Data Pelanggan", url: "#", icon: LayoutDashboard },
  ],
  navData: [
    {
      title: "Data Produk",
      url: "#", 
      icon: ShoppingBag,
      items: [
        { title: "Kategori", url: "/admin/data-produk/kategori"},
        { title: "Atribut", url: "/admin/data-produk/atribut" },
        { title: "Produk", url: "/admin/data-produk/produk" },
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
