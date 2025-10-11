"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const socket = io(socketUrl, {
      path: "/api/socket",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export function useRestaurantSocket(restaurantId?: string) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected || !restaurantId) return;

    socket.emit("join-restaurant", restaurantId);
    console.log("📡 Joined restaurant room:", restaurantId);

    return () => {
      socket.emit("leave-restaurant", restaurantId);
    };
  }, [socket, connected, restaurantId]);

  return { socket, connected };
}

export function useTableSocket(
  tableId?: string,
  restaurantId?: string,
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
    if (!socket || !connected || !tableId || !restaurantId) return;

    const handleJoin = (data: any) => {
      setTableStatus({
        joined: true,
        isFull: false,
        userCount: data.userCount,
        capacity: data.capacity,
      });
    };

    const handleFull = (data: any) => {
      setTableStatus({
        joined: false,
        isFull: true,
        userCount: data.current,
        capacity: data.capacity,
        error: data.message,
      });
    };

    const handleUsersUpdated = (data: any) => {
      setTableStatus((prev) => ({
        ...prev,
        userCount: data.userCount,
        capacity: data.capacity,
      }));
    };

    const handleError = (data: any) => {
      setTableStatus((prev) => ({
        ...prev,
        error: data.message,
      }));
    };

    socket.emit("join-table", { tableId, restaurantId, capacity });

    socket.on("table-joined", handleJoin);
    socket.on("table-full", handleFull);
    socket.on("table-users-updated", handleUsersUpdated);
    socket.on("table-error", handleError);

    return () => {
      socket.emit("leave-table", tableId);
      socket.off("table-joined", handleJoin);
      socket.off("table-full", handleFull);
      socket.off("table-users-updated", handleUsersUpdated);
      socket.off("table-error", handleError);
    };
  }, [socket, connected, tableId, restaurantId, capacity]);

  return { socket, connected, tableStatus };
}
