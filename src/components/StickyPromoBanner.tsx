"use client";

import { useState, useEffect } from "react";
import Icon from "./Icon";
import type { PromoFromNotion } from "@/app/api/promos/route";

// gtag.js の型定義（GA4用）
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

// ========================================
// 背景カラーマッピング
// ========================================
const bgGradients: Record<string, string> = {
  dark: "from-gray-900 via-gray-800 to-gray-900",
  green: "from-green-900 via-emerald-800 to-green-900",
  purple: "from-purple-900 via-purple-800 to-purple-900",
  blue: "from-blue-900 via-blue-800 to-blue-900",
  red: "from-red-900 via-red-800 to-red-900",
  orange: "from-orange-900 via-orange-800 to-orange-900",
};

const labelColors: Record<string, string> = {
  dark: "bg-yellow-500 text-black",
  green: "bg-green-500 text-white",
  purple: "bg-purple-500 text-white",
  blue: "bg-blue-500 text-white",
  red: "bg-red-500 text-white",
  orange: "bg-orange-500 text-white",
};

// ========================================
// GA4 イベント送信ヘルパー
// gtag.js が読み込まれている場合のみ送信
// ========================================
function sendGA4Event(action: string, promoId: string, label: string) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: "sticky_promo_banner",
      event_label: label,
      promo_id: promoId,
    });
  }
}

// ========================================
// DAZN・WOWOW・LINE を交互に表示
// ========================================
const fallbackPromos: PromoFromNotion[] = [
  {
    id: "toto-docomo",
    title: "ドコモスポーツくじ",
    label: "W杯を予想",
    description: "toto・BIG・WINNERで試合結果を予想しよう",
    ctaText: "無料登録する",
    ctaUrl: "https://tr.affiliate-sp.docomo.ne.jp/cl/d0000000359/4739/3",
    trackingPixel: null,
    bgColor: "purple",
    showProbability: 0.5,
    cooldownHours: 48,
    sortOrder: 1,
  },
  {
    id: "dazn-business",
    title: "DAZN for BUSINESS",
    label: "法人向け",
    description: "お店でW杯全試合を上映！飲食店・スポーツバー向け",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100ph9q00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100ph9q00opav",
    bgColor: "dark",
    showProbability: 0.5,
    cooldownHours: 48,
    sortOrder: 2,
  },
  {
    id: "wowow",
    title: "WOWOW",
    label: "CL・ラリーガ",
    description: "W杯出場選手のクラブでの活躍もチェック！月額2,530円",
    ctaText: "詳細を見る",
    ctaUrl: "https://h.accesstrade.net/sp/cc?rk=0100pjmj00opav",
    trackingPixel: "https://h.accesstrade.net/sp/rr?rk=0100pjmj00opav",
    bgColor: "blue",
    showProbability: 0.3,
    cooldownHours: 48,
    sortOrder: 3,
  },
  {
    id: "line-friend",
    title: "LINE で最新情報を受け取る",
    label: "無料",
    description: "試合速報・toto予想・代表ニュースをLINEでお届け",
    ctaText: "友だち追加",
    ctaUrl: "https://line.me/R/ti/p/@517lriub",
    trackingPixel: null,
    bgColor: "green",
    showProbability: 0.5,
    cooldownHours: 48,
    sortOrder: 4,
  },
];

// ========================================
// localStorage
// ========================================
const STORAGE_PREFIX = "promo_dismissed_";

function isDismissed(promoId: string, cooldownHours: number): boolean {
  if (typeof window === "undefined") return true;
  try {
    const dismissed = localStorage.getItem(`${STORAGE_PREFIX}${promoId}`);
    if (!dismissed) return false;
    const dismissedAt = parseInt(dismissed, 10);
    return Date.now() - dismissedAt < cooldownHours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(promoId: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${promoId}`, Date.now().toString());
  } catch { /* localStorage unavailable */ }
}

// ========================================
// メインコンポーネント
// ========================================
export default function StickyPromoBanner() {
  const [promo, setPromo] = useState<PromoFromNotion | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAndSelect() {
      // Notion API経由でプロモ設定を取得
      let promos: PromoFromNotion[] = fallbackPromos;
      try {
        const res = await fetch("/api/promos", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.promos && data.promos.length > 0) {
            promos = data.promos;
          }
        }
      } catch {
        // API失敗時はフォールバック
      }

      if (cancelled) return;

      // 非表示期間チェック
      const candidates = promos.filter(
        (p) => !isDismissed(p.id, p.cooldownHours)
      );
      if (candidates.length === 0) return;

      // 交互表示: ページビュー数に基づいて DAZN → WOWOW → LINE を切り替え
      let viewCount = 0;
      try {
        viewCount = parseInt(localStorage.getItem("promo_view_count") || "0", 10);
        localStorage.setItem("promo_view_count", (viewCount + 1).toString());
      } catch { /* localStorage unavailable */ }
      const selected = candidates[viewCount % candidates.length];
      setPromo(selected);

      // GA4: バナー表示イベント
      sendGA4Event("promo_view", selected.id, selected.title);

      // 2秒後にスライドイン
      setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, 2000);
    }

    loadAndSelect();
    return () => { cancelled = true; };
  }, []);

  const handleClick = () => {
    if (!promo) return;
    // GA4: CTAクリックイベント
    sendGA4Event("promo_click", promo.id, promo.title);
  };

  const handleClose = () => {
    if (!promo) return;
    // GA4: 閉じるイベント
    sendGA4Event("promo_close", promo.id, promo.title);
    setClosing(true);
    setDismissed(promo.id);
    setTimeout(() => {
      setVisible(false);
      setPromo(null);
    }, 300);
  };

  if (!promo || !visible) return null;

  const isExternal = promo.ctaUrl.startsWith("http");
  const gradient = bgGradients[promo.bgColor] || bgGradients.dark;
  const labelColor = labelColors[promo.bgColor] || labelColors.dark;
  const isLine = promo.id === "line-friend";

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        closing ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className={`bg-gradient-to-r ${gradient} border-t border-white/10 shadow-2xl`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3 sm:gap-4">
          {/* バッジ＋テキスト */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span className={`${labelColor} text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap`}>
              {promo.label}
            </span>
            <div className="min-w-0">
              <p className="text-white text-sm sm:text-base font-bold truncate">
                {promo.title}
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs truncate hidden sm:block">
                {promo.description}
              </p>
            </div>
          </div>

          {/* CTA ボタン */}
          <a
            href={promo.ctaUrl}
            target="_blank"
            rel={isLine ? "noopener noreferrer" : "nofollow sponsored noopener noreferrer"}
            onClick={handleClick}
            data-promo-id={promo.id}
            data-promo-name={promo.title}
            className="shrink-0 bg-white text-black text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-1.5"
          >
            {promo.ctaText}
            <Icon name={isLine ? "arrow_forward" : "open_in_new"} size={14} />
          </a>

          {/* トラッキングピクセル */}
          {promo.trackingPixel && (
            <img src={promo.trackingPixel} width="1" height="1" alt="" className="hidden" />
          )}

          {/* 閉じるボタン */}
          <button
            onClick={handleClose}
            className="shrink-0 text-gray-500 hover:text-white transition-colors p-1"
            aria-label="閉じる"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* PR表記（LINE以外） */}
        {!isLine && (
          <div className="text-center pb-1">
            <span className="text-[9px] text-gray-600">広告・PR</span>
          </div>
        )}
      </div>
    </div>
  );
}
