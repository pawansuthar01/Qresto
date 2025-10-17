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
import { Clock, User, Table, Volume2, VolumeX, Phone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/hooks/usePermissions";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { Spinner } from "../ui/spinner";

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

export function OrderBoard({ orders = [], restaurantId }: OrderBoardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const [filter, setFilter] = useState<string>("ALL");
  const [allOrders, setAllOrders] = useState(orders);
  const [orderStatusChange, setOrderStatusChange] = useState<string[]>([]);

  const { newOrderCount, resetNewOrderCount } = useRealtimeOrders(restaurantId);

  const canUpdate = hasPermission("order.update");
  const [canPlaySound, setCanPlaySound] = useState(false);

  useEffect(() => {
    const onUserInteract = () => setCanPlaySound(true);
    window.addEventListener("click", onUserInteract, { once: true });
    return () => window.removeEventListener("click", onUserInteract);
  }, []);

  useEffect(() => {
    setAllOrders(orders);
  }, [orders]);

  // Play notification sound and refresh orders when new ones arrive
  useEffect(() => {
    if (newOrderCount > 0 && "Notification" in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification("New Order!", {
            body: `You have ${newOrderCount} new orders.`,
            icon: "/favicon.ico",
          });
        }
      });
    }
  }, [newOrderCount]);
  function playSound() {
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.5;
    audio.play().catch((e) => console.log("Sound play failed:", e));
  }
  useEffect(() => {
    if (newOrderCount > 0) {
      if (canPlaySound) {
        playSound();
      }

      resetNewOrderCount();
      // Refetch latest orders
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    }
  }, [newOrderCount, queryClient, restaurantId, resetNewOrderCount]);

  const updateOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      setOrderStatusChange((prev) => [...prev, orderId]);
      console.log("AFTER SET (stale log):", orderStatusChange);
      try {
        const res = await fetch(
          `/api/restaurants/${restaurantId}/orders/${orderId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
        setOrderStatusChange((prev) =>
          prev.filter((o) => !o.includes(orderId))
        );
        console.log(orderStatusChange);
        if (!res.ok) throw new Error("Failed to update order");
        return res.json();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update order status",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast({ title: "Success", description: "Order status updated" });
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
    filter === "ALL" ? allOrders : allOrders.filter((o) => o.status === filter);
  return (
    <div className="space-y-4">
      {/* Filter & Sound Control */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Orders</SelectItem>
            {Object.keys(STATUS_COLORS).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-muted-foreground">
          {filteredOrders.length}{" "}
          {filteredOrders.length === 1 ? "order" : "orders"}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setCanPlaySound(!canPlaySound)}
          className="ml-auto"
        >
          {canPlaySound ? (
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
        {canPlaySound && (
          <Button type="button" onClick={() => playSound()}>
            Play try
          </Button>
        )}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">
                    #{order.orderNumber?.slice(-6)}
                  </span>
                  <Badge className={STATUS_COLORS[order.status]}>
                    {order?.status}
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
                    {new Date(order.createdAt).toLocaleTimeString()}
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
                  <p className="rounded-md bg-muted p-2 text-sm  break-words break-all">
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

                {canUpdate && orderStatusChange.includes(order.id) ? (
                  <div className="flex gap-2 justify-center items-center ">
                    order status : updating... <Spinner size={1} />
                  </div>
                ) : (
                  !["SERVED", "CANCELLED"].includes(order.status) && (
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
                        {Object.keys(STATUS_COLORS).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )
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
      )}
    </div>
  );
}
