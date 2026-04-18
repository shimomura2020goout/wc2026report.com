"use client";

import { useEffect } from "react";

const SESSION_FLAG = "wcup2026:visit-sent";

export default function VisitBeacon() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_FLAG) === "1") return;
      sessionStorage.setItem(SESSION_FLAG, "1");
    } catch {
      /* sessionStorage unavailable — still fire once per page load */
    }

    // keepalive: ページ遷移中でも POST を完走させる
    fetch("/api/metrics/visit", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      /* noop */
    });
  }, []);

  return null;
}
