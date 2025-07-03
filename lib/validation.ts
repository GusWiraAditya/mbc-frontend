// lib/validation.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(8, { message: 'Minimal 8 karakter' }),
})

// TAMBAHKAN SKEMA BARU INI
export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"], // Menampilkan error di bawah field konfirmasi password
});

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
// 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

/// =================================================================
// SKEMA UNTUK MANAJEMEN ADMIN
// =================================================================

// --- Skema untuk Kategori ---

export const addCategorySchema = z.object({
  category_name: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }),
  description: z.string().optional(),

  image: z
    .any()
    .refine((files) => files?.length == 1, "Gambar kategori wajib diisi.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Ukuran gambar maksimal 2MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Hanya format .jpeg, .jpg, .png, .gif, dan .webp yang didukung."
    ),
  is_active: z.boolean(),

});

export const editCategorySchema = z.object({
  category_name: z.string().min(3, { message: "Nama kategori minimal 3 karakter." }),
  description: z.string().optional(),

  image: z
    .any()
    .optional()
    .refine(
        (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, 
        `Ukuran gambar maksimal 2MB.`
    )
    .refine(
        (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        "Hanya format .jpeg, .jpg, .png, .gif, dan .webp yang didukung."
    ),
  is_active: z.boolean(),

});


// --- Skema untuk Produk ---
// --- Konstanta untuk Validasi File ---
// --- Skema Validasi ---

// Skema untuk satu varian produk di dalam form
export const productVariantFormSchema = z.object({
  id: z.number().nullable(),
  color_id: z.string().min(1, { message: "Warna harus dipilih." }),
  size_id: z.string().min(1, { message: "Ukuran harus dipilih." }),
  material_id: z.string().min(1, { message: "Bahan harus dipilih." }),
  // REVISI: Harga minimal 1 agar tidak bisa 0 atau kosong
  price: z.coerce.number({ invalid_type_error: "Harga harus angka." }).min(1, "Harga harus diisi."),
  stock: z.coerce.number({ invalid_type_error: "Stok harus berupa angka." }).int("Stok harus bilangan bulat.").min(0, "Stok tidak boleh negatif."),
  sku: z.string().min(1, { message: "SKU harus diisi." }),
  
  // Properti ini hanya untuk state di frontend
  existingImages: z.array(z.any()),
  
  // --- REVISI UTAMA DI SINI ---
  newImageFiles: z.array(
    z.instanceof(File)
      .refine(
        (file) => file.size <= MAX_FILE_SIZE,
        `Ukuran file maksimal adalah 2MB.`
      )
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        "Hanya format .jpeg, .png, .jpg, dan .webp yang diterima."
      )
  ),
  
  deletedImageIds: z.array(z.number()),
})
.refine(
  // Fungsi validasi: total gambar harus > 0
  (data) => data.existingImages.length + data.newImageFiles.length > 0,
  {
    // Pesan error jika validasi gagal
    message: "Setidaknya satu gambar harus diunggah untuk varian ini.",
    // Tampilkan pesan error ini pada field 'newImageFiles'
    path: ["newImageFiles"],
  }
);

// Skema untuk keseluruhan form produk
export const productFormSchema = z.object({
  product_name: z.string().min(1, "Nama produk harus diisi."),
  category_id: z.string().min(1, "Kategori harus dipilih."),
  description: z.string().optional(),
  gender: z.enum(["men", "women", "unisex"]),
  is_active: z.boolean(),
  variants: z.array(productVariantFormSchema).min(1, "Minimal harus ada satu varian produk."),
});

// Tipe yang di-infer dari skema untuk digunakan di komponen
export type ProductFormValues = z.infer<typeof productFormSchema>;