"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  MessageSquare,
  Star,
  PackageCheck,
  PackageX,
  Phone,
  Mail,
  Calendar,
  Receipt,
  FileText,
  Shield,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { showSuccess, showError, showInfo } from "@/lib/toast";
import Script from "next/script";

// ... (Interface dan komponen sub-elemen seperti OrderTimeline, OrderItems, dll. tidak berubah, bisa disalin dari kode Anda sebelumnya) ...
interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  weight: number;
  product_image?: string;
}
type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'failed';
interface OrderDetail {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  shipping_courier: string;
  shipping_service: string;
  shipping_etd: string;
  shipping_address: any;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
type StatusConfigItem = {
  text: string;
  icon: React.ElementType;
  className: string;
  color: string;
};

// Status Configuration
const statusConfig: Record<OrderStatus, StatusConfigItem>  = {
  pending_payment: {
    text: "Pending Payment",
    icon: CreditCard,
    className: "bg-yellow-100 text-yellow-800 border-yellow-300",
    color: "yellow",
  },
  processing: {
    text: "Processing",
    icon: Package,
    className: "bg-blue-100 text-blue-800 border-blue-300",
    color: "blue",
  },
  shipped: {
    text: "Shipped",
    icon: Truck,
    className: "bg-indigo-100 text-indigo-800 border-indigo-300",
    color: "indigo",
  },
  completed: {
    text: "Completed",
    icon: PackageCheck,
    className: "bg-green-100 text-green-800 border-green-300",
    color: "green",
  },
  cancelled: {
    text: "Cancelled",
    icon: PackageX,
    className: "bg-red-100 text-red-800 border-red-300",
    color: "red",
  },
  failed: {
    text: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-300",
    color: "red",
  },
};

// Order Status Timeline
// Di dalam file halaman detail pesanan Anda

// Sub-komponen baru untuk Order Timeline
const OrderTimeline = ({ status }: { status: OrderStatus }) => {
  const steps = [
    { id: 'pending_payment', label: 'Order Placed', icon: Receipt },
    { id: 'processing', label: 'Processing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Truck },
    { id: 'completed', label: 'Delivered', icon: CheckCircle2 },
  ];

  // Logika untuk menentukan status setiap langkah (Selesai, Sedang Berjalan, Menunggu)
  const getStepStatus = (stepId: string, stepIndex: number) => {
    const currentIndex = steps.findIndex(step => step.id === status);
    
    // Logika khusus jika pesanan dibatalkan atau gagal
    if (status === 'cancelled' || status === 'failed') {
      // Langkah pertama (Order Placed) tetap dianggap selesai
      if (stepIndex === 0) return 'completed';
      // Semua langkah setelahnya dianggap dibatalkan
      return 'cancelled';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Order Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Kontainer utama menggunakan Flexbox */}
        <div className="flex items-start justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Setiap Langkah */}
              <div className="flex flex-col items-center text-center w-24">
                {(() => {
                  const stepStatus = getStepStatus(step.id, index);
                  return (
                    <>
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                        stepStatus === 'completed' && "bg-green-100 border-green-300 text-green-700",
                        stepStatus === 'current' && "bg-blue-100 border-blue-300 text-blue-700 scale-110 shadow-lg",
                        stepStatus === 'pending' && "bg-gray-100 border-gray-300 text-gray-400",
                        stepStatus === 'cancelled' && "bg-red-100 border-red-300 text-red-700"
                      )}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <p className={cn(
                        "mt-2 text-xs font-semibold transition-colors duration-300",
                        stepStatus === 'completed' && "text-green-700",
                        stepStatus === 'current' && "text-blue-700",
                        stepStatus === 'pending' && "text-gray-500",
                        stepStatus === 'cancelled' && "text-red-700"
                      )}>
                        {step.label}
                      </p>
                    </>
                  );
                })()}
              </div>

              {/* Garis Penghubung (tidak muncul setelah langkah terakhir) */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-1 mt-6 rounded-full transition-colors duration-500",
                  getStepStatus(steps[index + 1].id, index + 1) !== 'pending' ? "bg-green-300" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Order Items Component
const OrderItems = ({ items }: { items: OrderItem[] }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Order Items ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id}>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{item.product_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.variant_name}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm">Qty: {item.quantity}</span>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
              {index < items.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Order Summary Component
const OrderSummary = ({ order }: { order: OrderDetail }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Cost</span>
            <span>{formatCurrency(order.shipping_cost)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatCurrency(order.discount_amount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(order.grand_total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Shipping Info Component
const ShippingInfo = ({ order }: { order: OrderDetail }) => {
  const address = order.shipping_address;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Shipping Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{address.recipient_name}</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              <Phone className="h-4 w-4" />
              {address.phone_number}
            </p>
          </div>
          <div>
            <p className="text-sm">{address.address_detail}</p>
            <p className="text-sm text-muted-foreground">
              {address.city_name}, {address.postal_code}
            </p>
          </div>
          <Separator />
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {order.shipping_courier} - {order.shipping_service}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Estimated delivery: {order.shipping_etd}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
// =====================================================================
// KOMPONEN UTAMA (DENGAN LOGIKA PEMBAYARAN ULANG)
// =====================================================================
export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
     // --- REVISI #2: Gunakan React.use() untuk mengakses params ---
  const { id } = React.use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // --- STATE BARU: Untuk loading tombol "Pay Now" ---
  const [isPaying, setIsPaying] = useState(false);
  const router = useRouter();

   const fetchOrderDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get(`/orders/${id}`); // <-- Gunakan `id`
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]); // <-- Ganti dependensi menjadi `id`

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // --- FUNGSI BARU: Untuk menangani pembayaran ulang ---
  const handleRetryPayment = async () => {
    if (!order) return;
    setIsPaying(true);
    try {
      // 1. Minta token baru dari backend
      const response = await api.post(`/orders/${order.id}/retry-payment`);
      const { snap_token } = response.data;

      if (!snap_token) {
        throw new Error("Failed to get new payment token.");
      }

      // 2. Buka popup Midtrans dengan token baru
      window.snap.pay(snap_token, {
        onSuccess: (result: any) => {
          showSuccess("Payment successful!");
          fetchOrderDetail(); // Refresh detail pesanan untuk melihat status baru
        },
        onPending: (result: any) => {
          showInfo("Your payment is pending.");
          fetchOrderDetail();
        },
        onError: (result: any) => {
          showError("Payment failed. Please try again.");
        },
        onClose: () => {
          showInfo(
            "You closed the payment window. Your order is still waiting for payment."
          );
        },
      });
    } catch (error: any) {
      showError(error.response?.data?.message || "Failed to initiate payment.");
    } finally {
      setIsPaying(false);
    }
  };

  const copyOrderNumber = () => {
    if (order) {
      navigator.clipboard.writeText(order.order_number);
      // You can add toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-10 pt-32">
          <div className="space-y-6">
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-10 pt-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Order Not Found
            </h1>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const config = statusConfig[order.order_status] || statusConfig.failed;

  return (
    <>
      {/* Penting untuk memuat script Midtrans */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
      />
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-10 pt-32">
          {/* Header */}
          <div className="mb-8">
            <Button 
  variant="ghost" 
  // Arahkan ke halaman profil dengan query parameter
  onClick={() => router.push('/profile?view=orders')}
  className="mb-4"
>
  <ArrowLeft className="mr-2 h-4 w-4" />
  Back to Orders
</Button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Order Details
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-muted-foreground">
                    Order #{order.order_number}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyOrderNumber}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn("font-semibold", config.className)}
                >
                  <config.icon className="mr-2 h-4 w-4" />
                  {config.text}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* --- TOMBOL BAYAR KONDISIONAL --- */}
          {order.payment_status === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="bg-yellow-50 border-yellow-200">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-yellow-900">
                      <Clock className="h-5 w-5" />
                      Awaiting Payment
                    </CardTitle>
                    <CardDescription className="text-yellow-700 mt-1">
                      Please complete your payment to process this order.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={handleRetryPayment}
                    disabled={isPaying}
                    className="w-full sm:w-auto"
                  >
                    {isPaying ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Pay Now
                  </Button>
                </CardHeader>
              </Card>
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <OrderItems items={order.items} />
              <OrderTimeline status={order.order_status} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <OrderSummary order={order} />
              <ShippingInfo order={order} />

              {/* Action Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {order.payment_status === 'paid' && (
    <Button variant="outline" className="w-full">
      <Download className="mr-2 h-4 w-4" />
      Download Invoice
    </Button>
  )}
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                  {order.order_status === "completed" && (
                    <Button variant="outline" className="w-full">
                      <Star className="mr-2 h-4 w-4" />
                      Rate Products
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
