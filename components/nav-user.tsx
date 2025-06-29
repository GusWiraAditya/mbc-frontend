"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store";
import { Skeleton } from "@/components/ui/skeleton";
import { showSuccess, showError } from "@/lib/toast";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

   /**
   * REVISI KUNCI: handleLogout sekarang mengelola alur UI secara lengkap untuk admin.
   */
  const handleLogout = async () => {
    // Mencegah klik ganda saat proses logout sedang berjalan
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // 1. Panggil fungsi logout dari store untuk menghancurkan sesi.
      await logout();
      
      // 2. Tampilkan pesan sukses.
      showSuccess('Anda telah berhasil logout.');
      
      // 3. Arahkan ke halaman login admin setelah logout berhasil.
      // Kita tidak perlu jeda di sini karena tidak ada state yang perlu ditunggu.
      router.push("/auth/login-admin");

    } catch (error) {
      showError("Logout gagal, silakan coba lagi.");
      console.error("Logout failed:", error);
    } finally {
      // Pastikan state loading selalu direset
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="grid flex-1 text-left gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton 
              size="lg" 
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={isLoggingOut}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar || ''} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg" 
            side={isMobile ? "bottom" : "right"} 
            align="end" 
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar || ''} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-500 focus:bg-red-50 focus:text-red-600 cursor-pointer"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}