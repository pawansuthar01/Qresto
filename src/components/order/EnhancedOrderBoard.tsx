"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceButton } from "./InvoiceButton";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  User,
  Table,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useEffect, useState } from "react";

interface EnhancedOrderBoardProps {
  orders: any[];
  restaurantId: string;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-blue-500",
  PREPARING: "bg-orange-500",
  READY: "bg-green-500",
  SERVED: "bg-gray-500",
  CANCELLED: "bg-red-500",
};

export function EnhancedOrderBoard({
  orders,
  restaurantId,
  pagination,
  onPageChange,
}: EnhancedOrderBoardProps) {
  const { toast } = useToast();
  const { data: restaurant } = useRestaurant(restaurantId);
  const [orderData, setOrderData] = useState(orders || []);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [isOrderStatusUpdating, setIsOrderStatusUpdating] = useState<any[]>([]);
  const canUpdate = hasPermission("order.update");

  useEffect(() => {
    setOrderData(orders);
  }, [orders]);

  const handelStatusUpdate = async (id: string, status: string) => {
    if (!canUpdate) {
      toast({
        title: "Permission Error",
        description: "Permission denied",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsOrderStatusUpdating((prev) => [...prev, id]);

      const res = await fetch(`/api/restaurants/${restaurantId}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
        return;
      }

      // ✅ Get updated order from API response
      const updatedOrder = await res.json();

      // ✅ Replace that order in the current list
      setOrderData((prevOrders) =>
        prevOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );

      toast({ title: "Success", description: "Order status updated" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsOrderStatusUpdating((prev) => prev.filter((i) => i !== id));
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      // Show all pages if 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Orders Grid */}
      {orderData.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {orderData.map((order) => (
              <Card
                key={order.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">
                      #{order.orderNumber.slice(-6)}
                    </span>
                    <Badge className={STATUS_COLORS[order.status]}>
                      {order.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Table & Customer Info */}
                  <div className="space-y-2">
                    {order.table && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Table className="h-4 w-4" />
                        Table {order.table.number}
                      </div>
                    )}
                    {order.customerName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {order.customerName}
                      </div>
                    )}
                    {order.customerPhone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {order.customerPhone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-1 text-sm">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.menuItem.name}
                        </span>
                        <span className="font-medium">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <p className="rounded-md bg-muted p-2 text-sm break-words">
                      <strong>Notes:</strong> {order.notes}
                    </p>
                  )}

                  {/* Total */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Status Update */}
                  {canUpdate &&
                    !["SERVED", "CANCELLED"].includes(order.status) && (
                      <Select
                        value={order.status}
                        disabled={isOrderStatusUpdating.includes(order.id)}
                        onValueChange={(status) =>
                          handelStatusUpdate(order.id, status)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(STATUS_COLORS).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.charAt(0) + status.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                  {/* Invoice */}
                  {["READY", "SERVED"].includes(order.status) && (
                    <InvoiceButton
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      restaurantId={restaurantId}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} orders
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {getPageNumbers().map((pageNum, idx) =>
                      pageNum === "..." ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-3 py-1 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={pageNum}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => onPageChange(pageNum as number)}
                        >
                          {pageNum}
                        </Button>
                      )
                    )}
                  </div>

                  {/* Next Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
