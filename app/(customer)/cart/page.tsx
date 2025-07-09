"use client";

// --- 1. IMPORTS ---
import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Store & Tipe Data
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store";
import { CartItem, AppliedVoucher } from "@/lib/types/product"; // Pastikan tipe AppliedVoucher di-ekspor dari file tipe Anda

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  X,
  Loader2,
  TicketPercent,
  CalendarDays,
  Info,
} from "lucide-react";

// =====================================================================
// BAGIAN 1: SUB-KOMPONEN YANG FOKUS DAN DIREVISI
// =====================================================================

/**
 * REVISI: Skeleton Loader yang menarik untuk halaman keranjang.
 * Memberi pengguna gambaran visual tentang apa yang sedang dimuat.
 */
const CartPageSkeleton = () => (
  <div className="pt-10">
    <div className="container mx-auto px-4 py-10 animate-pulse">
      <Skeleton className="h-10 w-1/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-6 w-1/5" />
          </div>
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-start space-x-4 py-4 border-b border-gray-100"
            >
              <Skeleton className="h-6 w-6 rounded mt-5" />
              <Skeleton className="h-24 w-24 rounded-md" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Separator />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * REVISI: Kartu Voucher yang lebih informatif dan menarik.
 */
const AppliedVoucherCard = ({ voucher }: { voucher: AppliedVoucher }) => {
  const { removeVoucher, isApplyingVoucher } = useCartStore();

  // Format tanggal dengan aman, berikan fallback jika null
  const formattedStartDate = voucher.start_date
    ? format(new Date(voucher.start_date), "d MMM yyyy", { locale: localeID })
    : "-";
  const formattedEndDate = voucher.end_date
    ? format(new Date(voucher.end_date), "d MMM yyyy", { locale: localeID })
    : "-";

  return (
    <Card className="bg-emerald-50 border-emerald-200 hover:shadow-sm transition-shadow duration-200 overflow-hidden">
      <CardHeader className=" flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-emerald-100 rounded-md">
            <Tag className="h-4 w-4 text-emerald-700" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-emerald-900 flex items-center gap-2">
              {voucher.code}
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-emerald-600 font-medium">
                  AKTIF
                </span>
              </div>
            </CardTitle>
            <CardDescription className="text-emerald-700 text-sm font-medium mt-1">
              {voucher.name}
            </CardDescription>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-600 hover:text-emerald-900 hover:bg-emerald-100 shrink-0"
          onClick={() => removeVoucher(voucher.code)}
          disabled={isApplyingVoucher}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <Separator className="bg-emerald-600" />

      <CardContent className="space-y-3">
        {voucher.description && (
          <div className="flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
            <p className="text-emerald-800">{voucher.description}</p>
          </div>
        )}

        <div className="flex items-start gap-2 text-sm">
          <CalendarDays className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs text-emerald-600 font-medium">Masa Berlaku</p>
            <p className="text-emerald-800 font-medium">
              {formattedStartDate} - {formattedEndDate}
            </p>
          </div>
        </div>
      </CardContent>

      {/* <div className="h-0.5 bg-emerald-600" /> */}
    </Card>
  );
};

/**
 * REVISI: Dialog Voucher dengan tampilan baru dan state management yang lebih baik.
 */
const VoucherDialog = () => {
  // Ambil state dan aksi yang relevan dari store
  const { applyVoucher, appliedVouchers, voucherError, isApplyingVoucher } =
    useCartStore();
  const [inputCode, setInputCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    if (!inputCode) return;
    // .then() akan dieksekusi jika promise berhasil (resolve)
    applyVoucher(inputCode.trim())
      .then(() => {
        setInputCode(""); // Reset input hanya jika berhasil
      })
      .catch(() => {
        // Biarkan input tetap ada jika gagal, agar user bisa perbaiki
      });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        // Bersihkan error setiap kali dialog ditutup
        if (!open) useCartStore.setState({ voucherError: null });
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-primary bg-secondary/20 hover:text-primary hover:bg-secondary/10 border-primary/30"
        >
          <TicketPercent className="mr-2 h-4 w-4" />
          {appliedVouchers.length > 0
            ? `${appliedVouchers.length} Voucher Diterapkan`
            : "Gunakan Voucher"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kelola Voucher</DialogTitle>
          <DialogDescription>
            Masukkan kode voucher atau lihat voucher yang sedang Anda gunakan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="voucher" className="sr-only">
            Tambah Voucher Baru
          </Label>
          <div className="flex space-x-2">
            <Input
              id="voucher"
              placeholder="Masukkan kode di sini"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              disabled={isApplyingVoucher}
            />
            <Button
              onClick={handleApply}
              disabled={!inputCode || isApplyingVoucher}
            >
              {isApplyingVoucher ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Terapkan"
              )}
            </Button>
          </div>
          {voucherError && (
            <p className="text-sm text-red-600 pt-1">{voucherError}</p>
          )}
        </div>

        {appliedVouchers.length > 0 && (
          <div className="space-y-3 pt-4 border-t max-h-[40vh] overflow-y-auto pr-2">
            <Label>Voucher Diterapkan:</Label>
            {appliedVouchers.map((voucher) => (
              <AppliedVoucherCard key={voucher.code} voucher={voucher} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- CartItemCard & OrderSummary (Tidak ada perubahan signifikan) ---
const CartItemCard = ({ item }: { item: CartItem }) => {
  const {
    updateQuantity,
    removeFromCart,
    toggleSelectItem,
    updatingVariantId,
  } = useCartStore();

  // Gunakan useMemo untuk mencegah kalkulasi ulang yang tidak perlu
  // Tentukan apakah item INI yang sedang diupdate
  const isUpdating = updatingVariantId === item.variantId;
  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(item.price),
    [item.price]
  );

  return (
    <div
      className={cn(
        "flex items-start space-x-4 py-4 justify-center transition-opacity duration-300",
        isUpdating && "opacity-50 pointer-events-none" // <-- Efek visual saat loading
      )}
    >
      <Checkbox
        className="mt-5"
        checked={item.selected}
        onCheckedChange={() => toggleSelectItem(item.variantId)} // Gunakan variantId untuk konsistensi
        disabled={isUpdating}
      />
      <div className="relative w-24 h-24 rounded-md overflow-hidden bg-gray-100">
        <Image
          src={
            item.image
              ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image}`
              : "/placeholder.png"
          }
          alt={item.productName}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between h-24">
        <div>
          <h3 className="text-md font-semibold text-gray-800 line-clamp-1">
            {item.productName}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {item.variantName}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between h-24">
        <p className="text-lg font-bold text-primary mt-1">{formattedPrice}</p>
        <div className="flex justify-between items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50"
            onClick={() => removeFromCart([item.variantId])}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            {/* --- INILAH PERUBAHAN UTAMANYA --- */}
            <div className="w-10 h-8 flex items-center justify-center font-medium">
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <span>{item.quantity}</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* <span className="text-sm text-muted-foreground">Stock : {item.stock}</span> */}
        </div>
      </div>
    </div>
  );
};

const OrderSummary = () => {
  const { summary, items } = useCartStore();
  const router = useRouter();

  const selectedItemsCount = items.filter((item) => item.selected).length;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-4">
        Ringkasan Pesanan
      </h2>
      <div className="space-y-4 my-4">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Subtotal ({selectedItemsCount} produk)
          </span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>
        {summary.totalDiscount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="text-gray-600">Diskon Voucher</span>
            <span className="font-semibold">
              - {formatCurrency(summary.totalDiscount)}
            </span>
          </div>
        )}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-lg my-4">
        <span>Total</span>
        <span>{formatCurrency(summary.grandTotal)}</span>
      </div>
      <Button
        size="lg"
        className="w-full"
        disabled={selectedItemsCount === 0}
        onClick={() => router.push("/checkout")}
      >
        Lanjut ke Checkout ({selectedItemsCount})
      </Button>
    </div>
  );
};

// =====================================================================
// BAGIAN 2: KOMPONEN UTAMA (THE ORCHESTRATOR)
// =====================================================================

export default function CartPage() {
  const { isAuthenticated } = useAuthStore();
  // REVISI: Ambil state yang relevan. Kita tidak lagi menghitung apapun di sini.
  const { items, isLoading, isInitialized, toggleSelectAll, removeFromCart } =
    useCartStore();

  // REVISI: State turunan hanya untuk UI, bukan untuk kalkulasi.
  const selectedItems = useMemo(
    () => items.filter((item) => item.selected),
    [items]
  );
  const isAllSelected = useMemo(
    () => items.length > 0 && selectedItems.length === items.length,
    [items, selectedItems]
  );

  // --- Render Logic ---
  if (!isInitialized) {
    return <CartPageSkeleton />; // <-- Gunakan skeleton loader baru
  }

  if (items.length === 0) {
    return (
      <div className="pt-10">
        <div className="container mx-auto px-4 py-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingBag className="mx-auto h-24 w-24 text-gray-300" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Keranjang Belanja Anda Kosong
          </h1>
          <p className="mt-2 text-gray-500">
            Sepertinya Anda belum menambahkan apapun.
          </p>
          <Button asChild className="mt-6">
            <Link href="/collections">Mulai Belanja</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Keranjang Saya
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start space-y-6 lg:space-y-0">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 relative">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="select-all"
                  checked={isAllSelected}
                  onCheckedChange={(checked) =>
                    toggleSelectAll(Boolean(checked))
                  }
                  disabled={isLoading}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Pilih Semua ({items.length} produk)
                </label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() =>
                  removeFromCart(selectedItems.map((item) => item.variantId))
                }
                disabled={selectedItems.length === 0 || isLoading}
              >
                Hapus ({selectedItems.length})
              </Button>
            </div>

            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <CartItemCard key={item.variantId} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-3 sticky top-28">
            {isAuthenticated && <VoucherDialog />}
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
