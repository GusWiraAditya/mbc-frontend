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
  addToCart: (
    variantData: {
      variantId: number;
      productId: number;
      productName: string;
      variantName: string;
      image: string | null;
      slug: string;
      sku: string;
      price: number;
      stock: number;
      weight: number;
    },
    quantity: number
  ) => Promise<void>;
  updateQuantity: (variantId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (variantIds: number[]) => Promise<void>;
  toggleSelectItem: (variantId: number) => Promise<void>;
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
  subtotal: 0,
  totalDiscount: 0,
  shippingCost: 0,
  grandTotal: 0,
});

// Helper untuk mengupdate state setelah panggilan API berhasil
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

// Helper untuk menghitung ulang summary untuk GUEST
const recalculateGuestSummary = (set: any, get: any) => {
  const { items } = get();
  const selectedItems = items.filter((item: CartItem) => item.selected);
  const subtotal = selectedItems.reduce(
    (acc: number, item: CartItem) => acc + item.price * item.quantity,
    0
  );
  // Untuk guest, kita asumsikan diskon & ongkir 0
  set({
    summary: {
      subtotal,
      totalDiscount: 0,
      shippingCost: 0,
      grandTotal: subtotal,
    },
  });
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

      initializeCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        const localItems = get().items;
        set({ isLoading: true });

        if (isAuthenticated) {
          try {
            // Jika ada item lokal, merge dulu, lalu ambil state final
            if (localItems.length > 0) {
              await api.post("/cart/merge", {
                items: localItems.map((item) => ({
                  variant_id: item.variantId,
                  quantity: item.quantity,
                })),
              });
            }
            // Selalu ambil data terbaru dari server setelah merge atau saat load
            const response = await api.get("/cart");
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal menyinkronkan keranjang.");
            set({ isLoading: false });
          }
        } else {
          // Untuk guest, cukup hitung ulang summary dari local storage
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
            const response = await api.post("/cart/add", {
              variant_id: variantData.variantId,
              quantity,
            });
            updateStateFromServer(set, response.data);
            showSuccess(`${variantData.productName} ditambahkan.`);
          } catch (error) {
            showError("Gagal menambahkan item.");
            set({ isLoading: false });
          }
        } else {
          // Logika untuk Guest
          const { items } = get();
          const existingItemIndex = items.findIndex(
            (item) => item.variantId === variantData.variantId
          );

          if (existingItemIndex > -1) {
            // Item sudah ada, update kuantitas
            const newItems = [...items];
            const newQuantity = newItems[existingItemIndex].quantity + quantity;
            newItems[existingItemIndex].quantity = Math.min(
              newQuantity,
              variantData.stock
            );
            set({ items: newItems });
          } else {
            // Item baru, tambahkan ke array
            const newItem: CartItem = {
              ...variantData,
              cartItemId: 0, // ID 0 untuk guest
              quantity,
              selected: true,
            };
            set({ items: [...items, newItem] });
          }
          recalculateGuestSummary(set, get);
          set({ isLoading: false });
          showSuccess(`${variantData.productName} ditambahkan.`);
        }
      },

      updateQuantity: async (variantId, newQuantity) => {
        const { isAuthenticated } = useAuthStore.getState();

        // Jangan lakukan apa-apa jika kuantitas tidak berubah atau item sudah diupdate
        const currentItem = get().items.find(
          (item) => item.variantId === variantId
        );
        if (
          !currentItem ||
          newQuantity === currentItem.quantity ||
          get().updatingVariantId === variantId
        ) {
          return;
        }

        if (newQuantity <= 0) return get().removeFromCart([variantId]);

        set({ updatingVariantId: variantId });
        if (isAuthenticated) {
          try {
            const response = await api.put(
              `/cart/update/${currentItem.cartItemId}`,
              { quantity: newQuantity }
            );
            updateStateFromServer(set, response.data); // updateStateFromServer akan mereset loading
          } catch (error) {
            showError("Gagal mengupdate kuantitas.");
            set({ updatingVariantId: null }); // 2. Jangan lupa reset jika error
          } finally {
            set({ updatingVariantId: null }); // 3. Selalu reset setelah selesai
          }
        } else {
          // Logika untuk Guest
          const newItems = get().items.map((item) =>
            item.variantId === variantId
              ? { ...item, quantity: Math.min(newQuantity, item.stock) }
              : item
          );
          set({ items: newItems });
          recalculateGuestSummary(set, get);
          set({ updatingVariantId: null }); // 4. Reset setelah selesai
        }
      },

      removeFromCart: async (variantIds) => {
        const { isAuthenticated } = useAuthStore.getState();
        set({ isLoading: true });

        if (isAuthenticated) {
          try {
            const cartItemIds = get()
              .items.filter((item) => variantIds.includes(item.variantId))
              .map((item) => item.cartItemId);

            const response = await api.post("/cart/remove", {
              cart_item_ids: cartItemIds,
            });
            updateStateFromServer(set, response.data);
            showSuccess("Item berhasil dihapus.");
          } catch (error) {
            showError("Gagal menghapus item.");
            set({ isLoading: false });
          }
        } else {
          // Logika untuk Guest
          const newItems = get().items.filter(
            // PERBAIKAN: Bandingkan variantIds dengan item.variantId
            (item) => !variantIds.includes(item.variantId)
          );
          set({ items: newItems });
          recalculateGuestSummary(set, get);
          set({ isLoading: false });
          showSuccess("Item berhasil dihapus.");
        }
      },

      // Aksi toggle select dan clear cart juga perlu dual-mode
      toggleSelectItem: async (variantId) => {
        const { isAuthenticated } = useAuthStore.getState();
        // Untuk aksi ini, kita bisa optimis update UI dulu baru panggil API
        const newItems = get().items.map((item) =>
          item.variantId === variantId
            ? { ...item, selected: !item.selected }
            : item
        );
        set({ items: newItems });

        if (isAuthenticated) {
          try {
            const itemToToggle = newItems.find(
              (item) => item.variantId === variantId
            );
            if (!itemToToggle) return;
            const response = await api.post("/cart/toggle-select", {
              cart_item_ids: [itemToToggle.cartItemId],
              selected: itemToToggle.selected,
            });
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal sinkronisasi pilihan.");
            // Revert state jika gagal? (Opsional)
          }
        } else {
          recalculateGuestSummary(set, get);
        }
      },

      toggleSelectAll: async (select) => {
        const { isAuthenticated } = useAuthStore.getState();
        const newItems = get().items.map((item) => ({
          ...item,
          selected: select,
        }));
        set({ items: newItems });

        if (isAuthenticated) {
          try {
            const allCartItemIds = newItems.map((item) => item.cartItemId);
            const response = await api.post("/cart/toggle-select", {
              cart_item_ids: allCartItemIds,
              selected: select,
            });
            updateStateFromServer(set, response.data);
          } catch (error) {
            showError("Gagal sinkronisasi pilihan.");
          }
        } else {
          recalculateGuestSummary(set, get);
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        try {
          const response = await api.post("/cart/clear");
          updateStateFromServer(set, response.data);
        } catch (error) {
          showError("Gagal mengosongkan keranjang.");
          set({ isLoading: false });
        }
      },

      /**
       * Menerapkan kode voucher.
       */
      applyVoucher: async (code) => {
        set({ isApplyingVoucher: true, voucherError: null });
        try {
          // 1. Panggil API. Backend akan melakukan semua validasi.
          const response = await api.post("/vouchers/apply", { code });

          // 2. Gunakan SELURUH respons dari server untuk mengupdate state.
          // Ini akan memperbarui items, summary, dan appliedVouchers sekaligus.
          updateStateFromServer(set, response.data);

          showSuccess(`Voucher "${code}" berhasil diterapkan.`);
        } catch (error: any) {
          const message =
            error.response?.data?.message || "Voucher tidak valid.";
          set({ voucherError: message, isApplyingVoucher: false });
          showError(message);
        }
      },

      /**
       * Menghapus voucher yang sudah diterapkan.
       * REVISI: Menggunakan pola yang sama dengan applyVoucher.
       */
      removeVoucher: async (code) => {
        set({ isApplyingVoucher: true }); // Gunakan isApplyingVoucher untuk loading state
        try {
          const response = await api.post("/vouchers/remove", { code });

          // Update seluruh state dengan data baru dari server.
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
      partialize: (state) => ({ items: state.items }),
    }
  )
);
