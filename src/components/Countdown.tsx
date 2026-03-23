"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n/client";

const WORLD_CUP_START = new Date("2026-06-11T00:00:00-05:00"); // 開幕戦（北米東部時間）

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = WORLD_CUP_START.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6">
      {[
        { value: timeLeft.days, label: t("countdown.days") },
        { value: timeLeft.hours, label: t("countdown.hours") },
        { value: timeLeft.minutes, label: t("countdown.minutes") },
        { value: timeLeft.seconds, label: t("countdown.seconds") },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 sm:px-5 sm:py-3 min-w-[60px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-bold text-white tabular-nums">
              {String(item.value).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs sm:text-sm text-gray-300 mt-1 block">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
