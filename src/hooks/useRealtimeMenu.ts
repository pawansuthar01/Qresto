import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabaseAdmin } from "@/lib/supabase";

export function useRealtimeMenu(restaurantId: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [menuUpdates, setMenuUpdates] = useState(0);
  const queryClient = useQueryClient();
  const supabaseAdmin = getSupabaseAdmin();
  useEffect(() => {
    if (!restaurantId) return;

    const channel = supabaseAdmin
      .channel(`menu-updates-${restaurantId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "menuCategory",
          filter: `restaurantId=eq.${restaurantId}`,
        },
        (payload) => {
          console.log("Menu change detected:", payload);
          queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
          setMenuUpdates((prev) => prev + 1);
        }
      )
      .subscribe((status) => setIsConnected(status === "SUBSCRIBED"));

    return () => {
      supabaseAdmin.removeChannel(channel);
      setIsConnected(false);
    };
  }, [restaurantId, queryClient]);

  return { isConnected, menuUpdates };
}
