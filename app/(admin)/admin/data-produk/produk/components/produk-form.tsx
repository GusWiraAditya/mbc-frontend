// app/admin/produk/produk-form.tsx

"use client";

// --- IMPORTS ---
import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { productFormSchema, ProductFormValues } from "@/lib/validation";
import { showError, showSuccess } from "@/lib/toast";
import api from "@/lib/api";
import { Product, Category, Color, Size, Material } from "./produk-columns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, GripVertical, PlusCircle } from "lucide-react";
import { VariantImageUploader } from "./produk-form-variant-image-uploader";

// --- TIPE PROPS ---
interface ProductFormProps {
  initialData?: Product | null;
  onSuccess: () => void;
  onClose: () => void;
}
interface SortableItemProps {
  id: string;
  index: number;
  children: ReactNode;
  remove: (index: number) => void;
}

// --- KOMPONEN BANTU UNTUK KARTU VARIAN ---
function SortableVariantItem({
  id,
  index,
  children,
  remove,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <Card className="relative overflow-hidden bg-muted/20">
        <div
          className="absolute top-3 left-1 p-2 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="absolute top-3 right-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/80"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardHeader>
          <CardTitle className="text-center font-medium text-base">
            Varian #{index + 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">{children}</CardContent>
      </Card>
    </div>
  );
}

// --- KOMPONEN FORM UTAMA ---
export function ProductForm({
  initialData,
  onSuccess,
  onClose,
}: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [masterData, setMasterData] = useState<{
    categories: Category[];
    colors: Color[];
    sizes: Size[];
    materials: Material[];
  }>({ categories: [], colors: [], sizes: [], materials: [] });
  const [deletedVariantIds, setDeletedVariantIds] = useState<number[]>([]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      product_name: initialData?.product_name || "",
      category_id: String(initialData?.category?.id || ""),
      description: initialData?.description || "",
      gender: initialData?.gender || "unisex",
      is_active: initialData ? !!initialData.is_active : true,
      variants:
        initialData?.variants?.map((v) => ({
          id: v.id,
          color_id: String(v.color.id),
          size_id: String(v.size.id),
          material_id: String(v.material.id),
          price: v.price,
          stock: v.stock,
          weight: v.weight,
          sku: v.sku || "",
          existingImages: v.images || [],
          newImageFiles: [],
          deletedImageIds: [],
        })) || [],
    },
  });
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, colRes, sizeRes, matRes] = await Promise.all([
          api.get("/admin/categories"),
          api.get("/admin/colors"),
          api.get("/admin/sizes"),
          api.get("/admin/materials"),
        ]);
        setMasterData({
          categories: catRes.data,
          colors: colRes.data,
          sizes: sizeRes.data,
          materials: matRes.data,
        });
      } catch (error) {
        showError("Gagal memuat data master (kategori, warna, dll).");
      }
    };
    fetchData();
  }, []);

  const handleRemoveVariant = (index: number) => {
    const variantId = form.getValues(`variants.${index}.id`);
    if (variantId) setDeletedVariantIds((prev) => [...prev, variantId]);
    remove(index);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
    }
  };

   const watchedProductName = useWatch({ control: form.control, name: "product_name" });
  const watchedVariants = useWatch({ control: form.control, name: "variants" });

  useEffect(() => {
    watchedVariants.forEach((variant, index) => {
      // Hanya generate jika field SKU kosong
      if (!form.getValues(`variants.${index}.sku`)) {
        const colorId = variant.color_id;
        const sizeId = variant.size_id;
        const materialId = variant.material_id;

        if (watchedProductName && colorId && sizeId && materialId) {
          // 1. Ganti spasi dengan '-' dan buat uppercase untuk semua bagian teks
          const productPart = watchedProductName.toUpperCase().replace(/\s+/g, '-');
          const colorName = masterData.colors.find(c => String(c.id) === colorId)?.name.toUpperCase().replace(/\s+/g, '-') || '';
          const sizeCode = masterData.sizes.find(s => String(s.id) === sizeId)?.code?.toUpperCase() || '';
          const materialName = masterData.materials.find(m => String(m.id) === materialId)?.name.toUpperCase().replace(/\s+/g, '-') || '';
          
          // 2. Gabungkan semua bagian
          const generatedSku = `${productPart}-${colorName}-${sizeCode}-${materialName}`;
          
          // 3. Bersihkan tanda hubung berlebih
          const finalSku = generatedSku.replace(/-+/g, '-').replace(/^-|-$/g, '');

          form.setValue(`variants.${index}.sku`, finalSku, { shouldValidate: true });
        }
      }
    });
  }, [
    watchedProductName, 
    JSON.stringify(watchedVariants.map(v => ({c: v.color_id, s: v.size_id, m: v.material_id}))),
    masterData, 
    form
  ]);
  // ------------------------------------
  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      // ... (semua logika formData.append untuk data teks tetap sama)
      formData.append("product_name", data.product_name);
      formData.append("category_id", data.category_id);
      formData.append("gender", data.gender);
      formData.append("is_active", data.is_active ? "1" : "0");
      if (data.description) formData.append("description", data.description);

      data.variants.forEach((variant, index) => {
        // ... (semua logika formData.append untuk varian tetap sama)
        if (variant.id)
          formData.append(`variants[${index}][id]`, String(variant.id));
        formData.append(`variants[${index}][color_id]`, variant.color_id);
        formData.append(`variants[${index}][size_id]`, variant.size_id);
        formData.append(`variants[${index}][material_id]`, variant.material_id);
        formData.append(`variants[${index}][price]`, String(variant.price));
        formData.append(`variants[${index}][stock]`, String(variant.stock));
        formData.append(`variants[${index}][weight]`, String(variant.weight)); // Tambahkan weight
        // Ganti 'rating' dengan 'sku'
        if (variant.sku) {
          formData.append(`variants[${index}][sku]`, variant.sku);
        }

        variant.newImageFiles.forEach((file) =>
          formData.append(`variants[${index}][images][]`, file)
        );
        variant.deletedImageIds.forEach((id) =>
          formData.append(`variants[${index}][deleted_image_ids][]`, String(id))
        );
      });
      deletedVariantIds.forEach((id) =>
        formData.append("deleted_variant_ids[]", String(id))
      );

      // --- PERBAIKAN UTAMA ADA DI SINI ---

      if (initialData) {
        // Untuk update, kita tetap menggunakan POST tapi dengan _method: 'PUT'
        // dan WAJIB menyertakan header 'multipart/form-data'
        formData.append("_method", "PUT");
        await api.post(`/admin/products/${initialData.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccess("Produk berhasil diperbarui.");
      } else {
        // Untuk create, kita gunakan POST dan WAJIB menyertakan header
        await api.post("/admin/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        showSuccess("Produk berhasil ditambahkan.");
      }

      onSuccess();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Operasi gagal. Periksa kembali data Anda.";
      showError(message);
      // Log ini sangat penting untuk melihat detail error dari Laravel
      console.error("Validation Errors:", err?.response?.data?.errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col flex-1 min-h-0 sm:w-3xl md:w-6xl"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-4 -mr-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Utama Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2" htmlFor="product_name">
                Nama Produk
              </Label>
              <Input id="product_name" {...form.register("product_name")} />
              {form.formState.errors.product_name && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.product_name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2" htmlFor="category_id">
                  Kategori
                </Label>
                <Controller
                  name="category_id"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="category_id">
                        <SelectValue placeholder="Pilih kategori..." />
                      </SelectTrigger>
                      <SelectContent>
                        {masterData.categories.map((cat) => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {cat.category_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.category_id && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.category_id.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-2" htmlFor="gender">
                  Target Gender
                </Label>
                <Controller
                  name="gender"
                  control={form.control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue
                          placeholder="Pilih gender..."
                          className="w-full"
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unisex">Unisex</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="mb-2" htmlFor="description">
                Deskripsi Produk
              </Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Jelaskan detail produk, bahan, keunggulan, dll."
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div>
              <Label>Status Produk</Label>
              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <div className="flex items-center space-x-3 mt-2">
                    <Switch
                      id="is_active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer mb-2">
                      {field.value
                        ? "Aktif (Tampil di toko)"
                        : "Nonaktif (Disembunyikan dari toko)"}
                    </Label>
                  </div>
                )}
              />
              {form.formState.errors.is_active && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.is_active.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Manajemen Varian</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    id: null,
                    color_id: "",
                    size_id: "",
                    material_id: "",
                    price: 0,
                    stock: 0,
                    weight: 0,
                    sku: "",
                    existingImages: [],
                    newImageFiles: [],
                    deletedImageIds: [],
                  })
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Varian
              </Button>
            </div>
            {form.formState.errors.variants?.root && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.variants.root.message}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <SortableVariantItem
                      key={field.id}
                      id={field.id}
                      index={index}
                      remove={handleRemoveVariant}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Controller
                            name={`variants.${index}.color_id`}
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih warna..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {masterData.colors.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {form.formState.errors.variants?.[index]
                            ?.color_id && (
                            <p className="text-sm text-red-500 mt-1">
                              {
                                form.formState.errors.variants[index].color_id
                                  .message
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <Controller
                            name={`variants.${index}.size_id`}
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih ukuran..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {masterData.sizes.map((s) => (
                                    <SelectItem key={s.id} value={String(s.id)}>
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {form.formState.errors.variants?.[index]?.size_id && (
                            <p className="text-sm text-red-500 mt-1">
                              {
                                form.formState.errors.variants[index].size_id
                                  .message
                              }
                            </p>
                          )}
                        </div>
                        <div>
                          <Controller
                            name={`variants.${index}.material_id`}
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih bahan..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {masterData.materials.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {form.formState.errors.variants?.[index]
                            ?.material_id && (
                            <p className="text-sm text-red-500 mt-1">
                              {
                                form.formState.errors.variants[index]
                                  .material_id.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                       {/* --- REVISI UTAMA PADA TAMPILAN --- */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div><Label>Harga <span className="text-destructive">*</span></Label><Input type="number" {...form.register(`variants.${index}.price`)} />{form.formState.errors.variants?.[index]?.price && <p className="text-sm text-red-500 mt-1">{form.formState.errors.variants[index].price.message}</p>}</div>
                        <div><Label>Stok <span className="text-destructive">*</span></Label><Input type="number" {...form.register(`variants.${index}.stock`)} />{form.formState.errors.variants?.[index]?.stock && <p className="text-sm text-red-500 mt-1">{form.formState.errors.variants[index].stock.message}</p>}</div>
                        <div><Label>Berat (gram) <span className="text-destructive">*</span></Label><Input type="number" {...form.register(`variants.${index}.weight`)} />{form.formState.errors.variants?.[index]?.weight && <p className="text-sm text-red-500 mt-1">{form.formState.errors.variants[index].weight.message}</p>}</div>
                        <div><Label>SKU <span className="text-destructive">*</span></Label><Input type="text" placeholder="Terisi otomatis..." {...form.register(`variants.${index}.sku`)} />{form.formState.errors.variants?.[index]?.sku && <p className="text-sm text-red-500 mt-1">{form.formState.errors.variants[index].sku.message}</p>}</div>
                      </div>
                      <div>
                        <Label className="mb-2">Gambar Varian</Label>
                        <VariantImageUploader
                          existingImages={
                            form.getValues(
                              `variants.${index}.existingImages`
                            ) || []
                          }
                          newImageFiles={
                            form.getValues(`variants.${index}.newImageFiles`) ||
                            []
                          }
                          onUpdateNewFiles={(files) =>
                            form.setValue(
                              `variants.${index}.newImageFiles`,
                              files,
                              { shouldValidate: true }
                            )
                          }
                          onAddExistingImageToDelete={(imageId) => {
                            const dels =
                              form.getValues(
                                `variants.${index}.deletedImageIds`
                              ) || [];
                            form.setValue(`variants.${index}.deletedImageIds`, [
                              ...dels,
                              imageId,
                            ]);
                            const exis =
                              form.getValues(
                                `variants.${index}.existingImages`
                              ) || [];
                            form.setValue(
                              `variants.${index}.existingImages`,
                              exis.filter((i) => i.id !== imageId)
                            );
                          }}
                        />
                        {form.formState.errors.variants?.[index]
                          ?.newImageFiles && (
                          <p className="text-sm text-red-500 mt-1">
                            {/* Pesan error bisa dari validasi file individual atau dari .refine() */}
                            {form.formState.errors.variants[index].newImageFiles
                              .message ||
                              form.formState.errors.variants[index]
                                .newImageFiles.root?.message}
                          </p>
                        )}
                      </div>
                    </SortableVariantItem>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end gap-2 pt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );
}
