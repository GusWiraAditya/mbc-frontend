// lib/validation.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, { message: "Minimum 8 characters" }),
});

// TAMBAHKAN SKEMA BARU INI
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"], // Menampilkan error di bawah field konfirmasi password
  });

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
// 2MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

/// =================================================================
// SKEMA UNTUK MANAJEMEN ADMIN
// =================================================================

// --- Skema untuk Kategori ---

export const addCategorySchema = z.object({
  category_name: z
    .string()
    .min(3, { message: "Nama kategori minimal 3 karakter." }),
  description: z.string().optional(),

  image: z
    .any()
    .refine((files) => files?.length == 1, "Gambar kategori wajib diisi.")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      `Ukuran gambar maksimal 2MB.`
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Hanya format .jpeg, .jpg, .png, .gif, dan .webp yang didukung."
    ),
  is_active: z.boolean(),
});

export const editCategorySchema = z.object({
  category_name: z
    .string()
    .min(3, { message: "Nama kategori minimal 3 karakter." }),
  description: z.string().optional(),

  image: z
    .any()
    .optional()
    .refine(
      (files) =>
        !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
      `Ukuran gambar maksimal 2MB.`
    )
    .refine(
      (files) =>
        !files ||
        files.length === 0 ||
        ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Hanya format .jpeg, .jpg, .png, .gif, dan .webp yang didukung."
    ),
  is_active: z.boolean(),
});

// --- Skema untuk Produk ---
// --- Konstanta untuk Validasi File ---
// --- Skema Validasi ---

// Skema untuk satu varian produk di dalam form
export const productVariantFormSchema = z
  .object({
    id: z.number().nullable(),
    color_id: z.string().min(1, { message: "Warna harus dipilih." }),
    size_id: z.string().min(1, { message: "Ukuran harus dipilih." }),
    material_id: z.string().min(1, { message: "Bahan harus dipilih." }),
    // REVISI: Harga minimal 1 agar tidak bisa 0 atau kosong
    price: z.coerce
      .number({ invalid_type_error: "Harga harus angka." })
      .min(1, "Harga harus diisi."),
    stock: z.coerce
      .number({ invalid_type_error: "Stok harus berupa angka." })
      .int("Stok harus bilangan bulat.")
      .min(0, "Stok tidak boleh negatif."),
    weight: z.coerce.number({ invalid_type_error: "Berat harus angka."}).min(1, "Berat harus diisi (minimal 1 gram)."),
    sku: z.string().min(1, { message: "SKU harus diisi." }),

    // Properti ini hanya untuk state di frontend
    existingImages: z.array(z.any()),

    // --- REVISI UTAMA DI SINI ---
    newImageFiles: z.array(
      z
        .instanceof(File)
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
  variants: z
    .array(productVariantFormSchema)
    .min(1, "Minimal harus ada satu varian produk."),
});

// Tipe yang di-infer dari skema untuk digunakan di komponen
export type ProductFormValues = z.infer<typeof productFormSchema>;

// --- Skema Validasi untuk VOUCHER (BARU & STABIL) ---

// --- Skema Validasi untuk VOUCHER (Versi Final & Stabil) ---
// Skema untuk Voucher (Versi Final & Stabil)
// lib/validation.ts

const optionalNumeric = z.preprocess(
  (val) => (val === "" || val == null ? undefined : Number(val)),
  z.number({ invalid_type_error: "Harus berupa angka." }).optional()
);

export const voucherSchema = z.object({
  // --- Informasi Dasar ---
  name: z.string().min(3, { message: "Nama voucher minimal 3 karakter." }),
  code: z
    .string()
    .min(3, { message: "Kode unik minimal 3 karakter." })
    .regex(/^[A-Z0-9_]+$/, { message: "Kode hanya boleh berisi huruf kapital, angka, dan underscore (_)." })
    .transform((v) => v.toUpperCase()),
  description: z.string().optional(),
  is_active: z.boolean().default(true),

  // --- Aturan & Tipe Voucher ---
 type: z.enum([
    "fixed_transaction",
    "percent_transaction",
    "fixed_item", 
    "percent_item",
    "free_shipping",
  ]).transform((val) => val || "fixed_transaction"),

   stacking_group: z.enum(
    ["transaction_discount", "item_discount", "shipping_discount", "unique"]
  ).optional().default("transaction_discount"),
  
  // --- Nilai & Batasan ---
  value: optionalNumeric, // Menggunakan helper
  max_discount: optionalNumeric, // Menggunakan helper
  min_purchase: optionalNumeric, // Menggunakan helper
  usage_limit: optionalNumeric, // Menggunakan helper
  usage_limit_per_user: optionalNumeric, // Menggunakan helper

  // --- Periode Berlaku ---
  start_date: z.date({ required_error: "Tanggal mulai wajib diisi." }),
  end_date: z.date({ required_error: "Tanggal akhir wajib diisi." }),
  
  // --- Keterkaitan dengan Produk/Kategori ---
  product_ids: z.array(z.number()).optional(),
  category_ids: z.array(z.number()).optional(),

}).superRefine((data, ctx) => {
  // ATURAN 1: Tanggal akhir tidak boleh sebelum tanggal mulai.
  if (data.end_date < data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tanggal akhir tidak boleh sebelum tanggal mulai.",
      path: ["end_date"],
    });
  }

  // ATURAN 2: Field 'value' wajib diisi kecuali untuk tipe 'Gratis Ongkir'.
  if (data.type !== "free_shipping" && (data.value === undefined || data.value < 1)) {
     ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Nilai/persen wajib diisi (minimal 1).",
      path: ["value"],
    });
  }

  // ATURAN 3: Field 'max_discount' wajib diisi jika tipe voucher adalah persen.
  if (data.type.includes("percent") && (data.max_discount === undefined || data.max_discount < 1)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Potongan maksimal wajib diisi (minimal 1).",
      path: ["max_discount"],
    });
  }

  // ATURAN 4: Wajib memilih produk atau kategori jika tipe voucher adalah per item.
  if (
    data.type.includes("item") &&
    (data.product_ids?.length === 0 || !data.product_ids) &&
    (data.category_ids?.length === 0 || !data.category_ids)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pilih minimal satu produk atau kategori untuk tipe voucher ini.",
      path: ["product_ids"], // Tampilkan pesan error di bawah field produk
    });
  }
});

// Kita juga bisa mengekspor tipe TypeScript yang dihasilkan oleh Zod
export type VoucherFormData = z.infer<typeof voucherSchema>;

// --- Skema Validasi untuk SETTINGS (Sudah Benar) ---
const phoneRegex = new RegExp(/^(\+62|62|0)8[1-9][0-9]{7,14}$/);
const urlSchema = z
  .string()
  .url({ message: "URL tidak valid." })
  .optional()
  .or(z.literal(""));

export const settingsSchema = z.object({
  shop_name: z.string().optional(),
  shop_tagline: z.string().optional(),
  contact_email: z
    .string()
    .email({ message: "Invalid email format." })
    .optional()
    .or(z.literal("")),
  contact_phone: z
    .string()
    .regex(phoneRegex, {
      message: "The Indonesian phone number format is invalid.",
    })
    .optional()
    .or(z.literal("")),
  shop_address: z.string().optional(),
  shop_latitude: z.string().optional(),
  shop_longitude: z.string().optional(),
  shipping_fee: z.coerce.number().optional(),
  seo_meta_title: z.string().optional(),
  seo_meta_description: z.string().optional(),
  seo_meta_keywords: z.string().optional(),
  social_facebook_url: urlSchema,
  social_instagram_url: urlSchema,
  social_twitter_url: urlSchema,
  social_tiktok_url: urlSchema,
  social_youtube_url: urlSchema,
  shop_logo_primary: z.any().optional(),
  shop_logo_secondary: z.any().optional(),
  shop_favicon: z.any().optional(),
  hero_headline: z.string().optional(),
  hero_subheadline: z.string().optional(),
  hero_background_image: z.any().optional(),
});


export const profileSchema = z.object({
  name: z.string().min(3, { message: "Name must have at least 3 characters." }),
  phone_number: z
    .string()
    .regex(phoneRegex, {
      message: "The Indonesian phone number format is invalid.",
    })
    .optional()
    .or(z.literal("")),
  date_of_birth: z.date({
    errorMap: (issue, ctx) => ({ message: 'Format tanggal tidak valid.' }),
  }).optional().nullable(),
  gender: z.enum(['Male', 'Female']).optional().nullable(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
