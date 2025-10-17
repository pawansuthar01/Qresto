"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabaseClient } from "@/lib/supabase";
import { notificationSound } from "@/lib/notification-sound";
import { toast } from "@/components/ui/use-toast";

export interface RealtimeOrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  menuItem?: { id: string; name: string };
}

export interface RealtimeOrder {
  id: string;
  orderNumber: string;
  status: string;
  tableId: string;
  restaurantId: string;
  totalAmount: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: RealtimeOrderItem[];
}

export function useRealtimeOrders(restaurantId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [orders, setOrders] = useState<RealtimeOrder[]>([]);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [connectionError, setConnectionError] = useState(false);

  const channelRef = useRef<any>(null);

  const resetNewOrderCount = useCallback(() => setNewOrderCount(0), []);

  const playNotification = useCallback((eventType: string) => {
    try {
      if (eventType === "INSERT") notificationSound.playOrderAlert();
      else if (eventType === "UPDATE") notificationSound.playStatusUpdate();
    } catch (error) {
      console.error("Notification sound error:", error);
    }
  }, []);

  const showToast = useCallback((order: RealtimeOrder, eventType: string) => {
    if (eventType === "INSERT") {
      toast({
        title: "🔔 New Order Received!",
        description: `Order #${order.orderNumber} from Table ${order.tableId}`,
        duration: 5000,
      });
      setNewOrderCount((prev) => prev + 1);
    } else if (eventType === "UPDATE") {
      toast({
        title: "Order Updated",
        description: `Order #${order.orderNumber} status: ${order.status}`,
        duration: 5000,
      });
    }
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!restaurantId) return;

    if (channelRef.current) {
      supabaseClient.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    setConnectionError(false);

    const channel = supabaseClient
      .channel(`orders:${restaurantId}`)
      .on("broadcast", { event: "new_order" }, (msg: any) => {
        const order = msg.payload as RealtimeOrder;

        // add order to orders array
        setOrders((prev) => {
          const exists = prev.find((o) => o.id === order.id);
          if (exists) return prev.map((o) => (o.id === order.id ? order : o));
          else return [order, ...prev]; // new orders at top
        });

        // play notification + toast
        playNotification("INSERT");
        showToast(order, "INSERT");
      })
      .subscribe((status) => {
        console.log(`📡 Realtime status: ${status}`);

        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          setConnectionError(false);
        } else if (["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status)) {
          setIsConnected(false);
          setConnectionError(true);
        }
      });

    channelRef.current = channel;
  }, [restaurantId, playNotification, showToast]);

  useEffect(() => {
    setupRealtimeSubscription();

    const enableAudio = () => {
      notificationSound.requestPermission();
      document.removeEventListener("click", enableAudio);
    };
    document.addEventListener("click", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      if (channelRef.current) supabaseClient.removeChannel(channelRef.current);
    };
  }, [setupRealtimeSubscription]);

  const retryConnection = useCallback(() => {
    if (!isConnected) setupRealtimeSubscription();
  }, [isConnected, setupRealtimeSubscription]);

  return {
    isConnected,
    orders, // <<< live orders array
    newOrderCount,
    resetNewOrderCount,
    connectionError,
    retryConnection,
  };
}
