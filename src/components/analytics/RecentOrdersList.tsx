"use client";

import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Clock, Table, User } from "lucide-react";

interface RecentOrdersListProps {
  orders: any[];
}

const STATUS_COLORS: Record<string, any> = {
  PENDING: "default",
  CONFIRMED: "default",
  PREPARING: "default",
  READY: "default",
  SERVED: "secondary",
  CANCELLED: "destructive",
};

export function RecentOrdersList({ orders }: RecentOrdersListProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No recent orders
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                #{order.orderNumber.slice(-6)}
              </span>
              <Badge variant={STATUS_COLORS[order.status]}>
                {order.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {order.table && (
                <span className="flex items-center gap-1">
                  <Table className="h-3 w-3" />
                  Table {order.table.number}
                </span>
              )}
              {order.customerName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customerName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="text-sm">
              {order.items.slice(0, 2).map((item: any, index: number) => (
                <span key={item.id}>
                  {index > 0 && ", "}
                  {item.quantity}x {item.menuItem.name}
                </span>
              ))}
              {order.items.length > 2 && (
                <span className="text-muted-foreground">
                  {" "}
                  +{order.items.length - 2} more
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold">
              {formatCurrency(order.total)}
            </div>
            <div className="text-xs text-muted-foreground">
              {order.items.length} {order.items.length === 1 ? "item" : "items"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
