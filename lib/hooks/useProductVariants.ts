// lib/hooks/useProductVariants.ts

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, ProductVariant, ProductImage } from '@/lib/types/product';

/**
 * Custom Hook untuk mengelola semua logika kompleks pemilihan varian produk.
 * Hook ini bertanggung jawab untuk:
 * 1. Melacak pilihan pengguna (warna, ukuran, material).
 * 2. Secara dinamis menghitung opsi mana yang tersedia berdasarkan pilihan saat ini (Dependent Filtering).
 * 3. Secara proaktif memperbaiki pilihan pengguna untuk mencegah state yang tidak valid.
 * 4. Menentukan varian produk akhir yang cocok dengan semua pilihan.
 * 5. Mengelola gambar utama yang ditampilkan.
 *
 * @param product - Objek produk lengkap yang berisi semua varian, atau null jika sedang loading.
 * @returns Objek yang berisi semua state dan handler yang dibutuhkan oleh komponen UI.
 */
export function useProductVariants(product: Product | null) {
  // --- 1. State Internal untuk Pilihan Pengguna ---
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<ProductImage | null>(null);

  // --- 2. Inisialisasi atau Reset State Saat Produk Berubah ---
  useEffect(() => {
    // Jika produk baru dimuat (atau berubah), reset semua pilihan dan set ke default.
    if (product && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedColorId(firstVariant.color.id);
      setSelectedSizeId(firstVariant.size.id);
      setSelectedMaterialId(firstVariant.material.id);
    } else {
      // Jika produk null (misalnya saat loading), kosongkan semua state.
      setSelectedColorId(null);
      setSelectedSizeId(null);
      setSelectedMaterialId(null);
    }
  }, [product]);

  // --- 3. Logika Inti: Kalkulasi Varian & Opsi yang Tersedia (DIREVISI UNTUK KETERBACAAN) ---
  const variantData = useMemo(() => {
    if (!product) {
      return {
        selectedVariant: null,
        uniqueColors: [],
        availableSizes: [],
        availableMaterials: [],
         uniqueSizes: [], 
      uniqueMaterials: [],
      };
    }
    const { variants } = product;

    // A. Ambil semua opsi unik dari awal. Ini tidak akan berubah.
    const uniqueColors = [...new Map(variants.map(v => [v.color.id, v.color])).values()];
    const uniqueSizes = [...new Map(variants.map(v => [v.size.id, v.size])).values()];
    const uniqueMaterials = [...new Map(variants.map(v => [v.material.id, v.material])).values()];
    
    // B. Tentukan varian yang mungkin berdasarkan pilihan warna.
    const possibleVariantsAfterColor = variants.filter(v => 
      v.color.id === selectedColorId
    );

    // C. Dari kemungkinan itu, tentukan ukuran apa saja yang tersedia.
    const availableSizes = [...new Map(possibleVariantsAfterColor.map(v => [v.size.id, v.size])).values()];

    // D. Tentukan varian yang mungkin setelah memilih warna DAN ukuran.
    const possibleVariantsAfterSize = possibleVariantsAfterColor.filter(v =>
      v.size.id === selectedSizeId
    );

    // E. Dari kemungkinan itu, tentukan material apa saja yang tersedia.
    const availableMaterials = [...new Map(possibleVariantsAfterSize.map(v => [v.material.id, v.material])).values()];

    // F. Temukan varian final yang cocok dengan SEMUA pilihan.
    const selectedVariant = possibleVariantsAfterSize.find(v => 
      v.material.id === selectedMaterialId
    ) || null; // Selalu kembalikan null jika tidak ditemukan

    return {
      selectedVariant,
      uniqueColors,
      uniqueSizes, 
      uniqueMaterials,
      availableSizes,
      availableMaterials,
    };
  }, [product, selectedColorId, selectedSizeId, selectedMaterialId]);

  // --- 4. Handler Aksi yang Proaktif dan Anti-Buntu (DIREVISI) ---

  const handleColorSelect = useCallback((colorId: number) => {
    if (!product || colorId === selectedColorId) return;

    // Cari kombinasi valid pertama untuk warna yang baru dipilih.
    const bestFirstMatch = product.variants.find(v => v.color.id === colorId);
    if (bestFirstMatch) {
      // Set SEMUA state varian secara bersamaan untuk melompat ke kombinasi valid.
      setSelectedColorId(bestFirstMatch.color.id);
      setSelectedSizeId(bestFirstMatch.size.id);
      setSelectedMaterialId(bestFirstMatch.material.id);
    }
  }, [product, selectedColorId]);

  const handleSizeSelect = useCallback((sizeId: number) => {
    if (!product || !selectedColorId || sizeId === selectedSizeId) return;

    // Setelah memilih ukuran, kita harus memperbaiki pilihan material.
    const possibleVariants = product.variants.filter(v => 
      v.color.id === selectedColorId && v.size.id === sizeId
    );
    
    if (possibleVariants.length > 0) {
      // Ambil material valid pertama dari sisa kemungkinan.
      const firstAvailableMaterial = possibleVariants[0].material;
      
      // Set ukuran dan perbaiki material ke pilihan valid pertama.
      setSelectedSizeId(sizeId);
      setSelectedMaterialId(firstAvailableMaterial.id);
    }
  }, [product, selectedColorId, selectedSizeId]);

  const handleMaterialSelect = useCallback((materialId: number) => {
    // Ini adalah pilihan terakhir, jadi cukup set nilainya.
    // Logika `useMemo` di atas akan menemukan varian yang cocok.
    setSelectedMaterialId(materialId);
  }, []);

  // --- 5. Efek untuk Mengelola Gambar Utama (Tidak Berubah, Sudah Baik) ---
  useEffect(() => {
    const { selectedVariant } = variantData;
    if (selectedVariant && selectedVariant.images.length > 0) {
      if (!mainImage || !selectedVariant.images.some(img => img.id === mainImage.id)) {
        setMainImage(selectedVariant.images[0]);
      }
    } else if (product && product.variants.length > 0 && !mainImage) {
      // Fallback ke gambar pertama dari produk jika tidak ada varian terpilih
      setMainImage(product.variants[0].images[0] || null);
    }
  }, [variantData, mainImage, product]);

  // --- 6. Kembalikan Semua yang Dibutuhkan UI ---
  return {
    // State Pilihan & Hasil
    selectedVariant: variantData.selectedVariant,
    mainImage,
    
    // Opsi untuk ditampilkan di UI
    uniqueColors: variantData.uniqueColors,
    uniqueSizes: variantData.uniqueSizes,
    uniqueMaterials: variantData.uniqueMaterials,

    // Opsi yang aktif (untuk menonaktifkan tombol)
    availableSizes: variantData.availableSizes,
    availableMaterials: variantData.availableMaterials,
    
    // Handler Aksi
    setMainImage,
    handleColorSelect,
    handleSizeSelect,
    handleMaterialSelect,
  };
}
