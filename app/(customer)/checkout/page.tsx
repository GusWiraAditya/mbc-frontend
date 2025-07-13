"use client";

// --- 1. IMPORTS ---
import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Image from "next/image";

// Store & Tipe Data
import { useCartStore } from "@/lib/store/useCartStore";
import { Address } from "@/lib/types/profile";
import { AppliedVoucher } from "@/lib/types/product";

// Komponen & Ikon
import { AddressForm } from "@/components/account/AddressForm"; // <-- TAMBAHKAN IMPORT INI (sesuaikan path)
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  AlertCircle,
  ShieldCheck,
  Edit,
  ShoppingBag,
  TicketPercent,
  Tag,
  X,
  Info,
  CalendarDays,
  Minus,
} from "lucide-react";
import api from "@/lib/api"; // Penting: Pastikan file ini (lib/api.ts) sudah dikonfigurasi dengan `withCredentials: true`
import { showError, showSuccess, showInfo } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { add, format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { on } from "events";

// --- Tipe Data Spesifik Halaman ---
type ShippingCost = {
  service: string;
  description: string;
  cost: { value: number; etd: string; note: string }[];
};

type ShippingOption = {
  code: string;
  name: string;
  costs: ShippingCost[];
};

type SelectedShipping = {
  courier: string;
  service: string;
  cost: number;
  etd: string;
};

declare global {
  interface Window {
    snap: any;
  }
}

// =====================================================================
// BAGIAN 1: SUB-KOMPONEN (Tidak ada perubahan signifikan, sudah baik)
// =====================================================================

const CheckoutPageSkeleton = () => (
  <div className="container mx-auto px-4 py-24 animate-pulse">
    <Skeleton className="h-10 w-1/3 mb-8" />
    <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8 items-start">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

const AddressDisplayCard = ({
  address,
  onEditClick,
  onAddNew,
}: {
  onAddNew?: () => void;
  address: Address | null;
  onEditClick: () => void;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Alamat Pengiriman</CardTitle>
      <Button
        variant="outline"
        size="sm"
        onClick={address ? onEditClick : onAddNew}
      >
        {address ? (
          <>
            <Edit className="h-4 w-4 mr-2" /> Ganti
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" /> Tambah Alamat
          </>
        )}
      </Button>
    </CardHeader>
    <CardContent>
      {address ? (
        <div>
          <p className="font-semibold">
            {address.recipient_name}{" "}
            <span className="font-normal text-muted-foreground">
              ({address.label})
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            {address.phone_number}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {address.address_detail}, {address.subdistrict_name},{" "}
            {address.city_name}, {address.province_name} {address.postal_code}
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground">
            Silakan pilih atau tambah alamat pengiriman.
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const AddressSelectionDialog = ({
  addresses,
  currentAddressId,
  onSelect,
  onAddNew,
}: {
  addresses: Address[];
  currentAddressId: number | null;
  onSelect: (addressId: number) => void;
  onAddNew: () => void;
}) => {
  const [selectedId, setSelectedId] = useState(currentAddressId);
  useEffect(() => {
    setSelectedId(currentAddressId);
  }, [currentAddressId]);
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
        <Button variant="outline" onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" /> Tambah Alamat Baru
        </Button>
        <Button
          onClick={() => selectedId && onSelect(selectedId)}
          disabled={!selectedId}
        >
          Pilih Alamat
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const CheckoutItemsList = () => {
  const { items, updateQuantity, isLoading } = useCartStore();
  const itemsToCheckout = items.filter((item) => item.selected);
  const cartItemsFromStore = useCartStore.getState().items;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Produk yang Dipesan ({itemsToCheckout.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {itemsToCheckout.map((item) => {
          const isItemLoading =
            isLoading &&
            item.quantity !==
              cartItemsFromStore.find((i) => i.variantId === item.variantId)
                ?.quantity;
          return (
            <div
              key={item.variantId}
              className={cn(
                "flex items-start space-x-4 py-4",
                isLoading && "opacity-50 pointer-events-none"
              )}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden bg-gray-100 shrink-0">
                <Image
                  src={
                    item.image
                      ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.image}`
                      : "/placeholder.png"
                  }
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-1">
                  {item.productName}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {item.variantName}
                </p>
                <p className="text-sm font-semibold text-primary mt-1">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(item.price)}
                </p>
              </div>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  // Tambahkan kondisi 'item.quantity <= 1' di sini
                  disabled={isLoading || item.quantity <= 1}
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity - 1)
                  }
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center font-medium text-sm">
                  {isItemLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    item.quantity
                  )}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={isLoading}
                  onClick={() =>
                    updateQuantity(item.variantId, item.quantity + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

const ShippingDisplayCard = ({
  shipping,
  isLoading,
  onSelectClick, // Ganti nama prop agar lebih jelas
  hasAddress,
}: {
  shipping: SelectedShipping | null;
  isLoading: boolean;
  onSelectClick: () => void; // Fungsi untuk membuka dialog
  hasAddress: boolean;
}) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Pengiriman</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Tampilan saat loading
          <div className="flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-muted-foreground">Menghitung ongkos kirim...</p>
          </div>
        ) : shipping ? (
          // Tampilan SETELAH metode dipilih
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {shipping.courier.toUpperCase()} - {shipping.service}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimasi {shipping.etd}
              </p>
              <p className="font-semibold mt-1 text-primary">
                {formatCurrency(shipping.cost)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={onSelectClick}>
              <Edit className="h-4 w-4 mr-2" />
              Ganti
            </Button>
          </div>
        ) : // Tampilan SEBELUM metode dipilih
        hasAddress ? (
          <Button className="w-full" variant="outline" onClick={onSelectClick}>
            Pilih Metode Pengiriman
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Pilih alamat terlebih dahulu untuk melihat opsi pengiriman.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const ShippingSelectionDialog = ({
  options,
  isLoading,
  currentService,
  onSelect,
  onCancel,
}: {
  options: ShippingOption[];
  isLoading: boolean;
  currentService: { courier: string; service: string } | null;
  onSelect: (data: SelectedShipping) => void;
  onCancel: () => void;
}) => {
  const [selectedValue, setSelectedValue] = useState(
    currentService ? `${currentService.courier}|${currentService.service}` : ""
  );
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  const handleSelect = () => {
    if (!selectedValue) return;
    const [courierCode, serviceName] = selectedValue.split("|");
    const courier = options.find((opt) => opt.code === courierCode);
    const service = courier?.costs.find((cost) => cost.service === serviceName);
    if (courier && service) {
      onSelect({
        courier: courier.code,
        service: service.service,
        cost: service.cost[0].value,
        etd: service.cost[0].etd,
      });
    }
  };
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Pilih Metode Pengiriman</DialogTitle>
      </DialogHeader>
      <div className="max-h-[60vh] overflow-y-auto pr-4 py-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : !options || options.length === 0 ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tidak Ada Opsi Pengiriman</AlertTitle>
            <AlertDescription>
              Tidak ada jasa pengiriman yang tersedia untuk alamat tujuan Anda.
            </AlertDescription>
          </Alert>
        ) : (
          <RadioGroup value={selectedValue} onValueChange={setSelectedValue}>
            <div className="space-y-2">
              {options.map((courier) =>
                courier.costs?.map((serviceOption) => {
                  const uniqueValue = `${courier.code}|${serviceOption.service}`;
                  return (
                    <Label
                      key={uniqueValue}
                      htmlFor={uniqueValue}
                      className={cn(
                        "flex items-center justify-between border rounded-lg p-4 transition-all cursor-pointer",
                        selectedValue === uniqueValue &&
                          "border-primary ring-2 ring-primary/20"
                      )}
                    >
                      <div>
                        <p className="font-semibold">
                          {courier.name} - {serviceOption.service}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {serviceOption.description} (Estimasi{" "}
                          {serviceOption.cost[0].etd})
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
        )}
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button disabled={!selectedValue} onClick={handleSelect}>
          Pilih Pengiriman
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const VoucherDialog = ({
  onVoucherChange,
  onClose,
}: {
  onVoucherChange: () => void;
  onClose: () => void;
}) => {
  const {
    applyVoucher,
    removeVoucher,
    appliedVouchers,
    voucherError,
    isApplyingVoucher,
  } = useCartStore();
  const [inputCode, setInputCode] = useState("");
  const handleApply = async () => {
    if (!inputCode) return;
    try {
      await applyVoucher(inputCode.trim());
      setInputCode("");
      onVoucherChange();
    } catch (error) {
      /* handled by store */
    }
  };
  const handleRemove = async (code: string) => {
    await removeVoucher(code);
    onVoucherChange();
  };
  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Kelola Voucher</DialogTitle>
        <DialogDescription>
          Masukkan kode voucher atau hapus voucher yang sedang Anda gunakan.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
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
        <>
          <div className="space-y-3 pt-4 border-t max-h-[40vh] overflow-y-auto pr-2">
            <Label>Voucher Diterapkan:</Label>
            {appliedVouchers.map((voucher) => {
              const formattedStartDate = voucher.start_date
                ? format(new Date(voucher.start_date), "d MMM yyyy", {
                    locale: localeID,
                  })
                : "N/A";
              const formattedEndDate = voucher.end_date
                ? format(new Date(voucher.end_date), "d MMM yyyy", {
                    locale: localeID,
                  })
                : "N/A";
              return (
                <Card
                  key={voucher.code}
                  className="bg-emerald-50 border-emerald-200"
                >
                  <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
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
                      onClick={() => handleRemove(voucher.code)}
                      disabled={isApplyingVoucher}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <Separator className="bg-emerald-200 mb-3" />
                    {voucher.description && (
                      <div className="flex items-start gap-2 text-sm">
                        <Info className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                        <p className="text-emerald-800">
                          {voucher.description}
                        </p>
                      </div>
                    )}
                    <div className="flex items-start gap-2 text-sm">
                      <CalendarDays className="h-4 w-4 mt-0.5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs text-emerald-600 font-medium">
                          Masa Berlaku
                        </p>
                        <p className="text-emerald-800 font-medium">
                          {formattedStartDate} - {formattedEndDate}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={onClose}>Selesai</Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  );
};

const CheckoutSummary = ({
  finalShippingCost,
  originalShippingCost, // <-- Terima ongkir final
  onPlaceOrder,
  isPlacingOrder,
  isReadyToPay,
}: {
  finalShippingCost: number;
  originalShippingCost: number; // <-- Tipe data diubah
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  isReadyToPay: boolean;
}) => {
  // Ambil data subtotal dan diskon langsung dari store
  const { summary } = useCartStore();

  const grandTotal =
    summary.subtotal - summary.totalDiscount + finalShippingCost;
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  // Cek apakah ada diskon ongkir yang diterapkan
  const hasShippingDiscount = finalShippingCost < originalShippingCost;
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle>Ringkasan Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal Produk</span>
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
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Biaya Pengiriman</span>

          {hasShippingDiscount ? (
            // Tampilan JIKA ada diskon gratis ongkir
            <div className="flex items-center gap-2">
              <span className="line-through text-muted-foreground text-sm">
                {formatCurrency(originalShippingCost)}
              </span>
              <span className="font-semibold text-green-600">
                {formatCurrency(finalShippingCost)}
              </span>
            </div>
          ) : (
            // Tampilan normal jika tidak ada diskon ongkir
            <span className="font-semibold">
              {formatCurrency(finalShippingCost)}
            </span>
          )}
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
          // disabled={!isReadyToPay || isPlacingOrder}
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

// =====================================================================
// KOMPONEN UTAMA (KODE FINAL YANG TELAH DIREVISI TOTAL)
// =====================================================================

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart, items, summary, appliedVouchers, removeVoucher } =
    useCartStore();

  // --- State Management ---
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isMidtransLoaded, setIsMidtransLoaded] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null
  );
  const [selectedShipping, setSelectedShipping] =
    useState<SelectedShipping | null>(null);
  const [isLoading, setIsLoading] = useState({
    addresses: true,
    shippingCost: false,
    placingOrder: false,
  });
  const [dialogOpen, setDialogOpen] = useState({
    addressSelection: false,
    addressAdd: false,
    shipping: false,
    voucher: false,
  });

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ||
      !process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL
    ) {
      console.warn(
        "Peringatan: Kunci Midtrans atau URL Snap belum diatur di file .env.local!"
      );
    }
  }, []);

  // --- Memoized Values ---
  const selectedItems = useMemo(
    () => items.filter((item) => item.selected),
    [items]
  );
  const selectedAddress = useMemo(
    () => addresses.find((addr) => addr.id === selectedAddressId),
    [addresses, selectedAddressId]
  );
  const finalShippingCost = useMemo(() => {
    // Jika belum ada pengiriman yang dipilih, biayanya 0
    if (!selectedShipping) {
      return 0;
    }
    console.log("appliedVouchers", appliedVouchers);
    // Cek apakah ada voucher dengan tipe 'free_shipping' yang aktif
    const hasFreeShipping = appliedVouchers.some(
      (voucher) => voucher.type === "free_shipping"
    );

    // Jika ada, biaya ongkir menjadi 0. Jika tidak, gunakan biaya dari kurir.
    return hasFreeShipping ? 0 : selectedShipping.cost;
  }, [selectedShipping, appliedVouchers]);
  const originalShippingCost = selectedShipping?.cost || 0;
  // --- Data Fetching & Logic Functions (menggunakan useCallback) ---

  const fetchAddresses = useCallback(
    async (newAddressIdToSelect: number | null = null) => {
      setIsLoading((prev) => ({ ...prev, addresses: true }));
      try {
        const response = await api.get("/addresses");
        const fetchedAddresses: Address[] = response.data || [];
        setAddresses(fetchedAddresses);

        // Jika ada ID alamat baru yang dikirim, langsung pilih itu.
        if (newAddressIdToSelect) {
          setSelectedAddressId(newAddressIdToSelect);
        }
        // Jika tidak, gunakan logika pemilihan default seperti biasa.
        else if (
          !selectedAddressId ||
          !fetchedAddresses.some((addr) => addr.id === selectedAddressId)
        ) {
          const primaryAddress = fetchedAddresses.find(
            (addr) => addr.is_primary
          );
          setSelectedAddressId(
            primaryAddress?.id || fetchedAddresses[0]?.id || null
          );
        }
      } catch (err) {
        showError("Gagal memuat alamat Anda.");
      } finally {
        setIsLoading((prev) => ({ ...prev, addresses: false }));
      }
    },
    [selectedAddressId]
  ); // Dependensi agar bisa check `currentSelected`

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]); // Dijalankan saat komponen mount

  useEffect(() => {
    // Redirect jika tidak ada item terpilih setelah loading alamat selesai
    if (!isLoading.addresses && selectedItems.length === 0) {
      showError("Tidak ada produk yang dipilih untuk checkout.");
      router.push("/cart");
    }
  }, [isLoading.addresses, selectedItems, router]);

  useEffect(() => {
    // Kalkulasi ongkos kirim saat alamat yang dipilih berubah
    if (!selectedAddressId) {
      setShippingOptions([]);
      setSelectedShipping(null);
      return;
    }

    let isActive = true; // Flag untuk mencegah race condition

    const calculateShippingCost = async () => {
      setIsLoading((prev) => ({ ...prev, shippingCost: true }));
      setSelectedShipping(null);
      setShippingOptions([]);

      try {
        const currentSelectedAddress = addresses.find(
          (addr) => addr.id === selectedAddressId
        );
        if (!currentSelectedAddress) return;

        const response = await api.post("/shipping/cost", {
          destination_district_id: currentSelectedAddress.district_id,
        });

        if (!isActive) return;

        // --- FIX TYPE 1: Definisikan tipe data mentah dari API ---
        type RawShippingService = {
          code: string;
          name: string;
          service: string;
          description: string;
          cost: number;
          etd?: string;
        };

        const shippingData: RawShippingService[] = response.data || [];

        const groupedOptions = shippingData.reduce((acc, option) => {
          if (!acc[option.code]) {
            acc[option.code] = {
              code: option.code,
              name: option.name,
              costs: [],
            };
          }
          acc[option.code].costs.push({
            service: option.service,
            description: option.description,
            // --- FIX TYPE 2: Tambahkan properti 'note' yang hilang ---
            cost: [{ value: option.cost, etd: option.etd || "N/A", note: "" }],
          });
          return acc;
          // --- FIX TYPE 3: Beri tahu tipe data hasil reduce pada objek awal ---
        }, {} as Record<string, ShippingOption>);

        const transformedOptions: ShippingOption[] =
          Object.values(groupedOptions);
        setShippingOptions(transformedOptions);

      } catch (err: any) {
        if (!isActive) return;
        // Pesan error dari backend sekarang lebih bisa diandalkan
        const message =
          err.response?.data?.message || "Gagal memuat opsi pengiriman.";
        showError(message);
        setShippingOptions([]);
      } finally {
        if (isActive) {
          setIsLoading((prev) => ({ ...prev, shippingCost: false }));
        }
      }
    };

    calculateShippingCost();

    return () => {
      isActive = false; // Cleanup function saat komponen unmount atau dependensi berubah
    };
  }, [selectedAddressId, addresses]);

  const validateOrderData = useCallback(() => {
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
      router.push("/cart");
      return false;
    }
    if (!isMidtransLoaded || !window.snap) {
      showError("Sistem pembayaran sedang dimuat. Silakan tunggu sebentar.");
      return false;
    }
    return true;
  }, [
    selectedAddressId,
    selectedShipping,
    selectedItems,
    isMidtransLoaded,
    router,
  ]);

  const handlePlaceOrder = useCallback(async () => {
    if (!validateOrderData()) return;

    setIsLoading((prev) => ({ ...prev, placingOrder: true }));
    try {
      const orderData = {
        address_id: selectedAddressId,
        shipping_courier: selectedShipping!.courier,
        shipping_service: selectedShipping!.service,
        shipping_cost: Number(finalShippingCost),
        shipping_etd: selectedShipping!.etd,
        items: selectedItems.map((item) => ({
          variant_id: item.variantId,
          quantity: item.quantity,
        })),
        voucher_codes: appliedVouchers.map((v) => v.code),
      };

      const response = await api.post("/orders", orderData);
      const { snap_token, order_id } = response.data; // Sesuaikan jika struktur berbeda

      if (!snap_token)
        throw new Error("Token pembayaran tidak diterima dari server");

      window.snap.pay(snap_token, {
        onSuccess: (result: any) => {
          showSuccess("Pembayaran berhasil!");
          clearCart();
          router.push(`/profile/orders/${order_id}`);
        },
        onPending: (result: any) => {
          showSuccess("Menunggu pembayaran Anda.");
          clearCart();
          router.push(`/profile/orders/${order_id}`);
        },
        onError: (result: any) => {
          showError("Pembayaran gagal. Silakan coba lagi.");
        },
        // --- REVISI FINAL: Menangani jika popup pembayaran ditutup ---
        onClose: () => {
          showInfo(
            "Anda membatalkan pembayaran. Pesanan Anda menunggu di halaman profil."
          );
          // Arahkan ke detail pesanan agar pengguna bisa membayar lagi nanti
          router.push(`/profile/orders/${order_id}`);
        },
      });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Gagal membuat pesanan";
      showError(errorMessage);
    } finally {
      setIsLoading((prev) => ({ ...prev, placingOrder: false }));
    }
  }, [
    validateOrderData,
    selectedAddressId,
    selectedShipping,
    selectedItems,
    appliedVouchers,
    clearCart,
    router,
  ]);

  // --- Render ---
  if (isLoading.addresses) return <CheckoutPageSkeleton />;

  return (
    <>
      <Script
        src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL as string}
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY as string}
        onLoad={() => setIsMidtransLoaded(true)}
      />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Konfirmasi Pesanan
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-4 items-start">
            <div className="lg:col-span-2 space-y-4 mb-4 md:mb-0">
              <AddressDisplayCard
                onAddNew={() => {
                  // Tutup dialog pemilihan, buka dialog tambah alamat
                  setDialogOpen({
                    ...dialogOpen,
                    addressSelection: false,
                    addressAdd: true,
                  });
                }}
                address={selectedAddress || null}
                onEditClick={() =>
                  setDialogOpen((prev) => ({ ...prev, addressSelection: true }))
                }
              />
              <ShippingDisplayCard
                shipping={selectedShipping}
                isLoading={isLoading.shippingCost}
                // Gunakan prop baru untuk membuka dialog
                onSelectClick={() =>
                  setDialogOpen((prev) => ({ ...prev, shipping: true }))
                }
                hasAddress={!!selectedAddressId}
              />
              <CheckoutItemsList />
              
            </div>
            <div className="lg:col-span-1 space-y-4 md:sticky md:top-28 md:max-h-lvh ">
              <Card>
                <CardHeader>
                  <CardTitle>Voucher & Diskon</CardTitle>
                </CardHeader>
                <CardContent>
                  {appliedVouchers.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-2">
                        Voucher yang diterapkan:
                      </p>
                      {appliedVouchers.map((v) => (
                        <div
                          key={v.code}
                          className="flex justify-between items-center bg-emerald-50 p-2 rounded-md border border-emerald-200"
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-emerald-700" />
                            <span className="font-semibold text-sm text-emerald-800">
                              {v.code}
                            </span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 hover:bg-green-100"

                            onClick={() => removeVoucher(v.code)}
                          >
                            <X className="h-4 w-4 text-emerald-700" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() =>
                          setDialogOpen((prev) => ({ ...prev, voucher: true }))
                        }
                      >
                        <Edit className="mr-2 h-4 w-4" /> Ubah Voucher
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        setDialogOpen((prev) => ({ ...prev, voucher: true }))
                      }
                    >
                      <TicketPercent className="mr-2 h-4 w-4" /> Gunakan Voucher
                    </Button>
                  )}
                </CardContent>
              </Card>
              <CheckoutSummary
                originalShippingCost={originalShippingCost}
                finalShippingCost={finalShippingCost}
                onPlaceOrder={handlePlaceOrder}
                isPlacingOrder={isLoading.placingOrder}
                isReadyToPay={
                  !!selectedShipping && !!selectedAddressId && isMidtransLoaded
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialogOpen.addressSelection} // <-- Ganti nama properti
        onOpenChange={(isOpen) =>
          setDialogOpen((prev) => ({ ...prev, addressSelection: isOpen }))
        }
      >
        <AddressSelectionDialog
          addresses={addresses}
          currentAddressId={selectedAddressId}
          onSelect={(id) => {
            setSelectedAddressId(id);
            setDialogOpen((prev) => ({ ...prev, addressSelection: false }));
          }}
          // --- UBAH LOGIKA onAddNew ---
          onAddNew={() => {
            // Tutup dialog pemilihan, buka dialog tambah alamat
            setDialogOpen({
              ...dialogOpen,
              addressSelection: false,
              addressAdd: true,
            });
          }}
        />
      </Dialog>

      {/* --- TAMBAHKAN DIALOG BARU INI untuk FORM Tambah Alamat --- */}
      <Dialog
        open={dialogOpen.addressAdd}
        onOpenChange={(isOpen) =>
          setDialogOpen((prev) => ({ ...prev, addressAdd: isOpen }))
        }
      >
        <DialogContent className="sm:max-w-lg md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Alamat Baru</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSuccess={(newAddress) => {
              showSuccess("Alamat baru berhasil ditambahkan.");
              setDialogOpen((prev) => ({ ...prev, addressAdd: false }));
              // Refresh daftar alamat dan langsung pilih yang baru menggunakan ID dari `newAddress`
              fetchAddresses(newAddress.id);
            }}
            onCancel={() => {
              // Jika dibatalkan, tutup form dan buka kembali dialog pemilihan
              setDialogOpen({
                ...dialogOpen,
                addressAdd: false,
                addressSelection: true,
              });
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={dialogOpen.shipping}
        onOpenChange={(isOpen) =>
          setDialogOpen((prev) => ({ ...prev, shipping: isOpen }))
        }
      >
        <ShippingSelectionDialog
          options={shippingOptions}
          isLoading={isLoading.shippingCost}
          currentService={
            selectedShipping
              ? {
                  courier: selectedShipping.courier,
                  service: selectedShipping.service,
                }
              : null
          }
          onSelect={(data) => {
            setSelectedShipping(data);
            setDialogOpen((prev) => ({ ...prev, shipping: false }));
          }}
          onCancel={() =>
            setDialogOpen((prev) => ({ ...prev, shipping: false }))
          }
        />
      </Dialog>
      <Dialog
        open={dialogOpen.voucher}
        onOpenChange={(isOpen) =>
          setDialogOpen((prev) => ({ ...prev, voucher: isOpen }))
        }
      >
        <VoucherDialog
          onVoucherChange={() => {}}
          onClose={() => setDialogOpen((prev) => ({ ...prev, voucher: false }))}
        />
      </Dialog>
    </>
  );
}
