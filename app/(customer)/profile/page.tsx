"use client";

// --- 1. IMPORTS ---
import { useState, useEffect, useCallback, FormEvent, ReactNode } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {AddressList} from "@/components/account/AddressList";
import { ProfileSection } from "@/components/account/ProfileSection";
import { OrderHistorySection } from "@/components/account/OrderHistorySection";

// Store & Tipe Data
import { useAuthStore } from "@/lib/store";
import api from "@/lib/api";

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  MapPin,
  ShieldCheck,
  Package,
  LogOut,
} from "lucide-react";
const SecuritySection = () => {
  const router = useRouter();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keamanan Akun</CardTitle>
        <CardDescription>
          Ubah kata sandi dan kelola keamanan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between items-center border rounded-lg p-4">
        <div>
          <p className="font-medium">Kata Sandi</p>
          <p className="text-sm text-muted-foreground">
            Disarankan untuk mengganti kata sandi secara berkala.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/profile/security")}
        >
          Ubah Kata Sandi
        </Button>
      </CardContent>
    </Card>
  );
};
const AccountSidebar = ({
  user,
  activeView,
  setActiveView,
  onLogout,
}: {
  user: any;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
}) => {
  const navItems = [
    { id: "profile", label: "Detail Profil", icon: User },
    { id: "addresses", label: "Buku Alamat", icon: MapPin },
    { id: "orders", label: "Riwayat Pesanan", icon: Package },
    { id: "security", label: "Keamanan", icon: ShieldCheck },
  ];

  return (
    <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto  rounded-lg shadow-md">
      <div className="p-6 bg-white">
        {/* User Identity */}
        <div className="flex items-center gap-4 border-b pb-4">
          <Avatar className="h-14 w-14">
            <AvatarImage
              src={
                user?.profile_picture
                  ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${user.profile_picture}`
                  : ""
              }
              alt={user?.name}
                className="object-cover"
            />
            <AvatarFallback className="text-xl bg-primary/20 text-primary font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-semibold truncate">{user?.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView(item.id)}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="mt-6 border-t pt-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
};
export default function MyAccountPage() {
  const { user, isInitialized, logout } = useAuthStore();
  const router = useRouter();
  // --- TAMBAHKAN KODE INI ---
  const [activeView, setActiveView] = useState("profile"); // Default view
  const searchParams = useSearchParams();
   useEffect(() => {
    // Ambil nilai dari parameter 'view' di URL
    const viewParam = searchParams.get('view');
    
    // Jika ada parameter 'view' (misalnya, 'orders'), atur tab aktif sesuai nilainya
    if (viewParam) {
      setActiveView(viewParam);
    }
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

   // REVISI: Fungsi ini akan kita teruskan sebagai "telepon"
    const refreshPageData = () => {
        // Di masa depan, ini bisa memuat ulang data pesanan, dll.
        // Untuk sekarang, kita bisa log atau memicu refresh data lain jika perlu.
        console.log("An action in a child component requires the dashboard to refresh!");
    };
  // Skeleton Loader yang meniru layout kokpit
  if (!isInitialized) {
    return (
      <div className="container mx-auto px-4 py-10 pt-32 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
            <Skeleton className="h-64 w-full" />
          </div>
          {/* Content Skeleton */}
          <div className="flex-1">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "profile":
        return <ProfileSection/>;
      case "addresses":
        return  <AddressList onAction={refreshPageData} />;
      case "orders":
        return <OrderHistorySection />;
      case "security":
        return <SecuritySection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-10 pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Akun Saya</h1>
          <p className="text-muted-foreground">
            Kelola semua informasi akun, alamat, dan pesanan Anda di satu
            tempat.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start ">
          <AccountSidebar
            user={user}
            activeView={activeView}
            setActiveView={setActiveView}
            onLogout={handleLogout}
          />

          <main className="flex-1 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
