"use client";

// --- 1. IMPORTS ---
import { useState, useEffect, useMemo, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";

// Store & Tipe Data
import { useCartStore } from "@/lib/store/useCartStore";
import { useAuthStore } from "@/lib/store";
import { AddressForm } from "@/components/account/AddressForm";
import { Address } from "@/lib/types/profile";

import { CartItem, AppliedVoucher } from "@/lib/types/product";
 // Asumsi tipe terpusat

// Komponen & Ikon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { MapPin, Truck, Loader2, Plus, AlertCircle, ShieldCheck, Edit, ShoppingBag, TicketPercent, Tag, X, Info, CalendarDays, Minus } from "lucide-react";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

// Tipe Data Spesifik
type ShippingCost = { service: string; description: string; cost: { value: number; etd: string; note: string; }[]; };
type ShippingOption = { code: string; name: string; costs: ShippingCost[]; };

declare global {
  interface Window {
    snap: any;
  }
}

// =====================================================================
// BAGIAN 1: SUB-KOMPONEN YANG FOKUS DAN DIREVISI
// =====================================================================

/**
 * REVISI: Skeleton Loader yang baru, meniru layout yang lebih kompleks.
 */
const CheckoutPageSkeleton = () => (
    <div className="container mx-auto px-4 py-24 animate-pulse">
        <Skeleton className="h-10 w-1/3 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    </div>
);

/**
 * REVISI: Komponen ini sekarang hanya menampilkan alamat yang dipilih.
 * Aksi untuk mengubahnya akan membuka sebuah Dialog.
 */
const AddressDisplayCard = ({ address, onEditClick }: { address: Address | null; onEditClick: () => void }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Alamat Pengiriman</CardTitle>
        <Button variant="outline" size="sm" onClick={onEditClick}><Edit className="h-4 w-4 mr-2" /> Ganti</Button>
      </CardHeader>
      <CardContent>
        {address ? (
          <div>
            <p className="font-semibold">{address.recipient_name} <span className="font-normal text-muted-foreground">({address.label})</span></p>
            <p className="text-sm text-muted-foreground">{address.phone_number}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {address.address_detail}, {address.subdistrict_name}, {address.city_name}, {address.province_name} {address.postal_code}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Silakan pilih atau tambah alamat pengiriman.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * REVISI BARU: Komponen untuk menampilkan daftar item yang akan di-checkout.
 */
const CheckoutItemsList = () => {
    const { items, updateQuantity, isLoading } = useCartStore();
    const itemsToCheckout = items.filter(item => item.selected);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><ShoppingBag className="h-5 w-5 mr-2" />Produk yang Dipesan ({itemsToCheckout.length})</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
                {itemsToCheckout.map(item => (
                    <div key={item.variantId} className={cn("flex items-start space-x-4 py-4", isLoading && "opacity-50 pointer-events-none")}>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                            <Image src={item.image ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${item.image}` : "/placeholder.png"} alt={item.productName} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">{item.productName}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.variantName}</p>
                            <p className="text-sm font-semibold text-primary mt-1">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(item.price)}</p>
                        </div>
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading} onClick={() => updateQuantity(item.variantId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                            <span className="w-10 text-center font-medium text-sm">{isLoading && <Loader2 className="h-4 w-4 animate-spin mx-auto" />}{!isLoading && item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading} onClick={() => updateQuantity(item.variantId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

/**
 * REVISI: Komponen ini sekarang hanya menampilkan pengiriman yang dipilih.
 * Aksi untuk mengubahnya akan membuka sebuah Dialog.
 */
const ShippingDisplayCard = ({ shipping, isLoading, onEditClick }: {
    shipping: { courier: string; service: string; cost: number; etd: string; } | null;
    isLoading: boolean;
    onEditClick: () => void;
}) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Metode Pengiriman</CardTitle>
                {shipping && <Button variant="outline" size="sm" onClick={onEditClick}><Edit className="h-4 w-4 mr-2" /> Ganti</Button>}
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center gap-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /><p className="text-muted-foreground">Menghitung ongkos kirim...</p></div>
                ) : shipping ? (
                    <div>
                        <p className="font-semibold">{shipping.courier.toUpperCase()} - {shipping.service}</p>
                        <p className="text-sm text-muted-foreground">Estimasi {shipping.etd} hari</p>
                        <p className="font-semibold mt-1">{formatCurrency(shipping.cost)}</p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted-foreground">Pilih alamat terlebih dahulu untuk melihat opsi pengiriman.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// --- Komponen lain (AddressSelectionDialog, ShippingSelectionDialog, CheckoutSummary) ---
// ... (Kode untuk komponen-komponen ini tidak berubah signifikan, hanya dipanggil dari tempat baru)
const AddressSelectionDialog = ({
  addresses,
  currentAddressId,
  onSelect,
  onAddressChange,
  onAction,
}: {
  addresses: Address[];
  currentAddressId: number | null;
  onAction: () => void;
  onSelect: (addressId: number) => void;
  onAddressChange: () => void; // Callback untuk refresh daftar alamat
}) => {
  const [address, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(currentAddressId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data);
    } catch (err) {
      showError("Gagal memuat daftar alamat.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);
  const handleSelectAndClose = () => {
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  // TODO: Implementasikan komponen AddressForm di sini jika diperlukan
  // const AddressForm = () => <div>Form Tambah Alamat</div>;
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchAddresses();
    onAction();
  };
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Pilih Alamat Pengiriman</DialogTitle>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-4 py-4">
        <RadioGroup
          value={selectedId?.toString()}
          onValueChange={(val) => setSelectedId(parseInt(val))}
        >
          {addresses.map((address) => (
            <Label
              key={address.id}
              htmlFor={`dialog-address-${address.id}`}
              className={cn(
                "flex items-start space-x-4 border rounded-lg p-4 transition-all cursor-pointer",
                selectedId === address.id &&
                  "border-primary ring-2 ring-primary/20"
              )}
            >
              <RadioGroupItem
                value={address.id.toString()}
                id={`dialog-address-${address.id}`}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-semibold flex items-center">
                  {address.recipient_name}{" "}
                  <span className="font-normal text-muted-foreground ml-1">
                    ({address.label})
                  </span>
                  {/* REVISI: Tambahkan Badge "Utama" */}
                  {address.is_primary && (
                    <Badge variant="default" className="ml-2 text-xs">
                      Utama
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {address.phone_number}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {address.address_detail}, {address.city_name}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>
      <DialogFooter className="sm:justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Alamat Baru
        </Button>
        <Button onClick={handleSelectAndClose} disabled={!selectedId}>
          Pilih Alamat
        </Button>
      </DialogFooter>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl">
          <DialogHeader>
            <DialogTitle>'Tambah Alamat Baru'</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DialogContent>
  );
};

const ShippingSelector = ({
  options,
  isLoading,
  selectedService,
  onSelectService,
}: {
  options: ShippingOption[];
  isLoading: boolean;
  selectedService: {
    courier: string;
    service: string;
    cost: number;
    etd: string;
  } | null;
  onSelectService: (data: {
    courier: string;
    service: string;
    cost: number;
    etd: string;
  }) => void;
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pilih Metode Pengiriman</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!options || options.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pilih Metode Pengiriman</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Ada Opsi Pengiriman</AlertTitle>
            <AlertDescription>
              Tidak ada layanan kurir yang tersedia untuk alamat tujuan Anda.
              Silakan coba alamat lain.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pilih Metode Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={
            selectedService
              ? `${selectedService.courier}|${selectedService.service}`
              : ""
          }
          onValueChange={(value) => {
            const [courier, service, cost, etd] = value.split("|");
            onSelectService({
              courier,
              service,
              cost: parseInt(cost),
              etd,
            });
          }}
        >
          <div className="space-y-2">
            {options.map(
              (courier) =>
                courier.costs &&
                courier.costs.map((serviceOption) => {
                  const uniqueValue = `${courier.code}|${serviceOption.service}|${serviceOption.cost[0].value}|${serviceOption.cost[0].etd}`;
                  const isSelected =
                    selectedService?.courier === courier.code &&
                    selectedService?.service === serviceOption.service;

                  return (
                    <Label
                      key={uniqueValue}
                      htmlFor={uniqueValue}
                      className={cn(
                        "flex items-center justify-between border rounded-lg p-4 transition-all cursor-pointer",
                        isSelected && "border-primary ring-2 ring-primary/20"
                      )}
                    >
                      <div>
                        <p className="font-semibold">
                          {courier.name} - {serviceOption.service}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {serviceOption.description} (Estimasi{" "}
                          {serviceOption.cost[0].etd} hari)
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-bold">
                          {formatCurrency(serviceOption.cost[0].value)}
                        </p>
                        <RadioGroupItem value={uniqueValue} id={uniqueValue} />
                      </div>
                    </Label>
                  );
                })
            )}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

const CheckoutSummary = ({
  shippingCost,
  onPlaceOrder,
  isPlacingOrder,
  isReadyToPay,
}: {
  shippingCost: number;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  isReadyToPay: boolean;
}) => {
  const { summary, items } = useCartStore();

  const grandTotal = summary.grandTotal + shippingCost;
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Ringkasan Pesanan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-48 overflow-y-auto pr-2 space-y-2">
          {items
            .filter((item) => item.selected)
            .map((item) => (
              <div
                key={item.variantId}
                className="flex justify-between text-sm"
              >
                <p className="truncate pr-2">
                  {item.productName}{" "}
                  <span className="text-muted-foreground">
                    x{item.quantity}
                  </span>
                </p>
                <p className="font-medium shrink-0">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
        </div>
        <Separator />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>
        {summary.totalDiscount > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diskon Voucher</span>
            <span className="font-semibold text-green-600">
              - {formatCurrency(summary.totalDiscount)}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Biaya Pengiriman</span>
          <span className="font-semibold">{formatCurrency(shippingCost)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total Pembayaran</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full"
          onClick={onPlaceOrder}
          disabled={!isReadyToPay || isPlacingOrder}
        >
          {isPlacingOrder ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}
          Bayar Sekarang
        </Button>
      </CardFooter>
    </Card>
  );
};
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
// =====================================================================
// KOMPONEN UTAMA
// =====================================================================

export default function CheckoutPage() {
    const router = useRouter();
    const { clearCart, items } = useCartStore();

    // ... (Semua state Anda: addresses, shippingOptions, selectedAddressId, dll.)
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [isMidtransLoaded, setIsMidtransLoaded] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
    const [selectedShipping, setSelectedShipping] = useState<{ courier: string; service: string; cost: number; etd: string; } | null>(null);
    const [isAddressLoading, setIsAddressLoading] = useState(true);
    const [isCostLoading, setIsCostLoading] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    
    // State untuk mengontrol dialog
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [isShippingDialogOpen, setIsShippingDialogOpen] = useState(false);
    const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
    
    // ... (Semua useEffect dan handler Anda: fetchAddresses, calculateShippingCost, handlePlaceOrder)
    
const selectedItems = items.filter((item) => item.selected);

  useEffect(() => {
    if (selectedItems.length === 0) {
      showError(
        "Keranjang Anda kosong. Silakan tambahkan produk terlebih dahulu."
      );
      router.push("/cart");
      return;
    }
  }, [selectedItems, router]);

  // Ambil alamat
  const fetchAddresses = async () => {
    setIsAddressLoading(true);
    try {
      const response = await api.get("/addresses");
      const fetchedAddresses = response.data;
      setAddresses(fetchedAddresses);

      // Jika belum ada alamat yang dipilih, atau alamat yang dipilih sudah tidak ada,
      // set ke alamat utama atau alamat pertama.
      if (
        !selectedAddressId ||
        !fetchedAddresses.some((addr: Address) => addr.id === selectedAddressId)
      ) {
        const primaryAddress = fetchedAddresses.find(
          (addr: Address) => addr.is_primary
        );
        if (primaryAddress) {
          setSelectedAddressId(primaryAddress.id);
        } else if (fetchedAddresses.length > 0) {
          setSelectedAddressId(fetchedAddresses[0].id);
        }
      }
    } catch (err) {
      showError("Gagal memuat alamat Anda.");
    } finally {
      setIsAddressLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Hitung ongkir
  useEffect(() => {
    if (!selectedAddressId) {
      setShippingOptions([]);
      return;
    }

    const calculateShippingCost = async () => {
      setIsCostLoading(true);
      setSelectedShipping(null);

      try {
        const selectedAddr = addresses.find(
          (addr) => addr.id === selectedAddressId
        );
        if (!selectedAddr) {
          console.error("Selected address not found");
          return;
        }

        console.log("Calculating shipping for address:", selectedAddr);

        const response = await api.post("/location/cost", {
          destination_district_id: selectedAddr.district_id,
        });

        console.log("Shipping cost response:", response.data);

        // Validasi response
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error("Invalid shipping response format");
        }

        // Transformasi data
        const rawOptions = response.data;
        const groupedOptions = rawOptions.reduce((acc: any, option: any) => {
          // Validasi data option
          if (!option.code || !option.name || !option.service) {
            console.warn("Invalid shipping option:", option);
            return acc;
          }

          if (!acc[option.code]) {
            acc[option.code] = {
              code: option.code,
              name: option.name,
              costs: [],
            };
          }

          acc[option.code].costs.push({
            service: option.service,
            description: option.description || "",
            cost: [
              {
                value: Number(option.cost) || 0,
                etd: option.etd || "1-2",
                note: "",
              },
            ],
          });
          return acc;
        }, {});

        const finalOptions = Object.values(groupedOptions);
        console.log("Final shipping options:", finalOptions);
        setShippingOptions(finalOptions as ShippingOption[]);
      } catch (err: any) {
        console.error("Error calculating shipping:", err);
        showError(
          "Gagal menghitung ongkos kirim: " +
            (err.response?.data?.message || err.message)
        );
        setShippingOptions([]);
      } finally {
        setIsCostLoading(false);
      }
    };

    calculateShippingCost();
  }, [selectedAddressId, addresses]);

  // Fungsi validasi sebelum submit
  const validateOrderData = () => {
    if (!selectedAddressId) {
      showError("Silakan pilih alamat pengiriman");
      return false;
    }

    if (!selectedShipping) {
      showError("Silakan pilih metode pengiriman");
      return false;
    }

    if (selectedItems.length === 0) {
      showError("Keranjang Anda kosong");
      return false;
    }

    if (!isMidtransLoaded) {
      showError("Sistem pembayaran sedang dimuat. Silakan tunggu sebentar.");
      return false;
    }

    return true;
  };

  // Fungsi untuk memproses pembayaran
  const handlePlaceOrder = async () => {
    if (!validateOrderData()) return;

    setIsPlacingOrder(true);

    try {
      // Persiapkan data order
      const orderData = {
        address_id: selectedAddressId,
        shipping_courier: selectedShipping!.courier,
        shipping_service: selectedShipping!.service,
        shipping_cost: Number(selectedShipping!.cost),
        shipping_etd: selectedShipping!.etd,
      };

      console.log("Sending order data:", orderData);

      const response = await api.post("/orders", orderData);
      console.log("Order response:", response.data);

      const { snap_token, order_id, order_number } = response.data;

      if (!snap_token) {
        throw new Error("Token pembayaran tidak diterima dari server");
      }

      if (!window.snap) {
        throw new Error("Midtrans Snap tidak tersedia");
      }

      // Proses pembayaran dengan Midtrans
      window.snap.pay(snap_token, {
        onSuccess: function (result: any) {
          console.log("Payment success:", result);
          showSuccess("Pembayaran berhasil!");
          clearCart();
          router.push(`/profile/orders/${order_id}`);
        },
        onPending: function (result: any) {
          console.log("Payment pending:", result);
          showSuccess("Pembayaran sedang diproses");
          clearCart();
          router.push(`/profile/orders/${order_id}`);
        },
        onError: function (result: any) {
          console.error("Payment error:", result);
          showError("Pembayaran gagal. Silakan coba lagi.");
        },
        onClose: function () {
          console.log("Payment popup closed");
        },
      });
    } catch (err: any) {
      console.error("Order creation error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Gagal membuat pesanan";
      showError(errorMessage);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr.id === selectedAddressId),
    [addresses, selectedAddressId]
  );

    if (isAddressLoading) return <CheckoutPageSkeleton />;

    return (
        <>
           <Script
        type="text/javascript"
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL ||
          "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        onLoad={() => {
          console.log("Midtrans script loaded");
          setIsMidtransLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load Midtrans script:", e);
          showError("Gagal memuat sistem pembayaran");
        }}
      />
            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-24">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start">
                        
                        <div className="lg:col-span-2 space-y-6">
                            {/* REVISI: Alamat, Item, dan Pengiriman sekarang adalah kartu terpisah */}
                            <AddressDisplayCard address={selectedAddress || null} onEditClick={() => setIsAddressDialogOpen(true)} />
                            <CheckoutItemsList />
                            <ShippingDisplayCard shipping={selectedShipping} isLoading={isCostLoading} onEditClick={() => setIsShippingDialogOpen(true)} />
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            {/* REVISI: Tombol Voucher sekarang ada di sini */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Voucher & Diskon</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full" onClick={() => setIsVoucherDialogOpen(true)}>
                                        <TicketPercent className="mr-2 h-4 w-4" /> Gunakan Voucher
                                    </Button>
                                </CardContent>
                            </Card>
                            <CheckoutSummary 
                                shippingCost={selectedShipping?.cost || 0}
                                onPlaceOrder={handlePlaceOrder}
                                isPlacingOrder={isPlacingOrder}
                                isReadyToPay={!!selectedShipping && !!selectedAddressId}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* REVISI: Semua pilihan sekarang ada di dalam Dialog terpisah */}
            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                {/* ... Isi AddressSelectionDialog di sini ... */}
                <AddressSelectionDialog
                    addresses={addresses}
                    currentAddressId={selectedAddressId}
                    onSelect={(id) => {
                        setSelectedAddressId(id);
                        setIsAddressDialogOpen(false);
                    }}
                    onAddressChange={fetchAddresses}
                    onAction={() => {
                        // Callback untuk refresh data setelah aksi
                        fetchAddresses();
                    }}
                />
            </Dialog>
            <Dialog open={isShippingDialogOpen} onOpenChange={setIsShippingDialogOpen}>
                {/* ... Isi ShippingSelectionDialog (RadioGroup) di sini ... */}
                <ShippingSelector
                    options={shippingOptions}
                    isLoading={isCostLoading}
                    selectedService={selectedShipping}
                    onSelectService={(data) => {
                        setSelectedShipping(data);
                        setIsShippingDialogOpen(false);
                    }}
                />
            </Dialog>
            <Dialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen}>
                {/* ... Isi VoucherDialog di sini ... */}
                {/* <VoucherDialog
                    appliedVouchers={appliedVouchers}
                    onApplyVoucher={handleApplyVoucher}
                    onRemoveVoucher={handleRemoveVoucher}
                /> */}
                <VoucherDialog />
            </Dialog>
        </>
    );
}
