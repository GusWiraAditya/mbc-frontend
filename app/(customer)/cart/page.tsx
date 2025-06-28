'use client'

import { useCartStore } from '@/lib/cartStore'
import Image from 'next/image'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    toggleSelect,
    toggleSelectAll,
  } = useCartStore()

  const selectedItems = cart.filter((item) => item.selected)
  const totalPrice = selectedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  )

  return (
    <div className="p-32 space-y-12 bg-gray-100 min-h-screen">
      <div className="max-w-8xl mx-auto bg-white shadow-md rounded overflow-hidden">
        <div className="bg-primary grid grid-cols-6 text-white font-semibold px-4 py-6">
          <div></div>
          <div>Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total Price</div>
          <div>Action</div>
        </div>
        {cart.length === 0 ? (
          <div className="col-span-6 text-center text-gray-500 py-10">
            Keranjang kosong. Silakan tambahkan produk terlebih dahulu.
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-6 items-center border-b-2 border-gray-300 px-4 py-3"
            >
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleSelect(item.id)}
              />
              <div className="flex items-center gap-2">
                <Image
                  src={item.img}
                  alt={item.name}
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover"
                />
                <span className="truncate max-w-[100px]">{item.name}</span>
              </div>
              <div>Rp. {item.price.toLocaleString()}</div>
              <div className="flex items-center gap-2 border rounded bg-gray-50 p-2 w-14 h-6.5 justify-center text-black">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="px-2 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-2 border rounded bg-gray-100 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
              <div>Rp. {(item.price * item.quantity).toLocaleString()}</div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 bg-red-100 hover:bg-red-200 rounded p-2 w-14 h-6 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
        <div className="flex justify-between items-center px-4 py-4 bg-primary text-white">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={cart.every((item) => item.selected)}
              onChange={toggleSelectAll}
            />
            <span>Select All ({cart.length})</span>
          </label>
          <div className="flex items-center gap-4">
            <span>
              Total ({selectedItems.length} Product):{' '}
              <strong>Rp{totalPrice.toLocaleString()}</strong>
            </span>
            <button
              className="bg-secondary border text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={selectedItems.length === 0}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
