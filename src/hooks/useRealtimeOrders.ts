import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeOrders(restaurantId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const queryClient = useQueryClient();

  // Play notification sound

  useEffect(() => {
    if (!restaurantId) return;

    const eventSource = new EventSource(
      `/api/restaurants/${restaurantId}/orders/realtime`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("Real-time connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "orders" && data.data.length > 0) {
          // Invalidate orders query to refetch
          queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

          // Increment new order count
          setNewOrderCount((prev) => prev + data.data.length);
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.log("Real-time connection error");
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [restaurantId, queryClient]);

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  return { isConnected, newOrderCount, resetNewOrderCount };
}
