"use client";

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseClient } from "@/lib/supabase";

export function useRealtimeOrders(restaurantId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    setIsConnected(true);

    const subscription = supabaseClient
      .channel(`orders:restaurantId=eq.${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (_: any) => {
          queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
          setNewOrderCount((prev) => prev + 1);

          const audio = new Audio("/notification.mp3");
          audio.volume = 0.5;
          audio.play().catch(() => {});
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(subscription);
      setIsConnected(false);
    };
  }, [restaurantId, queryClient]);

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  return { isConnected, newOrderCount, resetNewOrderCount };
}
