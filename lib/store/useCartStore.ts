// lib/store/useCartStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { showSuccess, showError } from "@/lib/toast";
import api from "@/lib/api";
import { useAuthStore } from "../store";
import { CartItem, CartSummary, AppliedVoucher } from "@/lib/types/product";

// =====================================================================
// DEFINISI STATE & AKSI
// =====================================================================

type CartState = {
  items: CartItem[];
  summary: CartSummary;
  appliedVouchers: AppliedVoucher[];
  isInitialized: boolean;
  isLoading: boolean;
  updatingVariantId: number | null;
  isApplyingVoucher: boolean;
  voucherError: string | null;

  // Aksi
  initializeCart: () => Promise<void>;
  mergeAndSyncCart: () => Promise<void>;
  addToCart: (variantData: Omit<CartItem, "cartItemId" | "quantity" | "selected">, quantity: number) => Promise<void>;
  updateQuantity: (variantId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (variantIds: number[]) => Promise<void>;
  toggleSelectItem: (variantId: number, isSelected: boolean) => Promise<void>;
  toggleSelectAll: (select: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  applyVoucher: (code: string) => Promise<void>;
  removeVoucher: (code: string) => Promise<void>;
  reset: () => void;
};

// =====================================================================
// HELPER FUNCTIONS
// =====================================================================

const getInitialSummary = (): CartSummary => ({
  totalWeight: 0, // Tambahkan totalWeight untuk menghitung berat total
  subtotal: 0,
  totalDiscount: 0,
  shippingCost: 0,
  grandTotal: 0,
});

const updateStateFromServer = (set: any, responseData: any) => {
  set({
    items: responseData.items || [],
    summary: responseData.summary || getInitialSummary(),
    appliedVouchers: responseData.applied_vouchers || [],
    isLoading: false,
    isApplyingVoucher: false,
    updatingVariantId: null,
  });
};

const recalculateGuestSummary = (set: any, get: any) => {
  const { items } = get();
  const selectedItems = items.filter((item: CartItem) => item.selected);
  const subtotal = selectedItems.reduce((acc: number, item: CartItem) => acc + item.price * item.quantity, 0);
  set({ summary: { subtotal, totalDiscount: 0, shippingCost: 0, grandTotal: subtotal } });
};

// =====================================================================
// STORE IMPLEMENTATION
// =====================================================================

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Nilai Awal State
      
      items: [],
      summary: getInitialSummary(),
      appliedVouchers: [],
      isInitialized: false,
      isLoading: true,
      updatingVariantId: null,
      isApplyingVoucher: false,
      voucherError: null,

      // --- AKSI UTAMA ---

      mergeAndSyncCart: async () => {
        const localItems = get().items;
        if (localItems.length === 0) {
            // Jika tidak ada item lokal, cukup ambil data dari server
            return get().initializeCart();
        }

        set({ isLoading: true });
        try {
            // Panggil API merge, server akan menggabungkan dan mengembalikan state final
            const response = await api.post("/cart/merge", {
                items: localItems.map((item) => ({
                    variant_id: item.variantId,
                    quantity: item.quantity,
                })),
            });
            // Update seluruh state dengan hasil merge dari server
            updateStateFromServer(set, response.data);
            console.log("Cart merged and synced successfully.");
        } catch (error) {
            showError("Gagal menggabungkan keranjang belanja.");
            set({ isLoading: false });
        }
      },

      // --- REVISI UTAMA: `initializeCart` dibuat lebih sederhana ---
      initializeCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true });

        if (isAuthenticated) {
          // TUGASNYA SEKARANG HANYA MENGAMBIL DATA, BUKAN MERGE
          try {
            const response = await api.get("/cart");
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal mengambil data keranjang.");
            set({ isLoading: false });
          }
        } else {
          // Logika untuk guest tidak berubah
          recalculateGuestSummary(set, get);
          set({ isLoading: false });
        }
        set({ isInitialized: true });
      },


      addToCart: async (variantData, quantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true });
        if (isAuthenticated) {
          try {
            const response = await api.post("/cart/add", { variant_id: variantData.variantId, quantity });
            updateStateFromServer(set, response.data);
            showSuccess(`${variantData.productName} ditambahkan.`);
          } catch (error) {
            showError("Gagal menambahkan item.");
            set({ isLoading: false });
          }
        } else {
          const { items } = get();
          const existingItemIndex = items.findIndex((item) => item.variantId === variantData.variantId);
          if (existingItemIndex > -1) {
            const newItems = [...items];
            const newQuantity = newItems[existingItemIndex].quantity + quantity;
            newItems[existingItemIndex].quantity = Math.min(newQuantity, variantData.stock);
            set({ items: newItems });
          } else {
            const newItem: CartItem = { ...variantData, cartItemId: 0, quantity, selected: true };
            set({ items: [...items, newItem] });
          }
          recalculateGuestSummary(set, get);
          set({ isLoading: false });
          showSuccess(`${variantData.productName} ditambahkan.`);
        }
      },
      
      updateQuantity: async (variantId, newQuantity) => {
        const { isAuthenticated } = useAuthStore.getState();
        const currentItem = get().items.find((item) => item.variantId === variantId);
        if (!currentItem || newQuantity === currentItem.quantity || get().updatingVariantId === variantId) return;
        if (newQuantity <= 0) return get().removeFromCart([variantId]);
        
        set({ updatingVariantId: variantId });
        if (isAuthenticated) {
          try {
            const response = await api.put(`/cart/update/${currentItem.cartItemId}`, { quantity: newQuantity });
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal mengupdate kuantitas.");
            set({ updatingVariantId: null });
          }
        } else {
          const newItems = get().items.map((item) => item.variantId === variantId ? { ...item, quantity: Math.min(newQuantity, item.stock) } : item);
          set({ items: newItems, updatingVariantId: null });
          recalculateGuestSummary(set, get);
        }
      },

      removeFromCart: async (variantIds) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true });
        if (isAuthenticated) {
          try {
            const cartItemIds = get().items.filter((item) => variantIds.includes(item.variantId)).map((item) => item.cartItemId);
            const response = await api.post("/cart/remove", { cart_item_ids: cartItemIds });
            updateStateFromServer(set, response.data);
            showSuccess("Item berhasil dihapus.");
          } catch (error) {
            showError("Gagal menghapus item.");
            set({ isLoading: false });
          }
        } else {
          const newItems = get().items.filter((item) => !variantIds.includes(item.variantId));
          set({ items: newItems, isLoading: false });
          recalculateGuestSummary(set, get);
          showSuccess("Item berhasil dihapus.");
        }
      },

      // --- REVISI UTAMA: Mengganti Optimistic Update dengan Sinkronisasi Paksa ---
      toggleSelectItem: async (variantId, isSelected) => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          // Untuk user yang login, kita panggil API terlebih dahulu
          set({ isLoading: true }); // Tampilkan loading global
          try {
            const itemToToggle = get().items.find(item => item.variantId === variantId);
            if (!itemToToggle) throw new Error("Item tidak ditemukan");

            const response = await api.post("/cart/toggle-select", {
              cart_item_ids: [itemToToggle.cartItemId],
              selected: isSelected, // Gunakan status 'selected' yang baru
            });
            // Setelah backend sukses, update seluruh state dengan data yang dijamin benar
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal menyinkronkan pilihan.");
            set({ isLoading: false });
          }
        } else {
          // Untuk guest, cukup update state lokal
          const newItems = get().items.map((item) =>
            item.variantId === variantId ? { ...item, selected: isSelected } : item
          );
          set({ items: newItems });
          recalculateGuestSummary(set, get);
        }
      },

      // --- REVISI UTAMA: Mengganti Optimistic Update dengan Sinkronisasi Paksa ---
      toggleSelectAll: async (select) => {
        const { isAuthenticated } = useAuthStore.getState();

        if (isAuthenticated) {
          set({ isLoading: true });
          try {
            const allCartItemIds = get().items.map((item) => item.cartItemId);
            // Jika tidak ada item, tidak perlu panggil API
            if (allCartItemIds.length === 0) {
                set({isLoading: false});
                return;
            };
            
            const response = await api.post("/cart/toggle-select", {
              cart_item_ids: allCartItemIds,
              selected: select,
            });
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal menyinkronkan pilihan.");
            set({ isLoading: false });
          }
        } else {
          const newItems = get().items.map((item) => ({ ...item, selected: select }));
          set({ items: newItems });
          recalculateGuestSummary(set, get);
        }
      },

      clearCart: async () => {
          // Untuk clear cart, guest dan user sama-sama perlu dihapus
          if (useAuthStore.getState().isAuthenticated) {
              set({ isLoading: true });
              try {
                  const response = await api.post("/cart/clear");
                  updateStateFromServer(set, response.data);
              } catch (error) {
                  showError("Gagal mengosongkan keranjang.");
                  set({ isLoading: false });
              }
          } else {
              set({ items: [], summary: getInitialSummary() });
          }
      },

      applyVoucher: async (code) => {
        set({ isApplyingVoucher: true, voucherError: null });
        try {
          const response = await api.post("/vouchers/apply", { code });
          
          updateStateFromServer(set, response.data);
          showSuccess(`Voucher "${code}" berhasil diterapkan.`);
        } catch (error: any) {
          const message = error.response?.data?.message || "Voucher tidak valid.";
          set({ voucherError: message, isApplyingVoucher: false });
          showError(message);
        }
      },

      removeVoucher: async (code) => {
        set({ isApplyingVoucher: true });
        try {
          const response = await api.post("/vouchers/remove", { code });
          updateStateFromServer(set, response.data);
          showSuccess(`Voucher "${code}" dihapus.`);
        } catch (error) {
          showError("Gagal menghapus voucher.");
          set({ isApplyingVoucher: false });
        }
      },

      reset: () => {
        set({
          items: [],
          summary: getInitialSummary(),
          appliedVouchers: [],
          isInitialized: false,
          isLoading: false,
          isApplyingVoucher: false,
          voucherError: null,
        });
      },
    }),
    {
      name: "guest-cart-storage",
      partialize: (state) => ({ items: state.items }),// Hanya simpan 'items' untuk guest, dan default selected ke true
    }
  )
);