// app/admin/orders/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import api from '@/lib/api'; // Pastikan path ini benar
import { showSuccess, showError } from '@/lib/toast'; // Pastikan path ini benar
import Image from 'next/image';

// --- Komponen UI & Ikon ---
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, MapPin, Truck, CreditCard, Package, Loader2, Shield, ArrowLeft, Banknote, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils'; // Pastikan path ini benar

// =====================================================================
// DEFINISI TIPE DATA (SHARED TYPES)
// =====================================================================

type OrderStatus = 'pending_payment' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'failed';
type PaymentStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

export interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  price: number;
  product_variant?: {
    images?: { path: string }[];
  };
}
export interface ShippingAddress {
  recipient_name: string;
  phone_number: string;
  address_detail: string;
  subdistrict_name: string;
  city_name: string;
  province_name: string;
  postal_code: string;
}
export interface UserSummary {
    name: string;
    email: string;
    phone_number: string | null;
}

export interface OrderDetail {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  payment_type: string | null;
  midtrans_transaction_id: string | null;
  shipping_tracking_number: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  grand_total: number;
  shipping_courier: string;
  shipping_service: string;
  shipping_etd: string;
  shipping_address: ShippingAddress;
  user: UserSummary;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// --- SUB-KOMPONEN INFORMATIF ---

const OrderHeader = ({ order }: { order: OrderDetail }) => {
    const statusConfig: Record<OrderStatus, { text: string; className: string }> = {
        pending_payment: { text: "Pending Payment", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        processing: { text: "Processing", className: "bg-blue-100 text-blue-800 border-blue-300" },
        shipped: { text: "Shipped", className: "bg-indigo-100 text-indigo-800 border-indigo-300" },
        completed: { text: "Completed", className: "bg-green-100 text-green-800 border-green-300" },
        cancelled: { text: "Cancelled", className: "bg-red-100 text-red-800 border-red-300" },
        failed: { text: "Failed", className: "bg-red-100 text-red-800 border-red-300" },
    };
    const currentStatus = statusConfig[order.order_status] || statusConfig.cancelled;

    return (
        <div className="flex items-start justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
                <p className="text-muted-foreground">
                    Placed on {format(new Date(order.created_at), "d MMMM yyyy, HH:mm", { locale: localeID })}
                </p>
            </div>
            <Badge variant="outline" className={cn("text-base px-4 py-2", currentStatus.className)}>
                {currentStatus.text}
            </Badge>
        </div>
    );
};

const OrderItemsCard = ({ items }: { items: OrderItem[] }) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Package /> Order Items ({items.length})</CardTitle></CardHeader>
            <CardContent className="divide-y">
                {items.map(item => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                        <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            <Image 
                                src={item.product_variant?.images?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_URL}/storage/${item.product_variant.images[0].path}` : "/placeholder.png"} 
                                alt={item.product_name} 
                                width={64} height={64} 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">{item.variant_name}</p>
                            <p className="text-sm mt-1">{formatCurrency(item.price)} x {item.quantity}</p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const CustomerInfoCard = ({ user, address }: { user: UserSummary, address: ShippingAddress }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User /> Customer Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">{user.name}</p>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-muted-foreground">{user.phone_number || 'No phone number'}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><MapPin /> Shipping Address</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p className="font-semibold">{address.recipient_name}</p>
                <p>{address.address_detail}</p>
                <p>{address.subdistrict_name}, {address.city_name}</p>
                <p>{address.province_name}, {address.postal_code}</p>
                <p className="pt-2 text-muted-foreground">{address.phone_number}</p>
            </CardContent>
        </Card>
    </div>
);

const AdminActionsCard = ({ order, onUpdate, onTrackingAdd }: { order: OrderDetail, onUpdate: (status: OrderStatus) => Promise<void>, onTrackingAdd: (trackingNumber: string) => Promise<void> }) => {
    const [status, setStatus] = useState(order.order_status);
    const [trackingNumber, setTrackingNumber] = useState(order.shipping_tracking_number || '');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleUpdate = async () => {
        setIsUpdating(true);
        await onUpdate(status);
        setIsUpdating(false);
    };

    const handleAddTracking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingNumber) return;
        setIsAdding(true);
        await onTrackingAdd(trackingNumber);
        setIsAdding(false);
    };

    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield /> Admin Actions</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="order-status">Update Order Status</Label>
                    <div className="flex gap-2 mt-1">
                        <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)}>
                            <SelectTrigger id="order-status"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleUpdate} disabled={isUpdating || status === order.order_status} className="w-24">
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                        </Button>
                    </div>
                </div>
                <Separator />
                <div>
                    <Label htmlFor="tracking-number">Shipping Tracking Number</Label>
                    <form onSubmit={handleAddTracking} className="flex gap-2 mt-1">
                        <Input id="tracking-number" placeholder="Enter tracking number" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                        <Button type="submit" disabled={isAdding || !trackingNumber} className="w-24">
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
};

const PaymentDetailsCard = ({ order }: { order: OrderDetail }) => {
    const formatCurrency = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
    const paymentMethod = useMemo(() => {
        const type = order.payment_type || 'other';
        const config: Record<string, { name: string; icon: React.ElementType }> = {
            credit_card: { name: "Credit Card", icon: CreditCard },
            bank_transfer: { name: "Bank Transfer", icon: Banknote },
            qris: { name: "QRIS", icon: QrCode },
            gopay: { name: "GoPay", icon: CreditCard },
        };
        return config[type] || { name: type.replace(/_/g, ' '), icon: CreditCard };
    }, [order.payment_type]);

    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard /> Payment & Shipping</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Payment Status</span><Badge variant={order.payment_status === 'paid' ? 'success' : 'secondary'} className="capitalize">{order.payment_status}</Badge></div>
                <div className="flex justify-between items-center"><span>Payment Method</span><span className="font-medium capitalize flex items-center gap-2"><paymentMethod.icon className="h-4 w-4" /> {paymentMethod.name}</span></div>
                <div className="flex flex-col  start"><span>Transaction ID</span><span className="text-muted-foreground">{order.midtrans_transaction_id || 'N/A'}</span></div>
                <Separator />
                <div className="flex justify-between"><span>Shipping Method</span><span className="font-medium">{order.shipping_courier.toUpperCase()} - {order.shipping_service}</span></div>
                <Separator />
                <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{formatCurrency(order.shipping_cost)}</span></div>
                {order.discount_amount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(order.discount_amount)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Grand Total</span><span>{formatCurrency(order.grand_total)}</span></div>
            </CardContent>
        </Card>
    );
};

// --- KOMPONEN HALAMAN UTAMA (CLIENT COMPONENT) ---

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshOrderData = useCallback(async () => {
        if (!id) return;
        try {
            const response = await api.get(`/admin/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            showError("Failed to refresh order data.");
        }
    }, [id]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            await refreshOrderData();
            setIsLoading(false);
        };
        fetchInitialData();
    }, [refreshOrderData]);

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        try {
            await api.patch(`/admin/orders/${id}/status`, { status: newStatus });
            showSuccess("Order status updated successfully!");
            await refreshOrderData();
        } catch (error) {
            showError("Failed to update status.");
        }
    };

    const handleAddTracking = async (trackingNumber: string) => {
        try {
            await api.post(`/admin/orders/${id}/tracking`, { shipping_tracking_number: trackingNumber });
            showSuccess("Tracking number added and order marked as shipped!");
            await refreshOrderData();
        } catch (error) {
            showError("Failed to add tracking number.");
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold">Order not found.</h2>
                <Button onClick={() => window.history.back()} className="mt-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        );
    }

    return (
        <div>
            <OrderHeader order={order} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <CustomerInfoCard user={order.user} address={order.shipping_address} />
                    <OrderItemsCard items={order.items} />
                </div>
                <div className="space-y-6 sticky top-28">
                    <AdminActionsCard order={order} onUpdate={handleUpdateStatus} onTrackingAdd={handleAddTracking} />
                    <PaymentDetailsCard order={order} />
                </div>
            </div>
        </div>
    );
}
