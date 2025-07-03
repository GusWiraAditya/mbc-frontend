"use client";
import { useAuthStore } from "@/lib/store";
import SidebarWrapper from "@/components/sidebarwrapper";
import OrderCard from "./components/order-card";
import { Order } from "./components/order-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { IconRefresh } from "@tabler/icons-react";

const dummyOrders: Order[] = [
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Menunggu Pembayaran",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Pesanan Dibatalkan",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Menunggu Pembayaran",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Pesanan Dibatalkan",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Menunggu Pembayaran",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Pesanan Dibatalkan",
    amount: 203.0,
  },
  {
    id: "MAL238493863876398278470",
    date: "03 Jul 2025",
    status: "Selesai",
    amount: 203.0,
  },
];

export default function OrdersPage() {
  const user = useAuthStore((state) => state.user) ?? { name: "", email: "" };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col items-center py-8 border-b pt-32">
        <button
          onClick={() => window.location.reload()}
          className="w-12 h-12 rounded-full border flex items-center justify-center hover:bg-gray-100 transition"
          title="Refresh page"
        >
          <IconRefresh size={20} className="text-gray-600" />
        </button>
        <h1 className="text-lg text-primary font-semibold mt-4">{user.name} Account</h1>
        <p className="text-sm text-gray-500">
          You can manage your account and track your order here
        </p>
      </div>

      {/* Sidebar + Content */}
      <div className="flex px-36 pt-2">
        <SidebarWrapper />
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-primary">My Order</h2>
          <ScrollArea className="h-screen pr-4 rounded-md">
            <div className="space-y-4">
              {dummyOrders.map((order, index) => (
                <OrderCard key={index} order={order} />
              ))}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
}
