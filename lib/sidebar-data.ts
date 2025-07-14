import {
  Bot,
  GalleryVerticalEnd,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  LucideIcon,
  AudioWaveform,
  Command,
  Settings,
   UsersRound,
   Users,
   ScrollText,
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
    settings: NavItem[];
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
  settings: [
    { name: "Pengaturan Toko", url: "/admin/pengaturan-toko", icon: Settings},
  ],
  pengguna: [
    { name: "Data Admin", url: "#", icon:  UsersRound },
    { name: "Data Pelanggan", url: "#", icon: Users },
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
        { title: "Voucher", url: "/admin/data-produk/voucher" },
      ],
    },
    {
      title: "Data Pesanan",
      url: "#", 
      icon: ClipboardList,
      items: [
        { title: "Pesanan", url: "/admin/orders/" },
      ],
    },
  ],
  laporan: [{ name: "Penjualan", url: "#", icon: ScrollText }],
};
