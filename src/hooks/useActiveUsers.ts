import { useEffect, useState, useCallback } from "react";

export function useActiveUsers(shortCode: string) {
  const [userId] = useState(
    () => `user-${Math.random().toString(36).substr(2, 9)}`
  );
  const [currentUsers, setCurrentUsers] = useState(0);
  const [capacity, setCapacity] = useState(4);
  const [isFull, setIsFull] = useState(false);

  const updateActiveUsers = useCallback(
    async (action: "join" | "leave") => {
      try {
        const res = await fetch(`/api/q/${shortCode}/active-users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, action }),
        });

        if (res.ok) {
          const data = await res.json();
          setCurrentUsers(data.currentUsers);
          setCapacity(data.capacity);
          setIsFull(data.isFull);
        }
      } catch (error) {
        console.error("Error updating active users:", error);
      }
    },
    [shortCode, userId]
  );

  useEffect(() => {
    // Join on mount
    updateActiveUsers("join");

    // Poll for updates every 5 seconds
    const interval = setInterval(() => {
      fetch(`/api/q/${shortCode}/active-users`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentUsers(data.currentUsers);
          setCapacity(data.capacity);
          setIsFull(data.isFull);
        })
        .catch(console.error);
    }, 5000);

    // Leave on unmount or page close
    const handleBeforeUnload = () => {
      navigator.sendBeacon(
        `/api/q/${shortCode}/active-users`,
        JSON.stringify({ userId, action: "leave" })
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      updateActiveUsers("leave");
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shortCode, updateActiveUsers]);

  return { currentUsers, capacity, isFull, userId };
}
