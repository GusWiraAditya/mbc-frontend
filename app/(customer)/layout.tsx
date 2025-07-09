import Navbar from "@/components/user/Navbar";
import Footer from "@/components/user/Footer";
import { CartSyncTrigger } from '@/components/auth/CartSyncTrigger';
import AuthStatusNotifier from "@/components/auth/auth-status-notifier"; // <-- Impor komponen baru
import FloatingWhatsappButton from "@/components/ui/floating-wa";



/**
 * Layout ini khusus untuk halaman-halaman yang dapat diakses oleh customer.
 * Ia akan menambahkan Navbar dan Footer di sekitar konten halaman.
 */
export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <AuthStatusNotifier />
      <Navbar />
      <main className="flex-grow">
        <CartSyncTrigger /> {/* <-- LETAKKAN DI SINI */}
        {/* {children} akan menjadi halaman seperti /collections, /about, dll. */}
        {children}
         <FloatingWhatsappButton />
      </main>
      <Footer />
    </div>
  );
}
