"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { OrderBoard } from "@/components/order/OrderBoard";
import { Badge } from "@/components/ui/badge";
import { useRestaurant } from "@/hooks/useRestaurant";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { usePermissions } from "@/hooks/usePermissions";
import { Bell, Wifi, WifiOff } from "lucide-react";

export default function OrdersPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  const { data: restaurant } = useRestaurant(restaurantId);
  const [orders, setOrders] = useState<any[]>([]);
  const { hasPermission } = usePermissions(restaurant?.permissions);
  const { isConnected, newOrderCount, resetNewOrderCount, socket } =
    useRealtimeOrders(restaurantId);
  const [isLoading, setLoading] = useState(true);

  // Initial fetch
  async function fetchOrders() {
    setLoading(true);
    const res = await fetch(`/api/restaurants/${restaurantId}/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  // Listen to new orders via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order: any) => {
      setOrders((prev) => [order, ...prev]); // Add new order at the top
    };

    socket.on("new-order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
    };
  }, [socket]);

  const canRead = hasPermission("order.read");

  useEffect(() => {
    if (newOrderCount > 0) resetNewOrderCount();
  }, [newOrderCount, resetNewOrderCount]);

  useEffect(() => {
    document.title =
      newOrderCount > 0
        ? `(${newOrderCount}) New Orders - QResto`
        : "Orders - QResto";
  }, [newOrderCount]);

  if (!canRead) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            You don't have permission to view orders
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Orders
              {newOrderCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  <Bell className="mr-1 h-3 w-3" />
                  {newOrderCount} New
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              View and manage customer orders in real-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <Wifi className="mr-1 h-3 w-3" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="mr-1 h-3 w-3" />
                Connecting...
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : (
          <OrderBoard orders={orders} restaurantId={restaurantId} />
        )}
      </div>
    </MainLayout>
  );
}
