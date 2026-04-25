"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "./Icon";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "organic_toto_banner_v1";
const ORGANIC_HOSTS = [
  "google.",
  "yahoo.",
  "bing.",
];

function isOrganicReferrer(referrer: string): boolean {
  if (!referrer) return false;
  try {
    const url = new URL(referrer);
    if (url.hostname === window.location.hostname) return false;
    return ORGANIC_HOSTS.some((host) => url.hostname.includes(host));
  } catch {
    return false;
  }
}

function sendGA4Event(action: string, label: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: "organic_toto_banner",
      event_label: label,
    });
  }
}

export default function OrganicTotoBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored === "1") {
        setShow(true);
        return;
      }
      if (stored === "0") {
        return;
      }
      const organic = isOrganicReferrer(document.referrer);
      sessionStorage.setItem(STORAGE_KEY, organic ? "1" : "0");
      if (organic) {
        setShow(true);
        sendGA4Event("organic_banner_view", "shown");
      }
    } catch {
      const organic = isOrganicReferrer(document.referrer);
      if (organic) setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50 p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
          <Icon name="confirmation_number" size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
              W杯 toto
            </span>
            <span className="text-[11px] text-gray-500 font-medium">日程と合わせてチェック</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-snug mb-2">
            ワールドカップtotoの対象試合・販売スケジュール
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
            日本代表の試合がtoto・WINNERの対象になるタイミングと、購入できるスポーツくじの種類をまとめています。
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Link
              href="/toto"
              onClick={() => sendGA4Event("organic_banner_click", "toto_zone")}
              className="inline-flex items-center justify-center gap-1.5 bg-purple-700 text-white font-bold px-4 py-2.5 rounded-full hover:bg-purple-800 transition-colors text-sm"
            >
              <Icon name="confirmation_number" size={16} />
              totoゾーンを見る
              <Icon name="arrow_forward" size={14} />
            </Link>
            <Link
              href="/news/wcup-2026-toto-sports-lottery-overview"
              onClick={() => sendGA4Event("organic_banner_click", "toto_article")}
              className="inline-flex items-center justify-center gap-1.5 border-2 border-purple-300 text-purple-800 font-bold px-4 py-2.5 rounded-full hover:bg-purple-100 transition-colors text-sm"
            >
              <Icon name="article" size={16} />
              スポーツくじ徹底解説の記事
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
