// app/(admin)/admin/voucher/components/voucher-form.tsx
"use client";

import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
import { Calendar as CalendarIcon, Check, ChevronsUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { showError, showSuccess } from "@/lib/toast";
import { voucherSchema } from "@/lib/validation";
import { Voucher } from "./voucher-columns";
import { Product } from "@/app/(admin)/admin/data-produk/produk/components/produk-columns";
import { Category } from "@/app/(admin)/admin/data-produk/kategori/components/kategori-columns";

// Types
const typeOptions = [
  { label: "Potongan Harga (Transaksi)", value: "fixed_transaction" },
  { label: "Potongan Persen (Transaksi)", value: "percent_transaction" },
  { label: "Potongan Harga (per Item)", value: "fixed_item" },
  { label: "Potongan Persen (per Item)", value: "percent_item" },
  { label: "Gratis Ongkir", value: "free_shipping" },
];

// Reusable MultiSelect component
interface MultiSelectProps {
  options: Array<{ value: string; label: string }>;
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
}

function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item: string) => item !== value)
        : [...selected, value]
    );
  };
  
  const selectedLabels = selected
    .map((value: string) => options.find((opt) => opt.value === value)?.label)
    .filter((label): label is string => Boolean(label));
    
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between h-auto min-h-10"
        >
          <div className="flex flex-wrap gap-1">
            {selectedLabels.length > 0
              ? selectedLabels.map((label) => (
                  <Badge key={label} variant="secondary">
                    {label}
                  </Badge>
                ))
              : placeholder}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
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
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState<{
    products: Product[];
    categories: Category[];
  }>({
    products: [],
    categories: [],
  });

  const form = useForm<z.infer<typeof voucherSchema>>({
    resolver: zodResolver(voucherSchema) as Resolver<
      z.infer<typeof voucherSchema>
    >,
    mode: "onChange",
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          description: initialData.description ?? "",
          type: initialData.type,
          value: initialData.value ?? undefined,
          max_discount: initialData.max_discount ?? undefined,
          min_purchase: initialData.min_purchase ?? undefined,
          usage_limit: initialData.usage_limit ?? undefined,
          usage_limit_per_user: initialData.usage_limit_per_user ?? undefined,
          start_date: initialData.start_date
            ? new Date(initialData.start_date)
            : new Date(),
          end_date: initialData.end_date
            ? new Date(initialData.end_date)
            : new Date(),
          is_active: initialData.is_active,
          product_ids: initialData.products?.map((p) => p.id) || [],
          category_ids: initialData.categories?.map((c) => c.id) || [],
        }
      : {
          name: "",
          code: "",
          description: "",
          type: "fixed_transaction",
          value: undefined,
          max_discount: undefined,
          min_purchase: undefined,
          usage_limit: undefined,
          usage_limit_per_user: undefined,
          start_date: new Date(),
          end_date: new Date(new Date().setDate(new Date().getDate() + 30)),
          is_active: true,
          product_ids: [],
          category_ids: [],
        },
  });

  const { register, handleSubmit, control, watch, setError, formState } = form;
  const { errors } = formState; // Destructure errors from formState
  const watchedType = watch("type");

  useEffect(() => {
    if (watchedType?.includes("item")) {
      // Fetch products
      if (masterData.products.length === 0) {
        api.get("/admin/products?all=true")
          .then((res) => {
            setMasterData((prev) => ({
              ...prev,
              products: res.data.data || res.data,
            }));
          })
          .catch((err) => {
            console.error("Error fetching products:", err);
          });
      }
      
      // Fetch categories
      if (masterData.categories.length === 0) {
        api.get("/admin/categories?all=true")
          .then((res) => {
            setMasterData((prev) => ({
              ...prev,
              categories: res.data.data || res.data,
            }));
          })
          .catch((err) => {
            console.error("Error fetching categories:", err);
          });
      }
    }
  }, [watchedType, masterData.products.length, masterData.categories.length]);

  const onSubmit = async (data: z.infer<typeof voucherSchema>) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      value: data.type === "free_shipping" ? 0 : data.value,
      max_discount: data.type.includes("percent") ? data.max_discount : null,
      product_ids: data.type.includes("item") ? data.product_ids : [],
      category_ids: data.type.includes("item") ? data.category_ids : [],
      start_date: format(data.start_date, "yyyy-MM-dd HH:mm:ss"),
      end_date: format(data.end_date, "yyyy-MM-dd HH:mm:ss"),
    };

    try {
      if (initialData) {
        await api.put(`/admin/vouchers/${initialData.id}`, payload);
        showSuccess("Voucher berhasil diperbarui.");
      } else {
        await api.post("/admin/vouchers", payload);
        showSuccess("Voucher berhasil ditambahkan.");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        Object.entries(validationErrors).forEach(([key, value]) => {
          setError(key as any, {
            type: "server",
            message: (value as string[])[0],
          });
        });
      } else {
        showError(err?.response?.data?.message || "Operasi gagal.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4 max-h-[65vh] overflow-y-auto p-1 pr-4">
        <div>
          <Label htmlFor="name">Nama Voucher</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Contoh: Diskon Lebaran"
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="code">Kode Unik</Label>
          <Input id="code" {...register("code")} placeholder="LEBARAN2025" />
          {errors.code && (
            <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="description">Deskripsi (Opsional)</Label>
          <Textarea id="description" {...register("description")} />
        </div>

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div>
              <Label>Tipe Voucher</Label>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed_transaction">
                    Potongan Harga (Transaksi)
                  </SelectItem>
                  <SelectItem value="percent_transaction">
                    Potongan Persen (Transaksi)
                  </SelectItem>
                  <SelectItem value="fixed_item">
                    Potongan Harga (per Item)
                  </SelectItem>
                  <SelectItem value="percent_item">
                    Potongan Persen (per Item)
                  </SelectItem>
                  <SelectItem value="free_shipping">Gratis Ongkir</SelectItem>
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

        {watchedType && watchedType !== "free_shipping" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>
                {watchedType.includes("percent")
                  ? "Persentase (%)"
                  : "Nilai Potongan (Rp)"}
              </Label>
              <Input 
                type="number" 
                {...register("value", { valueAsNumber: true })}
              />
              {errors.value && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.value.message}
                </p>
              )}
            </div>
            {watchedType.includes("percent") && (
              <div>
                <Label>Potongan Maksimal (Rp)</Label>
                <Input 
                  type="number" 
                  {...register("max_discount", { valueAsNumber: true })}
                />
                {errors.max_discount && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.max_discount.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {watchedType && watchedType.includes("item") && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-md font-semibold">
              Berlaku Untuk <span className="text-destructive">*</span>
            </h3>
            <div>
              <Label>Produk Spesifik</Label>
              <Controller
                name="product_ids"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    placeholder="Pilih produk..."
                    options={masterData.products.map((p) => ({
                      value: String(p.id),
                      label: p.product_name,
                    }))}
                    selected={field.value?.map(String) || []}
                    onChange={(values) => field.onChange(values.map(Number))}
                  />
                )}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              - ATAU -
            </p>
            <div>
              <Label>Kategori Spesifik</Label>
              <Controller
                name="category_ids"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    placeholder="Pilih kategori..."
                    options={masterData.categories.map((c) => ({
                      value: String(c.id),
                      label: c.category_name,
                    }))}
                    selected={field.value?.map(String) || []}
                    onChange={(values) => field.onChange(values.map(Number))}
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
        )}

        <Separator />
        <div className="space-y-4 pt-2">
          <h3 className="text-md font-semibold">
            Syarat & Ketentuan (Opsional)
          </h3>
          <div>
            <Label>Minimal Pembelian (Rp)</Label>
            <Input
              type="number"
              placeholder="Kosongkan jika tidak ada"
              {...register("min_purchase", { valueAsNumber: true })}
            />
            {errors.min_purchase && (
              <p className="text-sm text-red-500 mt-1">
                {errors.min_purchase.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Batas Penggunaan Total</Label>
              <Input
                type="number"
                placeholder="Kosongkan jika tak terbatas"
                {...register("usage_limit", { valueAsNumber: true })}
              />
              {errors.usage_limit && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.usage_limit.message}
                </p>
              )}
            </div>
            <div>
              <Label>Batas per Pengguna</Label>
              <Input
                type="number"
                placeholder="1"
                {...register("usage_limit_per_user", { valueAsNumber: true })}
              />
              {errors.usage_limit_per_user && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.usage_limit_per_user.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="start_date"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "d MMM yyyy", {
                            locale: localeID,
                          })
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.start_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.start_date.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              name="end_date"
              control={control}
              render={({ field }) => (
                <div>
                  <Label>Tanggal Selesai</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "d MMM yyyy", {
                            locale: localeID,
                          })
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.end_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.end_date.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-6 border-t mt-4">
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-2 mr-auto">
              <Switch
                id="is_active"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="is_active">Aktifkan Voucher</Label>
            </div>
          )}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Voucher"}
        </Button>
      </div>
    </form>
  );
}