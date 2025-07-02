// app/checkout/page.tsx
"use client";

import Image from "next/image";
import { productsData } from "@/lib/data"; // Adjust the import path as necessary
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import { BsTicketPerforated } from "react-icons/bs"; // Adjust the import path as necessary

const CheckoutPage = () => {
  const orderedProductIds = [1, 4, 5];
  const orderedProducts = productsData.filter((p) =>
    orderedProductIds.includes(p.id)
  );
  const { user, isAuthenticated, fetchUser, logout } = useAuthStore();

  const subtotal = orderedProducts.reduce((sum, p) => sum + p.price, 0);
  const shipping = 25000;
  const [voucherUsed, setVoucherUsed] = useState(true);
  const discount = voucherUsed ? 15000 : 0;
  const total = subtotal + shipping - discount;
  const availableVouchers = [
    { id: "voucher1", label: "Diskon 15rb New User", amount: 15000 },
    { id: "voucher2", label: "Diskon 10%", amount: 10000 },
    { id: "voucher3", label: "Diskon Rp. 5000", amount: 5000 },
  ];

  return (
    <main className="bg-gray-100 min-h-screen">
      <section className="max-w-5xl mx-auto p-4 md:pt-32 space-y-10">
        {/* Address Section */}
        <section className="bg-white text-primary p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <h3 className="text-md mt-1 text-black font-bold items-center">{user?.name}
            <br />(08571824718)</h3>
            <div className="flex justify-center items-center text-black">
              <p className="text-sm leading-relaxed max-w-xl">
                Jalan Muding Indah III No.28, Kerobokan Kaja, Kuta Utara (Paling
                ujung dalem),
                <br />
                KAB. BADUNG - KUTA UTARA, BALI, ID 80365
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-red-600 border border-red-600 text-xs px-2 py-0.5 rounded-sm">
                Utama
              </span>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Ubah
              </button>
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section className="bg-white text-primary p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4 pb-2">Order Summary</h3>
          <div className="space-y-4">
            {orderedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between pb-2"
              >
                <Link href={`/detailProducts/${product.id}`}>
                  <div className="flex items-center gap-4">
                  <Image
                    src={product.img}
                    alt={product.name}
                    className="rounded-md object-cover w-14 h-14"
                  />
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-700">{product.category}</p>
                  </div>
                </div>
                </Link>
                
                <p className="text-right font-semibold">
                  Rp. {product.price.toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {/* Kiri: Payment Method & Voucher */}
          <div className="flex-1 space-y-4">
            {/* Payment Method */}
            <section className="bg-white text-primary p-4 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
              <div className="flex items-center gap-6">
                <Image src="/bca.png" alt="BCA" width={60} height={30} />
                <Image src="/bni.png" alt="BNI" width={60} height={30} />
                <Image src="/bri.png" alt="BRI" width={60} height={30} />
                <Image src="/qris.png" alt="QRIS" width={60} height={30} />
              </div>
            </section>

            {/* Voucher */}
            <section className="bg-white text-primary p-4 rounded-xl shadow">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <BsTicketPerforated className="text-[#5c3f27] text-xl" />
                  <span className="text-lg text-start font-semibold">
                    Voucher
                  </span>
                </div>
                <Link
                  href="/voucher"
                  className="text-[#5c3f27] hover:underline"
                >
                  <span className="text-sm text-start font-normal">
                    Choose Voucher
                  </span>
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="voucher"
                  checked={voucherUsed}
                  onCheckedChange={(val) => setVoucherUsed(!!val)}
                />
                <label
                  htmlFor="voucher"
                  className="text-sm font-medium leading-none"
                >
                  Voucher discount for new user
                </label>
                <span className="ml-auto text-sm">Rp. 15.000</span>
              </div>
            </section>
          </div>

          {/* Kanan: Order Summary */}
          <div className="w-full md:max-w-sm space-y-4">
            <section className="flex flex-col gap-3 p-4 border rounded-xl shadow">
              <div className="space-y-1 text-sm">
                <p>Total Order: Rp. {subtotal.toLocaleString("id-ID")}</p>
                <p>Shipping Costs: Rp. {shipping.toLocaleString("id-ID")}</p>
                <p>
                  Voucher Discount: - Rp. {discount.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="justify-between flex items-center">
                  <p className="font-bold text-lg">Total Payment</p>
                  <p className="text-xl font-bold text-[#5c3f27]">
                    Rp. {total.toLocaleString("id-ID")}
                  </p>
                </div>

                <Button className="mt-2 w-full">Make an Order</Button>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CheckoutPage;
