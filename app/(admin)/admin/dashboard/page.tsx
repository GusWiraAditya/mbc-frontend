'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthenticatedUser, AuthenticatedUser } from '@/lib/auth';
import { DataTableDemo } from "./data-table"
// import LogoutButton from "@/components/auth/logout-button";
export default function Page() {
  const [authData, setAuthData] = useState<AuthenticatedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const data = await getAuthenticatedUser();
  
          // Pengecekan lebih sederhana dan terpusat.
          // Jika user tidak punya role 'admin', maka redirect.
          if (!data.roles || !data.roles.includes('admin')) {
            throw new Error('Not an admin');
          }
  
          setAuthData(data);
        } catch (err) {
          // Jika gagal (entah karena tidak login atau bukan admin), redirect.
          router.push('/auth/login-admin');
        } finally {
          setLoading(false);
        }
      };
  
      checkAuth();
    }, [router]);
  return (
    <SidebarProvider>
      <AppSidebar user={authData?.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTableDemo />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
