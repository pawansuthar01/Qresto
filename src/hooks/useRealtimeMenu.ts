import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtimeMenu(restaurantId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [menuUpdates, setMenuUpdates] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!restaurantId) return;

    const eventSource = new EventSource(
      `/api/restaurants/${restaurantId}/menu/realtime`
    );

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "menu") {
          queryClient.setQueryData(["menu", restaurantId], data.data);
          setMenuUpdates((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error parsing menu SSE:", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [restaurantId, queryClient]);

  return { isConnected, menuUpdates };
}
