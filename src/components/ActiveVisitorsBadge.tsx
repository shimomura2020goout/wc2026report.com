"use client";

import { useEffect, useState } from "react";

export default function ActiveVisitorsBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/metrics/active-users")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {
        /* noop */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null || count <= 0) return null;

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      <span>直近24時間で {count.toLocaleString("ja-JP")} 人が訪問しました</span>
    </div>
  );
}
