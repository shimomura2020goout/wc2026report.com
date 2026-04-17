"use client";

import { useEffect, useState } from "react";
import { COOKIE_NAME } from "@/lib/predictions";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=")[1] || "") : null;
}

export function useAnonId(): string | null {
  const [anonId, setAnonId] = useState<string | null>(null);

  useEffect(() => {
    setAnonId(readCookie(COOKIE_NAME));
  }, []);

  return anonId;
}
