"use client";

import { useEffect, useState, useCallback } from "react";
import { supabaseClient } from "@/lib/supabase";

export function useActiveUser(tableData: any) {
  const [currentUsers, setCurrentUsers] = useState(
    tableData?.joinGuests?.length || 0
  );
  const [joinGuests, setJoinGuests] = useState(tableData?.joinGuests || []);
  const [capacity, setCapacity] = useState(tableData?.capacity || 0);
  const [onlyCapacity, setOnlyCapacity] = useState(tableData?.onlyCapacity);

  useEffect(() => {
    setCurrentUsers(tableData?.joinGuests?.length || 0);
    setJoinGuests(tableData?.joinGuests || []);
    setCapacity(tableData?.capacity || 0);
    setOnlyCapacity(tableData?.onlyCapacity);
  }, [tableData]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!tableData?.id) return;

    const channel = supabaseClient
      .channel(`table_presence:${tableData.id}`)
      .on("broadcast", { event: "users-updated" }, (msg: any) => {
        const { currentUsers, capacity, onlyCapacity, joinGuests } =
          msg.payload;
        setCurrentUsers(currentUsers);
        setCapacity(capacity);
        setJoinGuests(joinGuests || []);
        setOnlyCapacity(onlyCapacity);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to real-time channel!");
        }
      });

    return channel;
  }, [tableData?.id]);

  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [setupRealtimeSubscription]);

  return { onlyCapacity, capacity, currentUsers, joinGuests };
}

// ✅ Add Active User Function
export async function addActiveUser(
  shortCode: string,
  tableId: string,
  userId: string
) {
  try {
    const res = await fetch(`/api/q/${shortCode}/active-users`, {
      method: "POST",
      body: JSON.stringify({ userId, action: "join" }),
    });
    const data = await res.json();

    // Broadcast realtime update
    await supabaseClient.channel(`table_presence:${tableId}`).send({
      type: "broadcast",
      event: "users-updated",
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error adding user:", error);
  }
}

// ✅ Remove Active User Function
export async function removeActiveUser(
  shortCode: string,
  tableId: string,
  userId: string
) {
  try {
    const res = await fetch(`/api/q/${shortCode}/active-users`, {
      method: "POST",
      body: JSON.stringify({ userId, action: "leave" }),
    });
    const data = await res.json();

    await supabaseClient.channel(`table_presence:${tableId}`).send({
      type: "broadcast",
      event: "users-updated",
      payload: data,
    });

    return data;
  } catch (error) {
    console.error("Error removing user:", error);
  }
}
