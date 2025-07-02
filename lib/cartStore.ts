import { create } from 'zustand'

type Product = {
  id: number
  name: string
  price: number
  img: string
  rating?: number
  availability?: string
}

type CartItem = Product & { quantity: number; selected?: boolean }

type CartState = {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, amount: number) => void
  toggleSelect: (id: number) => void
  toggleSelectAll: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],

  addToCart: (product) => {
    const existing = get().cart.find((item) => item.id === product.id)
    if (existing) {
      set({
        cart: get().cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      })
    } else {
      set({
        cart: [...get().cart, { ...product, quantity: 1, selected: true }],
      })
    }
  },

  removeFromCart: (id) =>
    set({
      cart: get().cart.filter((item) => item.id !== id),
    }),

  updateQuantity: (id, amount) =>
    set({
      cart: get().cart.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item
      ),
    }),

  toggleSelect: (id) =>
    set({
      cart: get().cart.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ),
    }),

  toggleSelectAll: () => {
    const allSelected = get().cart.every((item) => item.selected)
    set({
      cart: get().cart.map((item) => ({ ...item, selected: !allSelected })),
    })
  },
}))
