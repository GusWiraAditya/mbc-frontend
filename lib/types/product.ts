// lib/types/product.ts

// Definisikan tipe dasar terlebih dahulu
export type Category = {
  id: number;
  category_name: string;
  slug: string;
  description?: string;
  image: string | null;
  isActive: boolean;
};

export type Color = { id: number; name: string; hex_code: string };
export type Size = { id: number; name: string; code: string; description?: string };
export type Material = { id: number; name: string; description?: string };
export type ProductImage = { id: number; path: string };

// Definisikan ProductVariant TANPA referensi kembali ke Product
export type ProductVariant = {
  id: number;
  // HAPUS: product: Product; <-- Ini adalah sumber masalah
  color: Color;
  size: Size;
  material: Material;
  price: number;
  stock: number;
  weight: number;
  sku: string | null;
  images: ProductImage[];
  // TAMBAHKAN: product_id jika Anda perlu tahu ID induknya
  product_id: number; 
};

// Terakhir, definisikan Product yang memiliki array ProductVariant
export type Product = {
  id: number;
  category: Category;
  slug: string;
  product_name: string;
  description?: string;
  gender: "male" | "female" | "unisex";
  min_price?: number;
  max_price?: number;
  isActive: boolean;
  variants: ProductVariant[];
};

export type CartItem = {
  cartItemId: number;      // ID dari tabel `carts` (0 untuk guest).
  variantId: number;       // ID dari `product_variants`. Kunci utama.
  productId: number;       // ID dari produk induk.
  productName: string;
  variantName: string;     // Cth: "Merah / L"
  image: string | null;
  slug: string;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  quantity: number;
  selected: boolean;       // Apakah item ini dipilih untuk checkout.
};

/**
 * Voucher yang sedang diterapkan di keranjang.
 */
export type AppliedVoucher = {
  code: string;
  discountAmount: number;
  name: string;
  start_date: string | null; // Format ISO 8601
  end_date: string | null;   // Format ISO 8601
  description: string;
};

/**
 * Ringkasan harga. Untuk user login, ini datang dari backend.
 * Untuk guest, ini dihitung di frontend.
 */
export type CartSummary = {
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  grandTotal: number;
};
