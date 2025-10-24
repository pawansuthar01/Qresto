import { useState, useEffect, useCallback } from "react";

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = window.localStorage.getItem(key);

      // 🧠 Guard: handle null, "undefined", "null", or empty string
      if (!item || item === "undefined" || item === "null") {
        return initialValue;
      }

      return JSON.parse(item);
    } catch (error) {
      console.warn(`⚠️ Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== "undefined") {
          if (valueToStore === undefined || valueToStore === null) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }

          // 🔄 Trigger local event for sync
          window.dispatchEvent(
            new CustomEvent("localStorage", {
              detail: { key, value: valueToStore },
            })
          );
        }
      } catch (error) {
        console.warn(`⚠️ Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        window.dispatchEvent(
          new CustomEvent("localStorage", {
            detail: { key, value: undefined },
          })
        );
      }
    } catch (error) {
      console.warn(`⚠️ Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key && e.key !== key) return;
      if ("detail" in e && e.detail.key !== key) return;

      try {
        const item = window.localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") {
          setStoredValue(initialValue);
        } else {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`⚠️ Error syncing localStorage key "${key}":`, error);
      }
    };

    window.addEventListener("storage", handleStorageChange as EventListener);
    window.addEventListener(
      "localStorage",
      handleStorageChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange as EventListener
      );
      window.removeEventListener(
        "localStorage",
        handleStorageChange as EventListener
      );
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
