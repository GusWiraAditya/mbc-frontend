"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { showError, showSuccess } from "@/lib/toast";
import {
  Menu,
  X,
  Search,
  User,
  LogOut,
  ChevronDown,
  ShoppingCart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import logoPrim from "@/public/logo/mbc-primary.png";
import logoPutih from "@/public/logo/mbc-putih.png";
import { useAuthStore } from "@/lib/store";
import { useCartStore } from "@/lib/store/useCartStore"; // <-- TAMBAHKAN INI

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { items } = useCartStore();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  // REVISI: Navbar sekarang hanya membaca state dari store.
  // Tidak ada lagi pemanggilan fetchUser() dari sini.
  const { user, isAuthenticated, logout } = useAuthStore();

  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const router = useRouter();

  // REVISI: useEffect untuk fetchUser() telah DIHAPUS.
  // Tugas ini sekarang sepenuhnya ditangani oleh AuthProvider di layout.

  // Efek untuk scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Efek untuk menutup menu & dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efek untuk menutup menu mobile saat navigasi
  useEffect(() => {
    if (isMenuOpen) setIsMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  /**
   * REVISI KUNCI: handleLogout sekarang mengelola alur UI secara lengkap.
   */
  const handleLogout = async () => {
    try {
      // 1. Panggil fungsi logout dari store untuk menghancurkan sesi.
      await logout();
      setIsProfileOpen(false);

      // 2. Tampilkan pesan sukses.
      showSuccess("Anda telah berhasil logout.");

      // 3. Beri sedikit jeda agar user sempat melihat toast, lalu redirect.
      // setTimeout(() => {
      router.push("/");
      // }, 1500); // 1.5 detik
    } catch (error) {
      showError("Logout gagal, silakan coba lagi.");
    }
  };

  const navColor = isHome && !isScrolled ? "text-white" : "text-primary";
  const borderColor = isHome && !isScrolled ? "border-white" : "border-primary";
  const searchInputColor =
    isHome && !isScrolled
      ? "placeholder:text-neutral-50 border-neutral-50 text-neutral-50"
      : "placeholder:text-primary border-primary text-primary";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
          isHome && !isScrolled ? "bg-transparent" : "bg-white shadow-md"
        }`}
      >
        <div className="flex justify-between items-center px-6 md:px-20 py-2">
          <Link href="/" className="flex-shrink-0">
            <Image
              src={isHome && !isScrolled ? logoPutih : logoPrim}
              alt="MBC Logo"
              height={80}
              className="h-14 sm:h-20 w-auto"
              priority
            />
          </Link>

          <ul className="hidden md:flex gap-8 font-semibold">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`transition-all pb-1 ${navColor} ${
                      isActive
                        ? `border-b-2 ${borderColor}`
                        : `hover:border-b-2 ${borderColor}`
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:flex items-center gap-6">
            <div className="relative flex items-center">
              <Search className={`absolute left-0 w-4 h-4 ${navColor}`} />
              <input
                type="text"
                placeholder="Search..."
                className={`bg-transparent border-b pl-6 outline-none text-sm w-32 ${searchInputColor}`}
              />
            </div>
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="relative group"
            >
              {/* Ikon Keranjang */}
              <div
                className={`${navColor} group-hover:text-secondary transition-colors`}
              >
                <ShoppingCart size={24} />
              </div>

              {/* Badge Notifikasi: Muncul hanya jika ada item di keranjang */}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-6">
                <Link
                  href="/profile/myOrder"
                  aria-label="Shopping Cart"
                  className={`flex items-center gap-2 font-semibold ${navColor}`}
                >
                  <User size={24} />
                  {user.name}
                </Link>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-secondary text-white font-bold px-5 py-2 rounded hover:opacity-90">
                  LOG IN
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} aria-label="Toggle Menu">
              {isMenuOpen ? (
                <X size={28} className={navColor} />
              ) : (
                <Menu size={28} className={navColor} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer & Overlay */}
      <>
        <div
          className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={toggleMenu}
        />
        <div
          className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white p-6 z-50 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center mb-8">
            <Image src={logoPrim} alt="MBC Logo" className="h-12 w-auto" />
            <button onClick={toggleMenu} aria-label="Close Menu">
              <X size={24} className={"text-primary"} />
            </button>
          </div>

          <nav className="flex flex-col gap-5 font-semibold text-lg">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`pb-2 ${
                  pathname === href
                    ? "text-primary border-b-2 border-primary"
                    : "text-neutral-800 hover:text-primary"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t my-6"></div>

          <div className="relative flex items-center mb-6">
            <Search className={`absolute left-0 w-4 h-4 text-primary`} />
            <input
              type="text"
              placeholder="Search..."
              className={`bg-transparent border-b pl-6 outline-none text-sm w-full placeholder:text-primary border-primary text-primary`}
            />
          </div>

          {isAuthenticated && user ? (
            <div className="space-y-4">
              <p className="font-semibold text-lg">{user.name}</p>
              <Link href="/cart" className="w-full block">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} /> View Cart
                </Button>
              </Link>
              <Link href="/profile" className="w-full block">
                <Button variant="outline" className="w-full">
                  Profile
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                className="bg-red-500 text-white w-full hover:bg-red-600"
              >
                LOG OUT
              </Button>
            </div>
          ) : (
            <Link href="/auth/login" className="w-full">
              <Button className="bg-primary text-white font-bold w-full py-2.5 rounded">
                LOG IN
              </Button>
            </Link>
          )}
        </div>
      </>
    </>
  );
}
