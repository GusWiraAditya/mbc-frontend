// app/(admin)/admin/voucher/components/voucher-form.tsx
"use client";

import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

// Impor Tipe & Skema
import { voucherSchema, VoucherFormData } from "@/lib/validation";
import { Voucher } from "./voucher-columns";
import { Product } from "@/app/(admin)/admin/data-produk/produk/components/produk-columns";
import { Category } from "@/app/(admin)/admin/data-produk/kategori/components/kategori-columns";

// Impor utilitas & komponen UI
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  Loader2,
  X,
} from "lucide-react";

// --- Konstanta & Tipe Data Lokal ---
const typeOptions = [
  { label: "Potongan Harga (Transaksi)", value: "fixed_transaction" },
  { label: "Potongan Persen (Transaksi)", value: "percent_transaction" },
  { label: "Potongan Harga (per Item)", value: "fixed_item" },
  { label: "Potongan Persen (per Item)", value: "percent_item" },
  { label: "Gratis Ongkir", value: "free_shipping" },
];

const stackingGroupOptions = [
  { label: "Diskon Transaksi", value: "transaction_discount" },
  { label: "Diskon per Item", value: "item_discount" },
  { label: "Diskon Ongkos Kirim", value: "shipping_discount" },
  { label: "Lainnya (Unik/Tidak Bisa Digabung)", value: "unique" },
];

interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

// Komponen MultiSelect yang dapat digunakan kembali
function MultiSelect({
  options,
  selected,
  onChange,
  placeholder,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (value: string) => {
      onChange(
        selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value]
      );
    },
    [selected, onChange]
  );

  const handleRemove = useCallback(
    (value: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selected.filter((item) => item !== value));
    },
    [selected, onChange]
  );

  const selectedItems = selected
    .map((value) => options.find((opt) => opt.value === value))
    .filter((item): item is { value: string; label: string } => Boolean(item));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-auto min-h-10"
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 max-w-full">
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <Badge
                  key={item.value}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => handleSelect(item.value)}
                >
                  {item.label}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={(e) => handleRemove(item.value, e)}
                  />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 max-h-[300px]">
        <Command>
          <CommandInput placeholder="Cari..." />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// --- Komponen Utama Form ---
interface VoucherFormProps {
  initialData?: Voucher | null;
  onSuccess: () => void;
  onClose: () => void;
}

export function VoucherForm({
  initialData,
  onSuccess,
  onClose,
}: VoucherFormProps) {
  const [masterData, setMasterData] = useState<{
    products: Product[];
    categories: Category[];
  }>({
    products: [],
    categories: [],
  });
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);

  // Fungsi untuk mendapatkan default values
  const getDefaultValues = useCallback(
    (data?: Voucher | null): VoucherFormData => {
      if (!data) {
        return {
          name: "",
          code: "",
          description: "",
          type: "fixed_transaction",
          stacking_group: "transaction_discount",
          is_active: true,
          start_date: new Date(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
          product_ids: [],
          category_ids: [],
          value: undefined,
          max_discount: undefined,
          min_purchase: undefined,
          usage_limit: undefined,
          usage_limit_per_user: undefined,
        };
      }

      // Validasi dan normalisasi data untuk mode edit
      const validTypes = [
        "fixed_transaction",
        "percent_transaction",
        "fixed_item",
        "percent_item",
        "free_shipping",
      ];
      const validStackingGroups = [
        "transaction_discount",
        "item_discount",
        "shipping_discount",
        "unique",
      ];

      const normalizedType = validTypes.includes(data.type)
        ? data.type
        : "fixed_transaction";
      const normalizedStackingGroup = validStackingGroups.includes(
        data.stacking_group
      )
        ? data.stacking_group
        : "transaction_discount";

      return {
        name: data.name || "",
        code: data.code || "",
        description: data.description || "",
        type: normalizedType,
        stacking_group: normalizedStackingGroup,
        is_active: data.is_active ?? true,
        value:
          data.value !== null && data.value !== undefined
            ? Number(data.value)
            : undefined,
        max_discount:
          data.max_discount !== null && data.max_discount !== undefined
            ? Number(data.max_discount)
            : undefined,
        min_purchase:
          data.min_purchase !== null && data.min_purchase !== undefined
            ? Number(data.min_purchase)
            : undefined,
        usage_limit:
          data.usage_limit !== null && data.usage_limit !== undefined
            ? Number(data.usage_limit)
            : undefined,
        usage_limit_per_user:
          data.usage_limit_per_user !== null &&
          data.usage_limit_per_user !== undefined
            ? Number(data.usage_limit_per_user)
            : undefined,
        start_date: data.start_date ? new Date(data.start_date) : new Date(),
        end_date: data.end_date
          ? new Date(data.end_date)
          : new Date(new Date().setDate(new Date().getDate() + 30)),
        product_ids: data.products?.map((p) => p.id) || [],
        category_ids: data.categories?.map((c) => c.id) || [],
      };
    },
    []
  );

  const form = useForm<VoucherFormData>({
    resolver: zodResolver(voucherSchema) as Resolver<VoucherFormData>,
    mode: "onChange",
    defaultValues: getDefaultValues(initialData),
  });

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = form;
  const watchedType = watch("type");
  const watchedStackingGroup = watch("stacking_group");
  const watchedStartDate = watch("start_date");
  const watchedProductIds = watch("product_ids");
  const watchedCategoryIds = watch("category_ids");

  // --- Inisialisasi form saat initialData berubah ---
  useEffect(() => {
    if (initialData) {
      console.log("=== INITIALIZING FORM WITH DATA ===");
      console.log("Initial data:", initialData);

      const formData = getDefaultValues(initialData);
      console.log("Form data to reset:", formData);

      reset(formData);
      console.log("Form reset completed");
    }
  }, [initialData, reset, getDefaultValues]);

  // --- Logika Kondisional: Menyesuaikan Form Berdasarkan Tipe Voucher ---
  useEffect(() => {
    if (!watchedType) return;

    console.log("=== AUTO-ADJUST FORM ===");
    console.log("Current type:", watchedType);
    console.log("Current stacking_group:", watchedStackingGroup);

    // Hanya lakukan penyesuaian otomatis jika bukan mode edit atau jika user mengubah tipe
    if (!initialData || watchedType !== initialData.type) {
      // 1. Atur grup voucher (stacking_group)
      if (watchedType.includes("transaction")) {
        setValue("stacking_group", "transaction_discount");
      } else if (watchedType.includes("item")) {
        setValue("stacking_group", "item_discount");
      } else if (watchedType === "free_shipping") {
        setValue("stacking_group", "shipping_discount");
      }

      // 2. Jika tipe bukan persen, hapus nilai 'max_discount'
      if (!watchedType.includes("percent")) {
        setValue("max_discount", undefined);
      }

      // 3. Jika tipe bukan per item, hapus pilihan produk/kategori
      if (!watchedType.includes("item")) {
        setValue("product_ids", []);
        setValue("category_ids", []);
      }

      // 4. Jika tipe adalah gratis ongkir, atur nilai
      if (watchedType === "free_shipping") {
        setValue("value", 0);
        setValue("max_discount", undefined);
      }
    }

    console.log("=== FORM ADJUSTED ===");
  }, [watchedType, setValue, initialData]);

  // --- Pengambilan Data Master (Produk & Kategori) ---
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoadingMasterData(true);
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("/admin/products?all=true"),
          api.get("/admin/categories?all=true"),
        ]);

        setMasterData({
          products: productsResponse.data.data || productsResponse.data || [],
          categories:
            categoriesResponse.data.data || categoriesResponse.data || [],
        });
      } catch (error) {
        console.error("Gagal mengambil data master:", error);
        showError("Gagal mengambil data produk dan kategori");
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, []);

  // --- Handler Submit Form ---
  const onSubmit = async (data: VoucherFormData) => {
    try {
      // Validasi tambahan sebelum submit
      if (
        data.type.includes("item") &&
        (!data.product_ids || data.product_ids.length === 0) &&
        (!data.category_ids || data.category_ids.length === 0)
      ) {
        showError(
          "Pilih minimal satu produk atau kategori untuk voucher per item"
        );
        return;
      }

      const payload = {
        ...data,
        start_date: format(data.start_date, "yyyy-MM-dd HH:mm:ss"),
        end_date: format(data.end_date, "yyyy-MM-dd HH:mm:ss"),
        // Pastikan array kosong dikirim sebagai array kosong, bukan undefined
        product_ids: data.product_ids || [],
        category_ids: data.category_ids || [],
      };

      if (initialData) {
        await api.put(`/admin/vouchers/${initialData.id}`, payload);
        showSuccess("Voucher berhasil diperbarui");
      } else {
        await api.post("/admin/vouchers", payload);
        showSuccess("Voucher berhasil ditambahkan");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error submitting voucher:", err);

      const validationErrors = err?.response?.data?.errors;
      if (validationErrors && typeof validationErrors === "object") {
        // Handle server-side validation errors
        Object.entries(validationErrors).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            form.setError(key as keyof VoucherFormData, {
              type: "server",
              message: value[0],
            });
          }
        });
      } else {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat menyimpan voucher";
        showError(errorMessage);
      }
    }
  };

  const isItemType = watchedType?.includes("item");
  const isPercentType = watchedType?.includes("percent");
  const isFreeShipping = watchedType === "free_shipping";

  // Helper untuk format label input
  const getValueLabel = () => {
    if (isFreeShipping) return "Nilai (Otomatis: 0)";
    return isPercentType ? "Persentase (%)" : "Nilai Potongan (Rp)";
  };

  // Helper untuk mendapatkan label yang dipilih
  const getSelectedTypeLabel = () => {
    return (
      typeOptions.find((opt) => opt.value === watchedType)?.label ||
      "Pilih tipe voucher"
    );
  };

  const getSelectedStackingGroupLabel = () => {
    return (
      stackingGroupOptions.find((opt) => opt.value === watchedStackingGroup)
        ?.label || "Pilih grup..."
    );
  };

  // Tampilkan loading hanya jika master data masih dimuat
  if (isLoadingMasterData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Memuat data produk dan kategori...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
        {/* --- Bagian Informasi Dasar --- */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nama Voucher *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Contoh: Diskon Lebaran"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Kode Unik *</Label>
            <Input
              id="code"
              {...register("code")}
              placeholder="LEBARAN2025"
              className={errors.code ? "border-red-500" : ""}
            />
            {errors.code && (
              <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Deskripsi (Opsional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Deskripsi voucher..."
              rows={3}
            />
          </div>
        </div>

        {/* --- Bagian Aturan & Tipe --- */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Aturan Voucher</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Tipe Voucher *</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.type ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Pilih tipe voucher">
                        {getSelectedTypeLabel()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.type.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              name="stacking_group"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Grup Kombinasi Voucher *</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.stacking_group ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Pilih grup...">
                        {getSelectedStackingGroupLabel()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {stackingGroupOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stacking_group && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.stacking_group.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* --- Bagian Nilai & Batasan --- */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Nilai & Batasan</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="value">{getValueLabel()} *</Label>
              <Input
                id="value"
                type="number"
                {...register("value")}
                disabled={isFreeShipping}
                placeholder={
                  isFreeShipping
                    ? "0"
                    : isPercentType
                    ? "Contoh: 10"
                    : "Contoh: 50000"
                }
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="max_discount">Potongan Maksimal (Rp)</Label>
              <Input
                id="max_discount"
                type="number"
                {...register("max_discount")}
                disabled={!isPercentType}
                placeholder={
                  !isPercentType ? "Tidak diperlukan" : "Contoh: 50000"
                }
                className={errors.max_discount ? "border-red-500" : ""}
              />
              {errors.max_discount && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.max_discount.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Bagian Keterkaitan Produk/Kategori --- */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">
            Berlaku Untuk{" "}
            {isItemType && <span className="text-red-500">*</span>}
          </h3>

          <div>
            <Label>Produk Spesifik</Label>

            <Controller
              name="product_ids"
              control={control}
              render={({ field }) => {
                // --- TAMBAHKAN LOG UNTUK DEBUGGING ---
                console.log("=== RENDER MULTISELECT (PRODUK) ===");
                console.log(
                  "Master Data Produk Tersedia:",
                  masterData.products.length > 0
                );
                console.log("Nilai Terpilih (dari form state):", field.value);
                // -----------------------------------------

                return (
                  <MultiSelect
                    placeholder={
                      isItemType
                        ? "Pilih produk..."
                        : "Hanya untuk tipe per Item"
                    }
                    options={masterData.products.map((p) => ({
                      value: String(p.id),
                      label: p.product_name,
                    }))}
                    selected={field.value?.map(String) || []}
                    onChange={(values) => field.onChange(values.map(Number))}
                    disabled={!isItemType}
                  />
                );
              }}
            />
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground bg-background px-2">
              - ATAU -
            </span>
          </div>

          <div>
            <Label>Kategori Spesifik</Label>
            <Controller
              name="category_ids"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  placeholder={
                    isItemType
                      ? "Pilih kategori..."
                      : "Hanya untuk tipe per Item"
                  }
                  options={masterData.categories.map((c) => ({
                    value: String(c.id),
                    label: c.category_name,
                  }))}
                  selected={field.value?.map(String) || []}
                  onChange={(values) => field.onChange(values.map(Number))}
                  disabled={!isItemType}
                />
              )}
            />
          </div>

          {errors.product_ids && (
            <p className="text-sm text-red-500 mt-1">
              {errors.product_ids.message}
            </p>
          )}
          {errors.category_ids && (
            <p className="text-sm text-red-500 mt-1">
              {errors.category_ids.message}
            </p>
          )}
        </div>

        {/* --- Bagian Batasan Penggunaan & Periode --- */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Batasan & Periode</h3>

          <div>
            <Label htmlFor="min_purchase">Minimal Pembelian (Rp)</Label>
            <Input
              id="min_purchase"
              type="number"
              placeholder="Kosongkan jika tidak ada batasan"
              {...register("min_purchase")}
              className={errors.min_purchase ? "border-red-500" : ""}
            />
            {errors.min_purchase && (
              <p className="text-sm text-red-500 mt-1">
                {errors.min_purchase.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usage_limit">Batas Penggunaan Total</Label>
              <Input
                id="usage_limit"
                type="number"
                placeholder="Kosongkan jika tidak terbatas"
                {...register("usage_limit")}
                className={errors.usage_limit ? "border-red-500" : ""}
              />
              {errors.usage_limit && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.usage_limit.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="usage_limit_per_user">Batas per Pengguna</Label>
              <Input
                id="usage_limit_per_user"
                type="number"
                placeholder="Kosongkan jika tidak terbatas"
                {...register("usage_limit_per_user")}
                className={errors.usage_limit_per_user ? "border-red-500" : ""}
              />
              {errors.usage_limit_per_user && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.usage_limit_per_user.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tanggal Mulai *</Label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.start_date && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: localeID })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={localeID}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <Label>Tanggal Berakhir *</Label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                          errors.end_date && "border-red-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: localeID })
                        ) : (
                          <span>Pilih tanggal</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={localeID}
                        disabled={(date) =>
                          watchedStartDate && date < watchedStartDate
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Bagian Aksi Form --- */}
      <div className="flex justify-between items-center pt-6 border-t">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="is_active">Aktifkan Voucher</Label>
            </div>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting || isLoadingMasterData}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              `${initialData ? "Perbarui" : "Simpan"} Voucher`
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
