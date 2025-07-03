import { FC } from "react";
import { Button } from "@/components/ui/button";
import { IoBagCheckOutline } from "react-icons/io5";

interface Props {
  order: Order;
}

export type OrderStatus =
  | "Selesai"
  | "Menunggu Pembayaran"
  | "Pesanan Dibatalkan";

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  amount: number;
}

const statusStyle = {
  Selesai: "bg-yellow-100 text-yellow-800",
  "Menunggu Pembayaran": "bg-gray-100 text-gray-700",
  "Pesanan Dibatalkan": "bg-red-100 text-red-600",
};

const OrderCard: FC<Props> = ({ order }) => {
  return (
    <div className="border rounded-xl p-4 mb-4 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500 flex items-center space-x-2">
          <span className="flex items-center gap-x-2">
            <IoBagCheckOutline size={18} /> {order.date}
          </span>

          <span
            className={`text-xs px-2 py-0.5 rounded ${
              statusStyle[order.status]
            }`}
          >
            {order.status}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          Total Amount: {order.amount.toFixed(3)} IDR
        </div>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-mono">{order.id}</span>
        <div className="space-x-2">
          <button className="text-sm text-gray-600 underline">
            View Details
          </button>
          {order.status === "Selesai" && (
            <Button className="bg-primary text-white px-3 py-1 rounded text-sm">
              Track Order
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
