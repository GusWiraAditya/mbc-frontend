import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
// Using native JavaScript Date formatting instead of date-fns
import { Package, PackageCheck, PackageX, Truck, CreditCard, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderSummary, PaginationInfo } from "@/lib/types/profile";
import { Separator } from "@radix-ui/react-separator";
import { Button } from "../ui/button";

const StatusBadge = ({ status }: { status: OrderSummary['order_status'] }) => {
  const statusConfig = {
    pending_payment: { text: "Pending Payment", icon: CreditCard, className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
    processing: { text: "Processing", icon: Package, className: "bg-blue-100 text-blue-800 border-blue-300" },
    shipped: { text: "Shipped", icon: Truck, className: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    completed: { text: "Completed", icon: PackageCheck, className: "bg-green-100 text-green-800 border-green-300" },
    cancelled: { text: "Cancelled", icon: PackageX, className: "bg-red-100 text-red-800 border-red-300" },
    failed: { text: "Failed", icon: PackageX, className: "bg-red-100 text-red-800 border-red-300" },
  };

  const config = statusConfig[status] || statusConfig.cancelled;

  return (
    <Badge variant="outline" className={cn("font-semibold", config.className)}>
      <config.icon className="mr-2 h-4 w-4" />
      {config.text}
    </Badge>
  );
};

const OrderCard = ({ order }: { order: OrderSummary }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat("id-ID", { 
      style: "currency", 
      currency: "IDR", 
      minimumFractionDigits: 0 
    }).format(amount);

  return (
    <Link href={`/profile/orders/${order.id}`}>
      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer mb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-primary">{order.order_number}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
          <StatusBadge status={order.order_status} />
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-center text-sm">
          <p className="text-muted-foreground">Total Payment</p>
          <p className="font-bold">{formatCurrency(order.grand_total)}</p>
        </div>
      </div>
    </Link>
  );
};

const OrderList = ({ 
  orders, 
  isLoading, 
  pagination, 
  onPageChange 
}: { 
  orders: OrderSummary[], 
  isLoading: boolean, 
  pagination: PaginationInfo | null,
  onPageChange: (page: number) => void 
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No orders found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        {orders.map((order) => (
        <OrderCard key={order.id} order={order}/>
      ))}
      
      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-between items-center pt-4">
          <Button 
            onClick={() => onPageChange(pagination.current_page - 1)} 
            disabled={pagination.current_page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button 
            onClick={() => onPageChange(pagination.current_page + 1)} 
            disabled={pagination.current_page === pagination.last_page}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export const OrderHistorySection = () => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch orders with optional status filter
  const fetchOrders = async (page = 1, status?: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (status && status !== "all") {
        params.append("status", status);
      }
      
      const response = await api.get(`/orders?${params.toString()}`);
      setOrders(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
      });
    } catch (error) {
      console.error("Failed to fetch order history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    fetchOrders(1, value);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchOrders(page, activeTab);
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeTab === "all") return orders;
    return orders.filter(order => order.order_status === activeTab);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { value: "all", label: "All", icon: Package },
    { value: "pending_payment", label: "To Pay", icon: CreditCard },
    { value: "processing", label: "Processing", icon: Clock },
    { value: "shipped", label: "Shipped", icon: Truck },
    { value: "completed", label: "Completed", icon: PackageCheck },
    { value: "cancelled", label: "Cancelled", icon: PackageX },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>All your transactions and purchase history.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-2 space-y-12">

              <OrderList 
                orders={getFilteredOrders()}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};