import Navbar from "@/components/user/Navbar";
import Footer from "@/components/user/Footer";
import AuthStatusNotifier from "@/components/auth/auth-status-notifier"; // <-- Impor komponen baru


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
        {/* {children} akan menjadi halaman seperti /collections, /about, dll. */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
