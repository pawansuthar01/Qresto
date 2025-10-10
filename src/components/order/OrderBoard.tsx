"use client";

import { useState, useEffect } from "react";
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
import { Clock, User, Table, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";

interface OrderBoardProps {
  orders: any[];
  restaurantId: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-blue-500",
  PREPARING: "bg-orange-500",
  READY: "bg-green-500",
  SERVED: "bg-gray-500",
  CANCELLED: "bg-red-500",
};

export function OrderBoard({ orders, restaurantId }: OrderBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [filter, setFilter] = useState<string>("ALL");
  const canSoundEnabled = localStorage.getItem("sound");
  const [previousOrderCount, setPreviousOrderCount] = useState(orders.length);

  useEffect(() => {
    const enableSound = () => localStorage.setItem("sound", "true");
    window.addEventListener("click", enableSound, { once: true });
    return () => window.removeEventListener("click", enableSound);
  }, []);
  const canUpdate = hasPermission("order.update");

  // Play sound when new order arrives
  useEffect(() => {
    if (orders.length > previousOrderCount && canSoundEnabled) {
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch((e) => console.log("Sound play failed:", e));
    }
    setPreviousOrderCount(orders.length);
  }, [orders.length, previousOrderCount, canSoundEnabled]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast({
        title: "Success",
        description: "Order status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Orders</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="PREPARING">Preparing</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="SERVED">Served</SelectItem>
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "order" : "orders"}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            localStorage.setItem("sound", canSoundEnabled ? "false" : "true")
          }
          className="ml-auto"
        >
          {canSoundEnabled ? (
            <>
              <Volume2 className="mr-2 h-4 w-4" />
              Sound On
            </>
          ) : (
            <>
              <VolumeX className="mr-2 h-4 w-4" />
              Sound Off
            </>
          )}
        </Button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>

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

                {order.notes && (
                  <div className="rounded-md bg-muted p-2 text-sm">
                    <strong>Notes:</strong> {order.notes}
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {canUpdate &&
                  order.status !== "SERVED" &&
                  order.status !== "CANCELLED" && (
                    <Select
                      value={order.status}
                      onValueChange={(status) =>
                        updateOrderStatus.mutate({ orderId: order.id, status })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PREPARING">Preparing</SelectItem>
                        <SelectItem value="READY">Ready</SelectItem>
                        <SelectItem value="SERVED">Served</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                {/* Invoice Buttons */}
                {(order.status === "SERVED" || order.status === "READY") && (
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
      )}
    </div>
  );
}
