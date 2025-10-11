"use client";

import { useEffect, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";

export function useRealtimeOrders(restaurantId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const socketClient = io(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      {
        path: "/api/socket",
      }
    );

    socketClient.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Connected to real-time server");
      socketClient.emit("join-restaurant", restaurantId);
    });

    socketClient.on("disconnect", () => {
      setIsConnected(false);
      console.log("⚠️ Disconnected from real-time server");
    });

    socketClient.on("new-order", (order) => {
      // Refetch orders
      queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });

      // Increment new order count
      setNewOrderCount((prev) => prev + 1);

      // Play notification sound
      const audio = new Audio("/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [restaurantId, queryClient]);

  const resetNewOrderCount = useCallback(() => {
    setNewOrderCount(0);
  }, []);

  return { isConnected, newOrderCount, resetNewOrderCount, socket };
}
