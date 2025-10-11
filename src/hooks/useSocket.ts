"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    socketRef.current = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Socket connected");
      setConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export function useRestaurantSocket(restaurantId: string | undefined) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (socket && connected && restaurantId) {
      socket.emit("join-restaurant", restaurantId);
      console.log("📡 Joined restaurant room:", restaurantId);

      return () => {
        socket.emit("leave-restaurant", restaurantId);
      };
    }
  }, [socket, connected, restaurantId]);

  return { socket, connected };
}

export function useTableSocket(
  tableId: string | undefined,
  restaurantId: string | undefined,
  capacity: number = 4
) {
  const { socket, connected } = useSocket();
  const [tableStatus, setTableStatus] = useState<{
    joined: boolean;
    isFull: boolean;
    userCount: number;
    capacity: number;
    error?: string;
  }>({
    joined: false,
    isFull: false,
    userCount: 0,
    capacity,
  });

  useEffect(() => {
    if (socket && connected && tableId && restaurantId) {
      socket.emit("join-table", { tableId, restaurantId, capacity });

      socket.on("table-joined", (data) => {
        setTableStatus({
          joined: true,
          isFull: false,
          userCount: data.userCount,
          capacity: data.capacity,
        });
      });

      socket.on("table-full", (data) => {
        setTableStatus({
          joined: false,
          isFull: true,
          userCount: data.current,
          capacity: data.capacity,
          error: data.message,
        });
      });

      socket.on("table-users-updated", (data) => {
        setTableStatus((prev) => ({
          ...prev,
          userCount: data.userCount,
          capacity: data.capacity,
        }));
      });

      socket.on("table-error", (data) => {
        setTableStatus((prev) => ({
          ...prev,
          error: data.message,
        }));
      });

      return () => {
        socket.emit("leave-table", tableId);
        socket.off("table-joined");
        socket.off("table-full");
        socket.off("table-users-updated");
        socket.off("table-error");
      };
    }
  }, [socket, connected, tableId, restaurantId, capacity]);

  return { socket, connected, tableStatus };
}
