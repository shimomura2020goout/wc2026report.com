"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      // noop: storage disabled or JSON broken
    }
    setHydrated(true);
  }, [key]);

  const setStoredValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // noop
        }
        return resolved;
      });
    },
    [key]
  );

  const removeStoredValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // noop
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return { value, setValue: setStoredValue, removeValue: removeStoredValue, hydrated };
}
