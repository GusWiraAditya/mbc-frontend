
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Package, PackageCheck, PackageX, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderSummary, PaginationInfo } from "@/lib/types/profile";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button";

const StatusBadge = ({ status }: { status: OrderSummary['order_status'] }) => {
  const statusConfig = {
    pending_payment: { text: "Menunggu Pembayaran", icon: Package, className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    processing: { text: "Sedang Diproses", icon: Package, className: "bg-blue-100 text-blue-800 border-blue-300" },
    shipped: { text: "Dikirim", icon: Truck, className: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    completed: { text: "Selesai", icon: PackageCheck, className: "bg-green-100 text-green-800 border-green-300" },
    cancelled: { text: "Dibatalkan", icon: PackageX, className: "bg-red-100 text-red-800 border-red-300" },
    failed: { text: "Gagal", icon: PackageX, className: "bg-red-100 text-red-800 border-red-300" },
  };

  const config = statusConfig[status] || statusConfig.cancelled;

  return (
    <Badge variant="outline" className={cn("font-semibold", config.className)}>
      <config.icon className="mr-2 h-4 w-4" />
      {config.text}
    </Badge>
  );
};

// Komponen utama untuk bagian Riwayat Pesanan
export const OrderHistorySection = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil data pesanan
  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      // Panggil endpoint backend yang sudah kita buat
      const response = await api.get(`/orders?page=${page}`);
      setOrders(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Gagal mengambil riwayat pesanan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Panggil fetchOrders saat komponen pertama kali dimuat
  useEffect(() => {
    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pesanan</CardTitle>
        <CardDescription>Semua transaksi dan riwayat pembelian Anda.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Tampilan saat loading
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        ) : orders.length === 0 ? (
          // Tampilan jika tidak ada pesanan
          <div className="text-center py-10 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Anda belum memiliki riwayat pesanan.</p>
          </div>
        ) : (
          // Tampilan jika ada pesanan
          <div className="space-y-4">
            {orders.map((order) => (
              <Link href={`/profile/orders/${order.id}`} key={order.id}>
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-primary">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "d MMMM yyyy", { locale: localeID })}
                      </p>
                    </div>
                    <StatusBadge status={order.order_status} />
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between items-center text-sm">
                    <p className="text-muted-foreground">Total Pembayaran</p>
                    <p className="font-bold">{formatCurrency(order.grand_total)}</p>
                  </div>
                </div>
              </Link>
            ))}
            
            {/* Navigasi Pagination Sederhana */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-between items-center pt-4">
                <Button onClick={() => fetchOrders(pagination.current_page - 1)} disabled={pagination.current_page === 1}>Sebelumnya</Button>
                <span className="text-sm text-muted-foreground">Halaman {pagination.current_page} dari {pagination.last_page}</span>
                <Button onClick={() => fetchOrders(pagination.current_page + 1)} disabled={pagination.current_page === pagination.last_page}>Berikutnya</Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};