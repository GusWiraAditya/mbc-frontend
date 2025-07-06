// File: app/(admin)/admin/categories/CategoryForm.tsx

"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// REVISI: Impor kedua skema validasi
import { addCategorySchema, editCategorySchema } from "@/lib/validation";
import { showError, showSuccess } from "@/lib/toast";
import api from "@/lib/api";
import { Category } from "./kategori-columns";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess: () => void;
  onClose: () => void;
}

// REVISI: Tentukan tipe form values secara dinamis
type FormValues =
  | z.infer<typeof addCategorySchema>
  | z.infer<typeof editCategorySchema>;

export function CategoryForm({
  initialData,
  onSuccess,
  onClose,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.image
      ? `${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/storage/${initialData.image}`
      : null
  );

  // REVISI: Pilih skema validasi berdasarkan mode (tambah atau edit)
  const formSchema = initialData ? editCategorySchema : addCategorySchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: initialData?.category_name || "",
      description: initialData?.description || "",
      is_active: initialData ? !!initialData.is_active : true,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("category_name", data.category_name);
      formData.append("is_active", data.is_active ? "1" : "0");
      if (data.description) formData.append("description", data.description);

      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      if (initialData) {
        formData.append("_method", "PUT");
        await api.post(`/admin/categories/${initialData.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSuccess("Kategori berhasil diperbarui.");
      } else {
        await api.post("/admin/categories", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showSuccess("Kategori berhasil ditambahkan.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors) {
        Object.values(serverErrors)
          .flat()
          .forEach((error: any) => showError(error));
      } else {
        showError(
          err?.response?.data?.message || "Operasi gagal, silakan coba lagi."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-h-[75vh] overflow-y-auto"
    >
      <div>
        <Label htmlFor="category_name" className="mb-2">
          Nama Kategori
        </Label>
        <Input
          id="category_name"
          {...register("category_name")}
          disabled={isSubmitting}
        />
        {errors.category_name && (
          <p className="text-sm text-red-500 mt-1">
            {errors.category_name.message}
          </p>
        )}
      </div>
      <div>
        <Label className="mb-2" htmlFor="description">
          Deskripsi
        </Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Deskripsi Kategori"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* --- REVISI: TAMBAHKAN KOMPONEN SWITCH DI SINI --- */}
      <div>
        <Label>Status Kategori</Label>
        <Controller
          name="is_active"
          control={control}
          render={({ field }) => (
            <div className="flex items-center space-x-3 mt-2 rounded-lg border p-3">
              <Switch
                id="is_active"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="is_active"
                className="cursor-pointer text-muted-foreground"
              >
                {field.value
                  ? "Aktif (Kategori akan tampil di toko)"
                  : "Nonaktif (Kategori disembunyikan)"}
              </Label>
            </div>
          )}
        />
        {errors.is_active && (
          <p className="text-sm text-red-500 mt-1">
            {errors.is_active.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="image" className="mb-2">
          Gambar Kategori
        </Label>
        <Input
          id="image"
          type="file"
          {...register("image")}
          onChange={handleImageChange}
          disabled={isSubmitting}
        />
        {previewImage && (
          <div className="mt-4">
            <Image
              src={previewImage}
              alt="Preview"
              width={100}
              height={100}
              className="rounded-md object-cover"
            />
          </div>
        )}
        {/* Tampilkan pesan error spesifik untuk gambar */}
        {errors.image && (
          <p className="text-sm text-red-500 mt-1">
            {errors.image.message as string}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : initialData
            ? "Simpan Perubahan"
            : "Tambah Kategori"}
        </Button>
      </div>
    </form>
  );
}
